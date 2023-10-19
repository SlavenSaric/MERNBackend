const uuid = require("uuid");
const {validationResult} = require('express-validator')
const HttpError = require('../models/http-error')
const User = require('../models/user')


const DUMMY_USERS = [
  { id: "u1", name: "Max Schwart", email: "max@test.com", password: "testers" },
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req)
  const { name, email, password, places } = req.body;

 
  if(!errors.isEmpty()){
    return next(new HttpError('Invalid inputs, please check your data', 422))
  }

  let existingUser
  try{
    existingUser = await User.findOne({email: email})
  }catch(err){
    const error = new HttpError('Signing up failed, please try again later.', 500)
    return next(error)
  }

  if(existingUser){
    const error = new HttpError('User exists already, please login instead.', 422)
    return next(error)
  }


  const createdUser = new User({
    name,
    email,
    image: 'https://images.pexels.com/photos/1674666/pexels-photo-1674666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    password,
    places
  })


  try{
    await createdUser.save()
  }catch(err){
    const error = new HttpError('Signing up failed. Please try again', 500)
    return next(error)
  }

  res.status(201).json({user: createdUser.toObject({getters: true})})
};

const login = (req, res, next) => {
    const {email, password} = req.body

    const identifiedUser = DUMMY_USERS.find(u => u.email === email)

    if(!identifiedUser || identifiedUser.password !== password){
        throw new HttpError('Could not identify user, credentials seem to be wrong!', 404)
    }

    res.json({message: 'Logged in!'})
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
