var dotenv = require('dotenv').config();
var express = require('express');
var router = express.Router({mergeParams: true}); // replace 'app' with 'router' and then export router.
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var middleware = require('../middleware');
var multer = require('multer');
var storage = multer.diskStorage({
	filename: function(req, file, callback){
		callback(null, Date.now() + file.originalname);
	}
});
var imageFilter = function(req, file, cb){
	// accept image files only
	if (!file.originalname.match(/\.(jpg|jpeg|png|git)$/i)){
		return cb(new Error('Only image files are allowed.'), false);
	}
	cb(null, true);
};
var upload = multer({
	storage: storage,
	fileFilter: imageFilter
})

var cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: 'aviipatell',
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});


// 'INDEX' ROUTE
router.get("/", function(req, res){	
	if (req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		// Get all campgrounds from DB
		Campground.find({name: regex}, function(err, allCampgrounds){ // refered to as a fuzzy search
			if (err) {
				//console.log("Error..");
				console.log(err);
			} else {
				res.render("campgrounds/index", {campgrounds:allCampgrounds, page: 'campgrounds'});
				//console.log("Campgrounds have been retrieved.. #$%^&");
			}
		});
		
	} else {
		// Get all campgrounds from DB
		Campground.find({}, function(err, allCampgrounds){
			if (err) {
				//console.log("Error..");
				console.log(err);
			} else {
				res.render("campgrounds/index", {campgrounds:allCampgrounds, page: 'campgrounds'});
				//console.log("Campgrounds have been retrieved.. #$%^&");
			}
		});	
	}
	
	
	
	//res.render("campgrounds", {campgrounds:campgrounds});
	//res.send("hello hello, is this working?");
});


// 'NEW' ROUTE
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});

// 'CREATE' ROUTE
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
	
	cloudinary.v2.uploader.upload(req.file.path, function(err, result){
		if (err) {
			req.flash('error', err.message);
			return res.redirect('back');
		}
		// add cloudinary url for the image to the campground object under image property
		req.body.campground.image = result.secure_url;
		// add image's publid_id to campground object
		req.body.campground.imageId = result.public_id;
		// add author to campground
		req.body.campground.author = {
			id: req.user._id,
			username: req.user.username
		}
		Campground.create(req.body.campground, function(err, campground){
			if (err){
				req.flash('error', err.message);
				return res.redirect('back');
			} else {
				res.redirect('/campgrounds/' + campground.id);
			}
		});
	});
	
	
	
	// get data from the form and add to the campgrounds array
	// console.log("Test 1");

	// var name = req.body.name;
	// var price = req.body.price;
	// var image = req.body.image;
	// var des = req.body.description;
	// var author = {
	// 	id: req.user._id,
	// 	username: req.user.username
	// };
	// var newCampground = {name: name, image: image, price: price, description: des, author:author};
	// console.log("Test 2");

	// Create a new Campground and save it to the DB
	// Campground.create(newCampground, function(err, newlyCreated){
	// 	if (err) {
	// 		console.log("Error.. %^&*$");
	// 		console.log(err);
	// 	} else {
	// 		res.redirect("/campgrounds");
	// 		console.log("Post Request has been successfull");
	// 	}
	// });
	//campgrounds.push(newCampground);
	// redirect it back to the campgrounds page
	//res.redirect("/campgrounds"); // default for redirects is a get request
	// testing statement
	//res.send("You hit the post route!");
});

// 'SHOW' ROUTE 
router.get("/:id", function(req, res){
	//res.send("This will be the show page one day");
	
	//find the campground with the provided ID
	Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground){
		if (err || !foundCampground) {
			req.flash("error", "Campground not found");
			res.redirect("back");
			// console.log("Error..");
			// console.log(err);
		} else {
			console.log(foundCampground);
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
	//render the show template with that campground
	//res.render("show");
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	
	// is user logged in at all
		Campground.findById(req.params.id, function(err, foundCampground){
			if (err) {
					req.flash("error", "Campground not found");
				res.redirect("back");
			} else {
				res.render("campgrounds/edit", {campground: foundCampground});
			}
		});
	// if logged in, does the user own the campground
	
	// otherwise also redirect
	
	// if not, redirect
	
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", upload.single('image'), middleware.checkCampgroundOwnership, async function(req, res){
	
	// find and update the correct campground
	Campground.findById(req.params.id, function(err, campground){
		if (err) {
			req.flash('error', err.message);
			res.redirect('back');
		} else {
			if (req.file){
				try {
					
					await 
					cloudinary.v2.uploader.destroy(campground.imageId);
					var result = await 
					cloudinary.v2.uploader.uploader(req.file.path);
					// update node node -v
					campground.imageId = result.public_id;
					campground.image = result.secure_url;
					
				} catch(err) {
					req.flash('error', err.message);
					res.redirect('back');
					return res.redirect('back');
				}
			
			}
			campground.name = req.body.campground.name;
			campground.description = req.body.campground.description;
			campground.save();
			req.flash('success', "Successfully Updated!");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err, campgroundRemoved){
		if (err) {
			res.redirect("/campgrounds");
		} else {
			Comment.deleteMany({_id: {$in: campgroundRemoved.comments}}, function(err){
				if (err) {
					res.redirect("/campgrounds");
				} else {
					res.redirect("/campgrounds");
				}
			});
			// res.redirect("/campgrounds");
		}
	});
});

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;



