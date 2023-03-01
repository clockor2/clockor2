/* eslint-disable no-restricted-globals */
import { phylotree } from "phylotree";
var minimize = require('minimize-golden-section-1d');

// this runs on the webworker, created with webpack 5 syntax new
// Worker('./worker.ts'). in jest tests, this module is not used, instead the
// workerMessageHandler is directly addressed
self.onmessage = ({ data: { nwk } }) => {
  
  self.postMessage({
    answer: new phylotree(nwk).getNewick(),
  });
};