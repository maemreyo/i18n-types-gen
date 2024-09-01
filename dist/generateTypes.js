'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.generateTypes = void 0;
const path_1 = __importDefault(require('path'));
const fs_1 = __importDefault(require('fs'));
const fileOps_1 = require('./utils/fileOps');
const versioning_1 = require('./utils/versioning');
const logger_1 = __importDefault(require('./utils/logger'));
/**
 * Generate TypeScript interfaces from i18n JSON files with versioning.
 *
 * @param options - The options object containing paths and feature flags.
 */
const generateTypes = async ({
  localePath = path_1.default.resolve(process.cwd(), '_locales'),
  typesPath = path_1.default.resolve(process.cwd(), '_types/i18n'),
  autoAddMissingKeys = true,
  dryRun = false,
}) => {
  // Determine the versioned output directory
  const versionedTypesDir = path_1.default.join(
    typesPath,
    '..',
    (0, versioning_1.getNextVersionedDir)(
      path_1.default.join(typesPath, '..'),
      path_1.default.basename(typesPath),
    ),
  );
  // Create the versioned types directory if it doesn't exist
  if (!dryRun && !fs_1.default.existsSync(versionedTypesDir)) {
    fs_1.default.mkdirSync(versionedTypesDir, { recursive: true });
    logger_1.default.info(
      `📁 Created versioned types directory: ${path_1.default.relative(process.cwd(), versionedTypesDir)}`,
    );
  }
  try {
    const languages = fs_1.default.readdirSync(localePath);
    const allKeys = {};
    // First pass: Gather all unique keys across all JSON files
    for (const lang of languages) {
      const langDir = path_1.default.join(localePath, lang);
      (0, fileOps_1.processLangFiles)(langDir, allKeys);
    }
    // Second pass: Ensure all JSON files have the same keys, fill missing keys if needed
    if (autoAddMissingKeys) {
      for (const lang of languages) {
        const langDir = path_1.default.join(localePath, lang);
        (0, fileOps_1.updateLangFiles)(langDir, allKeys);
      }
    }
    // Flatten keys for each interface
    Object.keys(allKeys).forEach((interfaceName) => {
      allKeys[interfaceName] = (0, fileOps_1.flattenKeys)(
        allKeys[interfaceName],
      );
    });
    // Dry Run: Only log the output, do not write files
    if (dryRun) {
      logger_1.default.info(
        '🔍 Dry Run mode enabled. The following types would be generated:',
      );
      logger_1.default.info(JSON.stringify(allKeys, null, 2));
      return;
    }
    // Generate TypeScript files in the versioned directory
    (0, fileOps_1.generateTypesContent)(allKeys, versionedTypesDir);
    logger_1.default.info('\n🎉 All tasks completed successfully!');
    logger_1.default.info('\n🚀 You can now continue with your development.\n');
  } catch (err) {
    logger_1.default.error(`❌ Error during types generation: ${err}`);
  }
};
exports.generateTypes = generateTypes;
