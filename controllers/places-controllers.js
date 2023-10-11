const uuid = require('uuid')

const HttpError = require("../models/http-error");

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

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => p.id === placeId);

  if (!place) {
    throw new HttpError("Could not find a place for the provided ID.", 404);
  }
  res.json({ place });
};

const getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const place = DUMMY_PLACES.find((u) => u.creator === userId);

  if (!place) {
    return next(
      new HttpError("Could not find a user for the provided ID.", 404)
    );
  }

  res.json({ place });
};

const createPlace = (req,res, next) => {
    const {title, description, coordinates, address, creator} = req.body
    const createdPlace = {
        id: uuid.v4(),
        title,
        description,
        location: coordinates,
        address,
        creator
    }
    DUMMY_PLACES.push(createdPlace)

    res.status(201).json({place: createdPlace})
}

exports.getPlaceById = getPlaceById
exports.getPlaceByUserId = getPlaceByUserId
exports.createPlace = createPlace