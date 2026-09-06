const { execSync } = require('child_process');
try {
  console.log('Starting Vite build...');
  execSync('node ./node_modules/vite/bin/vite.js build', { stdio: 'inherit' });
  console.log('BUILD SUCCESSFUL!');
  process.exit(0);
} catch (err) {
  console.error('Build Failed:\n', err.stdout || '', err.stderr || err.message);
  process.exit(1);
}
