var _ = require('underscore');

var ExpressionPrototype = new function () {
  this.generateJavaScriptBody = function (buffer) {
    buffer.write('return ');
    this.generateJavaScript(buffer);
    buffer.write(';');
  };
  this.generateJavaScriptStatement = function (buffer) {
    return this.generateJavaScript(buffer);
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
    buffer.write(this.integer.toString());
  };
});

expressionTerm('float', function (value) {
  this.float = value;
  this.generateJavaScript = function (buffer) {
    buffer.write(this.float.toString());
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
    var first = true;
    _(this.parameters).each(function (parameter) {
      if (!first) {
        buffer.write(',');
      }
      first = false;
      parameter.generateJavaScript(buffer);
    });
    buffer.write('){');
    body.generateJavaScriptBody(buffer);
    buffer.write('}');
  };
});

var generateJavaScriptWithDelimiter = function (array, delimiter, buffer) {
  var first = true;
  _(array).each(function (item) {
    if (!first) {
      buffer.write(delimiter);
    }
    first = false;
    item.generateJavaScript(buffer);
  });
};

expressionTerm('methodCall', function (object, name, arguments) {
  this.object = object;
  this.name = name;
  this.arguments = arguments;
  this.generateJavaScript = function (buffer) {
    this.object.generateJavaScript(buffer);
    buffer.write('.');
    buffer.write(concatName(this.name));
    buffer.write('(');
    generateJavaScriptWithDelimiter(this.arguments, ',', buffer);
    buffer.write(')');
  };
});

var Statements = function (statements) {
  this.statements = statements;
  
  var generateStatements = function (statements, buffer) {
    _(statements).each(function (statement) {
      statement.generateJavaScriptStatement(buffer);
      buffer.write(';');
    });
  };
  
  this.generateJavaScript = function (buffer) {
    generateStatements(this.statements, buffer);
  };
  this.generateJavaScriptBody = function (buffer) {
    generateStatements(this.statements.splice(0, this.statements.length - 1), buffer);
    this.statements[this.statements.length - 1].generateJavaScriptBody(buffer);
  };
};

exports.statements = function (s) {
  return new Statements(s);
};

expressionTerm('definition', function (target, source) {
  this.target = target;
  this.source = source;
  this.generateJavaScript = function (buffer) {
    target.generateJavaScript(buffer);
    buffer.write('=');
    source.generateJavaScript(buffer);
  };
  this.generateJavaScriptStatement = function (buffer) {
    buffer.write('var ');
    target.generateJavaScript(buffer);
    buffer.write('=');
    source.generateJavaScript(buffer);
  };
});