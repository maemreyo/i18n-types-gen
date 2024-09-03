"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenKeys = exports.generateTypesContent = exports.sortNestedKeys = exports.mergeNestedKeys = exports.updateLangFiles = exports.processLangFiles = exports.readJsonFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const stringOps_1 = require("./stringOps");
const logger_1 = __importDefault(require("./logger"));
/**
 * Reads and parses JSON content from a file.
 * Handles empty files and JSON parsing errors.
 *
 * @param filePath - The path to the JSON file.
 * @returns The parsed JSON content or an empty object.
 */
const readJsonFile = (filePath) => {
    const fileContent = fs_1.default.readFileSync(filePath, 'utf-8');
    if (fileContent.trim()) {
        try {
            return JSON.parse(fileContent);
        }
        catch (err) {
            console.warn(`⚠️  Warning: Failed to parse JSON file ${filePath}. Skipping...`);
        }
    }
    return {};
};
exports.readJsonFile = readJsonFile;
/**
 * Processes all JSON files in a language directory, merges keys, and returns the merged result.
 * Warn if there's a conflict key
 *
 * @param langDir - The path to the language directory.
 * @param allKeys - The object containing the merged keys from all languages.
 */
const processLangFiles = (langDir, allKeys) => {
    const files = fs_1.default.readdirSync(langDir);
    for (const file of files) {
        const jsonFilePath = path_1.default.join(langDir, file);
        const jsonContent = (0, exports.readJsonFile)(jsonFilePath); // Keep original nested structure
        const flatJsonContent = (0, exports.flattenKeys)(jsonContent); // Flatten for merging and type generation
        const interfaceName = (0, stringOps_1.toPascal)(path_1.default.basename(file, '.json'));
        if (!allKeys[interfaceName]) {
            allKeys[interfaceName] = {};
        }
        // Merge keys and check for conflicts
        Object.keys(flatJsonContent).forEach((key) => {
            if (allKeys[interfaceName][key] &&
                allKeys[interfaceName][key] !== flatJsonContent[key]) {
                logger_1.default.warn(`⚠️ Conflict detected: Key "${key}" has different values across languages.`);
            }
            allKeys[interfaceName][key] = flatJsonContent[key];
        });
    }
};
exports.processLangFiles = processLangFiles;
/**
 * Ensures that all JSON files in a language directory contain all the merged keys,
 * sorts them, and writes the result back to the file, keeping the nested structure.
 *
 * @param langDir - The path to the language directory.
 * @param allKeys - The object containing the merged keys from all languages (flattened keys).
 */
const updateLangFiles = (langDir, allKeys) => {
    const files = fs_1.default.readdirSync(langDir);
    for (const file of files) {
        const jsonFilePath = path_1.default.join(langDir, file);
        const jsonContent = (0, exports.readJsonFile)(jsonFilePath);
        const interfaceName = (0, stringOps_1.toPascal)(path_1.default.basename(file, '.json'));
        const allLangKeys = allKeys[interfaceName];
        // Ensure all keys are present in the JSON file and maintain the nested structure
        const updatedJsonContent = (0, exports.mergeNestedKeys)(jsonContent, allLangKeys);
        // Overwrite the original JSON file with the sorted and updated keys
        fs_1.default.writeFileSync(jsonFilePath, JSON.stringify(updatedJsonContent, null, 2), 'utf-8');
    }
};
exports.updateLangFiles = updateLangFiles;
/**
 * Merges the new flat keys into the existing nested JSON structure and sorts them alphabetically at each level.
 *
 * @param originalContent - The original nested JSON content.
 * @param flatKeys - The flat keys to be merged.
 * @returns The updated nested JSON content with keys sorted at each level.
 */
const mergeNestedKeys = (originalContent, flatKeys) => {
    const nestedContent = { ...originalContent };
    Object.keys(flatKeys).forEach((flatKey) => {
        const keys = flatKey.split('.');
        let currentLevel = nestedContent;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!currentLevel[key]) {
                currentLevel[key] = {};
            }
            currentLevel = currentLevel[key];
        }
        currentLevel[keys[keys.length - 1]] =
            flatKeys[flatKey] || originalContent[flatKey] || '';
    });
    return (0, exports.sortNestedKeys)(nestedContent);
};
exports.mergeNestedKeys = mergeNestedKeys;
/**
 * Sorts the keys of a nested object alphabetically at each level.
 *
 * @param obj - The nested object to sort.
 * @returns The sorted object with keys sorted alphabetically at each level.
 */
const sortNestedKeys = (obj) => {
    return Object.keys(obj)
        .sort()
        .reduce((sortedObj, key) => {
        sortedObj[key] =
            typeof obj[key] === 'object' && obj[key] !== null
                ? (0, exports.sortNestedKeys)(obj[key])
                : obj[key];
        return sortedObj;
    }, {});
};
exports.sortNestedKeys = sortNestedKeys;
/**
 * Generates TypeScript interfaces from the merged keys and writes them to the appropriate files.
 *
 * @param allKeys - The object containing the merged keys from all languages.
 * @param typesPath - The directory where the TypeScript interfaces should be written.
 */
const generateTypesContent = (allKeys, typesPath) => {
    const generatedFiles = [];
    for (const [interfaceName, keys] of Object.entries(allKeys)) {
        // Sort keys alphabetically
        const sortedKeys = (0, stringOps_1.sortKeys)(keys);
        // Prefix with "_" for all files except index.ts
        const typeFile = path_1.default.join(typesPath, `_${interfaceName.toLowerCase()}.ts`);
        const tsContent = `// This file was auto-generated from JSON. Do not edit it manually.

export interface ${interfaceName} {
${Object.keys(sortedKeys)
            .map((key) => `  "${key}": string;`)
            .join('\n')}
}
`;
        fs_1.default.writeFileSync(typeFile, tsContent);
        logger_1.default.info(`✅ Generated types for ${interfaceName} -> ${path_1.default.relative(process.cwd(), typeFile)}`);
        generatedFiles.push(interfaceName);
    }
    // Generate index.ts that combines all interfaces without "_"
    const importsContent = generatedFiles
        .map((name) => `import { ${name} } from './_${name.toLowerCase()}';`)
        .join('\n');
    const combinedKeysContent = `
export type I18nKeys = ${generatedFiles
        .map((name) => `keyof ${name}`)
        .join(' | ')};
  `;
    const indexContent = `
${importsContent}

${combinedKeysContent}
  `;
    fs_1.default.writeFileSync(path_1.default.join(typesPath, 'index.ts'), indexContent); // No "_" prefix for index.ts
    logger_1.default.info('✅ I18nKeys are created successfully!');
};
exports.generateTypesContent = generateTypesContent;
/**
 * Converts a nested JSON object into a flat object with dot notation keys.
 *
 * @param obj - The nested JSON object.
 * @param prefix - The current prefix for nested keys (used during recursion).
 * @returns A flat object with dot notation keys.
 */
const flattenKeys = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? `${prefix}.` : '';
        if (typeof obj[k] === 'object' && obj[k] !== null) {
            Object.assign(acc, (0, exports.flattenKeys)(obj[k], pre + k));
        }
        else {
            acc[pre + k] = obj[k];
        }
        return acc;
    }, {});
};
exports.flattenKeys = flattenKeys;
