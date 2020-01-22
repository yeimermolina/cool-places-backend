const uuid = require("uuid/v4");
const HttpError = require("../models/http-error");

const PLACES = [
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

const getPlaceByUserId = (req, res, next) => {
  const { userId } = req.params;
  const place = PLACES.find(p => p.creator === userId);
  if (!place) {
    if (!place) {
      return next(new HttpError("Could not find place for that user id", 404));
    }
  }

  res.json({
    place
  });
};

const addPlace = (req, res, next) => {
  const { title, description, coordinates, address, creator } = req.body;
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

exports.getPlaceById = getPlaceById;
exports.getAllPlaces = getAllPlaces;
exports.getPlaceByUserId = getPlaceByUserId;
exports.addPlace = addPlace;
