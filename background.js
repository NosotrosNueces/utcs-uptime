var Agenda = require('agenda');
var sys  = require('sys');
var fs   = require('fs');
var who  = require('./who');
var uptime = require('./uptime');
var assert = require('assert');
var config = require('./config.json');

var agenda = new Agenda({
  defaultConcurrency: 10,
  db: { address: config.database }
});

// Unlimit EventEmitters
process.setMaxListeners(0);

// Reads through the serversFile and adds a job for each server
fs.readFile(config.serversFile, 'utf-8', function (err, data) {
  assert.equal(null, err);

  // All the servers!!
  data.split('\n').map(function (server) {
    if (!server) {
      return;
    }

    agenda.define(server, function (job, done) {
      who.ssh(config.username, server, function (w) {
        // This updates the database records for the servers
        uptime.update(server, w, function (success) {
          job.priority(success ? 'high' : 'low');
          job.save();
          done();
        });
      });
    });

    agenda.every('4 minutes', server);
  });
});

agenda.start();

module.exports = agenda;
