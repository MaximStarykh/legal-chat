const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Vercel build...');

// Create .vercel directory if it doesn't exist
const vercelDir = path.join(process.cwd(), '.vercel');
if (!fs.existsSync(vercelDir)) {
  fs.mkdirSync(vercelDir, { recursive: true });
}

// Install dependencies
console.log('Installing dependencies...');
try {
  execSync('npm install --production=false', { stdio: 'inherit' });
  
  // Build the application
  console.log('Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
