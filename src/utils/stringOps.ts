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
 * Sorts an object's keys alphabetically.
 *
 * @param obj - The object to sort. It should be an object with string keys and string values.
 * @returns The sorted object with string keys and string values.
 */
export const sortKeys = (
  obj: Record<string, string>,
): Record<string, string> => {
  return Object.keys(obj)
    .sort()
    .reduce((result: Record<string, string>, key: string) => {
      result[key] = obj[key];
      return result;
    }, {}); // Start with an empty object of type Record<string, string>
};
