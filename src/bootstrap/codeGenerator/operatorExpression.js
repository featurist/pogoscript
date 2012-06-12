var _ = require('underscore');

module.exports = function (complexExpression) {
  var cg = this;
  return cg.oldTerm(function () {
    this.arguments = [complexExpression];
    this.name = [];

    this.subterms('arguments');
    
    this.addOperatorExpression = function (operator, expression) {
      this.name.push(operator);
      this.arguments.push(expression);
    };
    
    this.expression = function () {
      if (this.arguments.length > 1) {
        var argumentExpressions = _(this.arguments).map(function (arg) {
          return arg.expression();
        });
        
        var macro = cg.macros.findMacro(this.name);
        
        if (macro) {
          return macro(this.name, argumentExpressions);
        } else {
          return cg.methodCall(argumentExpressions[0], this.name, argumentExpressions.slice(1));
        }
      } else {
        return this.arguments[0].expression();
      }
    };
    
    this.hashEntry = function () {
      if (this.arguments.length === 1) {
        return this.arguments[0].hashEntry();
      } else {
        return cg.errors.addTermWithMessage(this, 'cannot be used as a hash entry');
      }
    };
    
    this.definition = function (source) {
      if (this.arguments.length > 1) {
        var object = this.arguments[0].expression();
        var parms = _(this.arguments.slice(1)).map(function (arg) {
          return arg.expression().parameter();
        });
        
        return cg.definition(cg.fieldReference(object, this.name), source.blockify(parms, []));
      } else {
        return this.arguments[0].definition(source);
      }
    }
  });
};
