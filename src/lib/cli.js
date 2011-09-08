var fs = require('fs');
var parser = require('./parser');

var filename = process.argv[2];
var filenames = process.argv.splice(2);

for (var f in filenames) {
  var filename = filenames[f];
  fs.watchFile(filename, function () {
    fs.readFile(filename, 'utf-8', function (err, contents) {
      if (!err) {
        var term = parser.parse(parser.module, contents);
        var jsFilename = filename.replace(/\.jungle$/, '.js');
        var stream = fs.createWriteStream(jsFilename);
        stream.on('open', function (fd) {
          term.generateJavaScript(stream);
          stream.write('\n');
        });
      } else {
        console.log(err.message);
      }
    });
  });
}
