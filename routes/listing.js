const express= require ("express");
const router = express.Router(); //creating router instance
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require('../models/listing.js')

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body); 
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, msg);
    }else {
        next();
    }   
};
//INDEX ROUTE
router.get("/", async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
});

//NEW ROUTE
router.get("//new", 
     wrapAsync(async (req, res) => {
    res.render("listings/new.ejs")
})
);


//Create Route
router.post(
    "/",
    wrapAsync(async (req, res, next) => {

        if (!req.body.listing) {
            throw new ExpressError(400, "Send Valid Listing Data");
        }
        // let {title, description,price,location,country}=req.body;
        // let listing = req.body.listing; data come in js object
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    })

);


//SHOW ROUTE
router.get("/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
});
//NEW ROUTE
router.get("/new", 
     wrapAsync(async (req, res) => {
    res.render("listings/new.ejs")
})
);

//Edit Route
router.get("/:id/edit",  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
})
);

//Update Route
router.put("/:id", 
     wrapAsync(async (req, res) => {
        if (!req.body.listing) {
            throw new ExpressError(400, "Send Valid Listing Data");
        };
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
})
);

//Delete Route
router.delete("/:id",  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
})
);

module.exports = router; //exporting router