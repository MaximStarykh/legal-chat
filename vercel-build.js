import { execSync } from 'child_process';
import { existsSync, copyFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current directory in an ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.env.DEV) console.log('🚀 Starting Vercel build...');

// Ensure .env file exists
const envPath = join(process.cwd(), '.env');
if (!existsSync(envPath)) {
  if (import.meta.env.DEV) console.log('No .env file found, creating from .env.example...');
  if (existsSync(join(process.cwd(), '.env.example'))) {
    copyFileSync(join(process.cwd(), '.env.example'), envPath);
    if (import.meta.env.DEV) console.log('Created .env file from .env.example');
  } else {
    console.warn('No .env.example file found, please create a .env file manually');
  }
}

// Install dependencies
if (import.meta.env.DEV) console.log('📦 Installing dependencies...');
try {
  // Install all dependencies including devDependencies
  execSync('npm ci --prefer-offline --no-audit --progress=false', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' },
  });

  // Build the application
  if (import.meta.env.DEV) console.log('🔨 Building application...');
  execSync('npm run build', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  });

  if (import.meta.env.DEV) console.log('✅ Build completed successfully!');
  process.exit(0);
} catch (error) {
  if (import.meta.env.DEV) console.error('❌ Build failed:', error);
  process.exit(1);
}
