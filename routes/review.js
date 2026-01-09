const express = require("express");
const router = express.Router({mergeParams: true}); //creating router instance
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { reviewSchema } = require("../schema.js");



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
router.post("/", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new review(req.body.review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
   res.redirect(`/listings/${req.params.id}`);

}));

//DELETE REVIEW ROUTE
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });// remove reference from listing
    await review.findByIdAndDelete(reviewId);// delete review document as well
    res.redirect(`/listings/${id}`);
}));

module.exports = router; //exporting router