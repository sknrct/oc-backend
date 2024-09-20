const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const sharpResize = (req, res, next) => {
  if (req.file) {
    const inputPath = path.join(__dirname, "../tmp/", req.file.filename);
    const outputPath = path.join(__dirname, "../images/", req.file.filename);

    console.log("Input Path:", inputPath);
    console.log("Output Path:", outputPath);

    // Vérifie que le fichier existe
    if (!fs.existsSync(inputPath)) {
      console.error("Fichier d'entrée non trouvé :", inputPath);
      return res.status(404).json({ error: "Fichier d'entrée non trouvé" });
    }

    // Vérifie que le dossier images existe, sinon le crée
    const imagesDir = path.join(__dirname, "../images/");
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    sharp.cache(false); // Facultatif, désactive le cache si nécessaire
    sharp(inputPath)
      .resize({ width: 800, height: 600, fit: "inside" })
      .webp({ quality: 80 })
      .toFile(outputPath, (err, info) => {
        if (err) {
          console.error("Erreur lors du traitement de l'image avec Sharp :", err);
          return res.status(500).json({ error: "Erreur lors du traitement de l'image" });
        }

        console.log("Image traitée avec succès :", info);

        // Supprimer le fichier temporaire après traitement
        fs.unlink(inputPath, (err) => {
          if (err) {
            console.error("Erreur lors de la suppression de l'image temporaire :", err);
          }
          next();
        });
      });
  } else {
    next();
  }
};

module.exports = sharpResize;
