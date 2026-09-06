const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processAvatar() {
  const inputPath = 'C:\\Users\\Pankaj Malhotra\\.gemini\\antigravity-ide\\brain\\689c0557-365b-49fd-bbe1-53633298ce08\\original_vtuber_avatar_1788686533250.jpg';
  const outputPath = 'c:\\Users\\Pankaj Malhotra\\Downloads\\Synapse\\public\\character\\live_anime_character.png';

  console.log('Loading image with sharp...');
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  console.log(`Dimensions: ${width}x${height}, channels: ${channels}`);

  const whiteThresh = 248;
  const softThresh = 228;

  // Process RGBA pixels to remove white background cleanly
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r >= whiteThresh && g >= whiteThresh && b >= whiteThresh) {
      data[i + 3] = 0; // Completely transparent
    } else if (r >= softThresh && g >= softThresh && b >= softThresh) {
      const minC = Math.min(r, g, b);
      const factor = (minC - softThresh) / (whiteThresh - softThresh);
      data[i + 3] = Math.max(0, Math.min(255, Math.round((1.0 - factor) * 255)));
    }
  }

  // Find tight bounding box of avatar content
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log(`Bounding box: x=[${minX}, ${maxX}], y=[${minY}, ${maxY}]`);
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;

  // Create trimmed image with padding
  const trimmedBuffer = await sharp(data, {
    raw: { width, height, channels }
  })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .png()
    .toBuffer();

  // Save to public/character/live_anime_character.png
  await sharp(trimmedBuffer)
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log(`Successfully saved transparent VTuber avatar to: ${outputPath}`);
}

processAvatar().catch(err => console.error(err));
