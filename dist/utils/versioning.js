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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextVersionedDir = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Generates the next available versioned directory name based on existing directories.
 *
 * @param baseDir - The base directory where the versioned directories are located.
 * @param baseName - The base name of the directory (e.g., "i18n").
 * @returns The next available directory name with versioning (e.g., "i18n_v1").
 */
const getNextVersionedDir = (baseDir, baseName) => {
    let version = 0;
    let dirName = baseName;
    while (fs.existsSync(path.join(baseDir, dirName))) {
        version += 1;
        dirName = `${baseName}_v${version}`;
    }
    return dirName;
};
exports.getNextVersionedDir = getNextVersionedDir;
