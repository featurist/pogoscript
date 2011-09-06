var _ = require('underscore');

exports.identifier = function (name) {
  return {
    identifier: name
  };
};

exports.integer = function (value) {
  return {
    integer: value,
    generateJavaScript: function (buffer) {
      buffer.write(this.value);
    }
  };
};

exports.float = function (value) {
  return {
    float: value,
    generateJavaScript: function (buffer) {
      buffer.write(this.value);
    }
  };
};

exports.variable = function (name) {
  return {
    variable: name,
    generateJavaScript: function (buffer) {
      buffer.write(concatName(this.variable));
    }
  };
};

var concatName = function (nameSegments) {
  var name = nameSegments[0];
  
  for (var n = 1; n < nameSegments.length; n++) {
    var segment = nameSegments[n];
    name += segment[0].toUpperCase() + segment.substring(1);
  }
  
  return name;
};

exports.functionCall = function (fun, arguments) {
  return {
    termName: 'functionCall',
    function: fun,
    arguments: arguments,
    generateJavaScript: function (buffer) {
      fun.generateJavaScript(buffer);
      buffer.write('(');
      var first = true;
      _(this.arguments).each(function (arg) {
        if (!first) {
          buffer.write(',');
        }
        first = false;
        arg.generateJavaScript(buffer);
      });
      
      buffer.write(')');
    }
  };
};