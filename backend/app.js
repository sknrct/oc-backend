const express = require("express");
const app = express();
// Sécuriser application en définissant des en-têtes HTTP adaptés. Il protège contre certaines vulnérabilités courantes comme les attaques XSS (Cross-Site Scripting), Clickjacking (l'utilisateur clique sur un bouton ou lien qui le renvoie en dehors du site, l'attaquant cache des liens dans le site en l'intégrant comme iframe), et les attaques liées à l'exposition d'informations sensibles dans les en-têtes HTTP.
const helmet = require('helmet');

const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');
const path = require('path');

require("dotenv").config();
const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});

app.use(express.json());

//Limite les requêtes pour éviter un DDOS
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ limit: '10kb', extended: true}));

app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));

// Protège contre les attaques Cross-Site-Scripting. 
// Permet de limiter l'éxécution d'un script malveillant injecté dans une des pages ou URL
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "trusted-scripts.com"],
  }
}));

// Protège contre les attaques Clickjacking : l'utilisateur peu cliquer sur des liens cachés malveillant
// Interdit l'inclusion de l'app dans un iframe 
app.use(helmet.frameguard({ action: 'deny' }));

// Protège contre des attaques Man-in-the-Middle
// Si un user accède au site en utilisant http://, un attaquant peut intercepter la requête et injecter 
// du contenu malveillant. HSTS s'assure que la connexion est toujours en HTTPS
app.use(helmet.hsts({ maxAge: 31536000 })); // Période de validité par défaut de 180 jours

// Protège contre le MIME Type sniffing
// Si un fichier est envoyé avec un MIME Type incorrect (un script JS intercepté comme une image)
// un attaquant peut exploiter cette faille pour executer du code malveillant
app.use(helmet.noSniff());

// Le header "X-Powerded-By" révèle la techno utilisée par le server, ici Express.js
app.use(helmet.hidePoweredBy());




mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error'));

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
