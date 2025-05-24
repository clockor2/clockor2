import { regression } from './rttRegression'
import { formatPlotly } from './visualisation'
import { readNewick } from "phylojs";
import { readFileSync } from "fs";
import { extractPartOfTipName } from "./utils";
import { decimal_date } from "./utils";

describe('regression(), and plotify()', () => {
  test('Correct output lengths with empirical tree', () => {
    const nwk = readFileSync("src/features/engine/empiricalTestTree.nwk").toString();
    const tree = readNewick(nwk);
    var tipNames = tree.getTipLabels()
    var decimal_dates = tipNames.map((name: string) => {
      let date = extractPartOfTipName(name, "_", "-1")
      return decimal_date(date, "decimal")
    })
    var groupings = tipNames.map((e,i) => i % 2 == 0 ? 'A' : 'B')

    let reg = regression(tree.getRTTDist(), decimal_dates, groupings, tipNames)
    let plotData = formatPlotly(reg)

    expect(reg.localClock).toHaveLength(2)
    expect(plotData).toHaveLength(6) // 6 = 3*2 for points and lines objects

  });
})