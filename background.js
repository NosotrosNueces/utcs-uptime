/*
 * background.js executes 'ssh <username>@<server> w' for all servers given
 * every 5 minutes and updates the database with the results.
 * Command line args:
 *  ./background.js <USERNAME> <SERVERS_FILE>
 * SERVERS_FILE is a simple newline-delimited textfile of all the servers.
 *
 * NOTE: Assumes all servers use port 22 for SSH.
 */

var Agenda = require('agenda');
var sys  = require('sys');
var fs   = require('fs');
var who  = require('./who');
var uptime  = require('./uptime');
var assert  = require('assert');

var args = process.argv.slice(2);
if (args.length !== 2) {
  // How do I error?
  throw 'Usage: ./background.js <USERNAME> <SERVERS_FILE>';
}

var agenda = new Agenda({db: { address: 'localhost:27017/utcs-uptime'}});

fs.readFile(args[1], 'utf-8', function (err, data) {
  assert.equal(null, err);

  // All the servers!!
  data.split('\n').map(function (server) {
    if (!server) {
      return;
    }
    agenda.define(server, function(job, done) {
      who.ssh(args[0], server, function (w) {
        // This updates the database records for the servers
        uptime.update(server, w, done);
      });
    });
    agenda.every('2 minutes', server);
  });
});

agenda.start();
