var express = require('express');
var router = express.Router();

var mongoose = require('mongoose'),
    Session = mongoose.model('Session');

// Serves every stored session
// probably don't want to do this
router.route('/')
  .get(function(req, res) {
    Session.find({},
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
          res.json(result);
        }
    });
  });

// Serves sessions for a given hostname
router.route('/server/:server')
  .get(function(req, res) {
    Session.find(
      { 'hostname': req.params.server },
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
          res.json(result);
        }
    });
  });

// Serves sessions for a given username
router.route('/user/:user')
  .get(function(req, res) {
    Session.find(
      { 'name': req.params.user },
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
          res.json(result);
        }
    });
  });

module.exports = router;
