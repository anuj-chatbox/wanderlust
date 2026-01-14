const express = require("express");
const router = express.Router(); //creating router instance
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require('../models/listing.js');
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");


//INDEX ROUTE
router.get("/", async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
});

//NEW ROUTE
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new");
});



//Create Route
router.post(
    "/", isLoggedIn, validateListing,
    wrapAsync(async (req, res, next) => {
        // let {title, description,price,location,country}=req.body;
        // let listing = req.body.listing; data come in js object
        const newListing = new Listing(req.body.listing);

        newListing.owner = req.user._id; //assigning owner of listing to currently logged in user
        await newListing.save();
        req.flash("success", "Successfully , A new listing Created!");
        res.redirect("/listings");
    })

);


//SHOW ROUTE
router.get("/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: { 
            path: "author",

    },
 })
 .populate("owner");



if (!listing) {
    req.flash("error", "Cannot find that listing!");
    return res.redirect("/listings");
}
console.log(listing);
res.render("listings/show.ejs", { listing });
});


//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not Exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
})
);

//Update Route
router.put("/:id", isLoggedIn, isOwner,
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        req.flash("success", "Successfully , Listing Updated!");
        res.redirect(`/listings/${id}`);
    })
);

//Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Successfully , Listing Deleted!");
    res.redirect("/listings");
})
);

module.exports = router; //exporting router