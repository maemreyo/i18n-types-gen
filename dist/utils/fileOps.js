"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTypesContent = exports.updateLangFiles = exports.processLangFiles = exports.denormalizeJSON = exports.normalizeJSON = exports.readJsonFile = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    if (fileContent.trim()) {
        try {
            return JSON.parse(fileContent);
        }
        catch (err) {
            logger_1.default.warn(`⚠️  Warning: Failed to parse JSON file ${filePath}. Skipping...`);
        }
    }
    return {};
};
exports.readJsonFile = readJsonFile;
/**
 * Converts a nested JSON object into a flat object with dot notation keys.
 *
 * @param obj - The nested JSON object.
 * @param prefix - The current prefix for nested keys (used during recursion).
 * @returns A flat object with dot notation keys.
 */
const normalizeJSON = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? `${prefix}.` : '';
        if (typeof obj[k] === 'object' && obj[k] !== null) {
            Object.assign(acc, (0, exports.normalizeJSON)(obj[k], pre + k));
        }
        else {
            acc[pre + k] = obj[k];
        }
        return acc;
    }, {});
};
exports.normalizeJSON = normalizeJSON;
/**
 * Converts a flat key-value pair object into a nested JSON structure.
 *
 * @param data - The flat JSON object.
 * @returns The nested JSON object.
 */
const denormalizeJSON = (data) => {
    const result = {};
    for (let flatKey in data) {
        const keys = flatKey.split('.');
        keys.reduce((acc, key, i) => {
            if (i === keys.length - 1) {
                acc[key] = data[flatKey];
            }
            else {
                // Ensure that the current key is an object. If it's not, replace it with an object.
                if (typeof acc[key] !== 'object' || acc[key] === null) {
                    acc[key] = {};
                }
            }
            return acc[key];
        }, result);
    }
    return result;
};
exports.denormalizeJSON = denormalizeJSON;
/**
 * Processes all JSON files in a language directory, normalizes keys, merges them, and returns the merged result.
 * Warns if there's a conflict key.
 *
 * @param langDir - The path to the language directory.
 * @param allKeys - The object containing the merged keys from all languages.
 */
const processLangFiles = (langDir, allKeys) => {
    const files = fs.readdirSync(langDir);
    for (const file of files) {
        const jsonFilePath = path.join(langDir, file);
        const jsonContent = (0, exports.readJsonFile)(jsonFilePath); // Keep original nested structure
        const flatJsonContent = (0, exports.normalizeJSON)(jsonContent); // Normalize for merging and type generation
        const interfaceName = (0, stringOps_1.toPascal)(path.basename(file, '.json'));
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
 * @param allKeys - The object containing the merged keys from all languages (normalized keys).
 */
const updateLangFiles = (langDir, allKeys) => {
    const files = fs.readdirSync(langDir);
    for (const file of files) {
        const jsonFilePath = path.join(langDir, file);
        const jsonContent = (0, exports.readJsonFile)(jsonFilePath);
        const interfaceName = (0, stringOps_1.toPascal)(path.basename(file, '.json'));
        const allLangKeys = allKeys[interfaceName];
        // Ensure all keys are present in the JSON file, maintaining the nested structure
        const updatedFlatJsonContent = {
            ...(0, exports.normalizeJSON)(jsonContent),
            ...allLangKeys,
        };
        const updatedJsonContent = (0, exports.denormalizeJSON)(updatedFlatJsonContent);
        // Overwrite the original JSON file with the sorted and updated keys
        fs.writeFileSync(jsonFilePath, JSON.stringify(updatedJsonContent, null, 2), 'utf-8');
    }
};
exports.updateLangFiles = updateLangFiles;
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
        const typeFile = path.join(typesPath, `_${interfaceName.toLowerCase()}.ts`);
        const tsContent = `// This file was auto-generated from JSON. Do not edit it manually.

export interface ${interfaceName} {
${Object.keys(sortedKeys)
            .map((key) => `  "${key}": string;`)
            .join('\n')}
}
`;
        fs.writeFileSync(typeFile, tsContent);
        logger_1.default.info(`✅ Generated types for ${interfaceName} -> ${path.relative(process.cwd(), typeFile)}`);
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
    fs.writeFileSync(path.join(typesPath, 'index.ts'), indexContent); // No "_" prefix for index.ts
    logger_1.default.info('✅ I18nKeys are created successfully!');
};
exports.generateTypesContent = generateTypesContent;
