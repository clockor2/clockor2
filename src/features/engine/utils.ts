import { readNewick, writeNewick } from "phylojs"

export const decimal_date = (sampDate: string, format: "yyyy-mm-dd" | "decimal") => {
  if (format === "yyyy-mm-dd") {
    // Parse the year, month, and day from sampDate
    let year = parseInt(sampDate.substring(0, 4));
    let month = parseInt(sampDate.substring(5, 7)) - 1; // Month is 0-indexed
    if (isNaN(month)) month = 0
    let day = parseInt(sampDate.substring(8, 10));
    if (isNaN(day)) day = 1

    // Create Date objects for the given date, the start of the year, and the start of the next year in UTC
    let date = new Date(Date.UTC(year, month, day));
    let startOfYear = new Date(Date.UTC(year, 0, 1));
    let endOfYear = new Date(Date.UTC(year + 1, 0, 1));

    // Calculate the total number of days in the year
    let daysInYear = (endOfYear.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000);

    // Calculate the day of the year for the given date
    let dayOfYear = (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000);

    // Calculate the decimal date value
    let decimal_date_value = year + (dayOfYear / daysInYear);
    return decimal_date_value;
  } else {
    // If the format is 'decimal', directly parse the input string as a float
    return parseFloat(sampDate);
  }
};

  

export const date_decimal = (decimal: number): string => {
  let year = Math.floor(decimal);
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInYear = isLeapYear ? 366 : 365;
  let remainingDays = Math.round((decimal - year) * daysInYear);

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
  const formattedMonth = (month + 1).toString().padStart(2, '0');
  const formattedDay = (remainingDays + 1).toString().padStart(2, '0');

  return `${year}-${formattedMonth}-${formattedDay}`;
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