#!/usr/bin/env node
var fs = require('fs');
var path = require('path');

var inquirer = require('inquirer');

var valid = require('../lib/valid');

function exists(path) {
  try {
    fs.statSync(path);
  } catch (err) {
    if (err && err.code === 'ENOENT') return false;
    throw err;
  }

  return true;
}

function requirable(module) {
  try { require.resolve(module); return true; }
  catch (e) { return false; }
}

var templateLocals = {
  app: {
    name       : null,
    dir        : null,
    scriptName : null,
    port       : null,
    launchArgs : null
  },
  user: null,
  group: null,
  nodeEnv: null
}

inquirer.prompt([{
  type       : 'input',
  name       : 'appName',
  message    : 'Enter App Name',
  validate   : (i) => (valid(i) || 'Please use only alphanumeric, -, and _')
},
{
  type       : 'input',
  name       : 'appDir',
  message    : 'Enter the app\'s directory',
  validate   : (i) => (exists(i) || 'File Not Found')
}])
  .then(function (answers) {
    // console.log(answers);
    templateLocals['app']['name'] = answers.appName;
    templateLocals['app']['dir'] = answers.appDir;

    function getMainFromPackage(dir) {
      try {
        var package = require(path.join(dir, 'package'));
        return package.main;
      } catch (notFoundError) {
        return null;
      }
    }

    return inquirer.prompt([{
      type     : 'input',
      name     : 'appScriptName',
      message  : 'Enter App Main file',
      default  : getMainFromPackage(answers.appDir),
      validate : function validateAppScript(scriptName) {
        // FIXME json fileext is also requirable.
        // console.log(path.join(answers.appDir, scriptName))
        // console.log(requirable(path.join(answers.appDir, scriptName)))

        var location = path.join(answers.appDir, scriptName);
        return requirable(location) || 'Unable to \'require\' that file';
      }
    },
    {
      type     : 'input',
      name     : 'appPort',
      message  : 'Port of server (PORT environment variable)',
      validate : function integerPort(port) {
        // console.log('port', port)
        if (isNaN(parseInt(port, 10))) return 'Port must be a number';
        if (parseInt(port, 10) < 1024) return 'Priveledged ports unsupported';
        if (parseInt(port, 10) > 65535) return 'TCP Ports don\'t go that high';
        return true;
      }
    },
    {
      type     : 'input',
      name     : 'appLaunchArgs',
      message  : 'Command line arguments to start the app with',
      default  : ''
    },
    {
      type     : 'input',
      name     : 'user',
      message  : 'User to start the app as',
      default  : process.env['USER']
      // TODO integrate with https://www.npmjs.com/package/linux-user
    },
    {
      type     : 'input',
      name     : 'group',
      message  : 'Group to start the app as',
      default  : process.env['USER']
      // TODO integrate with https://www.npmjs.com/package/linux-user
    },
    {
      type     : 'input',
      name     : 'nodeEnv',
      message  : 'NODE_ENV environment variable provided to app',
      default  : 'production'
    }]);
  })
  .then(function (answers) {
    // console.log(answers);
    templateLocals['app']['scriptName'] = answers.appScriptName;
    templateLocals['app']['port'] = parseInt(answers.appPort, 10);
    templateLocals['app']['launchArgs'] = answers.appLaunchArgs;
    templateLocals['user'] = answers.user;
    templateLocals['group'] = answers.group;
    templateLocals['nodeEnv'] = answers.nodeEnv;

    console.log('templateLocals', templateLocals);
  })
  .catch(function (error) {
    console.log('oh noes');
    throw error;
  });
