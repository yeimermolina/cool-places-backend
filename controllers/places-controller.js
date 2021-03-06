const fs = require("fs");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const getCoordsFromAddress = require("../utils/location");
const Place = require("../models/place");
const User = require("../models/user");

const getAllPlaces = async (req, res, next) => {
  let places = [];
  try {
    places = await Place.find();
  } catch (e) {
    return next(new HttpError("Something went wrong", 500));
  }

  res.status(200).json({
    places: places.map(place => place.toObject({ getters: true }))
  });
};

const getPlaceById = async (req, res, next) => {
  const { placeId } = req.params;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (e) {
    return next(new HttpError("Something went wrong", 500));
  }

  if (!place) {
    return next(new HttpError("Place not found", 404));
  }

  res.json({
    place: place.toObject({ getters: true })
  });
};

const getPlacesByUserId = async (req, res, next) => {
  const { userId } = req.params;
  let places;

  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    return next(new HttpError("Something went wrong", 500));
  }

  if (!places) {
    return next(new HttpError("There are no places for this user", 404));
  }

  res.json({
    places: places.map(place => place.toObject({ getters: true }))
  });
};

const addPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input data", 422));
  }

  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsFromAddress(address);
  } catch (error) {
    return next(error);
  }

  const place = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.user.id
  });

  let user;

  try {
    user = await User.findById(req.user.id);
  } catch (e) {
    return next(new HttpError("Something went wrong", 500));
  }

  if (!user) {
    return next(new HttpError("User does not exists", 500));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.save({ session });
    user.places.push(place);
    await user.save({ session });
    await session.commitTransaction();
  } catch (e) {
    console.log(e);
    return next(new HttpError("Unable to create place, please try again", 500));
  }

  res.status(201).json({
    place
  });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError("Invalid input data", 422);
  }

  const { title, description } = req.body;
  const { placeId } = req.params;
  let place;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(new HttpError("Something went wrong", 500));
  }

  if (!place) {
    return next(new HttpError("Place not found", 404));
  }

  if (place.creator.toString() !== req.user.id) {
    return next(new HttpError("You are not allowed to edit this place", 401));
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    return next(new HttpError("Unable to save place", 500));
  }

  res.status(200).json({
    place: place.toObject({ getters: true })
  });
};

const deletePlace = async (req, res, next) => {
  const { placeId } = req.params;
  let place;

  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    next(new HttpError("Something went wrong", 500));
  }

  if (!place) {
    next(new HttpError("Could not find Place", 404));
  }

  if (place.creator.id !== req.user.id) {
    return next(new HttpError("You are not allowed to edit this place", 401));
  }

  const imagePath = place.image;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.remove({ session });
    place.creator.places.pull(place);
    await place.creator.save({ session });
    await session.commitTransaction();
  } catch (err) {
    next(new HttpError("Something went wrong", 500));
  }

  fs.unlink(imagePath, e => {
    console.log(e);
  });

  res.status(200).json({
    message: "Place deleted!"
  });
};

exports.getPlaceById = getPlaceById;
exports.getAllPlaces = getAllPlaces;
exports.getPlacesByUserId = getPlacesByUserId;
exports.addPlace = addPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
