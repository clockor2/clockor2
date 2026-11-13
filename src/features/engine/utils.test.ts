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
  test('missing day uses the midpoint of the month', () => {
    expect(decimal_date('2000-12', 'yyyy-mm-dd')).toEqual(2000.957650273224);
  });
  test('missing day uses the midpoint of a short month', () => {
    expect(decimal_date('2001-02', 'yyyy-mm-dd')).toEqual(2001.123287671233);
  });
  test('missing month uses the midpoint of the year', () => {
    expect(decimal_date('2000', 'yyyy-mm-dd')).toEqual(2000.5);
  });
  test('mixed precision resolves each date independently', () => {
    expect(['2000-01-01', '2000-12', '2000'].map(d => decimal_date(d, 'yyyy-mm-dd')))
      .toEqual([2000, 2000.957650273224, 2000.5]);
  });
  test('2000 matches decimal', () => {
    expect(decimal_date('2000', 'decimal')).toEqual(2000);
  });
  test('custom DD/MM/YYYY matches decimal', () => {
    expect(decimal_date('05/11/2013', 'custom', 'DD/MM/YYYY')).toEqual(
      decimal_date('2013-11-05', 'yyyy-mm-dd')
    );
  });
  test('custom YYYY/MM/DD matches decimal', () => {
    expect(decimal_date('2013/11/05', 'custom', 'YYYY/MM/DD')).toEqual(
      decimal_date('2013-11-05', 'yyyy-mm-dd')
    );
  });
  test('custom YYYY-MM uses the midpoint of the month', () => {
    expect(decimal_date('2000-12', 'custom', 'YYYY-MM')).toEqual(2000.957650273224);
  });
  test('custom YYYY/MM/DD requires a complete date', () => {
    expect(decimal_date('2013/11/05', 'custom', 'YYYY/MM/DD')).toEqual(2013.8438356164384);
    expect(decimal_date('2013/11', 'custom', 'YYYY/MM/DD')).toBeNaN();
    expect(decimal_date('2013', 'custom', 'YYYY/MM/DD')).toBeNaN();
  });
  test('custom YYYY uses the midpoint of the year', () => {
    expect(decimal_date('2000', 'custom', 'YYYY')).toEqual(2000.5);
  });
  test('bracketed literals in a custom format are not treated as tokens', () => {
    expect(decimal_date('2000 MM', 'custom', 'YYYY [MM]')).toEqual(2000.5);
  });
  test('custom format does not fall back on non-matching input', () => {
    expect(decimal_date('2013-11-05', 'custom', 'DD/MM/YYYY')).toBeNaN();
  });
  test('custom format without a format string is NaN', () => {
    expect(decimal_date('2013-11-05', 'custom')).toBeNaN();
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
  test('small decimal dates', () => {
    let targetYMD = "0100-01-01"

    let testYMD = date_decimal(100.0)

    expect(testYMD).toEqual(targetYMD);
  });
  test('small negative decimal dates', () => {
    let targetYMD = "-0100-01-01"

    let testYMD = date_decimal(-100.0)

    expect(testYMD).toEqual(targetYMD);
  });
  test('normal size negative decimal dates', () => {
    let targetYMD = "-2000-01-01"

    let testYMD = date_decimal(-2000.0)

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