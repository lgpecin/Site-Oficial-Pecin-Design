import { execSync } from 'node:child_process';

const command = 'npx playwright install --with-deps';

try {
  console.log(`Running: ${command}`);
  execSync(command, { stdio: 'inherit' });
  console.log('Playwright browsers installed successfully.');
} catch (error) {
  console.warn('\n⚠️  Warning: Unable to install Playwright browsers automatically.');
  console.warn('This often happens when downloads are blocked by a proxy or HTTP 403 response.');

  if (error instanceof Error) {
    if ('status' in error && typeof error.status === 'number') {
      console.warn(`Exit status: ${error.status}`);
    }

    const stderr =
      error && typeof error === 'object' && 'stderr' in error && error.stderr instanceof Buffer
        ? error.stderr
        : undefined;

    if (stderr) {
      const message = stderr.toString().trim();
      if (message) {
        console.warn('\nPlaywright output:\n');
        console.warn(message);
      }
    } else if (error.message) {
      console.warn(error.message);
    }
  }

  console.warn('\nContinuing without Playwright browser downloads.');
  process.exitCode = 0;
}
