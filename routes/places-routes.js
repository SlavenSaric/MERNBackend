const express = require("express");
const bodyParser = require("body-parser");

const placesControllers = require("../controllers/places-controllers");

const router = express.Router();

router.get("/:pid", placesControllers.getPlaceById);

router.get("/user/:uid", placesControllers.getPlaceByUserId);

router.post('/', placesControllers.createPlace)

router.patch('/:pid', placesControllers.updatePlaceById)

router.delete('/:pid', placesControllers.deletePlaceById)

module.exports = router;
