const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require('./models/listing.js')
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate")
// const wrapAsync = require("./utils/wrapAsync.js");
// const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const review = require("./models/review.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");



const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("connected to db");

})
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


app.get("/", (req, res) => {
    res.send("Hi , i am root");
});



  

// app.get("/testListing", async (req,res) => {
//  let samplelisting = new Listing({
//     title: "My nnnew villa",
//     description: "By the beech",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//  });

//  await samplelisting.save();
//  console.log("sample was saved");
//  res.send("successfull testing")
// });



// //REDIRECT WHEN CLICK ON IMG
// app.get("/listings/:id", async (req, res) => {
//   const listing = await Listing.findById(req.params.id);
//   res.render("listings/show", { listing });
// });




//ERROR MIDDLEWARE
app.use((err, req, res, next) => {
    const status = err.status || 500;
const message = err.message || "Something Went Wrong";
// res.status(status).send(message);
res.status(status).render("error.ejs", { message });
})

app.use("/listings", listings); //using listing routes
app.use("/listings/:id/reviews", reviews); //using review routes     


// FOR ALL RANDOM URLS
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.listen(3333, () => {
    console.log("app listening");
});