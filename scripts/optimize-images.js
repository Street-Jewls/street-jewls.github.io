/**
 * Image Optimization Script for Street Jewls
 * 
 * Processes slideshow images:
 * - Keeps original as -hd.jpg for full resolution viewing
 * - Creates optimized version (max 1920px, 80% quality)
 * - Generates WebP versions for both
 * 
 * Usage: node scripts/optimize-images.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  inputDir: path.join(ROOT, 'assets/images/slideshows'),
  maxWidth: 1920,
  maxHeight: 1080,
  jpegQuality: 80,
  webpQuality: 80,
  hdJpegQuality: 90,  // Higher quality for HD
  hdWebpQuality: 85,
  supportedFormats: ['.jpg', '.jpeg', '.png']
};

// Stats tracking
const stats = {
  processed: 0,
  skipped: 0,
  totalOriginalSize: 0,
  totalOptimizedSize: 0,
  errors: []
};

/**
 * Get all image files from slideshow directories
 */
function getImageFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const subdirs = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const subdir of subdirs) {
    if (subdir.isDirectory()) {
      const slideshowDir = path.join(dir, subdir.name);
      const images = fs.readdirSync(slideshowDir);
      
      for (const image of images) {
        const ext = path.extname(image).toLowerCase();
        // Skip already processed files (-hd, -placeholder, .webp)
        const isProcessed = image.includes('-hd.') || 
                           image.includes('-placeholder') ||
                           ext === '.webp';
        
        if (CONFIG.supportedFormats.includes(ext) && !isProcessed) {
          files.push({
            dir: slideshowDir,
            name: image,
            path: path.join(slideshowDir, image)
          });
        }
      }
    }
  }
  
  return files;
}

/**
 * Optimize a single image
 */
async function optimizeImage(file) {
  const originalSize = fs.statSync(file.path).size;
  stats.totalOriginalSize += originalSize;
  
  const ext = path.extname(file.name).toLowerCase();
  const baseName = path.basename(file.name, ext);
  
  // Output paths
  const hdJpgPath = path.join(file.dir, `${baseName}-hd.jpg`);
  const hdWebpPath = path.join(file.dir, `${baseName}-hd.webp`);
  const webpPath = path.join(file.dir, `${baseName}.webp`);
  
  try {
    // Read image metadata
    const imageBuffer = fs.readFileSync(file.path);
    const metadata = await sharp(imageBuffer).metadata();
    
    // Check if already processed (HD version exists)
    if (fs.existsSync(hdJpgPath)) {
      console.log(`  ⏭️  ${file.name} (already processed)`);
      stats.skipped++;
      const currentSize = fs.statSync(file.path).size;
      stats.totalOptimizedSize += currentSize;
      return;
    }
    
    // 1. Save original as HD version (slightly compressed for web)
    await sharp(imageBuffer)
      .jpeg({ quality: CONFIG.hdJpegQuality, mozjpeg: true })
      .toFile(hdJpgPath);
    
    // 2. Create HD WebP version
    await sharp(imageBuffer)
      .webp({ quality: CONFIG.hdWebpQuality })
      .toFile(hdWebpPath);
    
    // 3. Calculate resize dimensions for optimized version
    let width = metadata.width;
    let height = metadata.height;
    
    if (width > CONFIG.maxWidth) {
      height = Math.round((CONFIG.maxWidth / width) * height);
      width = CONFIG.maxWidth;
    }
    
    if (height > CONFIG.maxHeight) {
      width = Math.round((CONFIG.maxHeight / height) * width);
      height = CONFIG.maxHeight;
    }
    
    // 4. Create optimized JPG (overwrites original)
    const optimizedBuffer = await sharp(imageBuffer)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: CONFIG.jpegQuality, mozjpeg: true })
      .toBuffer();
    
    fs.writeFileSync(file.path, optimizedBuffer);
    
    // 5. Create optimized WebP version
    await sharp(optimizedBuffer)
      .webp({ quality: CONFIG.webpQuality })
      .toFile(webpPath);
    
    // Stats
    const newSize = fs.statSync(file.path).size;
    const webpSize = fs.statSync(webpPath).size;
    const hdSize = fs.statSync(hdJpgPath).size;
    
    stats.totalOptimizedSize += Math.min(newSize, webpSize);
    
    const savings = Math.round((1 - newSize / originalSize) * 100);
    const webpSavings = Math.round((1 - webpSize / originalSize) * 100);
    
    console.log(`  ✅ ${file.name}`);
    console.log(`      Optimized: ${formatBytes(originalSize)} → ${formatBytes(newSize)} (-${savings}%)`);
    console.log(`      WebP: ${formatBytes(webpSize)} (-${webpSavings}%)`);
    console.log(`      HD saved: ${formatBytes(hdSize)}`);
    
    stats.processed++;
    
  } catch (error) {
    console.log(`  ❌ ${file.name}: ${error.message}`);
    stats.errors.push({ file: file.name, error: error.message });
    stats.totalOptimizedSize += originalSize;
  }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Main function
 */
async function main() {
  console.log('🖼️  Street Jewls Image Optimizer\n');
  console.log('Settings:');
  console.log(`  Max dimensions: ${CONFIG.maxWidth}x${CONFIG.maxHeight}`);
  console.log(`  Optimized quality: JPEG ${CONFIG.jpegQuality}%, WebP ${CONFIG.webpQuality}%`);
  console.log(`  HD quality: JPEG ${CONFIG.hdJpegQuality}%, WebP ${CONFIG.hdWebpQuality}%\n`);
  
  const files = getImageFiles(CONFIG.inputDir);
  
  if (files.length === 0) {
    console.log('⚠️  No new images found in slideshow directories.');
    console.log(`   Add images to: assets/images/slideshows/*/`);
    return;
  }
  
  console.log(`Found ${files.length} images to process:\n`);
  
  // Group by directory
  const byDir = {};
  for (const file of files) {
    const dirName = path.basename(file.dir);
    if (!byDir[dirName]) byDir[dirName] = [];
    byDir[dirName].push(file);
  }
  
  // Process each directory
  for (const [dirName, dirFiles] of Object.entries(byDir)) {
    console.log(`📁 ${dirName}/`);
    
    for (const file of dirFiles) {
      await optimizeImage(file);
    }
    
    console.log('');
  }
  
  // Summary
  console.log('─'.repeat(50));
  console.log('📊 Summary:\n');
  console.log(`   Processed: ${stats.processed} images`);
  console.log(`   Skipped: ${stats.skipped} images`);
  console.log(`   Errors: ${stats.errors.length}`);
  console.log('');
  console.log(`   Original size: ${formatBytes(stats.totalOriginalSize)}`);
  console.log(`   Optimized size: ${formatBytes(stats.totalOptimizedSize)}`);
  
  if (stats.totalOriginalSize > 0) {
    const totalSavings = Math.round((1 - stats.totalOptimizedSize / stats.totalOriginalSize) * 100);
    console.log(`   Total savings: ${totalSavings}%`);
  }
  
  console.log('\n✅ Done!');
  console.log('\nGenerated files:');
  console.log('  - *.jpg (optimized for web)');
  console.log('  - *.webp (optimized WebP)');
  console.log('  - *-hd.jpg (full resolution)');
  console.log('  - *-hd.webp (full resolution WebP)\n');
  
  if (stats.errors.length > 0) {
    console.log('Errors:');
    for (const err of stats.errors) {
      console.log(`  - ${err.file}: ${err.error}`);
    }
  }
}

main().catch(console.error);
