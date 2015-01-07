var mongoose = require('mongoose');

var sessionSchema = mongoose.Schema({
  name: {type: String, default: '', trim: true},
  hostname: {type: String, default: '', trim: true},
  from: {type: String, default: '', trim: true},
  loginTime: {type: Date},
  logoutTime: {type: Date, default: Date.now},
  physical: {type: Boolean, default: false}
});

mongoose.model('Session', sessionSchema);
