var fs = require('fs');
var path = require('path');
var Handlebars = require('handlebars');

var scriptTemplateLocation = path.join(__dirname, 'scriptTemplate.hbs');
var scriptTemplate = fs.readFileSync(scriptTemplateLocation).toString('utf-8');

var template = Handlebars.compile(scriptTemplate);

module.exports = template;
