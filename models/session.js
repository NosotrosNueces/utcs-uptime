var mongoose = require('mongoose');

var sessionSchema = mongoose.Schema({
  name: {type: String, trim: true},
  hostname: {type: String, trim: true},
  from: {type: String, trim: true},
  loginTime: {type: Date},
  logoutTime: {type: Date},
  physical: {type: Boolean}
});

var Session = mongoose.model('Session', sessionSchema);
