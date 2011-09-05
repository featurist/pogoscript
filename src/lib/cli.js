var fs = require('fs');
var parser = require('./parser');

var filename = process.argv[2];

fs.readFile(filename, 'utf-8', function (err, contents) {
  if (!err) {
    console.log(contents);
    var term = parser.parse(parser.expression, contents);
    console.log(term);
  } else {
    console.log(err.message);
  }
});