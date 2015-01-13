var exec = require('child_process').exec;

// Returns an array of JSON from raw w output
function read (stdout) {
  if (!stdout) {
    return { 'users': [] };
  }
  var lines = stdout.split('\n');
  var names = lines[1].split(/\s+/);

  // 5 minute load is the second to last thing
  var load = lines[0].split(/\s+/).reverse()[1].slice(0, -1);

  var users = lines.slice(2, -1).map(
    function (line) {
    var who = {};
    line.split(/\s+/).forEach(
      // Each value is named by its column
      function(value, index) {
        who[names[index]] = value;
      }
    );
    return who;
  });

  return { 'users': users, 'loadAverage': load };
}

// Runs callback on the array from running w on each server
function ssh (username, server, callback) {
  if (!(username && server)) {
    throw new Error('Invalid ssh operands');
  }
  // Build and exec a command if we have the stuff
  exec('ssh ' + username + '@' + server + ' w -s',
       function (error, stdout, stderr) {
         if (error) {
           // Needs logging
           return false;
         }
         callback(read(stdout));
       });
}

module.exports = {
  read: read,
  ssh: ssh
};
