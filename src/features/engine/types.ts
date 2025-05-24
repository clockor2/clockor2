// class to contain local clock model, incl. data points and information criteria
export interface Model {
  baseClock: Regression;
  localClock: Regression[];
  baseIC: InfoCriteria;
  localIC: InfoCriteria;
  groupNames: string[];
}
// interface for info metric data
export interface InfoCriteria {
  aic: number;
  aicc: number;
  bic: number;
}

export interface Regression {
  x: Array<number>;
  y: Array<number>;
  tip: Array<string>;
  fitY: Array<number>;
  slope: number;
  intercept: number;
  sigSq: number;
  r2: number;
  logLik: number;
  rms: number;
}

// Groups of points pertaining to one local clock
// To be apended in array for linearRegression()
export interface DataGroup {
  x: Array<number>;
  y: Array<number>;
  tip: Array<string>;
  name: string;
}
