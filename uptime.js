var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/utcs-uptime';

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
      'time': new Date()
    });
  }

  if (oldInfo === undefined) {
    // Everyone is new
    newInfo.forEach(function (user) {
      if (!users.some(function (u) { return u.name === user.USER; })) {
        add(user);
      }
    });
  } else {
    // Retain old users that are still here
    oldInfo.users.forEach(function (user) {
      if (newInfo.some(function (u) { return u.USER === user.name; })) {
        users.push(user);
      }
    });

    // Introduce a single copy of any next people
    newInfo.forEach(function (user) {
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
    if (!newInfo.some(function (u) { return u.USER === user.name; })) {
      MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('session').insert({
          'username': user.name,
          'servername': oldInfo.server,
          'hostname': user.from,
          'time': new Date() - user.time,
          'physical': user.tty === ':0'
        }, function (err, result) {
          assert.equal(null, err);
          db.close();
        });
      });
    }
  });
}

/*
 * Replaces the current collection's info on a server
 * and stores session data for people who left
 */
function update (server, w, callback) {
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log('Updating ' + server);

    // Callback for last async call made
    function finish (err, result) {
      assert.equal(null, err);
      db.close();
      callback();
    }

    var current = db.collection('current');

    current.find({ 'hostname': server }).toArray(
      function(err, result) {
        assert.equal(null, err);
        var oldInfo = result[0];
        var nextUserInfo = nextUsers(oldInfo, w);

        // Info to be stored in the current collection
        var nextInfo = {
          'hostname': server,
          'user-count': nextUserInfo.length,
          'physical': w.some(function (user) { return user.TTY === ':0'; }),
          'users': nextUserInfo
        };

        if (oldInfo === undefined) {
          // Insert if there wasn't already a record
          current.insert(nextInfo, finish);
        } else {
          saveSessions(oldInfo, w);
          current.update({ 'hostname': server }, { $set: nextInfo }, finish);
        }
    });
  });
}

module.exports = {
  update: update
};
