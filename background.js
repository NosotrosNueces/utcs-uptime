var Agenda = require('agenda');
var sys  = require('sys');
var fs   = require('fs');
var who  = require('./who');
var uptime = require('./uptime');
var assert = require('assert');
var config = require('./config.json');

var agenda = new Agenda({db: { address: config.database }});

// Reads through the serversFile and adds a job for each server
fs.readFile(config.serversFile, 'utf-8', function (err, data) {
  assert.equal(null, err);

  // All the servers!!
  data.split('\n').map(function (server) {
    if (!server) {
      return;
    }

    agenda.define(server, function(job, done) {
      who.ssh(config.username, server, function (w) {
        // This updates the database records for the servers
        uptime.update(server, w, done);
      });
    });

    agenda.every('2 minutes', server);
  });
});

agenda.start();
