const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const sharpResize = (req, res, next) => {
  if (req.file) {
    const inputPath = path.join(__dirname, "../tmp/", req.file.filename);
    const outputPath = path.join(__dirname, "../images/", req.file.filename);

    console.log("Input Path:", inputPath);
    console.log("Output Path:", outputPath);

    sharp.cache(false);
    sharp(inputPath)
      .resize({ width: 800, height: 600, fit: "inside" })
      .webp({ quality: 80 })
      .toFile(outputPath, (err) => {
        if (err) {
          console.error("Erreur lors du traitement de l'image :", err);
          return res.status(500).json({ error: "Erreur lors du traitement de l'image" });
        }

        fs.unlink(inputPath, (err) => {
          if (err) {
            console.error("Erreur lors de la suppression de l'image", err);
          }
          next();
        });
      });
  } else {
    next();
  }
};

module.exports = sharpResize;
