const fs = require("fs");
const path = require("path");
const { imageSize } = require("image-size");

/**
 * Carica, quando presente, il file con i metadati SEO
 * della collezione.
 *
 * Esempio:
 * utils/galleryMetadata/sicily.js
 */
function loadGalleryMetadata(folderName) {
  const metadataPath = path.join(
    __dirname,
    "galleryMetadata",
    `${folderName}.js`
  );

  if (!fs.existsSync(metadataPath)) {
    return {};
  }

  try {
    delete require.cache[require.resolve(metadataPath)];
    return require(metadataPath);
  } catch (error) {
    console.warn(
      `[Gallery] Impossibile leggere i metadati di "${folderName}":`,
      error.message
    );

    return {};
  }
}

/**
 * Crea un testo leggibile partendo dal nome del file.
 *
 * Esempio:
 * sicily-01-lone-pine
 * diventa:
 * Lone pine
 */
function createReadableName(filename, folderName) {
  return filename
    .replace(new RegExp(`^${folderName}-`, "i"), "")
    .replace(/^\d+[-_]?/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

function getGallery(folderName, label) {
  const folder = path.join(
    __dirname,
    "../assets/images",
    folderName
  );

  if (!fs.existsSync(folder)) {
    console.warn(
      `[Gallery] La cartella "${folderName}" non esiste: ${folder}`
    );

    return [];
  }

  const metadata = loadGalleryMetadata(folderName);

  const files = fs
    .readdirSync(folder)
    .filter((file) =>
      [".jpg", ".jpeg", ".png", ".webp"].includes(
        path.extname(file).toLowerCase()
      )
    )
    .sort((firstFile, secondFile) =>
      firstFile.localeCompare(secondFile, undefined, {
        numeric: true,
        sensitivity: "base"
      })
    );

  return files.map((file, index) => {
    const filePath = path.join(folder, file);
    const filename = path.parse(file).name;

    const buffer = fs.readFileSync(filePath);
    const dimensions = imageSize(buffer);

    const isPortrait = dimensions.height > dimensions.width;
    const imageMetadata = metadata[filename] || {};
    const readableName = createReadableName(filename, folderName);

    return {
      src: `/assets/images/${folderName}/${file}`,

      filename,

      title:
        imageMetadata.title ||
        readableName ||
        `${label} photograph ${index + 1}`,

      alt:
        imageMetadata.alt ||
        `${readableName}, fine art photograph from the ${label} collection by Fabrizio Vinciguerra`,

      location:
        imageMetadata.location || "",

      caption:
        imageMetadata.caption || "",

      class: isPortrait
        ? "private-portrait"
        : "private-landscape"
    };
  });
}

module.exports = getGallery;