const express = require("express");
const router = express.Router({mergeParams: true}); //creating router instance
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { reviewSchema } = require("../schema.js");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");



const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body); 
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, msg);
    }else {
        next();
    }   
};



//REVIEW SUBMIT ROUTE
router.post(
  "/",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    const review = new Review(req.body.review);

    review.author = req.user._id;   // ⭐ REQUIRED FIX

    listing.reviews.push(review);

    await review.save();
    await listing.save();

    req.flash("success", "New review added!");
    res.redirect(`/listings/${listing._id}`);
  })
);


//DELETE REVIEW ROUTE
router.delete("/:reviewId", isLoggedIn,isReviewAuthor, wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });// remove reference from listing
    await Review.findByIdAndDelete(reviewId);// delete review document as well
    req.flash("Successfully , A review Deleted!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router; //exporting router