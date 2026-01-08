const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function findGitRoot(start) {
  let dir = start;
  while (dir && dir !== path.parse(dir).root) {
    const candidate = path.join(dir, '.git');
    if (fs.existsSync(candidate)) return dir;
    dir = path.dirname(dir);
  }
  return null;
}

try {
  if (process.env.HUSKY === '0' || process.env.CI === 'true') {
    console.log('Husky disabled via env (HUSKY=0 or CI=true) — skipping husky install');
    process.exit(0);
  }

  const projectDir = process.cwd();
  const gitRoot = findGitRoot(projectDir);
  if (gitRoot) {
    const hooksDir = path.relative(gitRoot, path.join(projectDir, '.husky')).replace(/\\/g, '/');
    console.log(`Found .git at ${gitRoot}; running \`husky install ${hooksDir}\``);
    execSync(`npx husky install ${hooksDir}`, {
      stdio: 'inherit',
      shell: true,
      cwd: gitRoot,
    });
  } else {
    console.log('No .git found in parent chain — skipping husky install');
  }
} catch (err) {
  console.warn('husky install failed (non-fatal):', err.message);
}
