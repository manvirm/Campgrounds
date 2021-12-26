const express = require('express');
const router = express.Router({ mergeParams: true });
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware.js');
//handle async errors and express errors
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/reviews');
const reviews = require('../controllers/reviews');

//Create review for campground
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

//we want to remove where the review is and the review itself
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;