import { clockSearch } from "./clockSearch";

// this runs on the webworker, created with webpack 5 syntax new
// Worker('./worker.ts'). in jest tests, this module is not used, instead the
// workerMessageHandler is directly addressed
self.onmessage = ( /* eslint-disable-line no-restricted-globals */
  { 
    data: { 
      nwk,
      minCladeSize,
      maxClocks,
      dates,
      icMetric  
    } 
  }
) => { /* eslint-disable-line no-restricted-globals */
 
  let bestGrpConfig = clockSearch(
      nwk,
      minCladeSize,
      maxClocks,
      dates,
      icMetric
    )
  
  self.postMessage(bestGrpConfig); /* eslint-disable-line no-restricted-globals */
}; 