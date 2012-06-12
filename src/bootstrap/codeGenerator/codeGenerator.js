var cg = require('../../../lib/codeGenerator');

exports.codeGenerator = function () {
  codegen = {};

  terms = require('../../../lib/terms')
  term = terms(codegen);

  var importTerm = function (name) {
    codegen[name] = require('../../../lib/' + name)(codegen);
  };
  
  codegen.termClass = term.term;
  codegen.term = terms.term;
  codegen.termPrototype = term.termPrototype;
  codegen.basicExpression = require('./basicExpression');
  codegen.variable = cg.variable;
  codegen.selfExpression = cg.selfExpression;
  importTerm('statements');
  importTerm('closure');
  codegen.block = codegen.closure;
  codegen.parameters = cg.parameters;
  importTerm('identifier');
  importTerm('integer');
  importTerm('float');
  codegen.normaliseString = cg.normaliseString;
  codegen.unindent = cg.unindent;
  codegen.normaliseInterpolatedString = cg.normaliseInterpolatedString;
  codegen.string = cg.string;
  codegen.interpolatedString = cg.interpolatedString;
  codegen.normaliseRegExp = cg.normaliseRegExp;
  codegen.regExp = cg.regExp;
  codegen.parseRegExp = cg.parseRegExp;
  codegen.module = cg.module;
  codegen.interpolation = cg.interpolation;
  codegen.list = cg.list;
  codegen.normaliseArguments = cg.normaliseArguments;
  codegen.argumentList = cg.argumentList;
  codegen.subExpression = cg.subExpression;
  codegen.fieldReference = cg.fieldReference;
  codegen.hash = cg.hash;
  codegen.asyncArgument = cg.asyncArgument;
  codegen.complexExpression = require('./complexExpression');
  codegen.operatorExpression = require('./operatorExpression');
  codegen.newUnaryOperatorExpression = require('./unaryOperatorExpression').newUnaryOperatorExpression;
  codegen.operator = cg.operator;
  codegen.splat = cg.splat;
  codegen.javascript = cg.javascript;
  codegen.hashEntry = cg.hashEntry;
  codegen.concatName = cg.concatName;
  codegen.parseSplatParameters = cg.parseSplatParameters;
  codegen.collapse = cg.collapse;
  codegen.definition = cg.definition;
  codegen.functionCall = cg.functionCall;
  codegen.scope = cg.scope;
  codegen.Scope = cg.Scope;
  codegen.createMacroDirectory = require('./macroDirectory').createMacroDirectory;
  importTerm('boolean');
  codegen.typeof = require('../../../lib/typeof').typeof;
  codegen.tryStatement = cg.tryStatement;
  importTerm('ifExpression');
  codegen.nil = cg.nil;
  codegen.continueStatement = cg.continueStatement;
  codegen.breakStatement = cg.breakStatement;
  codegen.throwStatement = cg.throwStatement;
  codegen.returnStatement = cg.returnStatement;
  codegen.methodCall = cg.methodCall;
  codegen.indexer = cg.indexer;
  codegen.whileStatement = cg.whileStatement;
  codegen.forStatement = cg.forStatement;
  codegen.forIn = cg.forIn;
  codegen.forEach = cg.forEach;
  codegen.newOperator = cg.newOperator;
  codegen.loc = loc;
  codegen.generatedVariable = cg.generatedVariable;
  codegen.optional = cg.optional;
  codegen.postIncrement = cg.postIncrement;
  codegen.oldTerm = cg.oldTerm;
  codegen.errors = require('./errors').errors(codegen);
  codegen.macros = require('./macros').macros(codegen);
  codegen.thisiscodegen = true;
  
  return codegen;
};

var loc = function (term, location) {
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
