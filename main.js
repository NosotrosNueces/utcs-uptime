#!/usr/bin/env node
/*
 * main.js executes 'ssh <username>@<server> w' for all servers given.
 * Command line args:
 *  ./main.js <USERNAME> <SERVERS_FILE>
 * SERVERS_FILE is a simple newline-delimited textfile of all the servers.
 *
 * NOTE: Assumes all servers use port 22 for SSH.
 */

var sys  = require('sys');
var fs   = require('fs');
var who  = require('./who');
var uptime  = require('./uptime');
var assert  = require('assert');

//////////
// Main //
//////////
var args = process.argv.slice(2);

if (args.length !== 2) {
  throw new Error('Usage: ./main.js <USERNAME> <SERVERS_FILE>');
}

fs.readFile(args[1], 'utf-8', function (err, data) {
  assert.equal(null, err);

  // All the servers!!
  data.split('\n').slice(0,-1).map(function (server) {
    who.ssh(args[0], server, function (w) {
      // This takes the w object and prints the users from each machine
      if (w.length > 0) {
        sys.puts(
          server + ': ' +
          w.map(function (obj) {
            return obj.USER;
          }).join()
        );
      }
    });
  });
});
