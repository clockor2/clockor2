import { linearRegression, AIC, AICc, BIC, normalDensity } from "./statistical";
import { readNewick } from "phylojs";
import { readFileSync } from "fs";
import { extractPartOfTipName } from "./utils";
import { decimal_date } from "./utils";

describe('normalDensity()', () => {
  test('density value should match', () => {
    var d = normalDensity(0, 0, 1)
    expect(d).toEqual(1 / (Math.sqrt(2 * Math.PI)))
  });
});

describe('linearRegression()', () => {

  var dummyX = [0, 1, 2, 3, 4, 5];
  var dummyY = [1, 0, 3, 2, 5, 4];
  var dummyTip = dummyX.map(e => `t${e}`);
  var m = linearRegression({ x: dummyX, y: dummyY, tip: dummyTip, name: 'global' });

  test('Expect perfect fit', () => {
    expect(m.r2).toBeCloseTo(0.6865, 4);
    expect(m.intercept).toBeCloseTo(0.4286, 4);
    expect(m.slope).toBeCloseTo(0.8286, 4);
    expect(m.logLik).toBeCloseTo(-8.244795, 6);
  });

  test('Value Equality should match', () => {
    expect(AIC([m])).toBeCloseTo(22.48959, 5);
    expect(AICc([m])).toBeCloseTo(34.48959, 5);
    expect(BIC([m])).toBeCloseTo(21.86487, 5);
  });

  test('R2 & slope compared to tempest op using empirical tree', () => {
    const nwk = readFileSync("src/features/engine/empiricalTestTree.nwk").toString();
    const tree = readNewick(nwk);
    var tipNames = tree.getTipLabels()
    var decimal_dates = tipNames.map((name: string) => {
      let date = extractPartOfTipName(name, "_", "-1")
      return decimal_date(date, "decimal")
    })
    m = linearRegression({ x: decimal_dates, y: tree.getRTTDist(), tip: tipNames, name: 'global'})
   
    expect(m.r2).toBeCloseTo(9.9783e-2, 4);
    expect(m.intercept * -1 / m.slope).toBeCloseTo(1961.3394, 4);
    expect(m.slope).toBeCloseTo(3.7128e-4, 4);

  });

});
