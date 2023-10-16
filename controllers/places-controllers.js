const uuid = require('uuid')
const {validationResult} = require('express-validator')
const getCoordsForAddress = require('../util/location')

const HttpError = require("../models/http-error");

let DUMMY_PLACES = [
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

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((u) => u.creator === userId);

  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user ID.", 404)
    );
  }

  res.json({ places });
};

const createPlace = async (req,res, next) => {
  const errors = validationResult(req)

  if(!errors.isEmpty()){
   return next(new HttpError('Invalid inputs, please check your data', 422))
  }

    const {title, description, address, creator} = req.body

    const coords = await getCoordsForAddress(address)
    const createdPlace = {
        id: uuid.v4(),
        title,
        description,
        location: coords,
        address,
        creator
    }
    DUMMY_PLACES.push(createdPlace)

    res.status(201).json({place: createdPlace})
}

const updatePlaceById = (req, res, next) => {

  const errors = validationResult(req)

  if(!errors.isEmpty()){
    throw new HttpError('Invalid inputs, please check your data', 422)
  }

  const {title, description} = req.body
  const placeId = req.params.pid

  const updatedPlace = {...DUMMY_PLACES.find(p => p.id === placeId)}
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId)

  updatedPlace.title = title
  updatedPlace.description = description

  DUMMY_PLACES[placeIndex] = updatedPlace
  console.log(DUMMY_PLACES);

  res.status(200).json({place: updatedPlace})

}

const deletePlaceById = (req, res, next) => {
  placeId = req.params.pid

  if(!DUMMY_PLACES.find(p => p.id === placeId)){
    throw new HttpError('Could not find a place for that id', 404)
  }

  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId)

  res.status(200).json({message: 'Place deleted!'})
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlaceById = updatePlaceById
exports.deletePlaceById = deletePlaceById