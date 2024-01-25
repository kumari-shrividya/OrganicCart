const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Function to resize an image
async function resizeImage(inputPath, outputPath, width, height) {
  await sharp(inputPath)
    .resize(width, height)
    .toFile(outputPath);
}

// Function to resize multiple images in a directory
async function resizeImagesInDirectory(inputDirectory, outputDirectory, width, height) {
  // Read all files in the input directory
  const files = fs.readdirSync(inputDirectory);

  // Create the output directory if it doesn't exist
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }

  // Resize each image and save it to the output directory
  for (const file of files) {
    const inputPath = path.join(inputDirectory, file);
    const outputPath = path.join(outputDirectory, file);

    // Resize the image
    await resizeImage(inputPath, outputPath, width, height);

    console.log(`Resized: ${file}`);
  }
}

