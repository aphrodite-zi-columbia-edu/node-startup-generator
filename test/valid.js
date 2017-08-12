var expect = require('chai').expect;

var valid = require('../lib/valid');

describe('Should validate names', function () {
  it('should pass', function (done) {
    [
      'abc',
      'ABC',
      'aAbBcC',
      'a-bc',
      '-abc',
      'ABC-',
      '-_-',
      'abc-def_G'
    ].forEach(function (string) {
      expect(valid(string)).to.be.true;
    });
    done();
  });

  it('should fail', function (done) {
    [
      '',
      '#abc',
      '$ABC',
      'b.a'
    ].forEach(function (string) {
      expect(valid(string)).to.be.false;
    });
    done();
  });
});
