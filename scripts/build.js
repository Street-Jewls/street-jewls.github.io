#!/usr/bin/env node

/**
 * Street Jewls - Build Script
 * Copies source files to dist for deployment
 */

import { existsSync, mkdirSync, cpSync, rmSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

function clean() {
  if (existsSync(DIST)) {
    rmSync(DIST, { recursive: true });
  }
  mkdirSync(DIST, { recursive: true });
}

function fixPaths(content, isRoot = false) {
  if (isRoot) {
    return content
      .replace(/href="\/pages\//g, 'href="./pages/')
      .replace(/href="\/assets\//g, 'href="./assets/')
      .replace(/src="\/assets\//g, 'src="./assets/')
      .replace(/href="\/"/g, 'href="./"');
  } else {
    // For pages in /pages/: /pages/about.html -> ./about.html
    return content
      .replace(/href="\/pages\//g, 'href="./')
      .replace(/href="\/assets\//g, 'href="../assets/')
      .replace(/src="\/assets\//g, 'src="../assets/')
      .replace(/href="\/"/g, 'href="../index.html"');
  }
}

function copy() {
  const assetsSrc = join(ROOT, 'assets');
  const assetsDest = join(DIST, 'assets');
  if (existsSync(assetsSrc)) {
    console.log('📁 Copying assets/');
    cpSync(assetsSrc, assetsDest, { recursive: true });
  }

  const pagesSrc = join(ROOT, 'pages');
  const pagesDest = join(DIST, 'pages');
  mkdirSync(pagesDest, { recursive: true });

  const pages = readdirSync(pagesSrc).filter(f => f.endsWith('.html'));
  
  pages.forEach(page => {
    const srcPath = join(pagesSrc, page);
    const content = readFileSync(srcPath, 'utf8');
    
    if (page === 'index.html') {
      console.log('📄 Copying index.html to root (with fixed paths)');
      const fixedContent = fixPaths(content, true);
      writeFileSync(join(DIST, 'index.html'), fixedContent);
    } else {
      console.log(`📄 Copying pages/${page} (with fixed paths)`);
      const fixedContent = fixPaths(content, false);
      writeFileSync(join(pagesDest, page), fixedContent);
    }
  });
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