import { execSync } from 'child_process';
import { join } from 'path';
import { readFileSync } from 'fs';

// Helper function to print a divider
const printDivider = () => {
  console.log("\n========================================\n");
};

// Function to run a command in the shell
const runCommand = (command) => {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\n❌ Failed to execute command: "${command}" `);
    console.error('🔍 Error details:', error.message);
    process.exit(1);
  }
};

// Function to check if there are any stashes
const hasStashes = () => {
  try {
    const result = execSync('git stash list', { stdio: 'pipe' }).toString();
    return result.trim().length > 0;
  } catch (error) {
    console.error('❌ Failed to check stashes.');
    console.error('🔍 Error details:', error.message);
    return false;
  }
};

// Step 1: Get the target tag from command line arguments
printDivider();
const targetTag = process.argv[2];

if (!targetTag) {
  console.error('🚨 Please provide a tag to rollback to.');
  process.exit(1);
}

// Step 2: Check if the tag exists
printDivider();
try {
  runCommand(`git rev-parse ${targetTag}`);
} catch (error) {
  console.error(`🚫 Tag "${targetTag}" does not exist.`);
  process.exit(1);
}

console.log(`⏳ Rolling back to tag "${targetTag}"...`);

// Step 3: Create a backup branch
printDivider();
const backupBranchName = `backup-before-rollback-${new Date()
  .toISOString()
  .replace(/[:.]/g, '-')}`;
console.log(`🔄 Creating a backup branch: "${backupBranchName}"...`);
runCommand(`git checkout -b ${backupBranchName}`);

// Step 4: Push the backup branch to remote
printDivider();
console.log(`🌍 Pushing the backup branch to remote...`);
runCommand(`git push origin ${backupBranchName}`);

console.log(`✅ Backup branch "${backupBranchName}" created and pushed to remote.`);

// Step 5: Stash local changes (if any)
printDivider();
console.log('📦 Stashing local changes...');
runCommand('git stash');

// Step 6: Checkout the target tag
printDivider();
console.log(`🔄 Checking out tag "${targetTag}"...`);
runCommand(`git checkout ${targetTag}`);

// Step 7: Force push the rollback to the main branch
printDivider();
console.log('🚀 Force pushing the rollback to the main branch...');
runCommand('git checkout master'); // Adjust if you're using a different branch name
runCommand(`git reset --hard ${targetTag}`);
runCommand('git push -f origin master');

// Step 8: Apply the stashed changes (if any)
printDivider();
console.log('🔧 Applying stashed changes...');
if (hasStashes()) {
  try {
    runCommand('git stash pop');
  } catch (error) {
    console.warn(
      '⚠️ Failed to apply stashed changes, or there was nothing to apply.',
      error.message,
    );
  }
} else {
  console.log('ℹ️ No stashed changes to apply.');
}

printDivider();
console.log(`🎉 Rollback to "${targetTag}" complete!`);
printDivider();
