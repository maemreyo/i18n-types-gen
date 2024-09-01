# i18n TypeScript Generator

This package is a utility for generating TypeScript interfaces from i18n JSON files, making it easier to manage and use localization keys in TypeScript projects. It supports complex, nested JSON structures, automatically generates types, and ensures that all localization keys are consistent across different languages.

## Features

- **Deep/Nested JSON Support**: Automatically converts nested JSON keys into flat TypeScript interface keys while maintaining the original JSON structure.
- **Dry Run Mode**: Preview the output before generating files to ensure everything is correct without making any changes to the file system.
- **Key Conflict Warnings**: Alerts you to any duplicate or missing keys across different language files, helping you maintain consistency.
- **Versioning**: Automatically generates versioned output directories to keep track of different sets of generated TypeScript interfaces.
- **Sorted Keys**: Ensures that all keys in the generated TypeScript interfaces and JSON files are sorted alphabetically, making the files easy to navigate and maintain.
- **Automatic Key Addition**: Automatically adds missing keys across different language files to ensure consistency.
- **Customizable Paths**: Allows you to set custom paths for your locales and output directories.

## Installation

### Via npm

```bash
npm install --save-dev i18n-types-generator
```

### Via yarn

```bash
yarn add --dev i18n-types-generator
```

## Usage

### Programmatic Usage

You can use the generator programmatically in your Node.js scripts:

```javascript
const { generateTypes } = require('i18n-types-generator');

generateTypes({
  localePath: './src/locales',
  typesPath: './src/types/i18n',
  autoAddMissingKeys: true,
  dryRun: false,
});
```

### Example Structure

Assuming you have the following JSON files:

```plaintext
src/
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   └── auth.json
│   └── vi/
│       ├── common.json
│       └── auth.json
```

Your TypeScript output might look like this:

```plaintext
src/
├── types/
│   └── i18n_v1/
│       ├── _common.ts
│       ├── _auth.ts
│       └── index.ts
```

### Configuration

You can customize the generator's behavior via the following options:

- **`localePath`**: Path to the directory containing your i18n JSON files (default: `./src/locales`).
- **`typesPath`**: Path to the output directory for TypeScript files (default: `./src/types/i18n`).
- **`autoAddMissingKeys`**: Automatically add missing keys across all languages (default: `true`).
- **`dryRun`**: Run the generator in dry run mode to preview the output without making any changes (default: `false`).

### Advanced Features

#### Versioning

The tool automatically generates versioned directories for each run to ensure you can track changes over time.

#### Key Conflict Warnings

If the same key exists in multiple JSON files with different values, the generator will warn you about the conflict so you can resolve it manually.

### Limitations

- Currently, this tool assumes all JSON files are properly formatted. Any malformed JSON will be skipped with a warning.
- The tool is designed to work with JSON files. Other formats are not supported at this time.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue on GitHub.

### To get started:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/i18n-types-generator.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Make your changes and create a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the need to maintain consistent localization across large TypeScript projects.
- Thanks to the community for feedback and contributions.

---
