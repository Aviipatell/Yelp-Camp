// Create a bunch of Campgrounds and add in some filler content..

var mongoose = require('mongoose');
var Campground = require('./models/campground');
var Comment = require('./models/comment');

// Avoid all the Deprecation Warnings from Mongoose
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

var data = [
	{
		name: "Cloud's Rest", 
	 	image: "https://awe365.com/content/uploads/2013/06/Want-to-be-a-happy-camper-13-camping-mistakes-to-avoid-Flickr-creative-commons-image-by-pjohnkeane.jpg",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam lobortis tincidunt nisl, a tempus ligula mattis in. In vitae sollicitudin enim. Integer auctor et augue vel varius. Nulla pulvinar cursus metus at facilisis. Donec vehicula, risus congue pretium consequat, risus elit fringilla lectus, et molestie justo sapien nec risus. Aliquam imperdiet, neque eu dignissim lacinia, tortor risus tristique lectus, vitae efficitur est orci sit amet lectus. Praesent tincidunt ipsum et lectus elementum, a elementum ex blandit. Nam nec ante vitae augue fermentum interdum. Morbi nec libero sit amet tellus hendrerit scelerisque eget in felis. Aenean tempor vestibulum tortor, ac porttitor nisl sodales sed."
	},
	{
		name: "Canyon Floor", 
	 	image: "https://awe365.com/content/uploads/2013/06/Want-to-be-a-happy-camper-13-camping-mistakes-to-avoid-Flickr-creative-commons-image-by-srikanth_jandy.jpg",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam lobortis tincidunt nisl, a tempus ligula mattis in. In vitae sollicitudin enim. Integer auctor et augue vel varius. Nulla pulvinar cursus metus at facilisis. Donec vehicula, risus congue pretium consequat, risus elit fringilla lectus, et molestie justo sapien nec risus. Aliquam imperdiet, neque eu dignissim lacinia, tortor risus tristique lectus, vitae efficitur est orci sit amet lectus. Praesent tincidunt ipsum et lectus elementum, a elementum ex blandit. Nam nec ante vitae augue fermentum interdum. Morbi nec libero sit amet tellus hendrerit scelerisque eget in felis. Aenean tempor vestibulum tortor, ac porttitor nisl sodales sed."
	},
	{
		name: "Mountain's Peak", 
	 	image: "https://awe365.com/content/uploads/2013/06/Want-to-be-a-happy-camper-13-camping-mistakes-to-avoid-Flickr-creative-commons-image-by-JesseLeeRoper.jpg",
		description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam lobortis tincidunt nisl, a tempus ligula mattis in. In vitae sollicitudin enim. Integer auctor et augue vel varius. Nulla pulvinar cursus metus at facilisis. Donec vehicula, risus congue pretium consequat, risus elit fringilla lectus, et molestie justo sapien nec risus. Aliquam imperdiet, neque eu dignissim lacinia, tortor risus tristique lectus, vitae efficitur est orci sit amet lectus. Praesent tincidunt ipsum et lectus elementum, a elementum ex blandit. Nam nec ante vitae augue fermentum interdum. Morbi nec libero sit amet tellus hendrerit scelerisque eget in felis. Aenean tempor vestibulum tortor, ac porttitor nisl sodales sed."
	}
];

function seedDB(){
	// Remove all Campgrounds
	Campground.deleteMany({}, function(err){
		if (err) {
			console.log(err);
		} else {
			console.log("Remove Campground");
		}
		
		// Add a few campgrounds	
		data.forEach(function(seed){
			Campground.create(seed, function(err, campground){
				if (err) {
					console.log(err);
				} else {
					console.log("Added a Campground..");
					
					// Create a comment
					Comment.create({
						text: "This place is great, but I wish there was internet!", 
						author: "Homer"
					}, function(err, comment){
						if (err) {
							console.log(err);
						} else {
							campground.comments.push(comment);
							campground.save();
							console.log("Created a comment..");
						}
					});
				}
			});
		});
		
	});
	
	// Add a few comments
}

module.exports = seedDB;