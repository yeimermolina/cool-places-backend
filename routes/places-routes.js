const express = require("express");

const router = express.Router();
const placesController = require("../controllers/places-controller");

router.get("/", placesController.getAllPlaces);

router.get("/:placeId", placesController.getPlaceById);

router.get("/user/:userId", placesController.getPlaceByUserId);

router.post("/", placesController.addPlace);

module.exports = router;
