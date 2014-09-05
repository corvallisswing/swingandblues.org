var auth = require('./lib/auth');

var express = require('express');
var router = express.Router();

//----------------------------------------------------------------
// Authentication
//
var loginFailureUrl = '/admin'; // abs-url

// Google authentication returns here upon success.
router.get('/google/return', auth.authMiddleware, function (req, res) {
    // We're signed in, now. Persist.
    req.session.save(function (err) {
        if (err) {
            console.log(err);
        }
        res.redirect('/admin');    
    });
});


// GET /data/admin/auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve redirecting
//   the user to google.com.  After authenticating, Google will redirect the
//   user back to this application at /data/admin/auth/google/return
router.get('/google', auth.authenticate('google', { failureRedirect: loginFailureUrl }), function (req, res) {
    // This response doesn't matter, because we get redirected
    // to /data/admin/auth/google/return anyway.
    res.send(':-)');
});


// Logout ...
router.get('/sign-out', function (req, res){
    req.logout();
    req.session.destroy(function (err) {
        res.redirect('/admin');  
    });
});

module.exports = router;
