#!/usr/bin/env node
var fs = require('fs');
var path = require('path');

var inquirer = require('inquirer');
var stripIndent = require('strip-indent');

var template = require('../lib/template');
var promptUser = require('../lib/promptUser');

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

function promptConfirm(message, callback) {
  inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: message,
    default: true
  }])
    .then((answer) => { callback(null, answer.confirm); })
    .catch((error) => { callback(error); });
}

var outputOptions = ['Standard Error', 'Temporary File'];
function promptSelectOutput(name, callback) {
  outputOptions.push(('/etc/init.d/' + name));

  inquirer.prompt([{
    type: 'list',
    name: 'output',
    message: 'What to do with final output?',
    choices: outputOptions
  }])
    .then((answer) => { callback(null, answer.output); })
    .catch((error) => { callback(error); });
}

function writeToStdErrSyncAndExit(result) {
  // console.log("result", result);
  process.stderr.write(result);
  console.log('File written to standard error stream.');
  process.exit(0);
}

var tmp = require('tmp');
function writeToTmpFilePrintCommandsAndExit(result, name) {
  var tmpobj = tmp.fileSync({ keep: true, mode: 0o755 });
  fs.writeSync(tmpobj.fd, result);
  var msg = `
    File written:   ${tmpobj.name}

    # Copy this file to init.d to enable it: (double click to select whole line)

    sudo cp "${tmpobj.name}" "/etc/init.d/${name}"

    # Then update systemd to recognize a startup service:

    sudo update-rc.d ${name} defaults
  `;
  console.log(stripIndent(msg));
  process.exit(0);
}

function writeToInitdPrintCommandAndExit(result, name) {
  fs.writeFileSync(`/etc/init.d/${name}`, result, { mode: 0o755 });

  var msg = `
    File Written: /etc/init.d/${name}

    Update systemd to recognize a startup service:

    sudo update-rc.d ${name} defaults
  `;
  console.log(msg);
  process.exit(0);
}

/**
 * Organized thusly to be maximally self-explanatory and manually testable.
 */
function creator() {
  return promptUser(function (err, locals) {
    if (err) throw err;

    var result = template(locals);
    console.log(result.split('\n').slice(0, 37).join('\n'));

    return promptConfirm('Looks good?', function (err, confirmed) {
      if (err) throw err;

      if (confirmed)
        return promptSelectOutput(locals.app.name, function (err, output) {
          if (err) throw err;
          
          if (output === 'Standard Error') {
            return writeToStdErrSyncAndExit(result);
          }

          else if (output === 'Temporary File') {
            return writeToTmpFilePrintCommandsAndExit(result, locals.app.name);
          }

          else if (output.indexOf('/etc/init.d/') > -1) {
            if (exists(output)) {
              console.log('');
              console.log('*** File already Exists, creating tmp file. ***');
              console.log('');
              return writeToTmpFilePrintCommandsAndExit(result, locals.app.name);
            }

            if (process.getuid() !== 0) {
              console.log('');
              console.log('*** Need to be sudo to write to /etc/init.d/, creating tmp file. ***');
              console.log('');
              return writeToTmpFilePrintCommandsAndExit(result, locals.app.name);
            }

            else {
              return writeToInitdPrintCommandAndExit(result, locals.app.name);
            }
          }
        });

      // not confirmed
      else {
        return promptConfirm('SysV script already exists, try again?', function (err, confirmed) {
          if (confirmed) { process.nextTick(() => creator() ); }
          else { console.log('Bye!'); process.exit(1); }
        });
      }
    });
  });
}

if (require.main === module) {
  creator();
}
