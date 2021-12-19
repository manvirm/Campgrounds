const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//parse the body when sending the form of campground title, etc
app.use(express.urlencoded({extended: true}));

//_method string we will use in form action attribute to update
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
})

//must come before :id, order matters, render the ejs file with form
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

//new post, must match form action attribute in new.ejs
app.post('/campgrounds', async(req, res) => {
    //creating new campground with what user typed in form
    //must match input name attritbute in ejs file
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})

app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground});
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
})

//update campground
app.put('/campgrounds/:id', async(req, res) =>{
    const { id } = req.params;
    //... is spread operator, don't need to use it
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`)
})

app.delete('/campgrounds/:id', async(req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
})