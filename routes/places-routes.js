const express = require("express");
const { check } = require("express-validator");

const router = express.Router();
const fileUpload = require("../middlewares/file-upload");
const authRequired = require("../middlewares/auth-required");
const placesController = require("../controllers/places-controller");

router.get("/", placesController.getAllPlaces);

router.get("/:placeId", placesController.getPlaceById);

router.get("/user/:userId", placesController.getPlacesByUserId);

router.use(authRequired);

router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title")
      .not()
      .isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address")
      .not()
      .isEmpty()
  ],
  placesController.addPlace
);

router.patch(
  "/:placeId",
  [
    check("title")
      .not()
      .isEmpty(),
    check("description").isLength({ min: 5 })
  ],
  placesController.updatePlace
);

router.delete("/:placeId", placesController.deletePlace);

module.exports = router;
