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
exports.string = cg.string;
exports.interpolatedString = cg.interpolatedString;
exports.module = cg.module;
exports.interpolation = cg.interpolation;
exports.list = cg.list;
exports.hash = cg.hash;
exports.noArgSuffix = cg.noArgSuffix;
exports.complexExpression = require('./complexExpression');
exports.operatorExpression = require('./operatorExpression');
exports.macros = require('./macros');

exports.lexOperator = function (op) {
  if (/^[:,.#=]$/.test(op)) {
    return op;
  } else if (/^[!?]$/.test(op)) {
    return 'no_arg';
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