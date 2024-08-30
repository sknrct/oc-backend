const express = require('express');

const app = express();

// Middleware qui permet d'extraire le corps JSON pour gérer une requête POST
app.use(express.json());


// On a un soucis de CORS (Cross Origin Resource Sharing) = une sécurité qui empeche les appels HTTP entre des serveurs différents
// Donc evite les requetes malveillantes d'acceder à des ressources sensibles
// Nous avons deux origines localhost:3000 et localhost:4200
// On souhaite les faire communiquer 
// Donc on ajoute des headers 
app.use((req, res, next) => {
    // Acceder à notre API depuis n'importe quel origine avec *
    res.setHeader('Access-Control-Allow-Origin', '*');
    // ajouter des headers mentionnés aux requêtes envoyées vers notre API
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    // Envoyer des requêtes avec des méthodes mentionnées (GET, POST etc)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

  

module.exports = app;