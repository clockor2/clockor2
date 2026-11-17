import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import { readNewick, writeNewick } from "phylojs"

dayjs.extend(customParseFormat)

export type DateFormat = "yyyy-mm-dd" | "decimal" | "tipHeight" | "custom"

// Build a UTC date. Compared to Date.UTC, setUTCFullYear avoids mapping years
// 0-99 to 1900-1999.
const utcDate = (year: number, month: number, day: number): Date => {
  const date = new Date(0)
  date.setUTCFullYear(year, month, day)
  date.setUTCHours(0, 0, 0, 0)
  return date
}

const startOfYear = (year: number): number => utcDate(year, 0, 1).getTime()

const endOfYear = (year: number): number => utcDate(year + 1, 0, 1).getTime()

// Convert an instant to a decimal year using the length of its calendar year.
const decimalYearFromTime = (time: number): number => {
  const year = new Date(time).getUTCFullYear()
  const start = startOfYear(year)
  return year + (time - start) / (endOfYear(year) - start)
}

// A full date denotes the start of that day; a date missing the day denotes
// the whole month and a date missing the month denotes the whole year. For
// those partial dates use the midpoint of the represented interval.
const decimalYearForMonth = (year: number, month: number): number => {
  const start = utcDate(year, month, 1).getTime()
  const end = utcDate(year, month + 1, 1).getTime()
  return decimalYearFromTime(start + (end - start) / 2)
}

const decimalYearForYear = (year: number): number =>
  decimalYearFromTime(startOfYear(year) + (endOfYear(year) - startOfYear(year)) / 2)

// Whether the custom day.js format contains the given token, ignoring literal
// text such as "[Month]". "X"/"x" (Unix timestamps) carry full precision.
const formatHasToken = (format: string, token: RegExp): boolean =>
  token.test(format.replace(/\[[^\]]*\]/g, ""))

export const decimal_date = (sampDate: string, format: DateFormat, customFormat?: string): number => {
  if (format === "yyyy-mm-dd") {
    // Parse the year, month, and day from sampDate. Partial dates are valid;
    // missing components are resolved to the midpoint of their interval.
    const year = parseInt(sampDate.substring(0, 4));
    const month = parseInt(sampDate.substring(5, 7)) - 1; // Month is 0-indexed
    const day = parseInt(sampDate.substring(8, 10));

    if (isNaN(year)) return NaN
    if (isNaN(month)) return decimalYearForYear(year)
    if (isNaN(day)) return decimalYearForMonth(year, month)
    return decimalYearFromTime(utcDate(year, month, day).getTime())
  } else if (format === "custom") {
    // Custom values must match the user-supplied day.js format completely.
    // A format that itself omits the day or month is complete at that
    // precision and uses the midpoint of the interval.
    if (!customFormat) return NaN
    const date = dayjs(sampDate, customFormat, true)
    if (!date.isValid()) return NaN
    if (!formatHasToken(customFormat, /M/)) return decimalYearForYear(date.year())
    if (!formatHasToken(customFormat, /D/)) return decimalYearForMonth(date.year(), date.month())
    return decimalYearFromTime(utcDate(date.year(), date.month(), date.date()).getTime())
  } else {
    // 'decimal' (forward decimal year) and 'tipHeight' (age before the most
    // recent tip) are both raw numeric values, so parse directly as a float.
    // The distinction is carried by the regression xMode, not the parse.
    return parseFloat(sampDate);
  }
};

  

export const date_decimal = (decimal: number): string => {
  let year = Math.floor(Math.abs(decimal));
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInYear = isLeapYear ? 366 : 365;
  let remainingDays = Math.round((Math.abs(decimal) - year) * daysInYear);

  const daysPerMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let month = 0;

  // Adjust for the case where the remaining days equal the total days in a year
  if (remainingDays === daysInYear) {
    year += 1;
    remainingDays = 0;
  }

  while (remainingDays >= daysPerMonth[month]) {
    remainingDays -= daysPerMonth[month];
    month++;
  }

  // Formatting the date
  const formattedYear = year.toString().padStart(4, '0');
  const formattedMonth = (month + 1).toString().padStart(2, '0');
  const formattedDay = (remainingDays + 1).toString().padStart(2, '0');

  if (decimal < 0) {
    return `-${formattedYear}-${formattedMonth}-${formattedDay}`;
  }

  return `${formattedYear}-${formattedMonth}-${formattedDay}`;
};


const handelNegativeIndexes = (splitTipName: Array<string>, delimiter: string, loc: number): number => {
  if (loc < 0) {
    loc = splitTipName.length + loc
  }
  return loc
}

export const extractPartOfTipName = (name: string, delimiter: string, location: string): string => {
  let splitTipName = name.split(delimiter)
  let loc = handelNegativeIndexes(splitTipName, delimiter, parseInt(location))
  return name.split(delimiter)[loc]
}

export function ladderiseNewick(nwk: string) {
  let tr = readNewick(nwk)
  tr.ladderise()
  return writeNewick(tr)
}
export function numToScientific(num: number, dp: number) {
  let exp = num.toExponential()
  let str = exp.split('e')
  return `${parseFloat(str[0]).toFixed(dp)} x 10^${str[1]}`
}
