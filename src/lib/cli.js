var fs = require('fs');
var parser = require('./parser');
var ms = require('./memorystream');
var _ = require('underscore');
var uglify = require('uglify-js');
var errorOutput = require('./errorOutput');

var filename = process.argv[2];
var filenames = process.argv.splice(2);

var options = {
  watch: _.contains(process.argv, '--watch')
};

var beautify = function(code) {
  var ast = uglify.parser.parse(code);
  return uglify.uglify.gen_code(ast, {beautify: true});
};

var jungleFilenameOf = function (filename) {
  return filename.replace(/\.jungle$/, '.js');
};

var generate = function(term) {
  var stream = new ms.MemoryStream();
  term.generateJavaScript(stream);
  return stream.toString();
};

var parse = function(source, callback) {
  parser.parseModule(source, {
    success: function (term) {
      callback(undefined, term);
    },
    failure: function (error) {
      callback(error);
    }
  });
};

var printError = function(filename, source, error) {
  process.stderr.write(error.message + '\n');
  process.stderr.write('\n');
  var lineDetails = errorOutput.sourceIndexToLineAndColumn(source, error.index);
  process.stderr.write(filename + ':' + lineDetails.lineNumber + '\n');
  process.stderr.write(lineDetails.line + '\n');
  process.stderr.write(duplicateString(' ', lineDetails.columnNumber - 1) + '^\n');
};

var duplicateString = function(s, n) {
  var strings = [];
  for (var i = 0; i < n; i++) {
    strings.push(s);
  }
  return strings.join('');
};

var compile = function (filename) {
  fs.readFile(filename, 'utf-8', function (err, source) {
    console.log('compiling', filename);
    if (!err) {
      parse(source, function (error, term) {
        if (error) {
          printError(filename, source, error);
        } else {
          var output = beautify(generate(term));
          // process.stdout.write(output);
          fs.writeFile(jungleFilenameOf(filename), output);
        }
      });
    } else {
      console.log(err.message);
    }
  });
};

for (var f in filenames) {
  var filename = filenames[f];
  compile(filename);
  
  if (options.watch) {
    fs.watchFile(filename, function (curr, prev) {
      if (curr.mtime > prev.mtime) {
        compile(filename);
      }
    });
  }
}
