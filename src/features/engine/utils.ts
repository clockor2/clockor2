export const decimal_date = (date: Date) => {
    var full_year = date.getFullYear();
    var year_start = new Date(full_year, 0, 1).getTime(),
        year_start_p1 = new Date(full_year + 1, 0, 1).getTime();

    const decimal_date_value =
        full_year + (date.getTime() - year_start) / (year_start_p1 - year_start);

    return decimal_date_value;
  };
