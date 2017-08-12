var path = require('path');

var run = require('inquirer-test');

var cliPath = path.resolve(__dirname, '..', 'bin', 'creator.js');
console.log(cliPath);

describe.only('a sample interactive run', function () {
  it('should produce output from the template', function (done) {
    var actions = [
      'name', run.ENTER,
      '/resources/lomvardas/node-init-script', run.ENTER,
      run.ENTER,  // default main from package
      '3090a', run.ENTER,
      run.ENTER,  // no args
      run.ENTER,  // user
      run.ENTER,  // group
      run.ENTER   // env
    ];

    run(cliPath, actions).then(function (output) {
      console.log(output);
      done();
    });
  }).timeout(0);
});


// run(cliPath, [ENTER])