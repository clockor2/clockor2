import { date_decimal, decimal_date, extractPartOfTipName}  from "./utils"
import { readNewick } from "phylojs";
import { readFileSync
 } from "fs";
describe('decimal_date()', () => {
  test('2013-11-05 matches decimal', () => {
    expect(decimal_date('2013-11-05', 'yyyy-mm-dd')).toEqual(2013.8438356164384);
  });
  test('2013-11-08 matches decimal', () => {
    expect(decimal_date('2013-11-08', 'yyyy-mm-dd')).toEqual(2013.8520547945207);
  });
  test('2000-01-01 matches decimal', () => {
    expect(decimal_date('2000-01-01', 'yyyy-mm-dd')).toEqual(2000);
  });
  test('2000-12-31 matches decimal', () => {
    expect(decimal_date('2000-12-31', 'yyyy-mm-dd')).toEqual(2000.9972677595629);
  });
  test('yyyy-mm-NA matches decimal', () => {
    expect(decimal_date('2000-12', 'yyyy-mm-dd')).toEqual(decimal_date('2000-12-01', 'yyyy-mm-dd'));
  });
  test('yyyy-NA-NA matches decimal', () => {
    expect(decimal_date('2000', 'yyyy-mm-dd')).toEqual(decimal_date('2000-01-01', 'yyyy-mm-dd'));
  });
  test('2000 matches decimal', () => {
    expect(decimal_date('2000', 'decimal')).toEqual(2000);
  });
}); 

describe('date_decimal()', () => {
  test('2000.0 matches 2000-01-01', () => {
    let targetYMD = "2000-01-01"

    let testYMD = date_decimal(2000.0)

    expect(testYMD).toEqual(targetYMD);
  });
  test('2013.844 matches 2013-11-05', () => {
    let targetYMD = "2013-11-05"

    let testYMD = date_decimal(2013.844)

    expect(testYMD).toEqual(targetYMD);
  });
  test('2013.852 matches 2013-11-08', () => {
    let targetYMD = "2013-11-08"

    let testYMD = date_decimal(2013.852)

    expect(testYMD).toEqual(targetYMD);
  });
  test('2014.91506849315 matches 2000-12-31', () => {
    let targetYMD = "2014-12-01"

    let testYMD = date_decimal(2014.91506849315)

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