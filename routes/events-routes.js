const express = require("express");

const router = express.Router();
const authRequired = require("../middlewares/auth-required");
const eventsController = require("../controllers/events-controller");

router.use(authRequired);
router.post("/", eventsController.createEvent);
router.patch("/:eventId", eventsController.editEvent);
router.get("/", eventsController.getUserEvents);

module.exports = router;
