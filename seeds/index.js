const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '61c7e8b7556aab4fff2b1f78',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ipsa, alias quaerat. Nisi illum ipsam quibusdam nihil officia laborum consequatur iure ut, sequi voluptatem explicabo enim hic rerum, beatae placeat quidem.',
            price,
            geometry : { 
                "type" : "Point", 
                "coordinates" : [ -116.598821819119, 40.0711202976 ] 
            },
            images: [ { 
                "url" : "https://res.cloudinary.com/de4t9byi5/image/upload/v1640574571/YelpCamp/vcv1jehkyyfdoc3jludg.jpg", 
                "filename" : "YelpCamp/vcv1jehkyyfdoc3jludg"
                },
                { 
                "url" : "https://res.cloudinary.com/de4t9byi5/image/upload/v1640574451/YelpCamp/cjytpdm9n1gltydxgqqg.jpg", 
                "filename" : "YelpCamp/cjytpdm9n1gltydxgqqg"
                }
            ]
         })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})