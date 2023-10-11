const express = require("express");
const bodyParser = require("body-parser");

const router = express.Router();

const DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "A one of the highest buildings in the world",
    location: {
      lat: 40.7484405,
      lng: -73.9856644,
    },
    address: "20 W 34th St., New York, NY 10001, Vereinigte Staaten",
    creator: "u1",
  },
];

router.get("/:pid", (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => p.id === placeId);

  if (!place) {
    const error = new Error("Could not find a place for the provided ID.");
    error.code = 404;
    throw error;
  }
});

router.get("/user/:uid", (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find((u) => u.creator === userId);

  if (!place) {
    const error = new Error("Could not find a user for the provided ID.");
    error.code = 404;
    return next(error);
  }

  res.json({ place });
});

module.exports = router;
