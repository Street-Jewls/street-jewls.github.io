#!/usr/bin/env node

/**
 * Street Jewls - Build Script
 * Copies and prepares files for production deployment
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = process.cwd();
const DIST_DIR = path.join(process.cwd(), 'dist');

// Directories and files to copy
const COPY_ITEMS = [
  'assets',
  'pages',
];

// Files to copy to root of dist
const ROOT_FILES = [
  'pages/index.html',
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    ensureDir(dest);
    const items = fs.readdirSync(src);
    for (const item of items) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function build() {
  console.log('🚀 Building Street Jewls...\n');
  
  // Clean dist
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  ensureDir(DIST_DIR);
  
  // Copy directories
  for (const item of COPY_ITEMS) {
    const src = path.join(SRC_DIR, item);
    const dest = path.join(DIST_DIR, item);
    
    if (fs.existsSync(src)) {
      console.log(`  📁 Copying ${item}/`);
      copyRecursive(src, dest);
    }
  }
  
  // Copy index.html to root
  const indexSrc = path.join(SRC_DIR, 'pages', 'index.html');
  const indexDest = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexSrc)) {
    console.log('  📄 Copying index.html to root');
    fs.copyFileSync(indexSrc, indexDest);
  }
  
  console.log('\n✅ Build complete! Output in dist/\n');
}

build();
