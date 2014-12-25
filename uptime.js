var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/utcs-uptime';

/*
 * Replaces the current collection's info on a server
 * and stores session data for people who left
 */
function update (server, w, callback) {
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log('Updating ' + server);

    var current = db.collection('current')
      , session = db.collection('session');

    current.find({ 'hostname': server }).toArray(
      function(err, result) {
        assert.equal(null, err);
        var oldInfo = result[0];
        var nextUsers = [];

        if (oldInfo === undefined) {
          // Everyone is new
          w.forEach(function (user) {
            nextUsers.push({
              'name': user.USER,
              'tty':  user.TTY,
              'from': user.FROM,
              'time': new Date()
            });
          });

          current.insert({
            'hostname': server,
            'user-count': nextUsers.length,
            'physical': w.some(function (user) { return user.TTY === ':0'; }),
            'users': nextUsers
          }, function (err, result) {
              assert.equal(err, null);
              db.close();
              callback();
            });
        } else {
          // Retain old users and store sessions for people who left
          oldInfo.users.forEach(function (user) {
            if (w.some(function (u) { return u.USER === user.name; })) {
              nextUsers.push(user);
            } else {
              session.insert({
                'username': user.name,
                'servername': server,
                'hostname': user.from,
                'time': new Date() - user.time,
                'physical': user.tty === ':0'
              }, function (err, result) {
                assert.equal(null, err);
                // This connection is closed elsewhere, maybe at an ok time
              });
            }
          });

          // Introduce a single copy of any next people
          w.forEach(function (user) {
            if (!nextUsers.some(function (u) { return u.name === user.USER; })) {
              nextUsers.push({
                'name': user.USER,
                'tty':  user.TTY,
                'from': user.FROM,
                'time': new Date()
              });
            }
          });

          // Create actual info for update
          var nextInfo = {
            'user-count': nextUsers.length,
            'physical': w.some(function (user) { return user.TTY === ':0'; }),
            'users': nextUsers
          };

          current.update(
            { 'hostname': server },
            { $set: nextInfo },
            function (err, result) {
              assert.equal(err, null);
              db.close();
              callback();
            }
          );
        }
    });
  });
}

module.exports = {
  update: update
};
