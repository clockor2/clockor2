
export const decimal_date = (sampDate: string, format: "yyyy-mm-dd" | "decimal") => {
  if (format === "yyyy-mm-dd") {
    let date = new Date(sampDate)
    let yr = date.getFullYear();
    let m = date.getMonth() ?? 0;
    let d = date.getDate() ?? 0; // default to first day of month

    let decimal_date_value = (
      yr +
      m / 12 +
      d / 365.25
    )

    return decimal_date_value;
  } else {
    let decimal_date = parseFloat(sampDate)
    return decimal_date
  }
};

export const date_decimal = (sampDate: number): Date => {
  var year = parseInt(sampDate.toString());
  var reminder = sampDate - year;
  var daysPerYear = 365.25
  var miliseconds = reminder * daysPerYear * 24 * 60 * 60 * 1000;
  var yearDate = new Date(year, 0, 1);
  var outDate = new Date(yearDate.getTime() + miliseconds);

  return outDate;
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