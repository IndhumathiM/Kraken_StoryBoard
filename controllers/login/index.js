'use strict';

var LoginModel = require('../../models/login'),
passport = require('passport');
var user = require('../../models/user');

module.exports = function (router) {
  var model = new LoginModel();

   /** Display the login page. We also want to display any error messages that result from a failed login attempt.   */
   router.get('/', function (req, res) {
       model.messages = req.flash('error');
       res.render('login', model);
   });

    /**    * Receive the login credentials and authenticate.
     *  Failed authentications will go back to the login page with a helpful error message to be displayed.
     */
    router.post('/', function (req, res) {
        console.log(req.body.username);
        req.session.userName = req.body.username;
        passport.authenticate('local',
            {
                successRedirect: req.session.goingTo || '/home',
                failureRedirect: '/login',
                failureFlash: true
            })(req, res);
    });
};
