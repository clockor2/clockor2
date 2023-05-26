import { date_decimal, decimal_date, extractPartOfTipName}  from "./utils"
import { readNewick } from "phylojs";
import { readFileSync
 } from "fs";
describe('decimal_date()', () => {
  test('2000-01-01 matches decimal', () => {
    expect(decimal_date('2000-01-01', 'yyyy-mm-dd')).toEqual(2000.00 + (1 / 365.25));
  });
  test('2000-12-31 matches decimal', () => {
    expect(decimal_date('2000-12-31', 'yyyy-mm-dd')).toEqual(2000.00 + (11 / 12) + (31 / 365.25));
  });
  test('yyyy-mm-NA matches decimal', () => {
    expect(decimal_date('2000-12', 'yyyy-mm-dd')).toEqual(2000.00 + (11 / 12) + (1 / 365.25));
  });
  test('yyyy-NA-NA matches decimal', () => {
    expect(decimal_date('2000', 'yyyy-mm-dd')).toEqual(2000.00 + (0 / 12) + (1 / 365.25));
  });
}); 

describe('date_decimal()', () => {
  test('2000.0 matches 2000-01-01', () => {
    let targetDate = new Date("2000-01-01")
    let targetYMD = targetDate.getFullYear() + "-" + (targetDate.getMonth()+1) + "-" + targetDate.getDate()

    let testDate = date_decimal(2000.0)
    let testYMD = testDate.getFullYear() + "-" + (testDate.getMonth()+1) + "-" + testDate.getDate()

    expect(testYMD).toEqual(targetYMD);
  });
  test('2000.999999 matches 2000-12-31', () => {
    let targetDate = new Date("2000-12-31")
    let targetYMD = targetDate.getFullYear() + "-" + (targetDate.getMonth()+1) + "-" + targetDate.getDate()

    let testDate = date_decimal(2000.999999)
    let testYMD = testDate.getFullYear() + "-" + (testDate.getMonth()+1) + "-" + testDate.getDate()

    expect(testYMD).toEqual(targetYMD);
  });
}); 

describe('extractPartOfTipName()', () => {
  test('Identical dates for empirical yyyy dates with yyyy-mm-dd and decimal format', () => {
    const nwk = readFileSync("src/features/engine/empiricalTestTree.nwk").toString();
    const tree = readNewick(nwk);

    let tips = tree.getTipLabels()
    let dates = tips
      .map(e => extractPartOfTipName(e, "_", '-1'))
      .map(e => decimal_date(e, "decimal"))

    expect(dates).toHaveLength(tips.length)
  })
})