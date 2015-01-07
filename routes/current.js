var express = require('express');
var router = express.Router();

var mongoose = require('mongoose'),
    Current = mongoose.model('Current');

// Serves every current record
router.route('/')
  .get(function(req, res) {
    Current.find({},
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
          res.json(result);
        }
    });
  });

// Serves record for a given hostname
// This should only ever return one
router.route('/:server')
  .get(function(req, res) {
    Current.find(
      { 'hostname': req.params.server },
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
          res.json(result);
        }
    });
  });

module.exports = router;
