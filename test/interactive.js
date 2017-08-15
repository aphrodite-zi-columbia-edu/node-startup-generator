var expect = require('chai').expect;

var fs = require('fs');
var path = require('path');

var run = require('inquirer-test');

var cliPath = path.resolve(__dirname, '..', 'lib', 'promptUser.js');
// console.log(cliPath);

describe('a sample interactive run', function () {
  it('should produce output from the template', function (done) {
    var actions = [
      'name', run.ENTER,
      '/usr/local/lib/node_modules/npm', run.ENTER,
      run.ENTER,  // default main from package
      '3090a', run.ENTER,
      run.ENTER,  // no args
      run.ENTER,  // user
      run.ENTER,  // group
      run.ENTER   // env
    ];

    run(cliPath, actions, 100)
      .then(function (output) {
        var lines = output.split('\n')
        var firstLineOfTemplate = fs.readFileSync(path.join(__dirname, '..', 'lib', 'scriptTemplate.hbs')).toString('utf-8').split('\n')[0];
        var scriptStart = lines.indexOf(firstLineOfTemplate);
        var script = lines.slice(scriptStart).join('\n');
        var known_good_output = script.split('\n').slice(0, 30).join('\n');

        expect(known_good_output).to.equal(`#!/bin/sh

###############

# REDHAT chkconfig header

# chkconfig: - 58 74
# description: node-app is the script for starting a node app on boot.
### BEGIN INIT INFO
# Provides: name
# Required-Start:    $network $remote_fs $local_fs
# Required-Stop:     $network $remote_fs $local_fs
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: start and stop name
# Description: Node process for name
### END INIT INFO

###############

APP_NAME="name"
USER="toor"
GROUP="toor"
NODE_ENV="production"
PORT="3090"
APP_DIR="/usr/local/lib/node_modules/npm"
NODE_APP="/usr/local/lib/node_modules/npm/lib/npm.js"
KWARGS=""
CONFIG_DIR="$APP_DIR"
PID_DIR="$APP_DIR/pid"`);
        done();
      })
      .catch(function (error) {
        throw error;
      });
  }).timeout(0);
});


// run(cliPath, [ENTER])