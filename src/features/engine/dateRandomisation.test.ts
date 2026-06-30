import { oneSidedEmpiricalPValue, randomiseTipDates, TipData } from "./dateRandomisation";

const tipNames = ["A", "B", "C", "D"];

const tipData: TipData = {
  A: { date: 2000, group: "0" },
  B: { date: 2000, group: "0" },
  C: { date: 2001, group: "0" },
  D: { date: 2002, group: "0" },
};

const fixedRng = () => 0;

describe("randomiseTipDates()", () => {
  test("Duchene-style randomisation keeps same-date tips together", () => {
    const randomised = randomiseTipDates(tipNames, tipData, "duchene", fixedRng);

    expect(randomised.A.date).toEqual(randomised.B.date);
    expect([randomised.A.date, randomised.C.date, randomised.D.date].sort()).toEqual([2000, 2001, 2002]);
  });

  test("Firth-style randomisation shuffles dates across individual tips", () => {
    const randomised = randomiseTipDates(tipNames, tipData, "firth", fixedRng);

    expect(tipNames.map(tip => randomised[tip].date).sort()).toEqual([2000, 2000, 2001, 2002]);
    expect(randomised.A.date).not.toEqual(randomised.B.date);
  });

  test("does not mutate original tipData", () => {
    const original = JSON.stringify(tipData);

    randomiseTipDates(tipNames, tipData, "duchene", fixedRng);
    randomiseTipDates(tipNames, tipData, "firth", fixedRng);

    expect(JSON.stringify(tipData)).toEqual(original);
  });
});

describe("oneSidedEmpiricalPValue()", () => {
  test("uses slope magnitude for positive observed slopes", () => {
    expect(oneSidedEmpiricalPValue(3, [-4, -2, 3, 4])).toBeCloseTo(4 / 5);
  });

  test("uses slope magnitude for negative observed slopes", () => {
    expect(oneSidedEmpiricalPValue(-3, [-4, -3, 2, 1])).toBeCloseTo(3 / 5);
  });
});
