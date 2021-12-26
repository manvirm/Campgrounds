const express = require('express');
const router = express.Router();
//handle async errors and express errors
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
const Campground = require('../models/campground');

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}))

//must come before :id, order matters, render the ejs file with form
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

//new post, must match form action attribute in new.ejs
router.post('/', isLoggedIn, validateCampground, catchAsync(async(req, res, next) => {
    //creating new campground with what user typed in form
    //must match input name attritbute in ejs file
    const campground = new Campground(req.body.campground);
    //associate post with user
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    //flash error message if campground not found
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    //flash error message if campground not found
    if(!campground){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}))

//update campground
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async(req, res) =>{
    const { id } = req.params;
    //... is spread operator, don't need to use it
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async(req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}))

module.exports =  router;