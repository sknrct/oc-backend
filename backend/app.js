const express = require("express");
const app = express();

const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');

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

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error'));

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;
