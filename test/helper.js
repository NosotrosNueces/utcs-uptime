var mongoose = require('mongoose');
var fs = require('fs');

process.env.NODE_ENV = "test";

fs.readdirSync(__dirname + '/../models').forEach(function (file) {
  if (~file.indexOf('.js'))
    require(__dirname + '/../models/' + file);
});

