if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}


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
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");
const { isLoggesIn } = require("./middleware.js");  




// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("connected to db");

})
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 60 * 60,
});
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});


const sessionOptions = {
    store,
    secret: process.env.SECRET,// for signing session id cookie
    resave: false,// don't save session if unmodified
    saveUninitialized: true,// don't create session until something stored
    cookie: {
        express: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    },
};





app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());// persistent login sessions
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());   

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});
app.use((req, res, next) => {
    res.locals.currentUser = req.user;   // Passport stores logged-in user in req.user
    next();
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

app.use("/listings", listingRouter); //using listing routes
app.use("/listings/:id/reviews", reviewRouter); //using review routes     
app.use("/",userRouter); //using user routes

// FOR ALL RANDOM URLS
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


app.listen(3333, () => {
    console.log("app listening");
});