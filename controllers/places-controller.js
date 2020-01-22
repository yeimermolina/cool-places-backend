const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const getCoordsFromAddress = require("../utils/location");

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

const getPlaceById = (req, res, next) => {
  const { placeId } = req.params;
  const place = PLACES.find(p => p.id === placeId);

  if (!place) {
    throw new HttpError("Could not find place for that id", 404);
  }

  res.json({
    place
  });
};

const getPlacesByUserId = (req, res, next) => {
  const { userId } = req.params;
  const places = PLACES.filter(p => p.creator === userId);

  if (!places || places.length === 0) {
    return next(new HttpError("Could not find places for that user id", 404));
  }

  res.json({
    places
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

  const place = {
    id: uuid(),
    title,
    description,
    location: coordinates,
    address,
    creator
  };
  PLACES.push(place);

  res.status(201).json({
    place
  });
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError("Invalid input data", 422);
  }

  const { title, description } = req.body;
  const { placeId } = req.params;

  const place = { ...PLACES.find(p => p.id === placeId) };
  const placeIndex = PLACES.findIndex(p => p.id === placeId);
  place.title = title;
  place.description = description;
  PLACES[placeIndex] = place;

  res.status(200).json({
    place
  });
};

const deletePlace = (req, res, next) => {
  const { placeId } = req.params;
  if (!PLACES.find(p => p.id === placeId)) {
    throw new HttpError("Could not find Place", 404);
  }

  PLACES = PLACES.filter(p => p.id === placeId);

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
