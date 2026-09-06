const { execSync } = require('child_process');
try {
  const pipList = execSync('python -m pip list --disable-pip-version-check', { encoding: 'utf8', timeout: 10000 });
  console.log('Installed Python Packages:\n', pipList);
} catch (e) {
  console.log('Pip list error or timeout:', e.message);
}
