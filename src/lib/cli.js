var fs = require('fs');
var parser = require('./parser');

var filename = process.argv[2];

fs.readFile(filename, 'utf-8', function (err, contents) {
  if (!err) {
    var term = parser.parse(parser.module, contents);
    term.generateJavaScript(process.stdout);
    process.stdout.write('\n');
  } else {
    console.log(err.message);
  }
});