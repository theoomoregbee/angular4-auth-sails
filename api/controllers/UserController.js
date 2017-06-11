/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

module.exports = {
  /**
   * this is used to authenticate user to our api using either email and password
   * POST /login
   * @param req
   * @param res
   */
  login: function (req, res) {

    /**
     * this is param checking if they are provided
     */
    if (!_.has(req.body, 'email') || !_.has(req.body, 'password')) {
      return res.serverError("No field should be empty.");
    }

    /**
     * check if the username matches any email or phoneNumber
     */
    User.findOne({
      email: req.body.email
    }).exec(function callback(err, user) {
      if (err) return res.serverError(err);

      if (!user) return res.serverError("User not found, please sign up.");


      //check password
      bcrypt.compare(req.body.password, user.password, function (error, matched) {
        if (error) return res.serverError(error);

        if (!matched) return res.serverError("Invalid password.");

        //save the date the token was generated for already inside toJSON()

        var token = jwt.sign(user.toJSON(), "this is my secret key", {
          expiresIn: '10m'
        });

        //return the token here
        res.ok(token);
      });

    });
  },

  /**
   * this is used to request for another token when the other token is about
   * expiring so for next request call the token can be validated as true
   * GET /token
   * @param req
   * @param res
   */
  token: function (req, res) {
    User.findOne(req.user.id).exec(function callback(error, user) {
      if (error) return res.serverError(error);
      if (!user) return res.serverError("User not found");

      var token = jwt.sign(user.toJSON(), "this is my secret key", {
        expiresIn: '10m'
      });
      res.ok(token);
    });
  }
};

