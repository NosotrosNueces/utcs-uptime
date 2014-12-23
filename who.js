var exec = require('child_process').exec;

// Returns an array of JSON from raw w output
function read (stdout) {
  if (!stdout) {
    return [];
  }
  var lines = stdout.split('\n');
  var names = lines[1].split(/\s+/);
  return lines.slice(2, -1).map(
    function (line) {
      var who = {};
      line.split(/\s+/).forEach(
        function(value, index) {
          who[names[index]] = value;
      });
      return who;
  });
}

// Runs callback on the array from running w on each server
function ssh (username, server, callback) {
  if (!(username && server)) {
    throw new Error('Invalid ssh operands');
  }
  // Build and exec a command if we have the stuff
  exec('ssh ' + username + '@' + server + ' w',
       function (error, stdout, stderr) {
         if (error) {
           throw error;
         }
         callback(read(stdout));
       });
}

module.exports = {
  read: read,
  ssh: ssh
};
