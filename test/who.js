var should = require('should');
var who    = require('../who');

describe('who.js', function() {
  describe('#read()', function() {
    it('should return an empty array on nothing', function(){
      who.read('').should.be.an.Array.and.have.lengthOf(0);
    });

    it('should return an array of w objects', function(){
      // Captured w output for tests
      var result = who.read('\
 13:28:33 up 1 day,  4:32,  1 user,  load average: 0.00, 0.01, 0.05\n\
USER     TTY      FROM              LOGIN@   IDLE   JCPU   PCPU WHAT\n\
name    pts/0    192-168-2-1      13:24    4:13   0.22s  0.22s -zsh\n');
      result.should.be.an.Array.and.have.lengthOf(1);
      result[0].should.have.properties(
        ['USER', 'TTY', 'FROM', 'LOGIN@', 'IDLE', 'JCPU', 'PCPU', 'WHAT']
      );
    });

    it('should contain everyone from the w output', function(){
      // Captured w output for tests
      var result = who.read('\
 13:28:33 up 1 day,  4:32,  1 user,  load average: 0.00, 0.01, 0.05\n\
USER     TTY      FROM              LOGIN@   IDLE   JCPU   PCPU WHAT\n\
name    pts/0    192-168-2-1       13:00    0:13   0.12s  0.24s -zsh\n\
name    pts/2    192-168-2-7       13:14    5:13   0.22s  0.23s -zsh\n\
name    pts/1    192-168-2-4       13:11    7:13   0.32s  0.22s -zsh\n\
name    pts/3    192-168-2-15      13:24    2:13   0.42s  0.21s -zsh\n');
      result.should.be.an.Array.and.have.lengthOf(4);
    });
  });
});
