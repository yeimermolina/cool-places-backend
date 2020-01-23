const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  throw new HttpError("Resource not found", 404);
});

//Middleware for handling errors
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({
    message: error.message || "An unknown error ocurred"
  });
});

mongoose
  .connect(
    "mongodb+srv://yeimer:Asdf123!@cluster0-78rjv.mongodb.net/places_backend?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Running App on Port 5000");
    app.listen(5000);
  })
  .catch(e => {
    console.log(e);
  });
