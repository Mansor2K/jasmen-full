// middlewares.js

const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const express = require("express");
const bodyparser = require("body-parser");

const applyMiddlewares = (app) => {
  // CORS Middleware
  app.use(
    cors({
      origin: "*", // Adjust this to match your needs
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    })
  );

  // Body parser
  app.use(express.json({ limit: "100kb" }));
  app.use(bodyparser.json());

  // Sanitize data
  app.use(mongoSanitize());

  // Prevent XSS attacks
  app.use(xss());
};

module.exports = { applyMiddlewares };
