const fs = require("fs");
const path = require("path");

const folder = path.join(__dirname, "../../assets/images/woods");

const files = fs
  .readdirSync(folder)
  .filter((file) => file.toLowerCase().endsWith(".png"))
  .sort();

module.exports = files.map((file, index) => {
  return {
    src: `/assets/images/woods/${file}`,
    alt: `Woods & Silence ${index + 1}`,
    class: index === 1 ? "story-centered" : "story-wide"
  };
});