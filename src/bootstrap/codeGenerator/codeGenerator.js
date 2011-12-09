var cg = require('../../lib/codeGenerator');

exports.basicExpression = require('./basicExpression');
exports.variable = cg.variable;
exports.statements = cg.statements;
exports.block = cg.block;
exports.parameter = cg.parameter;
exports.identifier = cg.identifier;
exports.integer = cg.integer;
exports.string = cg.string;
exports.complexExpression = require('./complexExpression');