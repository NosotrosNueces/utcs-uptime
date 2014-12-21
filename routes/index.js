var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  var current = req.db.get('current');
  current.find({}, {}, function (e, result) {
    res.render('index', { 'servers': result });
  });
});

module.exports = router;
