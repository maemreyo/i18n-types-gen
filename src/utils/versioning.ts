import * as fs from 'fs';
import * as path from 'path';

/**
 * Generates the next available versioned directory name based on existing directories.
 *
 * @param baseDir - The base directory where the versioned directories are located.
 * @param baseName - The base name of the directory (e.g., "i18n").
 * @returns The next available directory name with versioning (e.g., "i18n_v1").
 */
export const getNextVersionedDir = (
  baseDir: string,
  baseName: string,
): string => {
  let version = 0;
  let dirName = baseName;

  while (fs.existsSync(path.join(baseDir, dirName))) {
    version += 1;
    dirName = `${baseName}_v${version}`;
  }

  return dirName;
};
