const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserDb = require("../models/userModel");
const jwt = require('jsonwebtoken');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/user/redirect",
      session: false
    },
    (accessToken, refreshToken, profile, done) => {
      // Check if user exists
      UserDb.findOne({ email: profile.emails[0].value }).then((currentUser) => {
        if (currentUser) {
          // User already exists
          return done(null, currentUser);
        } else {
          // Create a new user
          new UserDb({
            name: profile.displayName,
            email: profile.emails[0].value,
            wallet: 0
          })
            .save()
            .then((newUser) => {
              return done(null, newUser);
            })
            .catch(err => done(err));  // Handle error and pass it to done
        }
      }).catch(err => done(err));  // Handle error and pass it to done
    }
  )
);

// passport.serializeUser((user, done) => {
//   done(null, user._id);
// })

// passport.deserializeUser((id, done) => {
//   UserDb.findById(_id).then((user) => {
//     done(null, user);
//   });
// })


// Initiate Google OAuth
exports.googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false // Disable sessions
});

// Google OAuth callback
exports.googleRedirect = [
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  (req, res) => {
    try {
      // Debugging statement to check if req.user is set
      if (!req.user) {
        console.error('Authentication failed, req.user is undefined.');
        return res.redirect("/?msg=authentication_failed");
      }

      // Debugging statement to print the user object
      console.log('Authenticated user:', req.user);

      // Generate JWT token for user
      const token = jwt.sign({ email: req.user.email }, "secret_key", {
        expiresIn: "50m",
      });

      // Set token as cookie
      res.cookie("userJwtAuth", token, {
        httpOnly: true,
      });

      // Redirect to home with success message
      res.redirect("/?msg=success");
    } catch (error) {
      console.log(error)
    }
  }
];
