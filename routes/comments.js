var express = require('express');
var router = express.Router({mergeParams: true}); // replace 'app' with 'router' and then export router.
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var middleware = require('../middleware');


// ===================
// COMMENTS ROUTE
// ===================

// 'NEW COMMENTS' Route
router.get("/campgrounds/:id/comments/new", middleware.isLoggedIn, function(req, res){
	//res.send("This will be our comment form!");
	
	// find campground by 
	Campground.findById(req.params.id, function(err, campground){
		if (err){
			console.log(err);
		} else {
			res.render("comments/new", {campground: campground});
		}
	});
	// res.render("comments/new");
});

// middleware used here too to prevent postman.. tsk tsk
router.post("/campgrounds/:id/comments", middleware.isLoggedIn, function(req, res){
	// look up campground with ID
	Campground.findById(req.params.id, function(err, campground){
		if (err) {
			console.log(err);
			res.rediret("/campgrounds");
		} else {
			// create new comments
			// var newComment = req.body.comment;
			Comment.create(req.body.comment, function(err, comment){
				if (err){
					req.flash("error", "Something went wrong.");
					console.log(err);
				} else {
					// add usename and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					// save comment
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("success", "Successfully added your comment.");
					res.redirect("/campgrounds/" + campground._id);
				}
			});
			// connect new comment to campgroud
	
			// redirect back to show page
			// res.redirect("campground/show");
		}
	})
});

// EDIT ROUTE 
router.get("/campgrounds/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if (err || !foundCampground){
			req.flash("error", "Campground not found");
			return res.redirect("back");
		}
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if (err) {
				res.redirect("back");
			} else {
				res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});		
			}
		});
	});
	
});

// UPDATE ROUTE
router.put("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if (err){
			res.redirect("back");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// DESTROY ROUTE
router.delete("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if (err) {
			res.redirect("back");
		} else {
			req.flash("success", "Comment deleted.");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

module.exports = router;