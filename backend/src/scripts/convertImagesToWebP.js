/**
 * Script to convert all existing images in the uploads directory to WebP format
 *
 * Usage:
 * node src/scripts/convertImagesToWebP.js
 *
 * Options:
 * --quality=80    Set WebP quality (1-100, default: 80)
 * --force         Force conversion even if WebP version exists
 * --verbose       Show detailed output
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Convert fs functions to Promise-based
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const exists = util.promisify(fs.exists);

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  quality: 80,
  force: false,
  verbose: false
};

args.forEach(arg => {
  if (arg.startsWith('--quality=')) {
    const quality = parseInt(arg.split('=')[1]);
    if (!isNaN(quality) && quality >= 1 && quality <= 100) {
      options.quality = quality;
    }
  } else if (arg === '--force') {
    options.force = true;
  } else if (arg === '--verbose') {
    options.verbose = true;
  }
});

// Log function that respects verbose option
const log = (message) => {
  if (options.verbose) {
    console.log(message);
  }
};

// Get the uploads directory path
const uploadsDir = path.join(__dirname, '../../uploads');

// Supported image extensions
const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

// Function to recursively process a directory
async function processDirectory(dirPath) {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Recursively process subdirectories
        await processDirectory(fullPath);
      } else if (entry.isFile()) {
        // Process image files
        const ext = path.extname(entry.name).toLowerCase();

        if (supportedExtensions.includes(ext)) {
          await convertToWebP(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error);
  }
}

// Function to convert an image to WebP
async function convertToWebP(imagePath) {
  try {
    const webpPath = imagePath.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');

    // Skip if WebP already exists and not forcing conversion
    if (!options.force && await exists(webpPath)) {
      log(`Skipping ${imagePath} (WebP version already exists)`);
      return;
    }

    // Convert to WebP
    await sharp(imagePath)
      .webp({ quality: options.quality })
      .toFile(webpPath);

    console.log(`Converted ${imagePath} to WebP`);
  } catch (error) {
    console.error(`Error converting ${imagePath} to WebP:`, error);
  }
}

// Main function
async function main() {
  console.log(`Starting WebP conversion with quality: ${options.quality}`);
  console.log(`Force mode: ${options.force ? 'ON' : 'OFF'}`);
  console.log(`Verbose mode: ${options.verbose ? 'ON' : 'OFF'}`);

  // Check if uploads directory exists
  if (!(await exists(uploadsDir))) {
    console.error(`Uploads directory not found: ${uploadsDir}`);
    return;
  }

  // Process the uploads directory
  await processDirectory(uploadsDir);

  console.log('WebP conversion complete!');
}

// Run the script
main().catch(error => {
  console.error('Error:', error);
});
