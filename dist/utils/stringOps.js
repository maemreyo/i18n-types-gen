"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortKeys = exports.toPascal = void 0;
/**
 * Converts a filename to a PascalCase interface name.
 *
 * @param str - The filename.
 * @returns The PascalCase interface name.
 */
const toPascal = (str) => str
    .replace(/(^\w|-\w)/g, (match) => match.replace('-', '').toUpperCase())
    .replace(/\.json$/, '');
exports.toPascal = toPascal;
/**
 * Sorts the keys of an object alphabetically.
 *
 * @param obj - The object to sort.
 * @returns The sorted object with keys sorted alphabetically.
 */
const sortKeys = (obj) => {
    return Object.keys(obj)
        .sort()
        .reduce((sortedObj, key) => {
        sortedObj[key] = obj[key];
        return sortedObj;
    }, {});
};
exports.sortKeys = sortKeys;
