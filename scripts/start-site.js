const { spawn, execSync } = require('child_process');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');

console.log('\x1b[36m%s\x1b[0m', '==================================================');
console.log('\x1b[36m%s\x1b[0m', '  RailBus Platform - Starting Full-Stack Services ');
console.log('\x1b[36m%s\x1b[0m', '==================================================\n');

// Clean up any stale port processes on Windows
function freePort(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && pid !== String(process.pid)) {
            console.log(`\x1b[33m[PortManager] Freeing busy port ${port} (PID ${pid})...\x1b[0m`);
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          }
        }
      }
    }
  } catch (e) {
    // Port is free
  }
}

freePort(5000);
freePort(5173);

// 1. Start Backend (Port 5000)
console.log('\x1b[33m%s\x1b[0m', '▶ Starting Backend Server on http://localhost:5000 ...');
const backend = spawn('node', ['server.js'], {
  cwd: BACKEND_DIR,
  stdio: 'inherit',
  shell: true,
});

backend.on('error', (err) => {
  console.error('\x1b[31mBackend process error:\x1b[0m', err);
});

// 2. Start Frontend (Port 5173)
console.log('\x1b[33m%s\x1b[0m', '▶ Starting Frontend Vite Server on http://localhost:5173 ...\n');
const frontend = spawn('node', ['./node_modules/vite/bin/vite.js'], {
  cwd: FRONTEND_DIR,
  stdio: 'inherit',
  shell: true,
});

frontend.on('error', (err) => {
  console.error('\x1b[31mFrontend process error:\x1b[0m', err);
});

process.on('SIGINT', () => {
  console.log('\nShutting down RailBus servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});
