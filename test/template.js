var expect = require('chai').expect;

describe('sample template usage', function () {
  it('should render data into template', function (done) {
    var template = require('../lib/template');
    var data = {
      app: {
        name: 'monod',
        scriptName: 'index.js',
        launchArgs: '',
        port: 3001,
        dir: '/tmp/dir'
      },
      user: 'toor',
      group: 'toor',
      nodeEnv: 'production'
    }

    var result = template(data);
    var firstThirtyLines = result.split('\n').slice(0, 30).join('\n');

    // console.log(firstThirtyLines);
    expect(firstThirtyLines).to.equal(`#!/bin/sh

###############

# REDHAT chkconfig header

# chkconfig: - 58 74
# description: node-app is the script for starting a node app on boot.
### BEGIN INIT INFO
# Provides: monod
# Required-Start:    $network $remote_fs $local_fs
# Required-Stop:     $network $remote_fs $local_fs
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: start and stop monod
# Description: Node process for monod
### END INIT INFO

###############

APP_NAME="monod"
USER="toor"
GROUP="toor"
NODE_ENV="production"
PORT="3001"
APP_DIR="/tmp/dir"
NODE_APP="index.js"
KWARGS=""
CONFIG_DIR="$APP_DIR"
PID_DIR="$APP_DIR/pid"`);
    done();
  });
});
