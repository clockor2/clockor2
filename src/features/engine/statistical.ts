import { DataGroup, Regression } from './types'

// regression function 
export function linearRegression(points: DataGroup): Regression {
  const reg = {} as Regression;
  reg.tip = points.tip;

  const { x, y } = points;
  const n = y.length;

  const sum_x = x.reduce((a, b) => a + b, 0);
  const sum_y = y.reduce((a, b) => a + b, 0);
  const sum_xy = x.reduce((a, b, i) => a + b * y[i], 0);
  const sum_xx = x.reduce((a, b) => a + b * b, 0);
  const sum_yy = y.reduce((a, b) => a + b * b, 0);

  reg.x = x;
  reg.y = y;
  reg.slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
  reg.intercept = (sum_y - reg.slope * sum_x) / n;
  reg.fitY = x.map(e => reg.slope * e + reg.intercept);
  reg.r2 = Math.pow(
    (n * sum_xy - sum_x * sum_y) /
      Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)),
    2
  );

  const error = y.map((v, i) => v - reg.fitY[i]);
  const sigSq = error.reduce((a, b) => a + b * b, 0) / n;
  reg.logLik = y
    .map((e, i) => Math.log(normalDensity(e, reg.fitY[i], sigSq)))
    .reduce((a, b) => a + b, 0);

  const rss = reg.fitY
    .map((e, i) => e - reg.y[i])
    .reduce((a, b) => a + (b * b), 0);
  reg.rms = rss / (reg.y.length - 2);

  return reg;
}

// Function for likelihood in linearRegression() function
export function normalDensity(y: number, mu: number, sigSq: number) {
  let exp = -0.5 * ((y - mu) ** 2) / sigSq; // exponent
  let norm = 1 / (Math.sqrt(2 * Math.PI * sigSq)); // normalising factor
  return norm * (Math.E ** exp);
}

// Information criteria functions below 
export function AICc(regs: Regression[]): number {
  var f = regs.length;
  var n = regs.map((n, i, a) => regs[i].y.length).reduce(
    (a, b) => a + b, 0)
  var totLogLik = 0;

  for (let i = 0; i < regs.length; i++) {
    if (regs[i].logLik) {
      totLogLik += regs[i].logLik;
    }
  }
  return (-2 * totLogLik + ((6 * f * n) / (n - (3 * f) - 1)));
}

export function AIC(regs: Regression[]): number {
  var f = regs.length;
  var totLogLik = 0;

  for (let i = 0; i < regs.length; i++) {
    if (regs[i].logLik) {
      totLogLik += regs[i].logLik;
    }
  }
  return (-2 * totLogLik + (6 * f));
}

export function BIC(regs: Regression[]): number {
  var f = regs.length;
  var n = regs.map((n, i, a) => regs[i].y.length).reduce(
    (a, b) => a + b, 0)
  var totLogLik = 0;

  for (let i = 0; i < regs.length; i++) {
    if (regs[i].logLik) {
      totLogLik += regs[i].logLik;
    }
  }
  return (3 * f * Math.log(n) - (2 * totLogLik));
}