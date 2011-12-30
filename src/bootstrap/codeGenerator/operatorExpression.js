var cg = require('../../lib/codeGenerator');
var _ = require('underscore');
var macros = require('./macros');

module.exports = function (complexExpression) {
  return new function () {
    this.arguments = [complexExpression];
    this.name = [];
    
    this.addOperatorExpression = function (operator, expression) {
      this.name.push(operator);
      this.arguments.push(expression);
    };
    
    this.expression = function () {
      if (this.arguments.length > 1) {
        var argumentExpressions = _(this.arguments).map(function (arg) {
          return arg.expression();
        });
        
        var macro = macros.findMacro(this.name);
        
        if (macro) {
          return macro(this.name, argumentExpressions);
        } else {
          return cg.methodCall(argumentExpressions[0], this.name, argumentExpressions.slice(1));
        }
      } else {
        return this.arguments[0].expression();
      }
    };
    
    this.definition = function (source) {
      if (this.arguments.length > 1) {
        var object = this.arguments[0].expression();
        var parms = _(this.arguments.slice(1)).map(function (arg) {
          return arg.expression().parameter();
        });
        
        return cg.definition(cg.fieldReference(object, this.name), source.blockify(parms));
      } else {
        return this.arguments[0].definition(source);
      }
    }
  };
};