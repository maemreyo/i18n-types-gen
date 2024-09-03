import * as path from 'path';
import * as fs from 'fs';
import {
  processAndUpdateLangFiles,
  generateTypesContent,
  normalizeJSON,
  readJsonFile,
} from './utils/fileOps';
import { getNextVersionedDir } from './utils/versioning';
import logger from './utils/logger';
import { toPascal } from './utils/stringOps';

interface GenerateTypesOptions {
  localePath?: string;
  typesPath?: string;
  autoAddMissingKeys?: boolean;
  dryRun?: boolean;
}

/**
 * Generate TypeScript interfaces from i18n JSON files with versioning.
 *
 * @param options - The options object containing paths and feature flags.
 */
export const generateTypes = async ({
  localePath = path.resolve(process.cwd(), '_locales'),
  typesPath = path.resolve(process.cwd(), '_types/i18n'),
  autoAddMissingKeys = true,
  dryRun = false,
}: GenerateTypesOptions) => {
  // Determine the versioned output directory
  const versionedTypesDir = path.join(
    typesPath,
    '..',
    getNextVersionedDir(path.join(typesPath, '..'), path.basename(typesPath)),
  );

  // Create the versioned types directory if it doesn't exist
  if (!dryRun && !fs.existsSync(versionedTypesDir)) {
    fs.mkdirSync(versionedTypesDir, { recursive: true });
    logger.info(
      `📁 Created versioned types directory: ${path.relative(process.cwd(), versionedTypesDir)}`,
    );
  }

  try {
    const languages = fs.readdirSync(localePath);
    const allKeys: Record<string, Record<string, string>> = {};

    // Process and update each language's JSON files independently
    for (const lang of languages) {
      const langDir = path.join(localePath, lang);

      // Process the language files and gather normalized keys
      processAndUpdateLangFiles(langDir);

      // Gather all unique keys across all JSON files
      const files = fs.readdirSync(langDir);
      for (const file of files) {
        const jsonFilePath = path.join(langDir, file);
        const jsonContent = normalizeJSON(readJsonFile(jsonFilePath));
        const interfaceName = toPascal(path.basename(file, '.json'));

        if (!allKeys[interfaceName]) {
          allKeys[interfaceName] = {};
        }

        // Merge the normalized keys into the allKeys object
        Object.assign(allKeys[interfaceName], jsonContent);
      }
    }

    // Dry Run: Only log the output, do not write files
    if (dryRun) {
      logger.info(
        '🔍 Dry Run mode enabled. The following types would be generated:',
      );
      logger.info(JSON.stringify(allKeys, null, 2));
      return;
    }

    // Generate TypeScript files in the versioned directory
    generateTypesContent(allKeys, versionedTypesDir);

    logger.info('\n🎉 All tasks completed successfully!');
    logger.info('\n🚀 You can now continue with your development.\n');
  } catch (err) {
    logger.error(`❌ Error during types generation: ${err}`);
  }
};
