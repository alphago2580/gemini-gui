const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

// dist 디렉토리 정리
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}

// Main Process 빌드
esbuild.build({
  entryPoints: ['src/main/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/main/index.js',
  external: ['electron', 'node-pty'],
}).then(() => {
  console.log('✓ Main process built successfully');
}).catch(() => process.exit(1));

// Preload Script 빌드
esbuild.build({
  entryPoints: ['src/preload/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/preload/index.js',
  external: ['electron'],
}).then(() => {
  console.log('✓ Preload script built successfully');
}).catch(() => process.exit(1));

// Renderer Process 빌드
esbuild.build({
  entryPoints: ['src/renderer/index.tsx'],
  bundle: true,
  platform: 'browser',
  target: 'es2020',
  outfile: 'dist/renderer/index.js',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.css': 'css',
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  },
}).then(() => {
  console.log('✓ Renderer process built successfully');
}).catch(() => process.exit(1));
