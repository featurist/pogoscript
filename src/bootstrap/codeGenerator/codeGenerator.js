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
  importTerm('variable');
  importTerm('selfExpression');
  importTerm('statements');
  importTerm('closure');
  codegen.block = codegen.closure;
  importTerm('parameters');
  importTerm('identifier');
  importTerm('integer');
  importTerm('float');
  codegen.normaliseString = cg.normaliseString;
  codegen.unindent = cg.unindent;
  codegen.normaliseInterpolatedString = cg.normaliseInterpolatedString;
  importTerm('string');
  importTerm('interpolatedString');
  codegen.normaliseRegExp = cg.normaliseRegExp;
  importTerm('regExp');
  codegen.parseRegExp = cg.parseRegExp;
  importTerm('module');
  codegen.interpolation = cg.interpolation;
  importTerm('list');
  codegen.normaliseArguments = cg.normaliseArguments;
  codegen.argumentList = cg.argumentList;
  codegen.subExpression = cg.subExpression;
  importTerm('fieldReference');
  importTerm('hash');
  importTerm('asyncArgument');
  codegen.complexExpression = require('./complexExpression');
  codegen.operatorExpression = require('./operatorExpression');
  codegen.newUnaryOperatorExpression = require('./unaryOperatorExpression').newUnaryOperatorExpression;
  codegen.operator = cg.operator;
  codegen.splat = cg.splat;
  importTerm('javascript');
  importTerm('hashEntry');
  codegen.concatName = cg.concatName;
  codegen.parseSplatParameters = cg.parseSplatParameters;
  codegen.collapse = cg.collapse;
  importTerm('definition');
  importTerm('functionCall');
  codegen.scope = cg.scope;
  codegen.Scope = require('../../../lib/scope').Scope;
  codegen.createMacroDirectory = require('./macroDirectory').createMacroDirectory;
  importTerm('boolean');
  codegen.typeof = require('../../../lib/typeof').typeof;
  codegen.tryStatement = cg.tryStatement;
  importTerm('ifExpression');
  importTerm('nil');
  codegen.continueStatement = cg.continueStatement;
  codegen.breakStatement = cg.breakStatement;
  codegen.throwStatement = cg.throwStatement;
  codegen.returnStatement = cg.returnStatement;
  importTerm('methodCall');
  importTerm('indexer');
  codegen.whileStatement = cg.whileStatement;
  importTerm('forExpression');
  codegen.forStatement = codegen.forExpression;
  codegen.forIn = cg.forIn;
  importTerm('forEach');
  importTerm('newOperator');
  codegen.loc = loc;
  importTerm('generatedVariable');
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
