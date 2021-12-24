const express = require('express');
const router = express.Router();
//handle async errors and express errors
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const {campgroundSchema} = require('../schemas.js');

const Campground = require('../models/campground');


const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else{
        next();
    }
}


router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}))

//must come before :id, order matters, render the ejs file with form
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

//new post, must match form action attribute in new.ejs
router.post('/', validateCampground, catchAsync(async(req, res, next) => {
    //creating new campground with what user typed in form
    //must match input name attritbute in ejs file
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    //flash error message if campground not found
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    //flash error message if campground not found
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}))

//update campground
router.put('/:id', validateCampground, catchAsync(async(req, res) =>{
    const { id } = req.params;
    //... is spread operator, don't need to use it
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id', catchAsync(async(req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}))

module.exports =  router;