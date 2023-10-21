const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require('./models/http-error')

const app = express();

app.use(bodyParser.json())

app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requsted-Width, Content-Type, Accept, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
    next()
})

app.use("/api/places", placesRoutes);

app.use("/api/users", usersRoutes)

app.use((req,res, next) => {
    throw new HttpError('Could not find the route.', 404)
    
})

app.use((error ,req, res, next) => {
    if(res.headerSent){
        return next(error)
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'Something went wrong!'})
});

mongoose
.connect('mongodb+srv://slaven:g1zseqlGPm16ELP6@clustermdb.naaddkt.mongodb.net/mern?retryWrites=true&w=majority')
.then(() => {
    app.listen(5000);
}).
catch((err => {
    console.log(err);
}));