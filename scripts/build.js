#!/usr/bin/env node

/**
 * Street Jewls - Build Script
 * Copies source files to dist for deployment
 */

import { existsSync, mkdirSync, cpSync, rmSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

const INCLUDE = [
  'assets',
  'pages'
];

function clean() {
  if (existsSync(DIST)) {
    rmSync(DIST, { recursive: true });
  }
  mkdirSync(DIST, { recursive: true });
}

function copy() {
  INCLUDE.forEach(dir => {
    const src = join(ROOT, dir);
    const dest = join(DIST, dir);
    
    if (existsSync(src)) {
      console.log(`📁 Copying ${dir}/`);
      cpSync(src, dest, { recursive: true });
    }
  });
  
  // Copy index.html to root
  const indexSrc = join(ROOT, 'pages', 'index.html');
  const indexDest = join(DIST, 'index.html');
  
  if (existsSync(indexSrc)) {
    console.log('📄 Copying index.html to root');
    cpSync(indexSrc, indexDest);
  }
}

function stats() {
  let fileCount = 0;
  let totalSize = 0;
  
  function walk(dir) {
    const items = readdirSync(dir);
    items.forEach(item => {
      const path = join(dir, item);
      const stat = statSync(path);
      
      if (stat.isDirectory()) {
        walk(path);
      } else {
        fileCount++;
        totalSize += stat.size;
      }
    });
  }
  
  walk(DIST);
  
  const sizeKB = (totalSize / 1024).toFixed(2);
  console.log(`\n📊 ${fileCount} files, ${sizeKB} KB total`);
}

console.log('🚀 Building Street Jewls...\n');

clean();
copy();
stats();

console.log('\n✅ Build complete!\n');
