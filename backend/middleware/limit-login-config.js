const rateLimit = require('express-rate-limit');

const limitLogin = rateLimit({
    // On définit une fenêtre de temps pendnt laquelle les requêtes sont comptabilisées
    windowMs: 15 * 60 * 1000, // Toutes les 15min (en milisecondes)
    max: 3,
    message: "Maximum de tentatives atteintes. Réessayez dans 15 minutes",
    headers: true,
});

module.exports = limitLogin;