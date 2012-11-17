var _ = require('underscore');
var errors = require('./errors.js');
var codegenUtils = require('../../../lib/codegenUtils');

exports.macros = function (cg) {
  var macros = cg.macroDirectory();

  var createOperator = function(term, name, args) {
    return cg.operator(name[0], args);
  };

  var javaScriptOperators = [
    '/',
    '-',
    '>=',
    '!=',
    '<=',
    '<',
    '>',
    '|',
    '&',
    '||',
    '&&',
    '!',
    '~',
    '--',
    '++',
    '%',
    '>>',
    '>>>',
    '<<',
    '^'
  ];

  _.each(javaScriptOperators, function(op) {
    macros.addMacro([op], createOperator);
  });

  macros.addMacro(['=='], function (term, name, args) {
    return cg.operator('===', args);
  });

  macros.addMacro(['!='], function (term, name, args) {
    return cg.operator('!==', args);
  });

  macros.addMacro(['in'], function (term, name, args) {
    return cg.operator('in', args);
  });

  var constructorType = function (constructor) {
    if (constructor.isVariable && constructor.variable.length == 1) {
      var constructorName = constructor.variable[0];

      switch (constructorName) {
        case "String":
          return "string";
        case "Number":
          return "number";
        case "Boolean":
          return "boolean";
      }
    }
  };

  macros.addMacro(['::'], function (term, name, args) {
    var type = constructorType(args[1]);

    if (type) {
      return cg.typeof (args[0], type);
    } else {
      return cg.operator('instanceof', args);
    }
  });

  var matchMultiOperator = function (name) {
    var firstOp = name[0];

    for (var n = 1; n < name.length; n++) {
      if (name[n] != firstOp) {
        return;
      }
    }

    return function (term, name, args) {
      return cg.operator(name[0], args);
    };
  };

  _.each(['+', '*'], function(op) {
    macros.addWildCardMacro([op], matchMultiOperator);
  });

  var createIfExpression = function(term, name, args) {
    var cases = [];

    for (var n = 0; n + 1 < args.length; n += 2) {
      var body = args[n + 1].body;
      cases.push({condition: args[n], body: body});
    }

    var elseBody;

    if (args.length % 2 === 1) {
      var body = args[args.length - 1].body;
      elseBody = body;
    }

    return cg.ifExpression(cases, elseBody);
  };

  var matchIfMacro = function (name) {
    if (/^if(ElseIf)*(Else)?$/.test(codegenUtils.concatName(name))) {
      return createIfExpression;
    }
  };

  macros.addWildCardMacro(['if'], matchIfMacro);

  macros.addMacro(['new'], function(term, name, args) {
    var constructor;

    if (args[0].isSubExpression) {
      constructor = args[0].statements[0];
    } else {
      constructor = args[0];
    }

    return cg.newOperator(constructor);
  });

  var areValidArguments = function () {
    var args = arguments[0];
    var argValidators = Array.prototype.slice.call(arguments, 1);

    if (args.length !== argValidators.length) {
      return false;
    } else {
      return true;
    }
  };

  var createForEach = function (term, name, args) {
    if (areValidArguments(args, 1, 1)) {
      var collection = args[0];
      var block = args[1];
      var body = block.body;

      var itemVariable = block.parameters[0];

      return cg.forEach(collection, itemVariable, block.body);
    } else {
      return cg.errors.addTermWithMessage();
    }
  };

  macros.addMacro(['for', 'each', 'in'], createForEach);

  macros.addMacro(['for', 'in'], function (term, name, args) {
    var collection = args[0];
    var block = args[1];
    var iterator = block.parameters[0];
    var body = block.body;

    return cg.forIn(iterator, collection, block.body);
  });

  macros.addMacro(['for'], function(term, name, args) {
    var init = args[0];
    var test = args[1];
    var incr = args[2];

    if (!init)
      return errors.addTermWithMessage(args[0], 'expected init, as in (n = 0. ...)');

    if (!test)
      return errors.addTermWithMessage(args[0], 'expected test, as in (... . n < 10. ...)');

    if (!incr)
      return errors.addTermWithMessage(args[0], 'expected incr, as in (... . ... . n = n + 1)');

    return cg.forStatement(init, test, incr, args[3].body);
  });

  macros.addMacro(['while'], function(term, name, args) {
    var test;
    if (args[0].isSubExpression) {
      test = args[0].statements[0];
    } else if (args[0].isBlock) {
      test = args[0].body.statements[0];
    } else {
      test = args[0];
    }
    var statements = args[1].body;

    return cg.whileStatement(test, statements);
  });
  
  macros.addMacro(['with'], function(term, name, args) {
    return cg.withStatement(args[0], args[1].body);
  });

  macros.addMacro(['and'], function (term, name, args) {
    return cg.operator('&&', args);
  });

  macros.addMacro(['or'], function (term, name, args) {
    return cg.operator('||', args);
  });

  macros.addMacro(['not'], function (term, name, args) {
    return cg.operator('!', args);
  });

  macros.addMacro(['return'], function(term, name, args) {
    return cg.returnStatement(args && args[0]);
  });

  macros.addMacro(['throw'], function(term, name, args) {
    return cg.throwStatement(args[0]);
  });

  macros.addMacro(['break'], function(term, name, args) {
    return cg.breakStatement();
  });

  macros.addMacro(['continue'], function(term, name, args) {
    return cg.continueStatement();
  });

  macros.addMacro(['try', 'catch'], function (term, name, args) {
    var body = args[0].body;
    var catchParameter = args[1];
    var catchBody = args[2].body;

    return cg.tryExpression(body, {catchBody: catchBody, catchParameter: catchParameter});
  });

  macros.addMacro(['try', 'catch', 'finally'], function (term, name, args) {
    var body = args[0].body;
    var catchParameter = args[1];
    var catchBody = args[2].body;
    var finallyBody = args[3].body;

    return cg.tryExpression(body, {catchBody: catchBody, catchParameter: catchParameter, finallyBody: finallyBody});
  });

  macros.addMacro(['try', 'finally'], function (term, name, args) {
    var body = args[0].body;
    var finallyBody = args[1].body;

    return cg.tryExpression(body, {finallyBody: finallyBody});
  });

  macros.addMacro(['nil'], function (term) {
    return cg.nil();
  });
  
  return macros;
};
