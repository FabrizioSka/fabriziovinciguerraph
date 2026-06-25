const fs = require("fs");
const path = require("path");
const { imageSize } = require("image-size");

function getGallery(folderName, label) {
  const folder = path.join(__dirname, "../assets/images", folderName);

  const files = fs
    .readdirSync(folder)
    .filter((file) =>
  [".jpg", ".jpeg", ".png", ".webp"].includes(
    path.extname(file).toLowerCase()
  )
)
    .sort();

  return files.map((file, index) => {
    const filePath = path.join(folder, file);
    const buffer = fs.readFileSync(filePath);
    const dimensions = imageSize(buffer);

    const isPortrait = dimensions.height > dimensions.width;

    return {
      src: `/assets/images/${folderName}/${file}`,
      alt: `${label} ${index + 1}`,
      class: isPortrait ? "story-portrait" : "story-wide"
    };
  });
}

module.exports = getGallery;