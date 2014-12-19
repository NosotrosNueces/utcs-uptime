#!/usr/bin/env node
/*
 * who.js executes 'ssh <username>@<server> w' for all servers given.
 * Command line args:
 *  ./who.js <USERNAME> <SERVERS_FILE>
 * SERVERS_FILE is a simple newline-delimited textfile of all the servers.
 *
 * NOTE: Assumes all servers use port 22 for SSH.
 */
var sys = require('sys');
var fs = require('fs');
var exec = require('child_process').exec;

// Returns an array of JSON from raw w output
function wReader(stdout) {
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

function sshWho(username, server) {
  if (!(username && server)) {
    return '';
  }
  // Build and exec a command if we have the stuff
  exec('ssh ' + username + '@' + server + ' w',
       function (error, stdout, stderr) {
         if (error) {
           throw error;
         }
         var w = wReader(stdout);
         // This takes the w object and prints the users from each machine
         if (w.length > 0) {
           sys.puts(
             server + ': ' +
             w.map(function (obj) {
                     return obj.USER;
           }).join());
         }
       });
}

//////////
// Main //
//////////
var args = process.argv.slice(2);
if (args.length !== 2) {
  // How do I error?
  throw 'Usage: ./who.js <USERNAME> <SERVERS_FILE>';
}
fs.readFile(args[0], 'utf-8', function (err, data) {
  if (err) {
    throw err;
  }

  // All the servers!!
  data.split('\n').map(function (server) {
    sshWho(args[1], server);
  });
});
