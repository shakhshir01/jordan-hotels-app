const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function findGitDir(start) {
  let dir = start;
  while (dir && dir !== path.parse(dir).root) {
    const candidate = path.join(dir, '.git');
    if (fs.existsSync(candidate)) return true;
    dir = path.dirname(dir);
  }
  return false;
}

try {
  const projectDir = process.cwd();
  if (findGitDir(projectDir)) {
    console.log('Found .git; running `husky install`');
    execSync('npx husky install', { stdio: 'inherit', shell: true });
  } else {
    console.log('No .git found in parent chain — skipping husky install');
  }
} catch (err) {
  console.warn('husky install failed (non-fatal):', err.message);
}
