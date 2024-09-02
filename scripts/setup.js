const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, errorMessage) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`❌ ${errorMessage}`);
    console.error('🔍 Error details:', error.message);
    process.exit(1);
  }
}

// Step 1: Install dependencies including Husky
console.log('🚀 Installing dependencies...');
runCommand('npm install', 'Failed to install dependencies.');

// Step 2: Initialize Husky
console.log('🔧 Setting up Husky...');
runCommand('npx husky install', 'Failed to initialize Husky.');

// Step 3: Add a pre-commit hook to Husky
console.log('📎 Adding pre-commit hook to Husky...');
const huskyDir = path.join(__dirname, '../.husky');
if (!fs.existsSync(huskyDir)) {
  fs.mkdirSync(huskyDir);
  console.log('📁 .husky directory created.');
} else {
  console.log('📂 .husky directory already exists.');
}

const preCommitPath = path.join(huskyDir, 'pre-commit');
fs.writeFileSync(
  preCommitPath,
  `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
`
);

fs.chmodSync(preCommitPath, '755');
console.log('✅ Pre-commit hook added successfully.');

// Step 4: Provide an option to run in development mode
if (process.argv.includes('--dev')) {
  console.log('🛠️ Starting in development mode...');
  runCommand('npm run dev', 'Failed to start in development mode.');
} else {
  console.log('🎉 Setup complete! You can start the project using "npm start".');
}
