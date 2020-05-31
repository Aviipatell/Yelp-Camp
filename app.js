var dotenv = require('dotenv').config();
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var flash = require('connect-flash');

// Auth Requirements
var passport = require('passport');
var LocalStrategy = require('passport-local');
var User = require('./models/user');

var seedDB = require('./seeds');

// Seed the server everytime it runs!
//seedDB();

var commentRoutes = require("./routes/comments"),
	campgroundRoutes = require("./routes/campgrounds"),
	indexRoutes = require("./routes/index");

var Campground = require("./models/campground");
var Comment = require("./models/comment");

// Tell Express to use flash // must be before passport config
app.use(flash());

app.locals.moment = require('moment');

// PASSPORT CONFIGURATION
app.use(require('express-session')({
	secret: "Camping is the best thing to do!",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){ // easy way of passing the variable to all header partials/partials/files
	res.locals.currentUser = req.user;  // will be called on every single route. will return empty if no user
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success"); 
	next();
});

// Avoid all the Deprecation Warnings from Mongoose
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// Make Mongoose connect to the Database given the specificed url.
//mongoose.connect("mongodb://localhost/yelp_camp"); //DEV PURPOSES
mongoose.connect('mongodb+srv://avidev:' + process.env.YELPCAMP_CLUSTER_PASSWORD + '@yelpcampcluster-pv4t0.mongodb.net/test?retryWrites=true&w=majority', {
	useNewUrlParser: true,
	useCreateIndex: true
}).then(() => {
	console.log('Connected to DB!');
}).catch(err => {
	console.log('Connection Error:', err.message);
});

// Tell Express to user BodyParser
app.use(bodyParser.urlencoded({extended:true}));

// Tell Express to use stylesheets within the public directory
// app.use(express.static("public"));
// Now we are basically 'serving' the public directory
app.use(express.static(__dirname + "/public")); // more conventional way of doing it in node..

app.set("view engine", "ejs");

// Tell App to use Method Override
app.use(methodOverride('_method'));

// Tell our app to use the three Route files we required
app.use(indexRoutes);
app.use(commentRoutes);
app.use("/campgrounds", campgroundRoutes); // this will add /campgrounds in front of all routes in campgroundRoute 

app.listen(process.env.PORT || 3000, process.env.IP, function(){
	console.log("YelpCamp Server has started..");
});




// OLD SEED DATA
// Campground.create(
// 	{name: "Granite Hill", image: "https://s3.amazonaws.com/imagescloud/images/medias/camping/camping-tente.jpg"}, function(err, campground) {
// 		 if (err) {
// 			 console.log("Error..");
// 			 console.log(err);
// 		 } else {
// 		 	console.log("New Campground Created..");
// 			console.log(campground);
// 		 }
// 	 });

// var campgrounds = [
// 		{name: "Salmon Creek", image: "https://www.outsideonline.com/sites/default/files/styles/img_600x600/public/2018/05/31/favorite-free-camping-apps_s.jpg?itok=_jzf7iRS"},
// 		{name: "Granite Hill", image: "https://s3.amazonaws.com/imagescloud/images/medias/camping/camping-tente.jpg"},
// 		{name: "Mountain Goat's Rest", image: "https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"}
// 	];