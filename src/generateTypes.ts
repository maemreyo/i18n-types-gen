import * as path from 'path';
import * as fs from 'fs';
import {
  processLangFiles,
  updateLangFiles,
  generateTypesContent,
} from './utils/fileOps';
import { getNextVersionedDir } from './utils/versioning';
import logger from './utils/logger';

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

    // First pass: Gather all unique keys across all JSON files
    for (const lang of languages) {
      const langDir = path.join(localePath, lang);
      processLangFiles(langDir, allKeys);
    }

    // Second pass: Ensure all JSON files have the same keys, fill missing keys if needed
    if (autoAddMissingKeys) {
      for (const lang of languages) {
        const langDir = path.join(localePath, lang);
        updateLangFiles(langDir, allKeys);
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
