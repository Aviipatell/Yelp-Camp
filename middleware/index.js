var Campground = require('../models/campground');
var Comment = require('../models/comment');
// All the middleware goes here!
var middlewareObject = {};

middlewareObject.isLoggedIn = function(req, res, next){
	if (req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You need to be logged in to do that.");//technically only works on the next page after you redirect
	res.redirect("/login");
};

middlewareObject.checkCampgroundOwnership = function(req, res, next){
	if (req.isAuthenticated()){
		Campground.findById(req.params.id, function(err, foundCampground){
		if (err || !foundCampground) {
			req.flash("error", "Campground not found.");
			res.redirect("back");
		} else {
			if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
				next(); // move on to next		
			} else {
				req.flash("error", "You don't have permission to do that.")
				res.redirect("back");
			}
		}
	});
	} else {
		req.flash("error", "You need to be logged in to do that.");
		res.redirect("back"); // take the user to the previous page they were on..
	}
};

middlewareObject.checkCommentOwnership = function(req, res, next){
	if (req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundComment){
		if (err || !foundComment) {
			req.flash("error", "Comment not found.");
			res.redirect("back");
		} else {
			if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
				next(); // move on to next		
			} else {
				req.flash("error", "You don't have permission to do that.")
				res.redirect("back");
			}
		}
	});
	} else {
		req.flash("error", "You need to be logged in to do that.")
		res.redirect("back"); // take the user to the previous page they were on..
	}
};

module.exports = middlewareObject;