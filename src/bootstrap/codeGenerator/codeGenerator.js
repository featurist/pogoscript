var cg = require('../../lib/codeGenerator');

exports.basicExpression = require('./basicExpression');
exports.variable = cg.variable;
exports.selfExpression = cg.selfExpression;
exports.statements = cg.statements;
exports.block = cg.block;
exports.parameter = cg.parameter;
exports.identifier = cg.identifier;
exports.integer = cg.integer;
exports.float = cg.float;
exports.normaliseString = cg.normaliseString;
exports.unindent = cg.unindent;
exports.normaliseInterpolatedString = cg.normaliseInterpolatedString;
exports.string = cg.string;
exports.interpolatedString = cg.interpolatedString;
exports.normaliseRegExp = cg.normaliseRegExp;
exports.regExp = cg.regExp;
exports.parseRegExp = cg.parseRegExp;
exports.module = cg.module;
exports.interpolation = cg.interpolation;
exports.list = cg.list;
exports.subExpression = cg.subExpression;
exports.fieldReference = cg.fieldReference;
exports.hash = cg.hash;
exports.noArgSuffix = cg.noArgSuffix;
exports.complexExpression = require('./complexExpression');
exports.operatorExpression = require('./operatorExpression');
exports.newUnaryOperatorExpression = require('./unaryOperatorExpression').newUnaryOperatorExpression;
exports.operator = cg.operator;
exports.splat = cg.splat;
exports.macros = require('./macros');

exports.expression = function (e) {
  return new function () {
    this.expression = function () {
      return e;
    };
  };
};

exports.lexOperator = function (op) {
  if (/^(=>|\.\.\.|@:|[#@:!?,.=;])$/.test(op)) {
    return op;
  } else {
    return 'operator';
  }
};

exports.loc = function (term, location) {
  var loc = {
    firstLine: location.first_line,
    lastLine: location.last_line,
    firstColumn: location.first_column,
    lastColumn: location.last_column
  };

  term.location = function () {
    return loc;
  };
  
  return term;
};

exports.stringBrackets = 0;
