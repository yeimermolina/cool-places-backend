const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const getCoordsFromAddress = require("../utils/location");
const Place = require("../models/place");

let PLACES = [
  {
    id: "p1",
    title: "Empire State",
    description: "Empire State",
    location: {
      lat: 40.7482,
      lng: -73.98
    },
    address: "20 west av",
    creator: "u1"
  }
];

const getAllPlaces = (req, res, next) => {
  console.log("Get request");
  res.json({
    places: PLACES
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

  if (!places || places.length === 0) {
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

  const { title, description, address, creator } = req.body;

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
    image: "http://img2.rtve.es/v/4706369?w=1600&preview=1535139974809.jpg",
    creator
  });

  try {
    place.save();
  } catch (e) {
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
    place = await Place.findById(placeId);
  } catch (err) {
    next(new HttpError("Something went wrong", 500));
  }

  if (!place) {
    next(new HttpError("Could not find Place", 404));
  }

  try {
    await place.remove();
  } catch (err) {
    next(new HttpError("Something went wrong", 500));
  }

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
