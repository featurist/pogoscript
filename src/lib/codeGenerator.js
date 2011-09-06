var _ = require('underscore');

var ExpressionPrototype = new function () {
  this.generateJavaScriptBody = function (buffer) {
    buffer.write('return ');
    this.generateJavaScript(buffer);
    buffer.write(';');
  };
};

var expressionTerm = function (name, constructor) {
  constructor.prototype = ExpressionPrototype;
  exports[name] = function () {
    var args = arguments;
    var F = function () {
      return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
  };
};

exports.identifier = function (name) {
  return {
    identifier: name
  };
};

expressionTerm('integer', function (value) {
  this.integer = value;
  this.generateJavaScript = function (buffer) {
    buffer.write(this.value);
  };
});

expressionTerm('float', function (value) {
  this.float = value;
  this.generateJavaScript = function (buffer) {
    buffer.write(this.value);
  };
});

expressionTerm('variable', function (name) {
  this.variable = name;
  this.generateJavaScript = function (buffer) {
    buffer.write(concatName(this.variable));
  };
});

exports.parameter = function (name) {
  return {
    parameter: name,
    generateJavaScript: function (buffer) {
      buffer.write(concatName(this.parameter));
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

expressionTerm('functionCall', function (fun, arguments) {
  this.function = fun;
  this.arguments = arguments;
  this.generateJavaScript = function (buffer) {
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
  };
});

expressionTerm('block', function (parameters, body) {
  this.body = body;
  this.isBlock = true;
  this.parameters = parameters;
  this.generateJavaScript = function (buffer) {
    buffer.write('function(');
    _(this.parameters).each(function (parameter) {
      parameter.generateJavaScript(buffer);
    });
    buffer.write('){');
    body.generateJavaScriptBody(buffer);
    buffer.write('}');
  };
});