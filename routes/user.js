const express = require("express");
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
 
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ email,username });// Create a new user instance
    const registeredUser = await User.register(newUser, password);// Register the user with passport-local-mongoose
   console.log(registeredUser);
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");

  } catch (e) {     
    req.flash("error", e.message);
    res.redirect("signup");
  }

    }));


    router.get("/login", (req, res) => {
      res.render("users/login.ejs");
    });

 router.post("/login",saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
  }),
  async(req, res) => {
req.flash("success", "Welcome back!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  }
);




    router.get("/logout", (req, res, next) => {
      req.logout( (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Logged you out!");
        res.redirect("/listings");
      });
    });

module.exports = router;
