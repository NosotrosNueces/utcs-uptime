var should = require('should'),
    uptime = require('../uptime');

var now = new Date();

describe('uptime.js', function () {
  describe('#dateFromWTime', function () {
    it('handles time only', function () {
      uptime.dateFromWTime('16:56').should.eql(
        new Date(now.getFullYear(),
                 now.getMonth(),
                 now.getDate(),
                 16, 56)
      );
    });
    it('handles day/hour', function () {
      var lastTue = [5,6,0,1,2,3,4][now.getDay()];
      uptime.dateFromWTime('Tue11').should.eql(
        new Date(now.getFullYear(),
                 now.getMonth(), // Possibly not what we want
                 now.getDate() - lastTue,
                 11, 59)
      );
    });
    it('handles day/month/year', function () {
      uptime.dateFromWTime('23Dec14').should.eql(
        new Date(2014, 11, 23, 23, 59)
      );
    });
  });
});
