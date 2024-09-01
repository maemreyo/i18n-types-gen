/**
 * Converts a filename to a PascalCase interface name.
 *
 * @param str - The filename.
 * @returns The PascalCase interface name.
 */
export const toPascal = (str: string): string =>
  str
    .replace(/(^\w|-\w)/g, (match) => match.replace('-', '').toUpperCase())
    .replace(/\.json$/, '');

/**
 * Sorts the keys of an object alphabetically.
 *
 * @param obj - The object to sort.
 * @returns The sorted object with keys sorted alphabetically.
 */
export const sortKeys = (obj: Record<string, any>): Record<string, any> => {
  return Object.keys(obj)
    .sort()
    .reduce((sortedObj: Record<string, any>, key: string) => {
      sortedObj[key] = obj[key];
      return sortedObj;
    }, {});
};
