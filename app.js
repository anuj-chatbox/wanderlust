const express = require ("express");
const app= express();
const mongoose = require("mongoose");
const Listing = require('./models/listing.js')
const path=require ("path");
const methodOverride = require("method-override");
const  ejsMate= require("ejs-mate")



const MONGO_URL ="mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {console.log("connected to db");

})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}
app.set("view engine", "ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


app.get("/", (req,res) => {
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


//INDEX ROUTE
app.get("/Listings", async(req,res) => {
let allListings = await Listing.find({});
res.render("listings/index.ejs", {allListings});
});

//NEW ROUTE
app.get("/listings/new", async(req,res) => {
    res.render("listings/new.ejs")
});


//Create Route
app.post("/listings", async(req,res) => {
    // let {title, description,price,location,country}=req.body;
    // let listing = req.body.listing; data come in js object
   const newListing = new Listing(req.body.listing);
   await newListing.save();
   res.redirect("/listings");
});


//SHOW ROUTE
app.get("/listings/:id", async(req,res) => {
    let {id} =req.params;
    const listing= await Listing.findById(id);
    res.render("listings/show.ejs", {listing}); 
});
//NEW ROUTE
app.get("/listings/new", async(req,res) => {
    res.render("listings/new.ejs")
});

//Edit Route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

//Update Route
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
});

//Delete Route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

// //REDIRECT WHEN CLICK ON IMG
// app.get("/listings/:id", async (req, res) => {
//   const listing = await Listing.findById(req.params.id);
//   res.render("listings/show", { listing });
// });


app.listen(8080, () => {
    console.log("app listening");
})