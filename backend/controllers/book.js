const Book = require("../models/Book");
const fs = require("fs");
const { use } = require("../routes/book");

exports.createBook = (req, res, next) => {
  // Vérifier si Multer a renvoyé une erreur
  if (req.fileValidationError) {
    return res.status(400).json({ error: req.fileValidationError });
  }

  const bookObject = JSON.parse(req.body.book);
  
  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });

  book.save()
    .then(() => {
      res.status(201).json({ message: "Livre enregistré !" });
    })
    .catch((error) => {
      // Gérer les erreurs d'upload de fichier (comme un fichier trop grand)
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Le fichier est trop large. La taille maximale autorisée est de 1 Mo.' });
        }
      }
      res.status(400).json({ error: 'Erreur lors de la création du livre.' });
    });
};


exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body };

  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: "Livre modifié" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(400).json({ message: "Not authorized" });
      } else {
        const filename = book.imageUrl.split("/images")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Livre supprimé" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.rateOneBook = (req, res, next) => {
  const userId = req.auth.userId;
  const rating = req.body.rating;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre inexistant" });
      }

      const actualRate = book.ratings.find((rating) => rating.userId === userId);
      if (actualRate) {
        return res.status(400).json({ message: "Vous avez déjà donné une note à ce livre" });
      }

      book.ratings.push({ userId: userId, grade: rating });

      const totalRating = book.ratings.length;
      const sumRatings = book.ratings.reduce((sum, r) => sum + rating.grade, 0);
      book.averageRating = Math.round(sumRatings / totalRating);

      book.save();
    })
    .then((updatedBook) => {
      res.status(200).json(updatedBook);
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.getBestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)

    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
