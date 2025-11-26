#!/usr/bin/env node

/**
 * Street Jewls - Build Script
 * Copies source files to dist and generates category pages
 */

import { existsSync, mkdirSync, cpSync, rmSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

// =============================================================================
// Utility Functions
// =============================================================================

function clean() {
  if (existsSync(DIST)) {
    rmSync(DIST, { recursive: true });
  }
  mkdirSync(DIST, { recursive: true });
}

function fixPaths(content, depth = 0) {
  // depth 0 = root (index.html)
  // depth 1 = /pages/*.html
  // depth 2 = /pages/parts/*.html
  
  let result = content;
  
  if (depth === 0) {
    // Root level: ./assets/, ./pages/, ./
    result = result
      .replace(/href="\/assets\//g, 'href="./assets/')
      .replace(/src="\/assets\//g, 'src="./assets/')
      .replace(/href="\/pages\/parts\//g, 'href="./pages/parts/')
      .replace(/href="\/pages\//g, 'href="./pages/')
      .replace(/href="\/"/g, 'href="./"');
  } else if (depth === 1) {
    // /pages/*.html: ../assets/, ./, ../index.html
    result = result
      .replace(/href="\/assets\//g, 'href="../assets/')
      .replace(/src="\/assets\//g, 'src="../assets/')
      .replace(/href="\/pages\/parts\//g, 'href="./parts/')
      .replace(/href="\/pages\//g, 'href="./')
      .replace(/href="\/"/g, 'href="../index.html"');
  } else if (depth === 2) {
    // /pages/parts/*.html: ../../assets/, ../, ../../index.html
    result = result
      .replace(/href="\/assets\//g, 'href="../../assets/')
      .replace(/src="\/assets\//g, 'src="../../assets/')
      .replace(/href="\/pages\/parts\//g, 'href="./')
      .replace(/href="\/pages\//g, 'href="../')
      .replace(/href="\/"/g, 'href="../../index.html"');
  }
  
  return result;
}

// =============================================================================
// Copy Static Assets
// =============================================================================

function copyAssets() {
  const assetsSrc = join(ROOT, 'assets');
  const assetsDest = join(DIST, 'assets');
  if (existsSync(assetsSrc)) {
    console.log('📁 Copying assets/');
    cpSync(assetsSrc, assetsDest, { recursive: true });
  }
}

// =============================================================================
// Copy and Process HTML Pages
// =============================================================================

function copyPages() {
  const pagesSrc = join(ROOT, 'pages');
  const pagesDest = join(DIST, 'pages');
  mkdirSync(pagesDest, { recursive: true });

  const pages = readdirSync(pagesSrc).filter(f => f.endsWith('.html'));
  
  pages.forEach(page => {
    const srcPath = join(pagesSrc, page);
    const content = readFileSync(srcPath, 'utf8');
    
    if (page === 'index.html') {
      console.log('📄 Building index.html (root)');
      const fixedContent = fixPaths(content, 0);
      writeFileSync(join(DIST, 'index.html'), fixedContent);
    } else {
      console.log(`📄 Building pages/${page}`);
      const fixedContent = fixPaths(content, 1);
      writeFileSync(join(pagesDest, page), fixedContent);
    }
  });
}

// =============================================================================
// Stats
// =============================================================================

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

// =============================================================================
// Main Build
// =============================================================================

console.log('🚀 Building Street Jewls...\n');

clean();
copyAssets();
copyPages();
stats();

console.log('\n✅ Build complete!\n');
