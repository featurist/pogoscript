var cg = require('../codeGenerator');

exports.codeGenerator = function (options) {
  var codegen = {};

  var term = require('../terms/terms')(codegen);

  codegen.term = term.term;
  codegen.termPrototype = term.termPrototype;
  codegen.moduleConstants = new (require('../moduleConstants')(codegen));
  codegen.generatedVariable = require('../terms/generatedVariable')(codegen);
  codegen.definition = require('../terms/definition')(codegen);
  codegen.javascript = require('../terms/javascript')(codegen);
  codegen.basicExpression = require('./basicExpression');
  codegen.splatArguments = require('../terms/splatArguments')(codegen);
  codegen.variable = require('../terms/variable')(codegen);
  codegen.selfExpression = require('../terms/selfExpression')(codegen);
  codegen.statements = require('../terms/statements')(codegen);
  codegen.asyncStatements = require('../terms/asyncStatements')(codegen);
  codegen.subStatements = require('../terms/subStatements')(codegen);
  codegen.closure = require('../terms/closure')(codegen);
  codegen.normalParameters = require('../terms/normalParameters')(codegen);
  codegen.splatParameters = require('../terms/splatParameters')(codegen);
  codegen.block = codegen.closure;
  codegen.parameters = require('../terms/parameters')(codegen);
  codegen.identifier = require('../terms/identifier')(codegen);
  codegen.integer = require('../terms/integer')(codegen);
  codegen.float = require('../terms/float')(codegen);
  codegen.normaliseString = cg.normaliseString;
  codegen.unindent = cg.unindent;
  codegen.normaliseInterpolatedString = cg.normaliseInterpolatedString;
  codegen.string = require('../terms/string')(codegen);
  codegen.interpolatedString = require('../terms/interpolatedString')(codegen);
  codegen.normaliseRegExp = cg.normaliseRegExp;
  codegen.regExp = require('../terms/regExp')(codegen);
  codegen.parseRegExp = cg.parseRegExp;
  codegen.module = require('../terms/module')(codegen);
  codegen.interpolation = cg.interpolation;
  codegen.list = require('../terms/list')(codegen);
  codegen.normaliseArguments = cg.normaliseArguments;
  codegen.argumentList = require('../terms/argumentList')(codegen);
  codegen.subExpression = require('../terms/subExpression')(codegen);
  codegen.fieldReference = require('../terms/fieldReference')(codegen);
  codegen.hash = require('../terms/hash')(codegen);
  codegen.asyncArgument = require('../terms/asyncArgument')(codegen);
  codegen.futureArgument = require('../terms/futureArgument')(codegen);
  codegen.complexExpression = require('./complexExpression');
  codegen.operatorExpression = require('../parser/operatorExpression')(codegen);
  codegen.unaryOperatorExpression = require('../parser/unaryOperatorExpression')(codegen);
  codegen.operator = require('../terms/operator')(codegen);
  codegen.callback = require('../terms/callback')(codegen);
  codegen.splat = require('../terms/splat')(codegen);
  codegen.range = require('../terms/range')(codegen);
  codegen.hashEntry = require('../terms/hashEntry')(codegen);
  codegen.concatName = cg.concatName;
  codegen.parseSplatParameters = cg.parseSplatParameters;
  codegen.collapse = cg.collapse;
  codegen.functionCall = require('../terms/functionCall')(codegen);
  codegen.scope = require('../terms/scope')(codegen);
  codegen.SymbolScope = require('../symbolScope').SymbolScope;
  codegen.macroDirectory = require('../macroDirectory')(codegen);
  codegen.boolean = require('../terms/boolean')(codegen);
  codegen.increment = require('../terms/increment')(codegen);
  codegen.typeof = require('../terms/typeof')(codegen);
  codegen.tryExpression = require('../terms/tryExpression')(codegen);
  codegen.ifExpression = require('../terms/ifExpression')(codegen);
  codegen.nil = require('../terms/nil')(codegen);
  codegen.continueStatement = require('../terms/continueStatement')(codegen);
  codegen.breakStatement = require('../terms/breakStatement')(codegen);
  codegen.throwStatement = require('../terms/throwStatement')(codegen);
  codegen.returnStatement = require('../terms/returnStatement')(codegen);
  codegen.methodCall = require('../terms/methodCall')(codegen);
  codegen.asyncResult = require('../terms/asyncResult')(codegen);
  codegen.indexer = require('../terms/indexer')(codegen);
  codegen.whileExpression = require('../terms/whileExpression')(codegen);
  codegen.whileStatement = codegen.whileExpression;
  codegen.withExpression = require('../terms/withExpression')(codegen);
  codegen.withStatement = codegen.withExpression;
  codegen.forExpression = require('../terms/forExpression')(codegen);
  codegen.forStatement = codegen.forExpression;
  codegen.forIn = require('../terms/forIn')(codegen);
  codegen.forEach = require('../terms/forEach')(codegen);
  codegen.newOperator = require('../terms/newOperator')(codegen);
  codegen.generator = require('../terms/generator')(codegen);
  codegen.listComprehension = require('../terms/listComprehension')(codegen);
  codegen.loc = loc;
  codegen.asyncCallback = require('../terms/asyncCallback')(codegen);
  codegen.continuationOrDefault = require('../terms/continuationOrDefault')(codegen);
  codegen.continuationFunction = codegen.variable(['continuation'], {couldBeMacro: false});
  codegen.continuationFunction.isContinuation = true;
  codegen.onFulfilledFunction = codegen.generatedVariable(['onFulfilled'], {couldBeMacro: false, tag: 'onFulfilled'});
  codegen.onFulfilledFunction.isContinuation = true;
  codegen.onRejectedFunction = codegen.generatedVariable(['onRejected'], {couldBeMacro: false, tag: 'onRejected'});
  codegen.callbackFunction = codegen.generatedVariable(['callback'], {couldBeMacro: false});
  codegen.resolveFunction = codegen.generatedVariable(['resolve'], {couldBeMacro: false});
  codegen.resolve = require('../resolve')(codegen);
  codegen.newPromise = require('../terms/newPromise')(codegen);
  codegen.promise = require('../terms/promise')(codegen);
  codegen.createPromise = require('../terms/createPromise')(codegen);
  codegen.promisify = require('../terms/promisify')(codegen);
  codegen.optional = cg.optional;
  codegen.postIncrement = cg.postIncrement;
  codegen.oldTerm = cg.oldTerm;
  codegen.semanticError = require('../terms/semanticError')(codegen);
  codegen.errors = require('./errors').errors(codegen);
  codegen.macros = require('./macros').macros(codegen);
  codegen.listMacros = require('./listMacros')(codegen);
  codegen.argumentUtils = require('../terms/argumentUtils')(codegen);
  codegen.closureParameterStrategies = require('../terms/closureParameterStrategies')(codegen);
  codegen.promisesModule = promisesModule(options);
  
  return codegen;
};

function promisesModule(options) {
  var moduleName = (options && options.promises) || 'bluebird';
  
  if (moduleName === 'none') {
    return undefined;
  } else {
    return moduleName;
  }
}

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
