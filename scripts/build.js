#!/usr/bin/env node

/**
 * Street Jewls - Build Script
 * Copies source files to dist, generates slideshows from image directories
 */

import { existsSync, mkdirSync, cpSync, rmSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');

// Image extensions to scan for
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];

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
// Slideshow Processing
// =============================================================================

function getSlideshowImages(slideshowName) {
  const slideshowDir = join(ROOT, 'assets', 'images', 'slideshows', slideshowName);
  
  if (!existsSync(slideshowDir)) {
    return [];
  }
  
  const files = readdirSync(slideshowDir);
  const images = files
    .filter(file => IMAGE_EXTENSIONS.includes(extname(file).toLowerCase()))
    .sort((a, b) => {
      // Natural sort - handles 1, 2, 10 correctly
      const numA = parseInt(a.match(/\d+/) || [0]);
      const numB = parseInt(b.match(/\d+/) || [0]);
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b);
    });
  
  return images;
}

function generateSlideshowHTML(slideshowName, images) {
  if (images.length === 0) {
    // Return placeholder if no images
    return `
            <div class="slideshow__slide slideshow__slide--placeholder">
              <div class="slideshow__placeholder">
                <span class="slideshow__placeholder-text">Drop images into:</span>
                <code>assets/images/slideshows/${slideshowName}/</code>
                <span class="slideshow__placeholder-hint">Supports: JPG, PNG, GIF, WebP</span>
              </div>
            </div>`;
  }
  
  const slides = images.map((image, index) => {
    const isFirst = index === 0;
    // URL encode the filename to handle spaces, brackets, parentheses
    const encodedImage = encodeURIComponent(image);
    // Create a clean alt text from the filename
    const altText = image
      .replace(/\.[^.]+$/, '') // Remove extension
      .replace(/[\[\]()-]/g, '') // Remove brackets, parens, hyphens
      .replace(/\d+$/, '') // Remove trailing numbers
      .trim();
    
    return `
            <div class="slideshow__slide${isFirst ? ' slideshow__slide--active' : ''}">
              <img src="/assets/images/slideshows/${slideshowName}/${encodedImage}" alt="${altText || 'Slide ' + (index + 1)}" loading="${isFirst ? 'eager' : 'lazy'}">
            </div>`;
  }).join('');
  
  return slides;
}

function processSlideshows(content) {
  // Find all {{SLIDESHOW:name}} placeholders
  const regex = /\{\{SLIDESHOW:([a-z0-9-]+)\}\}/gi;
  
  return content.replace(regex, (match, slideshowName) => {
    const images = getSlideshowImages(slideshowName);
    const html = generateSlideshowHTML(slideshowName, images);
    
    if (images.length > 0) {
      console.log(`   🖼️  ${slideshowName}: ${images.length} images`);
    } else {
      console.log(`   ⚠️  ${slideshowName}: No images (placeholder shown)`);
    }
    
    return html;
  });
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
    let content = readFileSync(srcPath, 'utf8');
    
    // Process slideshows
    if (content.includes('{{SLIDESHOW:')) {
      console.log(`📄 Building ${page === 'index.html' ? 'index.html' : 'pages/' + page}`);
      content = processSlideshows(content);
    } else {
      console.log(`📄 Building ${page === 'index.html' ? 'index.html (root)' : 'pages/' + page}`);
    }
    
    if (page === 'index.html') {
      const fixedContent = fixPaths(content, 0);
      writeFileSync(join(DIST, 'index.html'), fixedContent);
    } else {
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
