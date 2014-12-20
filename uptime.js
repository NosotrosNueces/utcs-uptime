var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/utcs-uptime';

/*
 * Replaces the current collection's info on a server
 * TODO: Store into the session collection based on the difference
 *       between old and current data.
 */
function update (server, w) {
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log('Updating ' + server);

    // Should uniq users first
    var newInfo = {
      'user-count': w.length,
      'physical': w.some(function (user) { return user.TTY === ':0'; }),
      'users': w.map(function (user) {
        return {
          'name': user.USER,
          'tty':  user.TTY,
          'from': user.FROM,
          'time': new Date()
        };
      })
    };

    db.collection('current').update(
      { 'hostname': server },
      { $set: newInfo },
      function (err, result) {
        assert.equal(err, null);
        db.close();
      });
  });
}

module.exports = {
  update: update
};
