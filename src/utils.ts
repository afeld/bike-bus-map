export const arrayToObj = (headers: string[], row: string[]) => {
  const result = {};
  headers.forEach((header, i) => {
    result[header] = row[i];
  });
  return result;
};

// https://stackoverflow.com/a/2843625/358804
export const join = (parts: (string | null)[], separator = ", ") =>
  parts.filter(Boolean).join(separator);
