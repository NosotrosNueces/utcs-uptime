var mongoose = require('mongoose'),
    Current = mongoose.model('Current'),
    Session = mongoose.model('Session');

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

  if (oldInfo === undefined) {
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
  oldInfo.users.forEach(function (user) {
    if (!newInfo.users.some(function (u) { return u.USER === user.name; })) {
      var session = new Session({
        'name': user.name,
        'hostname': oldInfo.hostname,
        'from': user.from,
        'loginTime': user.time,
        'logoutTime': new Date(),
        'physical': user.tty === ':0'
      });

      session.save(function(err) {
        if (err) {
          // Needs logging
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
  console.log('Updating ' + server);

  Current.findOne({ 'hostname': server }, function(err, oldInfo) {
    if (err) {
      // Needs logging
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

    if (oldInfo === undefined) {
      // Insert if there wasn't already a record
      var current = new Current(nextInfo);

      current.save(function(err) {
        if (err) {
          // Needs logging
          return false;
        }
        callback();
      });
    } else {
      saveSessions(oldInfo, w);
      Current.update(
        { 'hostname': server },
        { $set: nextInfo },
        function(err) {
          if (err) {
            // Needs logging
            return false;
          }
          callback();
        }
      );
    }
  });
}

module.exports = {
  update: update
};
