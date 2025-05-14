const fs = require('fs');
const path = require('path');
const util = require('util');

// Convert fs functions to Promise-based
const exists = util.promisify(fs.exists);
const unlink = util.promisify(fs.unlink);

/**
 * Delete a file from the server
 * @param {string} filePath - Path to the file to delete
 * @returns {Promise<boolean>} - True if file was deleted, false otherwise
 */
const deleteFile = async (filePath) => {
  try {
    // If the path doesn't start with a slash, add it
    if (!filePath.startsWith('/')) {
      filePath = '/' + filePath;
    }

    // Get the absolute path
    const absolutePath = path.join(__dirname, '../..', filePath);
    
    // Check if file exists
    const fileExists = await exists(absolutePath);
    if (!fileExists) {
      console.log(`File not found: ${absolutePath}`);
      return false;
    }

    // Delete the file
    await unlink(absolutePath);
    console.log(`Deleted file: ${absolutePath}`);

    // Check if there's a WebP version and delete it too
    const webpPath = absolutePath.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
    const webpExists = await exists(webpPath);
    if (webpExists) {
      await unlink(webpPath);
      console.log(`Deleted WebP file: ${webpPath}`);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
};

/**
 * Find and delete unused image files
 * @param {Array<string>} oldImages - Array of old image paths
 * @param {Array<string>} newImages - Array of new image paths
 * @returns {Promise<void>}
 */
const deleteUnusedImages = async (oldImages = [], newImages = []) => {
  try {
    // Find images that are in oldImages but not in newImages
    const imagesToDelete = oldImages.filter(img => !newImages.includes(img));
    
    // Delete each unused image
    for (const image of imagesToDelete) {
      await deleteFile(image);
    }
    
    if (imagesToDelete.length > 0) {
      console.log(`Deleted ${imagesToDelete.length} unused images`);
    }
  } catch (error) {
    console.error('Error deleting unused images:', error);
  }
};

module.exports = {
  deleteFile,
  deleteUnusedImages
};
