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
exports.generateTypes = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const fileOps_1 = require("./utils/fileOps");
const versioning_1 = require("./utils/versioning");
const logger_1 = __importDefault(require("./utils/logger"));
const stringOps_1 = require("./utils/stringOps");
/**
 * Generate TypeScript interfaces from i18n JSON files with versioning.
 *
 * @param options - The options object containing paths and feature flags.
 */
const generateTypes = async ({ localePath = path.resolve(process.cwd(), '_locales'), typesPath = path.resolve(process.cwd(), '_types/i18n'), autoAddMissingKeys = true, dryRun = false, }) => {
    // Determine the versioned output directory
    const versionedTypesDir = path.join(typesPath, '..', (0, versioning_1.getNextVersionedDir)(path.join(typesPath, '..'), path.basename(typesPath)));
    // Create the versioned types directory if it doesn't exist
    if (!dryRun && !fs.existsSync(versionedTypesDir)) {
        fs.mkdirSync(versionedTypesDir, { recursive: true });
        logger_1.default.info(`📁 Created versioned types directory: ${path.relative(process.cwd(), versionedTypesDir)}`);
    }
    try {
        const languages = fs.readdirSync(localePath);
        const allKeys = {};
        // Process and update each language's JSON files independently
        for (const lang of languages) {
            const langDir = path.join(localePath, lang);
            // Process the language files and gather normalized keys
            (0, fileOps_1.processAndUpdateLangFiles)(langDir);
            // Gather all unique keys across all JSON files
            const files = fs.readdirSync(langDir);
            for (const file of files) {
                const jsonFilePath = path.join(langDir, file);
                const jsonContent = (0, fileOps_1.normalizeJSON)((0, fileOps_1.readJsonFile)(jsonFilePath));
                const interfaceName = (0, stringOps_1.toPascal)(path.basename(file, '.json'));
                if (!allKeys[interfaceName]) {
                    allKeys[interfaceName] = {};
                }
                // Merge the normalized keys into the allKeys object
                Object.assign(allKeys[interfaceName], jsonContent);
            }
        }
        // Dry Run: Only log the output, do not write files
        if (dryRun) {
            logger_1.default.info('🔍 Dry Run mode enabled. The following types would be generated:');
            logger_1.default.info(JSON.stringify(allKeys, null, 2));
            return;
        }
        // Generate TypeScript files in the versioned directory
        (0, fileOps_1.generateTypesContent)(allKeys, versionedTypesDir);
        logger_1.default.info('\n🎉 All tasks completed successfully!');
        logger_1.default.info('\n🚀 You can now continue with your development.\n');
    }
    catch (err) {
        logger_1.default.error(`❌ Error during types generation: ${err}`);
    }
};
exports.generateTypes = generateTypes;
