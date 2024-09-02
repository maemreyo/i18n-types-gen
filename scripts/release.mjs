import { execSync } from "child_process";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to print a divider
const printDivider = () => {
  console.log("\n========================================\n");
};

// Function to run a command in the shell
const runCommand = (command) => {
  try {
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(`\n❌ Failed to execute command: "${command}"`);
    console.error('🔍 Error details:', error.message);
    process.exit(1);
  }
};

// Step 1: Build the project
printDivider();
console.log("🏗️  Building the project...");
runCommand("npm run build");

// Step 2: Bump version and generate changelog using standard-version
printDivider();
console.log("🔄 Bumping version and generating changelog...");
runCommand("npx standard-version");

// Step 3: Get the new version from package.json
printDivider();
const packageJsonPath = join(__dirname, "../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const newVersion = packageJson.version;

console.log(`✨ New version is "${newVersion}"`);

// Step 4: Push the commit and tags to GitHub
printDivider();
console.log("🚀 Pushing new version to GitHub...");
// Push commits and tags to the correct branch (e.g., master or main)
runCommand("git push --follow-tags origin master");

printDivider();
console.log("🎉 Release complete!");
printDivider();
