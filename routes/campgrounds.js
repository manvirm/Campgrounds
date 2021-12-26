const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
//handle async errors and express errors
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
const Campground = require('../models/campground');

router.get('/', catchAsync(campgrounds.index));

//must come before :id, order matters, render the ejs file with form
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

//new post, must match form action attribute in new.ejs
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

router.get('/:id', catchAsync(campgrounds.showCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

//update campground
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports =  router;