var _ = require('underscore');

exports.writeToBufferWithDelimiter = function (array, delimiter, buffer, scope) {
  var writer;
  if (typeof scope === 'function') {
    writer = scope;
  } else {
    writer = function (item) {
      item.generateJavaScript(buffer, scope);
    };
  }
  
  var first = true;
  _(array).each(function (item) {
    if (!first) {
      buffer.write(delimiter);
    }
    first = false;
    writer(item);
  });
};

var actualCharacters = [
  [/\\/g, '\\\\'],
  [new RegExp('\b', 'g'), '\\b'],
  [/\f/g, '\\f'],
  [/\n/g, '\\n'],
  [/\0/g, '\\0'],
  [/\r/g, '\\r'],
  [/\t/g, '\\t'],
  [/\v/g, '\\v'],
  [/'/g, "\\'"],
  [/"/g, '\\"']
];

exports.formatJavaScriptString = function(s) {
  for (var i = 0; i < actualCharacters.length; i++) {
    var mapping = actualCharacters[i];
    s = s.replace(mapping[0], mapping[1]);
  }
  
  return "'" + s + "'";
};

exports.concatName = function (nameSegments, options) {
  var name = '';
  
  for (var n = 0; n < nameSegments.length; n++) {
    var segment = nameSegments[n];
    name += nameSegmentRenderedInJavaScript(segment, n === 0);
  }

  if (options && options.hasOwnProperty('escape') && options.escape)
    return escapeReservedWord(name);
  else
    return name;
};

var nameSegmentRenderedInJavaScript = function (nameSegment, isFirst) {
  if (/[_$a-zA-Z0-9]+/.test(nameSegment)) {
    if (isFirst) {
      return nameSegment;
    } else {
      return capitalise(nameSegment);
    }
  } else {
    return operatorRenderedInJavaScript(nameSegment);
  }
};

var operatorRenderedInJavaScript = function (operator) {
  var javaScriptName = '';
  for (var n = 0; n < operator.length; n++) {
    javaScriptName += '$' + operator.charCodeAt(n).toString(16);
  }
  return javaScriptName;
};

var capitalise = function (s) {
  return s[0].toUpperCase() + s.substring(1);
};

var reservedWords = {
  'class': true,
  'function': true
};

var escapeReservedWord = function (word) {
  if (reservedWords.hasOwnProperty(word)) {
    return '$' + word;
  } else {
    return word;
  }
};

exports.splattedArguments = function (cg, args, optionalArgs) {
  var splatArgs = [];
  var previousArgs = [];
  var foundSplat = false;
  
  for (var i = 0; i < args.length; i++) {
    var current = args[i];
    var next = args[i+1];
    if (next && next.isSplat) {
      foundSplat = true;
      if (previousArgs.length > 0) {
        splatArgs.push(cg.list(previousArgs));
        previousArgs = [];
      }
      splatArgs.push(current);
      i++;
    } else if (current.isSplat) {
      cg.errors.addTermWithMessage(current, 'splat keyword with no argument to splat');
    } else {
      previousArgs.push(current);
    }
  }
  
  if (optionalArgs && optionalArgs.length > 0) {
    previousArgs.push(cg.hash(optionalArgs));
  }
  
  if (previousArgs.length > 0) {
    splatArgs.push(cg.list(previousArgs));
  }
  
  if (foundSplat) {
    return cg.oldTerm(function () {
      this.generateJavaScript = function (buffer, scope) {
        for (var i = 0; i < splatArgs.length; i++) {
          var splattedArgument = splatArgs[i];

          if (i === 0) {
            splattedArgument.generateJavaScript(buffer, scope);
          } else {
            buffer.write('.concat(');
            splattedArgument.generateJavaScript(buffer, scope);
            buffer.write(')');
          }
        }
      }
    });
  }
};

exports.argsAndOptionalArgs = function (cg, args, optionalArgs) {
  var a = args.slice();

  if (optionalArgs && optionalArgs.length > 0) {
    a.push(cg.hash(optionalArgs));
  }

  return a;
};

