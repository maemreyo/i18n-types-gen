/**
 * Options for the generateTypes function.
 */
export interface GenerateTypesOptions {
  /**
   * The path to the directory containing your i18n JSON files.
   * Default: './src/locales'
   */
  localePath: string;

  /**
   * The path to the output directory for TypeScript files.
   * Default: './src/types/i18n'
   */
  typesPath: string;

  /**
   * Automatically add missing keys across all languages.
   * Default: true
   */
  autoAddMissingKeys?: boolean;

  /**
   * Run the generator in dry run mode to preview the output without making any changes.
   * Default: false
   */
  dryRun?: boolean;

  /**
   * Enable or disable versioning for the generated TypeScript files.
   * If enabled, the types will be versioned and saved in versioned directories.
   * Default: true
   */
  enableVersioning?: boolean;
}

/**
 * Generates TypeScript interfaces from i18n JSON files.
 *
 * @param options - Configuration options for the generator.
 * @returns A Promise that resolves when the generation is complete.
 *
 * Example usage:
 * ```typescript
 * import { generateTypes } from 'i18n-types-gen';
 *
 * generateTypes({
 *   localePath: './src/locales',
 *   typesPath: './src/types/i18n',
 *   autoAddMissingKeys: true,
 *   dryRun: false,
 *   enableVersioning: true, // Enable versioning
 * });
 * ```
 */
export function generateTypes(options: GenerateTypesOptions): Promise<void>;
