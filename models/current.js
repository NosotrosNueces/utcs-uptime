var mongoose = require('mongoose');

var currentSchema = mongoose.Schema({
  hostname: {type: String, trim: true},
  physical: {type: Boolean},
  userCount: {type: Number},
  updated: {type: Date},
  loadAverage: {type: Number},
  users: [{
    name: {type: String, trim: true},
    tty: {type: String, trim: true},
    from: {type: String, trim: true},
    loginTime: {type: Date}
  }]
});

var Mongoose = mongoose.model('Current', currentSchema);
