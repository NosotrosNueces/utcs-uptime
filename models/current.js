var mongoose = require('mongoose');

var currentSchema = mongoose.Schema({
  hostname: {type: String, default: '', trim: true},
  physical: {type: Boolean, default: false},
  userCount: {type: Number, default: 0},
  updated: {type: Date, default: Date.now},
  loadAverage: {type: Number, default: 0},
  users: [{
    name: {type: String, default: '', trim: true},
    tty: {type: String, default: '', trim: true},
    from: {type: String, default: '', trim: true},
    loginTime: {type: Date}
  }]
});

mongoose.model('Current', currentSchema);
