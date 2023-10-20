const uuid = require('uuid')
const {validationResult} = require('express-validator')
const getCoordsForAddress = require('../util/location')

const HttpError = require("../models/http-error");
const Place = require('../models/place');
const User = require('../models/user')
const { log } = require('console');
const  mongoose = require('mongoose');

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

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place
  try{
    place = await Place.findById(placeId)
  }catch(err){
    const error = new HttpError('Something went wrong. Could not find a place.', 500)
    return next(error)
  }


  if (!place) {
    const error =  new HttpError("Could not find a place for the provided ID.", 404);
    return next(error)
  }

  res.json({ place: place.toObject({getters: true}) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  
  let places
  try{
    places = await Place.find({creator: userId})
  }catch(err){
    const error = new HttpError('Something went wrong. Could not find a place', 500)
    return next(error)
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user ID.", 404)
    );
  }

  res.json({ places: places.map(p => p.toObject({getters: true})) });
};

const createPlace = async (req,res, next) => {
  const errors = validationResult(req)

  if(!errors.isEmpty()){
   return next(new HttpError('Invalid inputs, please check your data', 422))
  }

    const {title, description, address, creator} = req.body

    const coords = await getCoordsForAddress(address)
    const createdPlace = new Place({
      title,
      description,
      address,
      location: coords,
      image: 'https://www.esbnyc.com/sites/default/files/styles/260x370/public/2020-01/thumbnail5M2VW4ZF.jpg?itok=3kRhMPZA',
      creator
    })

    let user
    try{
      user = await User.findById(creator)
    }catch(err){
      const error = new HttpError('Creating place failed, please try again', 500)
      return next(error)
    }

    if(!user){
      const error = new HttpError('Could not find user for provided ID', 500)
      return next(error)
    }
    console.log(user);
    
    try{
      const sess = await mongoose.startSession()
      sess.startTransaction()
      await createdPlace.save({session: sess})
      user.places.push(createdPlace)
      await user.save({session: sess})
      await sess.commitTransaction()
    }catch(err){
      const error = new HttpError('Creating place failed. Please try again', 500)
      return next(error)
    }

    res.status(201).json({place: createdPlace})
}

const updatePlaceById = async (req, res, next) => {

  const errors = validationResult(req)

  if(!errors.isEmpty()){
    return next(new HttpError('Invalid inputs, please check your data', 422))
  }

  const {title, description} = req.body
  const placeId = req.params.pid

  let place
  try{
    place = await Place.findById(placeId)
  }catch(err){
    const error = new HttpError('Something went wrong. Could not update a place.', 500)
    return next(error)
  }

  place.title = title
  place.description = description

 try{
  await place.save()
 }catch(err){
  const error = new HttpError('Something went wrong. Could not update a place.', 500)
    return next(error)
 }

  res.status(200).json({place: place.toObject({getters: true})})

}

const deletePlaceById = async (req, res, next) => {
  const placeId = req.params.pid

  let place
  try{
    place = await Place.findById(placeId).populate('creator')
    console.log(place.toObject())
  }catch(err){
    const error = new HttpError('Something went wrong. Could not delete place!', 500)
    return next(error)
  }

  if(!place){
    const error = new HttpError('Could not find places for this id', 500)
    return next(error)
  }

  try{
    const sess = await mongoose.startSession()
    sess.startTransaction()
    place.deleteOne({session: sess})
    place.creator.places.pull(place)
    await place.creator.save({session: sess})
    await sess.commitTransaction()
  }catch(err){
    const error = new HttpError('Something went wrong. Could not delete place.', 500)
    console.log(err);
    return next(error)
  }

  res.status(200).json({message: 'Place deleted!'})
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlaceById = updatePlaceById
exports.deletePlaceById = deletePlaceById