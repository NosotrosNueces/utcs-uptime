var express = require('express');
var router = express.Router();

var mongoose = require('mongoose'),
    Current = mongoose.model('Current');

/* GET home page. */
router.get('/', function(req, res) {
  Current.find(function (err, result) {
    if (err) {
      res.send(err);
    } else {
      res.render('index', { 'servers': result });
    }
  });
});

module.exports = router;
