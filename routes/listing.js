const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require('../models/listing.js');
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const multer = require("multer");
const { storage, cloudinary } = require("../cloudConfig.js");
const upload = multer({ storage });


// ================= INDEX ROUTE =================
router.get("/", async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
});


// ================= NEW ROUTE =================
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new");
});


// ================= CREATE ROUTE =================
router.post(
    "/",
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,

    wrapAsync(async (req, res) => {

        if (!req.file) {
            req.flash("error", "Image is required!");
            return res.redirect("/listings/new");
        }

        const newListing = new Listing(req.body.listing);

        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };

        newListing.owner = req.user._id;

        await newListing.save();

        req.flash("success", "Successfully, A new listing Created!");
        res.redirect("/listings");
    })
);


// ================= SHOW ROUTE =================
router.get("/:id", async (req, res) => {

    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
});


// ================= EDIT ROUTE =================
router.get("/:id/edit", isLoggedIn, isOwner,
    wrapAsync(async (req, res) => {

        let { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing does not exist!");
            return res.redirect("/listings");
        }

        res.render("listings/edit.ejs", { listing });
    })
);


// ================= UPDATE ROUTE (IMAGE SUPPORT ADDED) =================
router.put("/:id",
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),

    wrapAsync(async (req, res) => {

        let { id } = req.params;

        let listing = await Listing.findById(id);

        await Listing.findByIdAndUpdate(id, { ...req.body.listing });

        // If user uploaded new image
        if (req.file) {

            // Delete old image from cloudinary
            await cloudinary.uploader.destroy(listing.image.filename);

            // Add new image
            listing.image = {
                url: req.file.path,
                filename: req.file.filename
            };

            await listing.save();
        }

        req.flash("success", "Successfully, Listing Updated!");
        res.redirect(`/listings/${id}`);
    })
);


// ================= DELETE ROUTE (CLOUD IMAGE DELETE FIX) =================
router.delete("/:id",
    isLoggedIn,
    isOwner,

    wrapAsync(async (req, res) => {

        let { id } = req.params;

        let listing = await Listing.findById(id);

        // Delete image from cloudinary
        await cloudinary.uploader.destroy(listing.image.filename);

        // Delete listing from DB
        await Listing.findByIdAndDelete(id);

        req.flash("success", "Successfully, Listing Deleted!");
        res.redirect("/listings");
    })
);

module.exports = router;
