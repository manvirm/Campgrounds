const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
//creates reusable code to reduce duplicating code
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const {campgroundSchema} = require('./schemas.js');
//handle async errors and express errors
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
//Fake put, patch, delete method
const methodOverride = require('method-override');
const Campground = require('./models/campground');

//this makes yelp-camp name of the database
mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected")
})

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//parse the body when sending the form of campground title, etc
app.use(express.urlencoded({extended: true}));

//_method string we will use in form action attribute to update
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else{
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}))

//must come before :id, order matters, render the ejs file with form
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

//new post, must match form action attribute in new.ejs
app.post('/campgrounds', validateCampground, catchAsync(async(req, res, next) => {
    //creating new campground with what user typed in form
    //must match input name attritbute in ejs file
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground});
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
}))

//update campground
app.put('/campgrounds/:id', validateCampground, catchAsync(async(req, res) =>{
    const { id } = req.params;
    //... is spread operator, don't need to use it
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async(req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

//error handler
app.use((err, req, res, next) => {
    const {statusCode =500} = err;
    if(!err.message) err.message = 'Oh no, Something went wrong!'
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
})