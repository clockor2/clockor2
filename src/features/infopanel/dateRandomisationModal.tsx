import { Label, Modal, Select } from "flowbite-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Plot from "react-plotly.js";
import Plotly from "plotly.js";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  BFRMethod,
  DateRandomisationMode,
  oneSidedEmpiricalPValue,
  runDateRandomisationReplicate,
  TipData
} from "../engine/dateRandomisation";
import { numToScientific } from "../engine/utils";
import { addNotification } from "../notifications/notificationsSlice";
import { selectCurrentData } from "../regression/regressionSlice";
import { selectSource, selectTipData } from "../tree/treeSlice";
import { useDarkMode } from "../utils/darkmode";

interface DateRandomisationModalProps {
  show: boolean;
  onClose: () => void;
  bfrMethod: BFRMethod;
  allowNegativeRates: boolean;
}

const plotDivId = "date-randomisation-plot";
const plotUpdateIntervalMs = 250;

interface DateRandomisationPlotProps {
  isDarkMode: boolean;
  observedSlope: number;
}

const DateRandomisationPlot = React.memo(function DateRandomisationPlot(props: DateRandomisationPlotProps) {
  const isSmallScreen = window.innerWidth < 640;
  const downloadImageButton: Plotly.ModeBarButton = useMemo(() => ({
    name: "Download plot image",
    title: "Download plot image",
    icon: {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="dark:text-slate-500 text-slate-300 dark:hover:text-slate-300 hover:text-slate-500 mt-1" viewBox="0 0 24 24" stroke-width="3"><path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" /><path fill-rule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" /></svg>',
    },
    click: async (gd) => {
      await Plotly.downloadImage(gd, {
        format: "svg",
        filename: "clockor2-date-randomisation",
        width: 1200,
        height: 800,
      });
    }
  }), []);

  const plotConfig: Partial<Plotly.Config> = useMemo(() => ({
    responsive: true,
    displaylogo: false,
    displayModeBar: true,
    modeBarButtons: [[downloadImageButton]],
  }), [downloadImageButton]);

  const plotData: Plotly.Data[] = useMemo(() => [
    {
      x: [],
      type: "histogram",
      name: "Randomised dates",
      marker: {
        color: props.isDarkMode ? "rgb(96,165,250)" : "rgb(31,119,180)",
        line: { color: props.isDarkMode ? "rgb(15,23,42)" : "rgb(44,62,80)", width: 1 }
      },
      opacity: 0.75,
    } as Plotly.Data
  ], [props.isDarkMode]);

  const layout: Partial<Plotly.Layout> = useMemo(() => ({
    title: {
      text: isSmallScreen
        ? "Date-randomisation test for root-to-tip<br>temporal signal"
        : "Date-randomisation test for root-to-tip temporal signal",
      font: { size: isSmallScreen ? 16 : 18 },
    },
    autosize: true,
    showlegend: false,
    bargap: 0.05,
    uirevision: "date-randomisation",
    margin: { l: 60, r: 20, b: 60, t: isSmallScreen ? 82 : 60, pad: 0 },
    plot_bgcolor: props.isDarkMode ? "rgb(15,23,42)" : "white",
    paper_bgcolor: props.isDarkMode ? "rgb(31,41,55)" : "white",
    font: { color: props.isDarkMode ? "rgb(203,213,225)" : "#111827" },
    xaxis: {
      title: { text: "Root-to-tip regression slope (substitutions/site/year)" },
      color: props.isDarkMode ? "rgb(203,213,225)" : "#111827",
      zeroline: false,
    },
    yaxis: {
      title: { text: "Date randomisations" },
      color: props.isDarkMode ? "rgb(203,213,225)" : "#111827",
      rangemode: "tozero",
    },
    shapes: [
      {
        type: "line",
        x0: props.observedSlope,
        x1: props.observedSlope,
        y0: 0,
        y1: 1,
        yref: "paper",
        line: { color: props.isDarkMode ? "rgb(147,197,253)" : "rgb(31,119,180)", width: 3, dash: "dash" }
      }
    ],
    annotations: [],
  }), [isSmallScreen, props.isDarkMode, props.observedSlope]);

  return (
    <Plot
      divId={plotDivId}
      data={plotData}
      layout={layout}
      style={{ width: "100%", height: "100%" }}
      config={plotConfig}
    />
  );
});

export function DateRandomisationModal(props: DateRandomisationModalProps) {
  const [nRandomisations, setNRandomisations] = useState(100);
  const [mode, setMode] = useState<DateRandomisationMode>("duchene");
  const [slopes, setSlopes] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [completed, setCompleted] = useState(0);
  const nRandomisationsInputRef = useRef<HTMLInputElement>(null);
  const plottedSlopesCountRef = useRef(0);
  const lastPlotCommitRef = useRef(0);
  const cancelRequested = useRef(false);
  const runIdRef = useRef(0);
  const dispatch = useAppDispatch();
  const isDarkMode = useDarkMode();
  const sourceNwk = useAppSelector(selectSource);
  const tipData = useAppSelector(selectTipData) as TipData;
  const currentData = useAppSelector(selectCurrentData);
  const observedSlope = currentData?.baseClock.slope ?? 0;
  const pValue = oneSidedEmpiricalPValue(observedSlope, slopes);

  useEffect(() => {
    if (!props.show) return;
    window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 0);
  }, [props.show]);

  const reset = () => {
    setSlopes([]);
    setCompleted(0);
    lastPlotCommitRef.current = 0;
    cancelRequested.current = false;
    setIsCancelling(false);
  }

  const commitPlotState = async (replicateSlopes: number[], force = false) => {
    const now = Date.now();
    if (!force && now - lastPlotCommitRef.current < plotUpdateIntervalMs) return;

    lastPlotCommitRef.current = now;
    setSlopes([...replicateSlopes]);
    setCompleted(replicateSlopes.length);
    await new Promise<void>(resolve => window.requestAnimationFrame(() => resolve()));
  }

  useEffect(() => {
    const updatePlot = async () => {
      try {
        if (slopes.length < plottedSlopesCountRef.current) {
          await Plotly.restyle(plotDivId, { x: [[]] }, [0]);
          plottedSlopesCountRef.current = 0;
        }

        const nextSlopes = slopes.slice(plottedSlopesCountRef.current);
        if (nextSlopes.length > 0) {
          await Plotly.extendTraces(plotDivId, { x: [nextSlopes] }, [0]);
          plottedSlopesCountRef.current = slopes.length;
        }

      } catch (error) {
        // Plotly may not be mounted yet while the modal is opening.
      }
    }

    updatePlot();
  }, [completed, slopes]);

  const handleStart = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isRunning || isCancelling) return;

    const requestedRandomisations = Math.max(
      1,
      parseInt(nRandomisationsInputRef.current?.value ?? nRandomisations.toString())
    );

    setNRandomisations(requestedRandomisations);
    reset();
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    setIsRunning(true);

    try {
      const replicateSlopes: number[] = [];
      for (let i = 0; i < requestedRandomisations; i++) {
        if (cancelRequested.current) break;

        const slope = await runDateRandomisationReplicate(
          sourceNwk,
          tipData,
          mode,
          props.bfrMethod,
          props.allowNegativeRates
        );

        if (runIdRef.current !== runId || cancelRequested.current) break;

        replicateSlopes.push(slope);
        await commitPlotState(replicateSlopes);
      }
      await commitPlotState(replicateSlopes, true);
    } catch (error: any) {
      if (!cancelRequested.current) {
        dispatch(addNotification({
          title: "Error",
          message: "Failed to run date randomisation",
          type: "error"
        }));
      }
    } finally {
      if (runIdRef.current === runId) {
        setIsRunning(false);
        setIsCancelling(false);
      }
    }
  }

  const handleCancel = () => {
    if (!isRunning || isCancelling) return;
    cancelRequested.current = true;
    setIsCancelling(true);
  }

  const handleClose = () => {
    if (isRunning || isCancelling) return;
    props.onClose();
  }

  return (
    <Modal
      dismissible={!isRunning}
      show={props.show}
      onClose={handleClose}
      size="5xl"
    >
      <Modal.Header>
        Date Randomisation
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleStart} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="nRandomisations" value="Number of randomisations" />
              <input
                id="nRandomisations"
                ref={nRandomisationsInputRef}
                className="mt-1 block w-full rounded border-gray-300 bg-gray-50 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                type="number"
                min={1}
                defaultValue={nRandomisations}
                disabled={isRunning || isCancelling}
                required
              />
            </div>
            <div>
              <Label htmlFor="dateRandomisationMode" value="Randomisation style" />
              <Select
                id="dateRandomisationMode"
                className="mt-1"
                value={mode}
                disabled={isRunning || isCancelling}
                onChange={e => setMode(e.target.value as DateRandomisationMode)}
                required
              >
                <option value="duchene">Duchene et al. 2015</option>
                <option value="firth">Firth et al. 2010</option>
              </Select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-700 dark:text-slate-300">
                <div>Observed slope: {numToScientific(observedSlope, 2)}</div>
                <div>BFR method: {props.bfrMethod === "RMS" ? "RMS" : "R²"}</div>
                <div>One-sided empirical p: {pValue.toFixed(4)}</div>
              </div>
            </div>
          </div>
          <div className="h-[420px] w-full">
            <DateRandomisationPlot
              isDarkMode={isDarkMode}
              observedSlope={observedSlope}
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <div className="text-sm text-gray-700 dark:text-slate-300">
              Progress: {completed.toLocaleString()} / {nRandomisations.toLocaleString()}
            </div>
            {isRunning || isCancelling
              ? <button type="button" onPointerDown={handleCancel} onClick={handleCancel} disabled={isCancelling} className="flex items-center gap-2 bg-red-500 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded my-2">
                  Cancel
                </button>
              : <button type="submit" disabled={isCancelling} className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded my-2">
                  Start
                </button>
            }
          </div>
        </form>
      </Modal.Body>
    </Modal>
  )
}
