var fs = require('fs');
var parser = require('./parser');
var ms = require('./memorystream');
var _ = require('underscore');
var uglify = require('uglify-js');
var errorOutput = require('./errorOutput');

var parseArguments = function(args) {
  return {
    watch: _.contains(args, '--watch'),
    compile: _.contains(args, '--compile'),
    pretty: !_.contains(args, '--notpretty'),
    filenames: _.filter(args, function(arg) {
      return !/^--/.test(arg);
    })
  };
};

var options = parseArguments(process.argv.splice(2));

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

var parse = function(source) {
  return parser.parseModule(source);
};

var printError = function(filename, source, error) {
  error.printError(new SourceFile(filename, source));
  
  process.stderr.write(error.message + '\n');
  process.stderr.write('\nexpected:\n');

  _.each(error.expected, function (ex) {
    if (ex.parserName) {
      process.stderr.write(ex.parserName + '\n');
    } else {
      process.stderr.write(ex + '\n');
    }
  });
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

var time = function(message, f) {
  var before = new Date();
  var result = f();
  var after = new Date();
  //console.log(message, 'in', after - before, 'milliseconds');
  return result;
};

var SourceFile = function(filename, source) {
  this.printIndex = function(index) {
    var lineDetails = errorOutput.sourceIndexToLineAndColumn(source, index);
    process.stderr.write(filename + ':' + lineDetails.lineNumber + '\n');
    process.stderr.write(lineDetails.line + '\n');
    process.stderr.write(duplicateString(' ', lineDetails.columnNumber - 1) + '^\n');
  };
};

var compile = function (filename) {
  var js = generateCode(filename);
  fs.writeFileSync(jungleFilenameOf(filename), js);
};

var generateCode = function(filename) {
  var source = fs.readFileSync(filename, 'utf-8');
  try {
    var result = time('parsed', function () {return parse(source)});
    if (result.isError) {
      printError(filename, source, result);
    } else {
      var generated = time('generated', function() {return generate(result)});

      if (options.pretty) {
        generated = time('beautified', function() {return beautify(generated)});
      }
      // var output = generate(result);
  
      // process.stdout.write(output);
      return generated;
    }
  } catch (e) {
    console.log('error!');
    if (e.printError) {
      console.log('uncanny error!');
      e.printError(new SourceFile(filename, source));
    } else {
      console.log('std error!', e);
      console.log(e.stack);
    }
  }
};

require.extensions['.jungle'] = function (module, filename) {
  var content = generateCode (filename);
  module._compile(content, filename)
}

var run = function (filename) {
  var js = generateCode(filename);
  module.filename = fs.realpathSync(filename);
  process.argv[1] = module.filename;
  module._compile(js, filename);
};

for (var f in options.filenames) {
  var filename = options.filenames[f];
  
  if (options.compile) {
    compile(filename);
  
    if (options.watch) {
      fs.watchFile(filename, function (curr, prev) {
        if (curr.mtime > prev.mtime) {
          compile(filename);
        }
      });
    }
  } else {
    run(filename);
  }
}
