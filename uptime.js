var mongoose = require('mongoose'),
    Current = mongoose.model('Current'),
    Session = mongoose.model('Session');

function dateFromWTime (wTime) {
  var time  = /(\d+):(\d+)/,
      day   = /(\w+)(\d+)/,
      month = /(\d+)(\D+)(\d+)/;

  var now = new Date();
  var match;
  if (time.test(wTime)) {
    match = time.exec(wTime);
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      match[1],
      match[2]);
  }

  if (day.test(wTime)) {
    match = day.exec(wTime);
    return new Date(
      now.getFullYear(),
      now.getMonth(), // Possibly not what we want
      match[1],
      match[2], 59);
  }

  if (month.test(wTime)) {
    match = month.exec(wTime);
    return new Date(
      match[3], match[2], match[1], 23, 59);
  }

  console.log('Unmatched time string: ' + wTime);
  return now;
}

/*
 * Creates a new users array
 */
function nextUsers (oldInfo, newInfo) {
  var users = [];
  function add (user) {
    users.push({
      'name': user.USER,
      'tty':  user.TTY,
      'from': user.FROM,
      'loginTime': new Date()
    });
  }

  if (!oldInfo) {
    // Everyone is new
    newInfo.users.forEach(function (user) {
      if (!users.some(function (u) { return u.name === user.USER; })) {
        add(user);
      }
    });
  } else {
    // Retain old users that are still here
    oldInfo.users.forEach(function (user) {
      if (newInfo.users.some(function (u) { return u.USER === user.name; })) {
        users.push(user);
      }
    });

    // Introduce a single copy of any next people
    newInfo.users.forEach(function (user) {
      if (!users.some(function (u) { return u.name === user.USER; })) {
        add(user);
      }
    });
  }
  return users;
}

/*
 * Store sessions for people who left
 */
function saveSessions (oldInfo, newInfo) {
  if (!oldInfo) {
    // First time to check this machine
    return;
  }

  oldInfo.users.forEach(function (user) {
    if (!newInfo.users.some(function (u) { return u.USER === user.name; })) {
      var session = new Session({
        'name': user.name,
        'hostname': oldInfo.hostname,
        'from': user.from,
        'loginTime': user.loginTime,
        'logoutTime': new Date(),
        'physical': user.tty === ':0'
      });

      session.save(function(err) {
        if (err) {
          console.log(err);
          return false;
        }
      });
    }
  });
}

/*
 * Replaces the current collection's info on a server
 * and stores session data for people who left
 */
function update (server, w, callback) {
  Current.findOne({ 'hostname': server }, function(err, oldInfo) {
    if (err) {
      console.log(err);
      callback(false);
      return false;
    }

    var nextUserInfo = nextUsers(oldInfo, w);

    // Info to be stored in the current collection
    var nextInfo = {
      'hostname': server,
      'userCount': nextUserInfo.length,
      'physical': w.users.some(function (user) { return user.TTY === ':0'; }),
      'loadAverage': w.loadAverage,
      'updated': new Date(),
      'users': nextUserInfo
    };

    if (!oldInfo) {
      // Insert if there wasn't already a record
      var current = new Current(nextInfo);

      current.save(function(err) {
        if (err) {
          console.log(err);
        }
        callback(!err);
      });
    } else {
      saveSessions(oldInfo, w);

      Current.update(
        { 'hostname': server },
        { $set: nextInfo },
        function(err) {
          if (err) {
            console.log(err);
          }
          callback(!err);
        }
      );
    }
  });
}

module.exports = {
  update: update
};

if (process.env.NODE_ENV === "test") {
  module.exports.dateFromWTime = dateFromWTime;
}
