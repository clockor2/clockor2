import { readNewick } from "phylojs";
import { globalRootParallel } from "./bestFittingRoot";
import { regression } from "./core";

export type BFRMethod = "RMS" | "R2";
export type DateRandomisationMode = "duchene" | "firth";

export interface TipDatum {
  date: number;
  group?: string | number;
}

export interface TipData {
  [tip: string]: TipDatum;
}

type RandomNumberGenerator = () => number;

function shuffle<T>(arr: T[], rng: RandomNumberGenerator = Math.random): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function cloneTipData(tipData: TipData): TipData {
  return Object.fromEntries(
    Object.entries(tipData).map(([tip, data]) => [tip, { ...data }])
  );
}

export function randomiseTipDates(
  tipNames: string[],
  tipData: TipData,
  mode: DateRandomisationMode,
  rng: RandomNumberGenerator = Math.random
): TipData {
  const randomisedTipData = cloneTipData(tipData);

  if (mode === "firth") {
    const shuffledDates = shuffle(tipNames.map(tip => tipData[tip].date), rng);
    tipNames.forEach((tip, index) => {
      randomisedTipData[tip].date = shuffledDates[index];
    });
    return randomisedTipData;
  }

  const clusterByDate = new Map<number, string[]>();
  tipNames.forEach(tip => {
    const date = tipData[tip].date;
    clusterByDate.set(date, [...(clusterByDate.get(date) ?? []), tip]);
  });

  const dates = Array.from(clusterByDate.keys());
  const shuffledDates = shuffle(dates, rng);
  dates.forEach((date, index) => {
    const randomisedDate = shuffledDates[index];
    clusterByDate.get(date)?.forEach(tip => {
      randomisedTipData[tip].date = randomisedDate;
    });
  });

  return randomisedTipData;
}

export function oneSidedEmpiricalPValue(observedSlope: number, randomisedSlopes: number[]): number {
  const observedSignal = Math.abs(observedSlope);
  const tailCount = randomisedSlopes.filter(slope => Math.abs(slope) >= observedSignal).length;

  return (tailCount + 1) / (randomisedSlopes.length + 1);
}

export async function runDateRandomisationReplicate(
  sourceNwk: string,
  tipData: TipData,
  mode: DateRandomisationMode,
  bfrMethod: BFRMethod,
  allowNegativeRates: boolean
): Promise<number> {
  const sourceTree = readNewick(sourceNwk);
  const sourceTipNames = sourceTree.getTipLabels();
  const randomisedTipData = randomiseTipDates(sourceTipNames, tipData, mode);
  const randomisedDates = sourceTipNames.map(tip => randomisedTipData[tip].date);

  const bfrNwk = await globalRootParallel(
    sourceNwk,
    randomisedDates,
    randomisedTipData,
    bfrMethod,
    allowNegativeRates
  );

  const bfrTree = readNewick(bfrNwk);
  const bfrTips = bfrTree.getTipLabels();
  const bfrDates = bfrTips.map(tip => randomisedTipData[tip].date);
  const bfrGroups = bfrTips.map(tip => randomisedTipData[tip].group ?? 0);
  const bfrHeights = bfrTree.getRTTDist();

  return regression(
    bfrHeights,
    bfrDates,
    bfrGroups.map(group => group.toString()),
    bfrTips
  ).baseClock.slope;
}
