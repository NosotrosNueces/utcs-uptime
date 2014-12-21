var express = require('express');
var router = express.Router();

// Serves every stored session
// probably don't want to do this
router.route('/')
  .get(function(req, res) {
    req.db.get('session').find({}, {},
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
    req.db.get('session').find(
      { 'servername': req.params.server }, {},
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
    req.db.get('session').find(
      { 'username': req.params.user }, {},
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
          res.json(result);
        }
    });
  });

module.exports = router;
