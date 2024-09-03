import * as fs from 'fs';
import * as path from 'path';
import { toPascal, sortKeys } from './stringOps';
import logger from './logger';

/**
 * Reads and parses JSON content from a file.
 * Handles empty files and JSON parsing errors.
 *
 * @param filePath - The path to the JSON file.
 * @returns The parsed JSON content or an empty object.
 */
export const readJsonFile = (filePath: string): Record<string, string> => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  if (fileContent.trim()) {
    try {
      return JSON.parse(fileContent);
    } catch (err) {
      console.warn(
        `⚠️  Warning: Failed to parse JSON file ${filePath}. Skipping...`,
      );
    }
  }

  return {};
};

/**
 * Processes all JSON files in a language directory, merges keys, and returns the merged result.
 * Warn if there's a conflict key
 *
 * @param langDir - The path to the language directory.
 * @param allKeys - The object containing the merged keys from all languages.
 */
export const processLangFiles = (
  langDir: string,
  allKeys: Record<string, Record<string, string>>,
) => {
  const files = fs.readdirSync(langDir);

  for (const file of files) {
    const jsonFilePath = path.join(langDir, file);
    const jsonContent = readJsonFile(jsonFilePath); // Keep original nested structure
    const flatJsonContent = flattenKeys(jsonContent); // Flatten for merging and type generation
    const interfaceName = toPascal(path.basename(file, '.json'));

    if (!allKeys[interfaceName]) {
      allKeys[interfaceName] = {};
    }

    // Merge keys and check for conflicts
    Object.keys(flatJsonContent).forEach((key) => {
      if (
        allKeys[interfaceName][key] &&
        allKeys[interfaceName][key] !== flatJsonContent[key]
      ) {
        logger.warn(
          `⚠️ Conflict detected: Key "${key}" has different values across languages.`,
        );
      }
      allKeys[interfaceName][key] = flatJsonContent[key];
    });
  }
};

/**
 * Ensures that all JSON files in a language directory contain all the merged keys,
 * sorts them, and writes the result back to the file, keeping the nested structure.
 *
 * @param langDir - The path to the language directory.
 * @param allKeys - The object containing the merged keys from all languages (flattened keys).
 */
export const updateLangFiles = (
  langDir: string,
  allKeys: Record<string, Record<string, string>>,
) => {
  const files = fs.readdirSync(langDir);

  for (const file of files) {
    const jsonFilePath = path.join(langDir, file);
    const jsonContent: Record<string, any> = readJsonFile(jsonFilePath);
    const interfaceName = toPascal(path.basename(file, '.json'));
    const allLangKeys = allKeys[interfaceName];

    // Ensure all keys are present in the JSON file and maintain the nested structure
    const updatedJsonContent = mergeNestedKeys(jsonContent, allLangKeys);

    // Overwrite the original JSON file with the sorted and updated keys
    fs.writeFileSync(
      jsonFilePath,
      JSON.stringify(updatedJsonContent, null, 2),
      'utf-8',
    );
  }
};

/**
 * Merges the new flat keys into the existing nested JSON structure and sorts them alphabetically at each level.
 *
 * @param originalContent - The original nested JSON content.
 * @param flatKeys - The flat keys to be merged.
 * @returns The updated nested JSON content with keys sorted at each level.
 */
export const mergeNestedKeys = (
  originalContent: Record<string, any>,
  flatKeys: Record<string, string>,
): Record<string, any> => {
  const nestedContent = { ...originalContent };

  Object.keys(flatKeys).forEach((flatKey) => {
    const keys = flatKey.split('.');
    let currentLevel = nestedContent;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];

      // If the current value is not an object or is null, convert it to an empty object
      if (typeof currentLevel[key] !== 'object' || currentLevel[key] === null) {
        currentLevel[key] = {};
      }

      currentLevel = currentLevel[key];
    }

    const finalKey = keys[keys.length - 1];

    // Assign the value from the flat key to the correct nested structure
    currentLevel[finalKey] = flatKeys[flatKey];

    // Remove the flat key from the original structure after it's been nested
    delete flatKeys[flatKey];
  });

  return sortNestedKeys(nestedContent);
};

/**
 * Sorts the keys of an object alphabetically, including nested objects.
 *
 * @param obj - The object to sort.
 * @returns The sorted object.
 */
export const sortNestedKeys = (
  obj: Record<string, any>,
): Record<string, any> => {
  return Object.keys(obj)
    .sort()
    .reduce((sortedObj: Record<string, any>, key: string) => {
      sortedObj[key] =
        typeof obj[key] === 'object' && obj[key] !== null
          ? sortNestedKeys(obj[key])
          : obj[key];
      return sortedObj;
    }, {});
};

/**
 * Generates TypeScript interfaces from the merged keys and writes them to the appropriate files.
 *
 * @param allKeys - The object containing the merged keys from all languages.
 * @param typesPath - The directory where the TypeScript interfaces should be written.
 */
export const generateTypesContent = (
  allKeys: Record<string, Record<string, string>>,
  typesPath: string,
) => {
  const generatedFiles = [];

  for (const [interfaceName, keys] of Object.entries(allKeys)) {
    // Sort keys alphabetically
    const sortedKeys = sortKeys(keys);

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
    logger.info(
      `✅ Generated types for ${interfaceName} -> ${path.relative(process.cwd(), typeFile)}`,
    );
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
  logger.info('✅ I18nKeys are created successfully!');
};

/**
 * Converts a nested JSON object into a flat object with dot notation keys.
 *
 * @param obj - The nested JSON object.
 * @param prefix - The current prefix for nested keys (used during recursion).
 * @returns A flat object with dot notation keys.
 */
export const flattenKeys = (
  obj: Record<string, any>,
  prefix: string = '',
): Record<string, string> => {
  return Object.keys(obj).reduce((acc: Record<string, string>, k: string) => {
    const pre = prefix.length ? `${prefix}.` : '';
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      Object.assign(acc, flattenKeys(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
};
