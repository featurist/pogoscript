(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
exports.while = function (conditionBody, body, cb) {
  var loop = function () {
    try {
      conditionBody(function (error, result) {
        if (error) {
          cb(error);
        } else if (result) {
          try {
            body(function (error, result) {
              if (error) {
                cb(error);
              } else {
                loop();
              }
            });
          } catch (error) {
            cb(error);
          }
        } else {
          cb();
        }
      });
    } catch (error) {
      cb(error);
    }
  };

  loop();
};

exports.for = function (test, incr, loop) {
  return new Promise(function (success, failure) {
    function testAndLoop(loopResult) {
      Promise.resolve(test()).then(function (testResult) {
        if (testResult) {
          Promise.resolve(loop()).then(incrTestAndLoop, failure);
        } else {
          success(loopResult);
        }
      }, failure);
    }

    function incrTestAndLoop (loopResult) {
      Promise.resolve(incr()).then(function () {
        testAndLoop(loopResult);
      }, failure);
    }

    testAndLoop();
  });
};

exports.promisify = function (fn) {
  return new Promise(function (onFulfilled, onRejected) {
    fn(function (error, result) {
      if (error) {
        onRejected(error);
      } else {
        onFulfilled(result);
      }
    });
  });
};

exports.listComprehension = function (items, areRanges, block) {
  return new Promise(function (onFulfilled, onRejected) {
    var indexes = [];
    var results = {};
    var completed = 0;
    var wasError = false;

    if (items.length > 0) {
      for (var n = 0; n < items.length; n++) {
        Promise.resolve(block(n, items[n], function (result, index) {
          indexes.push(index);
          results[index] = result;
        })).then(function (result) {
          completed++;

          if (completed == items.length && !wasError) {
            var sortedResults = [];

            indexes.sort();

            for (n = 0; n < indexes.length; n++) {
              if (areRanges) {
                sortedResults.push.apply(sortedResults, results[indexes[n]]);
              } else {
                sortedResults.push(results[indexes[n]]);
              }
            }

            onFulfilled(sortedResults);
          }
        }, onRejected);
      }
    } else {
      onFulfilled([]);
    }
  });
};

},{}],2:[function(require,module,exports){
(function() {
    var self = this;
    exports.class = function(prototype) {
        var self = this;
        var constructor;
        constructor = function() {
            var self = this;
            var args = Array.prototype.slice.call(arguments, 0, arguments.length);
            prototype.constructor.apply(self, args);
            return void 0;
        };
        constructor.prototype = prototype;
        return constructor;
    };
    exports.classExtending = function(baseConstructor, prototypeMembers) {
        var self = this;
        var prototypeConstructor, prototype, constructor;
        prototypeConstructor = function() {
            var self = this;
            var field;
            for (field in prototypeMembers) {
                (function(field) {
                    if (prototypeMembers.hasOwnProperty(field)) {
                        self[field] = prototypeMembers[field];
                    }
                })(field);
            }
            return void 0;
        };
        prototypeConstructor.prototype = baseConstructor.prototype;
        prototype = new prototypeConstructor();
        constructor = function() {
            var self = this;
            var args = Array.prototype.slice.call(arguments, 0, arguments.length);
            prototype.constructor.apply(self, args);
            return void 0;
        };
        constructor.prototype = prototype;
        return constructor;
    };
}).call(this);
},{}],3:[function(require,module,exports){
var _ = require('underscore');
require('./parser/runtime');
var codegenUtils = require('./terms/codegenUtils');

var loc = exports.loc = function (term, location) {
  var loc = {
    firstLine: location.firstLine,
    lastLine: location.lastLine,
    firstColumn: location.firstColumn,
    lastColumn: location.lastColumn
  };

  term.location = function () {
    return loc;
  };
  
  return term;
};

exports.oldTerm = function (members) {
  var cg = this;
  
  var constructor = function () {
    members.call(this);
  };
  constructor.prototype = cg.termPrototype;
  return new constructor();
};

},{"./parser/runtime":23,"./terms/codegenUtils":39,"underscore":110}],4:[function(require,module,exports){
(function() {
    var self = this;
    var $class, _;
    $class = require("./class").class;
    _ = require("underscore");
    module.exports = function(terms) {
        var self = this;
        var macroDirectory, createMacroDirectory;
        macroDirectory = $class({
            constructor: function() {
                var self = this;
                return self.nameTreeRoot = {};
            },
            nameNode: function(name) {
                var self = this;
                var nameTree;
                nameTree = self.nameTreeRoot;
                _(name).each(function(nameSegment) {
                    if (!nameTree.hasOwnProperty(nameSegment)) {
                        return nameTree = nameTree[nameSegment] = {};
                    } else {
                        return nameTree = nameTree[nameSegment];
                    }
                });
                return nameTree;
            },
            addMacro: function(name, createMacro) {
                var self = this;
                var nameTree;
                nameTree = self.nameNode(name);
                return nameTree["create macro"] = createMacro;
            },
            addWildCardMacro: function(name, matchMacro) {
                var self = this;
                var nameTree, matchMacros;
                nameTree = self.nameNode(name);
                matchMacros = void 0;
                if (!nameTree.hasOwnProperty("match macro")) {
                    matchMacros = nameTree["match macro"] = [];
                } else {
                    matchMacros = nameTree["match macro"];
                }
                return matchMacros.push(matchMacro);
            },
            findMacro: function(name) {
                var self = this;
                var findMatchingWildMacro, findMacroInTree;
                findMatchingWildMacro = function(wildMacros, name) {
                    var n, wildMacro, macro;
                    n = 0;
                    while (n < wildMacros.length) {
                        wildMacro = wildMacros[n];
                        macro = wildMacro(name);
                        if (macro) {
                            return macro;
                        }
                        ++n;
                    }
                    return void 0;
                };
                findMacroInTree = function(nameTree, name, index, wildMacros) {
                    var subtree;
                    if (index < name.length) {
                        if (nameTree.hasOwnProperty(name[index])) {
                            subtree = nameTree[name[index]];
                            if (subtree.hasOwnProperty("match macro")) {
                                wildMacros = subtree["match macro"].concat(wildMacros);
                            }
                            return findMacroInTree(subtree, name, index + 1, wildMacros);
                        } else {
                            return findMatchingWildMacro(wildMacros, name);
                        }
                    } else {
                        if (nameTree.hasOwnProperty("create macro")) {
                            return nameTree["create macro"];
                        } else {
                            return findMatchingWildMacro(wildMacros, name);
                        }
                    }
                };
                return findMacroInTree(self.nameTreeRoot, name, 0, []);
            }
        });
        return createMacroDirectory = function() {
            var args = Array.prototype.slice.call(arguments, 0, arguments.length);
            var gen1_c;
            gen1_c = function() {
                macroDirectory.apply(this, args);
            };
            gen1_c.prototype = macroDirectory.prototype;
            return new gen1_c();
        };
    };
}).call(this);
},{"./class":2,"underscore":110}],5:[function(require,module,exports){
var MemoryStream = function () {
  var buffer = [];
  
  this.write = function (str) {
    if (typeof str === 'undefined') {
      throw new Error('wrote undefined');
    }
    buffer.push(str);
  };
  
  var totalSizeOfBuffer = function () {
    var size = 0;
    
    for (var n in buffer) {
      size += buffer[n].length;
    }
    
    return size;
  };
  
  this.toString = function () {
    var str = "";
    
    for (var n in buffer) {
      str += buffer[n];
    }
    
    return str;
  };
};

exports.MemoryStream = MemoryStream;

},{}],6:[function(require,module,exports){
(function() {
    var self = this;
    var $class, codegenUtils;
    $class = require("./class").class;
    codegenUtils = require("./terms/codegenUtils");
    module.exports = function(terms) {
        var self = this;
        var moduleConstants;
        return moduleConstants = terms.term({
            constructor: function() {
                var self = this;
                self.namedDefinitions = {};
                return self.listeners = [];
            },
            defineAs: function(name, expression, gen1_options) {
                var self = this;
                var generated;
                generated = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "generated") && gen1_options.generated !== void 0 ? gen1_options.generated : true;
                var canonicalName, existingDefinition, variable;
                canonicalName = codegenUtils.concatName(name);
                existingDefinition = self.namedDefinitions[canonicalName];
                if (existingDefinition) {
                    return existingDefinition.target;
                } else {
                    variable = function() {
                        if (generated) {
                            return terms.generatedVariable(name);
                        } else {
                            return terms.variable(name, {
                                couldBeMacro: false
                            });
                        }
                    }();
                    self.namedDefinitions[canonicalName] = function() {
                        var definition;
                        definition = terms.definition(variable, expression);
                        self.notifyNewDefinition(definition);
                        return definition;
                    }();
                    return variable;
                }
            },
            definitions: function() {
                var self = this;
                var defs, name;
                defs = [];
                for (name in self.namedDefinitions) {
                    (function(name) {
                        var definition;
                        definition = self.namedDefinitions[name];
                        defs.push(definition);
                    })(name);
                }
                return defs;
            },
            notifyNewDefinition: function(d) {
                var self = this;
                var gen2_items, gen3_i, listener;
                gen2_items = self.listeners;
                for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
                    listener = gen2_items[gen3_i];
                    listener(d);
                }
                return void 0;
            },
            onEachNewDefinition: function(block) {
                var self = this;
                return self.listeners.push(block);
            },
            generate: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    var gen4_items, gen5_i, def;
                    gen4_items = self.definitions();
                    for (gen5_i = 0; gen5_i < gen4_items.length; ++gen5_i) {
                        def = gen4_items[gen5_i];
                        buffer.write("var ");
                        buffer.write(def.generate(scope));
                        buffer.write(";");
                    }
                    return void 0;
                });
            }
        });
    };
}).call(this);
},{"./class":2,"./terms/codegenUtils":39}],7:[function(require,module,exports){
var _ = require('underscore');

module.exports = function (terminals) {
  var cg = this;
  return cg.oldTerm(function () {
    this.terminals = terminals;
    this.subterms('terminals');
    
    this.hasName = function () {
      return this.name().length > 0;
    };
    
    this.isCall = function () {
      if (this.hasName()) {
        return this.hasArguments();
      } else {
        return this.argumentTerminals().length > 1;
      }
    };
    
    this.name = function () {
      return this._name || (this._name = _(this.terminals).filter(function (terminal) {
        return terminal.identifier;
      }).map(function (identifier) {
        return identifier.identifier;
      }));
    };
    
    this.hasAsyncArgument = function () {
      return this._hasAsyncArgument || (this._hasAsyncArgument =
        _.any(this.terminals, function (t) { return t.isAsyncArgument; })
      );
    };
    
    this.hasFutureArgument = function () {
      return this._hasFutureArgument || (this._hasFutureArgument =
        _.any(this.terminals, function (t) { return t.isFutureArgument; })
      );
    };
    
    this.hasCallbackArgument = function () {
      return this._hasCallbackArgument || (this._hasCallbackArgument =
        _.any(this.terminals, function (t) { return t.isCallback; })
      );
    };
    
    this.hasArguments = function () {
      return this._hasArguments || (this._hasArguments =
        this.argumentTerminals().length > 0
      );
    };
    
    this.argumentTerminals = function() {
      if (this._argumentTerminals) {
        return this._argumentTerminals;
      } else {
        this._buildBlocks();
        return this._argumentTerminals =
          _.compact(_.map(this.terminals, function (terminal) {
            return terminal.arguments();
          }));
      }
    };

    this.arguments = function() {
      return this._arguments || (this._arguments = _.flatten(this.argumentTerminals()));
    };

    this.parameters = function (options) {
      var skipFirstParameter = options && options.skipFirstParameter;
	
      if (this._parameters) {
        return this._parameters;
      }
      
      var args = this.arguments()

      if (skipFirstParameter) {
          args = args.slice(1);
      }

      return this._parameters = _(args).map(function (arg) {
        return arg.parameter();
      });
    };
    
    this.hasParameters = function () {
      return this._hasParameters || (this._hasParameters =
        this.argumentTerminals().length > 0
      );
    };
    
    this._buildBlocks = function () {
      var parameters = [];
      var hasParameters = false;

      _(this.terminals).each(function (terminal) {
        if (terminal.isParameters) {
          parameters.push.apply(parameters, terminal.parameters);
          hasParameters = true;
        } else if (terminal.isBlock) {
          terminal.setParameters(parameters);
          terminal.notScope = hasParameters;
          parameters = [];
          hasParameters = false;
        }
      });
      
      _(parameters).each(function (parm) {
        cg.errors.addTermWithMessage(parm, 'block parameter with no block');
      });
    };
    
    this.hashEntry = function (options) {
      var withoutBlock = options && options.withoutBlock;
      
      var args = this.arguments();
      var name = this.name();
      
      if (withoutBlock && args.length > 0 && args[args.length - 1].isBlock) {
        args = args.slice(0, args.length - 1);
      }

      if (name.length > 0 && args.length === 1) {
        return cg.hashEntry(name, args[0]);
      }

      if (name.length > 0 && args.length === 0) {
        return cg.hashEntry(name);
      }
      
      if (name.length === 0 && args.length === 2 && args[0].isString) {
        return cg.hashEntry(args[0], args[1])
      }
      
      return cg.errors.addTermWithMessage(this, 'cannot be a hash entry');
    };
    
    this.hashEntryBlock = function () {
      var args = this.arguments();
      
      var lastArgument = args[args.length - 1];
      
      if (lastArgument && lastArgument.isBlock) {
        return lastArgument;
      }
    };
    
    this.hashKey = function () {
      var args = this.arguments();
      if (args.length === 1 && args[0].isString) {
        return args[0];
      } else if (!this.hasParameters() && !this.hasArguments() && this.hasName()) {
        return this.name();
      } else {
        return cg.errors.addTermWithMessage(this, 'cannot be a hash key');
      }
    }
  });
};

},{"underscore":110}],8:[function(require,module,exports){
(function() {
    var self = this;
    window.pogoscript = require("./compiler");
}).call(this);
},{"./compiler":10}],9:[function(require,module,exports){
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

},{"../codeGenerator":3,"../macroDirectory":4,"../moduleConstants":6,"../parser/operatorExpression":20,"../parser/unaryOperatorExpression":24,"../resolve":26,"../symbolScope":27,"../terms/argumentList":28,"../terms/argumentUtils":29,"../terms/asyncArgument":30,"../terms/asyncCallback":31,"../terms/asyncResult":32,"../terms/asyncStatements":33,"../terms/boolean":34,"../terms/breakStatement":35,"../terms/callback":36,"../terms/closure":37,"../terms/closureParameterStrategies":38,"../terms/continuationOrDefault":40,"../terms/continueStatement":41,"../terms/createPromise":42,"../terms/definition":43,"../terms/fieldReference":44,"../terms/float":45,"../terms/forEach":46,"../terms/forExpression":47,"../terms/forIn":48,"../terms/functionCall":49,"../terms/futureArgument":50,"../terms/generatedVariable":51,"../terms/generator":52,"../terms/hash":53,"../terms/hashEntry":54,"../terms/identifier":55,"../terms/ifExpression":56,"../terms/increment":57,"../terms/indexer":58,"../terms/integer":59,"../terms/interpolatedString":60,"../terms/javascript":61,"../terms/list":62,"../terms/listComprehension":63,"../terms/methodCall":64,"../terms/module":65,"../terms/newOperator":66,"../terms/newPromise":67,"../terms/nil":68,"../terms/normalParameters":69,"../terms/operator":70,"../terms/parameters":71,"../terms/promise":72,"../terms/promisify":73,"../terms/range":74,"../terms/regExp":75,"../terms/returnStatement":76,"../terms/scope":77,"../terms/selfExpression":78,"../terms/semanticError":79,"../terms/splat":80,"../terms/splatArguments":81,"../terms/splatParameters":82,"../terms/statements":83,"../terms/string":85,"../terms/subExpression":86,"../terms/subStatements":87,"../terms/terms":88,"../terms/throwStatement":89,"../terms/tryExpression":90,"../terms/typeof":91,"../terms/variable":92,"../terms/whileExpression":93,"../terms/withExpression":94,"./basicExpression":7,"./complexExpression":11,"./errors":13,"./listMacros":18,"./macros":19}],10:[function(require,module,exports){
(function() {
    var self = this;
    var ms, createParser, createTerms, object, sm, beautify, serialise, sourceLocationPrinter;
    ms = require("../memorystream");
    createParser = require("./parser").createParser;
    createTerms = require("./codeGenerator").codeGenerator;
    object = require("./runtime").object;
    sm = require("source-map");
    beautify = function(code) {
        var uglify, ast, stream;
        uglify = require("uglify-js");
        ast = uglify.parse(code);
        stream = uglify.OutputStream({
            beautify: true
        });
        ast.print(stream);
        return stream.toString();
    };
    serialise = function(code) {
        if (code instanceof sm.SourceNode) {
            return code;
        } else {
            return new sm.SourceNode(0, 0, 0, code);
        }
    };
    exports.generateCode = function(term, terms, gen1_options) {
        var self = this;
        var inScope, global, returnResult, outputFilename, sourceMap;
        inScope = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "inScope") && gen1_options.inScope !== void 0 ? gen1_options.inScope : true;
        global = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "global") && gen1_options.global !== void 0 ? gen1_options.global : false;
        returnResult = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "returnResult") && gen1_options.returnResult !== void 0 ? gen1_options.returnResult : false;
        outputFilename = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "outputFilename") && gen1_options.outputFilename !== void 0 ? gen1_options.outputFilename : outputFilename;
        sourceMap = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "sourceMap") && gen1_options.sourceMap !== void 0 ? gen1_options.sourceMap : false;
        var moduleTerm, code;
        moduleTerm = terms.module(term, {
            inScope: inScope,
            global: global,
            returnLastStatement: returnResult
        });
        code = serialise(moduleTerm.generateModule());
        if (sourceMap) {
            return code.toStringWithSourceMap({
                file: outputFilename
            });
        } else {
            return code.toString();
        }
    };
    exports.compile = function(pogo, gen2_options) {
        var self = this;
        var filename, inScope, ugly, global, returnResult, async, outputFilename, sourceMap, promises, terms;
        filename = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "filename") && gen2_options.filename !== void 0 ? gen2_options.filename : void 0;
        inScope = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "inScope") && gen2_options.inScope !== void 0 ? gen2_options.inScope : true;
        ugly = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "ugly") && gen2_options.ugly !== void 0 ? gen2_options.ugly : false;
        global = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "global") && gen2_options.global !== void 0 ? gen2_options.global : false;
        returnResult = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "returnResult") && gen2_options.returnResult !== void 0 ? gen2_options.returnResult : false;
        async = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "async") && gen2_options.async !== void 0 ? gen2_options.async : false;
        outputFilename = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "outputFilename") && gen2_options.outputFilename !== void 0 ? gen2_options.outputFilename : void 0;
        sourceMap = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "sourceMap") && gen2_options.sourceMap !== void 0 ? gen2_options.sourceMap : false;
        promises = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "promises") && gen2_options.promises !== void 0 ? gen2_options.promises : void 0;
        terms = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "terms") && gen2_options.terms !== void 0 ? gen2_options.terms : createTerms({
            promises: promises
        });
        var parser, statements, output, memoryStream, error;
        parser = createParser({
            terms: terms,
            filename: filename
        });
        statements = parser.parse(pogo);
        if (async) {
            statements.asyncify({
                returnCallToContinuation: returnResult
            });
        }
        output = exports.generateCode(statements, terms, {
            inScope: inScope,
            global: global,
            returnResult: returnResult,
            outputFilename: outputFilename,
            sourceMap: sourceMap
        });
        if (parser.errors.hasErrors()) {
            memoryStream = new ms.MemoryStream();
            parser.errors.printErrors(sourceLocationPrinter({
                filename: filename,
                source: pogo
            }), memoryStream);
            error = new Error(memoryStream.toString());
            error.isSemanticErrors = true;
            throw error;
        } else if (sourceMap) {
            output.map.setSourceContent(filename, pogo);
            return {
                code: output.code,
                map: JSON.parse(output.map.toString())
            };
        } else {
            if (!ugly) {
                return beautify(output);
            } else {
                return output;
            }
        }
    };
    exports.evaluate = function(pogo, gen3_options) {
        var self = this;
        var definitions, ugly, global;
        definitions = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "definitions") && gen3_options.definitions !== void 0 ? gen3_options.definitions : {};
        ugly = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "ugly") && gen3_options.ugly !== void 0 ? gen3_options.ugly : true;
        global = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "global") && gen3_options.global !== void 0 ? gen3_options.global : false;
        var js, definitionNames, parameters, runScript, definitionValues;
        js = exports.compile(pogo, {
            ugly: ugly,
            inScope: !global,
            global: global,
            returnResult: !global
        });
        definitionNames = Object.keys(definitions);
        parameters = definitionNames.join(",");
        runScript = new Function(parameters, "return " + js + ";");
        definitionValues = function() {
            var gen4_results, gen5_items, gen6_i, name;
            gen4_results = [];
            gen5_items = definitionNames;
            for (gen6_i = 0; gen6_i < gen5_items.length; ++gen6_i) {
                name = gen5_items[gen6_i];
                (function(name) {
                    return gen4_results.push(definitions[name]);
                })(name);
            }
            return gen4_results;
        }();
        return runScript.apply(undefined, definitionValues);
    };
    sourceLocationPrinter = function(gen7_options) {
        var filename, source;
        filename = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "filename") && gen7_options.filename !== void 0 ? gen7_options.filename : void 0;
        source = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "source") && gen7_options.source !== void 0 ? gen7_options.source : void 0;
        return {
            linesInRange: function(range) {
                var self = this;
                var lines;
                lines = source.split(/\n/);
                return lines.slice(range.from - 1, range.to);
            },
            printLinesInRange: function(gen8_options) {
                var self = this;
                var prefix, from, to, buffer;
                prefix = gen8_options !== void 0 && Object.prototype.hasOwnProperty.call(gen8_options, "prefix") && gen8_options.prefix !== void 0 ? gen8_options.prefix : "";
                from = gen8_options !== void 0 && Object.prototype.hasOwnProperty.call(gen8_options, "from") && gen8_options.from !== void 0 ? gen8_options.from : void 0;
                to = gen8_options !== void 0 && Object.prototype.hasOwnProperty.call(gen8_options, "to") && gen8_options.to !== void 0 ? gen8_options.to : void 0;
                buffer = gen8_options !== void 0 && Object.prototype.hasOwnProperty.call(gen8_options, "buffer") && gen8_options.buffer !== void 0 ? gen8_options.buffer : buffer;
                var gen9_items, gen10_i, line;
                gen9_items = self.linesInRange({
                    from: from,
                    to: to
                });
                for (gen10_i = 0; gen10_i < gen9_items.length; ++gen10_i) {
                    line = gen9_items[gen10_i];
                    buffer.write(prefix + line + "\n");
                }
                return void 0;
            },
            printLocation: function(location, buffer) {
                var self = this;
                var spaces, markers;
                buffer.write(filename + ":" + location.firstLine + "\n");
                if (location.firstLine === location.lastLine) {
                    self.printLinesInRange({
                        from: location.firstLine,
                        to: location.lastLine,
                        buffer: buffer
                    });
                    spaces = self.times(" ", location.firstColumn);
                    markers = self.times("^", location.lastColumn - location.firstColumn);
                    return buffer.write(spaces + markers + "\n");
                } else {
                    return self.printLinesInRange({
                        prefix: "> ",
                        from: location.firstLine,
                        to: location.lastLine,
                        buffer: buffer
                    });
                }
            },
            times: function(s, n) {
                var self = this;
                var strings, i;
                strings = [];
                for (i = 0; i < n; ++i) {
                    strings.push(s);
                }
                return strings.join("");
            }
        };
    };
    exports.lex = function(pogo) {
        var self = this;
        var parser;
        parser = createParser({
            terms: createTerms()
        });
        return parser.lex(pogo);
    };
}).call(this);
},{"../memorystream":5,"./codeGenerator":9,"./parser":21,"./runtime":23,"source-map":100,"uglify-js":"qD98jl"}],11:[function(require,module,exports){
var _ = require('underscore');
var asyncControl = require('../asyncControl')

module.exports = function (listOfTerminals) {
  var terms = this;
  return terms.oldTerm(function () {
    this.isComplexExpression = true;
    this.basicExpressions = _(listOfTerminals).map(function (terminals) {
      return terms.basicExpression(terminals);
    });
    
    this.subterms('basicExpressions');

    this.head = function () {
      return this._firstExpression || (this._firstExpression = this.basicExpressions[0]);
    };
    
    this.tail = function () {
      return this._tail || (this._tail = this.basicExpressions.slice(1));
    };
    
    this.hasTail = function () {
      return this.tail().length > 0;
    };
    
    this.isAsyncCall = function () {
      return this.head().hasAsyncArgument();
    };

    this.isFutureCall = function () {
      return this.head().hasFutureArgument();
    };

    this.isCallbackCall = function () {
      return this.head().hasCallbackArgument();
    };
    
    this.tailBlock = function () {
      if (this._hasTailBlock) {
        return this._tailBlock;
      } else {
        var tail = this.tail();
        if (tail.length > 0) {
          var block = tail[tail.length - 1].hashEntryBlock();
          
          this._hasTailBlock = block;
          return this._tailBlock = block;
        } else {
          this._hasTailBlock = false;
          this._tailBlock = undefined;
        }
      }
    }
    
    this.arguments = function () {
      if (this._arguments) {
        return this._arguments;
      } else {
        var args = this.head().arguments();
        
        var tailBlock = this.tailBlock();
        
        if (tailBlock) {
          return this._arguments = args.concat(tailBlock);
        } else {
          return this._arguments = args;
        }
      }
    }
    
    this.hasArguments = function () {
      return this._hasArguments || (this._hasArguments = 
        this.head().hasArguments() || this.tailBlock()
      );
    };
    
    this.expression = function () {
      var head = this.head();

      if (head.hasName()) {
        if (this.hasArguments()) {
          return this.wrap(terms.functionCall(terms.variable(head.name(), {couldBeMacro: false, location: this.location()}), this.arguments(), {options: true}));
        } else {
          return this.wrap(terms.variable(head.name(), {location: this.location()}));
        }
      } else {
        if (!this.hasTail() && this.arguments().length === 1 && !this.head().isCall()) {
          return this.arguments()[0];
        } else {
          return this.wrap(terms.functionCall(this.arguments()[0], this.arguments().slice(1), {options: true}));
        }
      }
    };
    
    this.objectOperationExpression = function (object) {
      var head = this.head();

      if (head.hasName()) {
        if (this.hasArguments()) {
          return this.wrap(terms.methodCall(object, head.name(), this.arguments(), {options: true}));
        } else {
          return terms.fieldReference(object, head.name());
        }
      } else {
        if (!this.hasTail() && !head.isCall() && !this.isAsyncCall()) {
          return terms.indexer(object, this.arguments()[0]);
        } else {
          return this.wrap(terms.functionCall(terms.indexer(object, this.arguments()[0]), this.arguments().slice(1), {options: true}));
        }
      }
    };

    this.wrap = function (term) {
      if (this.isAsyncCall()) {
        term = terms.resolve(term);
      }

      return term;
    };
    
    this.parameters = function (options) {
      return this.head().parameters(options);
    };
    
    this.hasParameters = function () {
      return this._hasParameters || (this._hasParameters =
        this.head().hasParameters()
      );
    };
    
    this.hashEntry = function () {
      if (this.hasTail()) {
        return terms.errors.addTermsWithMessage(this.tail(), 'cannot be a hash entry');
      }
      return this.head().hashEntry();
    };
    
    this.objectOperationDefinition = function (object, source) {
      var self = this;
      
      return {
        expression: function () {
          if (self.head().hasName()) {
            if (self.hasParameters()) {
              var block = source.blockify(self.parameters(), {returnPromise: self.isAsyncCall(), redefinesSelf: true});
              return terms.definition(terms.fieldReference(object, self.head().name()), block, {assignment: true});
            } else {
              return terms.definition(terms.fieldReference(object, self.head().name()), source.scopify(), {assignment: true});
            }
          } else {
            if (!self.hasTail() && self.arguments().length === 1 && !self.isAsyncCall()) {
              return terms.definition(terms.indexer(object, self.arguments()[0]), source.scopify(), {assignment: true});
            } else {
              var block = source.blockify(self.parameters({skipFirstParameter: true}), {returnPromise: self.isAsyncCall(), redefinesSelf: true});
              return terms.definition(terms.indexer(object, self.arguments()[0]), block, {assignment: true});
            }
          }
        }
      };
    };
    
    this.objectOperation = function (object) {
      var complexExpression = this;
      
      return new function () {
        this.operation = complexExpression;
        this.object = object;
        
        this.expression = function () {
          return this.operation.objectOperationExpression(this.object);
        };
        
        this.definition = function (source) {
          return this.operation.objectOperationDefinition(this.object, source);
        };

        this.hashEntry = function () {
          return terms.errors.addTermWithMessage(this.expression(), 'cannot be a hash entry');
        };
      };
    };
    
    this.definition = function (source, options) {
      var self = this;
      var assignment = options && Object.hasOwnProperty.call(options, 'assignment') && options.assignment;
      
      if (self.head().hasName()) {
        if (self.hasParameters()) {
          return {
            expression: function () {
              return terms.definition(terms.variable(self.head().name(), {location: self.location()}), source.blockify(self.parameters(), {returnPromise: self.isAsyncCall()}), {assignment: assignment});
            },
            hashEntry: function (isOptionalArgument) {
              var block = source.blockify(self.parameters(), {returnPromise: self.isAsyncCall(), redefinesSelf: !isOptionalArgument});

              return terms.hashEntry(self.head().name(), block);
            }
          };
        } else {
          return {
            expression: function () {
              return terms.definition(terms.variable(self.head().name(), {location: self.location()}), source.scopify(), {assignment: assignment});
            },
            hashEntry: function () {
              return terms.hashEntry(self.head().hashKey(), source.scopify());
            }
          };
        }
      } else if (self.isAsyncCall()) {
        return {
          hashEntry: function () {
            var head = self.head();
            return terms.hashEntry(head.hashKey(), source.blockify ([], {async: true}));
          }
        };
      } else {
        return {
          hashEntry: function () {
            var head = self.head();
            return terms.hashEntry(head.hashKey(), source);
          }
        };
      }
    };
  });
};

},{"../asyncControl":1,"underscore":110}],12:[function(require,module,exports){
(function() {
    var self = this;
    var createDynamicLexer;
    exports.createDynamicLexer = createDynamicLexer = function(gen1_options) {
        var nextLexer, source;
        nextLexer = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "nextLexer") && gen1_options.nextLexer !== void 0 ? gen1_options.nextLexer : void 0;
        source = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "source") && gen1_options.source !== void 0 ? gen1_options.source : void 0;
        var lexer;
        lexer = {
            tokens: [],
            nextLexer: nextLexer,
            lex: function() {
                var self = this;
                var token;
                token = self.tokens.shift();
                if (token) {
                    self.yytext = token;
                    return token;
                } else {
                    token = self.nextLexer.lex();
                    self.yytext = self.nextLexer.yytext;
                    self.yylloc = self.nextLexer.yylloc;
                    self.yyleng = self.nextLexer.yyleng;
                    self.yylineno = self.nextLexer.yylineno;
                    self.match = self.nextLexer.match;
                    return token;
                }
            },
            showPosition: function() {
                var self = this;
                return self.nextLexer.showPosition();
            },
            setInput: function(input) {
                var self = this;
                return self.nextLexer.setInput(input);
            }
        };
        if (source) {
            lexer.setInput(source);
        }
        return lexer;
    };
}).call(this);
},{}],13:[function(require,module,exports){
var _ = require('underscore');

exports.errors = function (terms) {
  return new function () {
    this.errors = [];
  
    this.clear = function () {
      this.errors = [];
    };
  
    this.hasErrors = function () {
      return this.errors.length > 0;
    };
  
    this.printErrors = function (sourceFile, buffer) {
      _.each(this.errors, function (error) {
        error.printError(sourceFile, buffer);
      });
    };
  
    this.addTermWithMessage = function (term, message) {
      return this.addTermsWithMessage([term], message);
    };
  
    this.addTermsWithMessage = function (errorTerms, message) {
      var e = terms.semanticError (errorTerms, message);
      this.errors.push(e);
      return e;
    };
  };
};

},{"underscore":110}],14:[function(require,module,exports){
(function() {
    var self = this;
    var comments, identifier;
    comments = "\\s*((\\/\\*([^*](\\*+[^\\/]|))*(\\*\\/|$)|\\/\\/.*(\\r?\\n|$))\\s*)+";
    exports.identifier = identifier = function() {
        var ranges;
        ranges = "a-zA-Z\\u4E00-\\u9FFF\\u3400-\\u4DFF_$";
        return "[" + ranges + "][" + ranges + "0-9]*";
    }();
    exports.grammar = {
        lex: {
            startConditions: {
                interpolated_string: true,
                interpolated_string_terminal: true
            },
            rules: [ [ "^#![^\\n]*", "/* ignore hashbang */" ], [ " +", "/* ignore whitespace */" ], [ "\\s*$", "return yy.eof();" ], [ comments + "$", "return yy.eof();" ], [ comments, "var indentation = yy.indentation(yytext); if (indentation) { return indentation; }" ], [ "\\(\\s*", 'yy.setIndentation(yytext); if (yy.interpolation.interpolating()) {yy.interpolation.openBracket()} return "(";' ], [ "\\s*\\)", "if (yy.interpolation.interpolating()) {yy.interpolation.closeBracket(); if (yy.interpolation.finishedInterpolation()) {this.popState(); yy.interpolation.stopInterpolation()}} return yy.unsetIndentation(')');" ], [ "{\\s*", "yy.setIndentation(yytext); return '{';" ], [ "\\s*}", "return yy.unsetIndentation('}');" ], [ "\\[\\s*", "yy.setIndentation(yytext); return '[';" ], [ "\\s*\\]", "return yy.unsetIndentation(']')" ], [ "(\\r?\\n *)*\\r?\\n *", "return yy.indentation(yytext);" ], [ "0x[0-9a-fA-F]+", "return 'hex';" ], [ "[0-9]+\\.[0-9]+", "return 'float';" ], [ "[0-9]+", "return 'integer';" ], [ "@" + identifier, 'return "operator";' ], [ "\\.\\.\\.", 'return "...";' ], [ "([:;=?!.@~#%^&*+<>\\/?\\\\|-])+", "return yy.lexOperator(yy, yytext);" ], [ ",", 'return ",";' ], [ "r\\/([^\\\\\\/]*\\\\.)*[^\\/]*\\/(img|mgi|gim|igm|gmi|mig|im|ig|gm|mg|mi|gi|i|m|g|)", "return 'reg_exp';" ], [ identifier, "return 'identifier';" ], [ "$", "return 'eof';" ], [ "'([^']*'')*[^']*'", "return 'string';" ], [ '"', "this.begin('interpolated_string'); return 'start_interpolated_string';" ], [ [ "interpolated_string" ], "\\\\#", "return 'escaped_interpolated_string_terminal_start';" ], [ [ "interpolated_string" ], "#\\(", "yy.setIndentation('('); yy.interpolation.startInterpolation(); this.begin('INITIAL'); return '(';" ], [ [ "interpolated_string" ], "#", "return 'interpolated_string_body';" ], [ [ "interpolated_string" ], '"', "this.popState(); return 'end_interpolated_string';" ], [ [ "interpolated_string" ], "\\\\.", "return 'escape_sequence';" ], [ [ "interpolated_string" ], '[^"#\\\\]*', "return 'interpolated_string_body';" ], [ ".", "return 'non_token';" ] ]
        },
        operators: [ [ "right", ":=", "=" ], [ "left", "." ] ],
        start: "module_statements",
        bnf: {
            module_statements: [ [ "statements eof", "return $1;" ] ],
            statements: [ [ "statements_list", "$$ = yy.terms.asyncStatements($1);" ] ],
            hash_entries: [ [ "hash_entries , expression", "$1.push($3.hashEntry()); $$ = $1;" ], [ "expression", "$$ = [$1.hashEntry()];" ], [ "", "$$ = [];" ] ],
            statements_list: [ [ "statements_list , statement", "$1.push($3); $$ = $1;" ], [ "statement", "$$ = [$1];" ], [ "", "$$ = [];" ] ],
            arguments: [ [ "arguments_list", "$$ = $1;" ], [ "", "$$ = [];" ] ],
            arguments_list: [ [ "arguments_list , argument", "$1.push($3); $$ = $1;" ], [ "argument", "$$ = [$1];" ] ],
            argument: [ [ "expression : expression", "$$ = $1.definition($3.expression()).hashEntry(true);" ], [ "statement", "$$ = $1" ] ],
            parameters: [ [ "parameter_list", "$$ = $1;" ], [ "", "$$ = [];" ] ],
            parameter_list: [ [ "parameter_list , parameter", "$1.push($3); $$ = $1;" ], [ "parameter", "$$ = [$1];" ] ],
            parameter: [ [ "expression : expression", "$$ = $1.definition($3.expression()).hashEntry(true);" ], [ "statement", "$$ = $1" ] ],
            statement: [ [ "expression", "$$ = $1.expression();" ] ],
            expression: [ [ "expression = expression", "$$ = $1.definition($3.expression());" ], [ "expression := expression", "$$ = $1.definition($3.expression(), {assignment: true});" ], [ "operator_expression", "$$ = $1;" ] ],
            operator_with_newline: [ [ "operator ,", "$$ = $1" ], [ "operator", "$$ = $1" ] ],
            operator_expression: [ [ "operator_expression operator_with_newline unary_operator_expression", "$1.addOperatorExpression($2, $3); $$ = $1;" ], [ "unary_operator_expression", "$$ = yy.terms.operatorExpression($1);" ] ],
            unary_operator_expression: [ [ "object_operation", "$$ = $1;" ], [ "unary_operator unary_operator_expression", "$$ = yy.terms.unaryOperatorExpression($1, $2.expression());" ] ],
            object_reference_with_newline: [ [ ". ,", "$$ = $1" ], [ ".", "$$ = $1" ] ],
            object_operation: [ [ "object_operation object_reference_with_newline complex_expression", "$$ = $3.objectOperation($1.expression());" ], [ "complex_expression", "$$ = $1;" ] ],
            complex_expression: [ [ "basic_expression_list", "$$ = yy.terms.complexExpression($1);" ] ],
            basic_expression_list: [ [ "terminal_list", "$$ = [$1];" ] ],
            terminal_list: [ [ "terminal_list terminal", "$1.push($2); $$ = $1;" ], [ "terminal_list call_operator", "$1.push($2); $$ = $1;" ], [ "terminal", "$$ = [$1];" ] ],
            call_operator: [ [ "!", "$$ = yy.loc(yy.terms.asyncArgument(), @$);" ], [ "?", "$$ = yy.loc(yy.terms.futureArgument(), @$);" ] ],
            terminal: [ [ "( arguments )", "$$ = yy.loc(yy.terms.argumentList($arguments), @$);" ], [ "@ ( parameters )", "$$ = yy.loc(yy.terms.parameters($3), @$);" ], [ "block_start statements }", "$$ = yy.loc(yy.terms.block([], $2), @$);" ], [ "=> block_start statements }", "$$ = yy.loc(yy.terms.block([], $3, {redefinesSelf: true}), @$);" ], [ "[ arguments ]", "$$ = yy.loc(yy.terms.list($2), @$);" ], [ "{ hash_entries }", "$$ = yy.loc(yy.terms.hash($2), @$);" ], [ "float", "$$ = yy.loc(yy.terms.float(parseFloat(yytext)), @$);" ], [ "integer", "$$ = yy.loc(yy.terms.integer(parseInt(yytext, 10)), @$);" ], [ "hex", "$$ = yy.loc(yy.terms.integer(parseInt(yytext, 16)), @$);" ], [ "identifier", "$$ = yy.loc(yy.terms.identifier(yytext), @$);" ], [ "string", "$$ = yy.loc(yy.terms.string(yy.unindentBy(yy.normaliseString(yytext), @$.first_column + 1)), @$);" ], [ "reg_exp", "$$ = yy.loc(yy.terms.regExp(yy.parseRegExp(yy.unindentBy(yytext, @$.first_column + 2))), @$);" ], [ "interpolated_string", "$$ = yy.loc($1, @$);" ], [ "...", "$$ = yy.loc(yy.terms.splat(), @$);" ], [ "^", "$$ = yy.loc(yy.terms.callback(), @$);" ] ],
            block_start: [ [ "@ {", "$$ = '@{'" ], [ "@{", "$$ = '@{'" ] ],
            unary_operator: [ [ "operator", "$$ = $1;" ], [ "!", "$$ = $1;" ] ],
            interpolated_terminal: [ [ "( statement )", "$$ = $2;" ] ],
            interpolated_string: [ [ "start_interpolated_string interpolated_string_components end_interpolated_string", "$$ = yy.terms.interpolatedString(yy.normaliseStringComponentsUnindentingBy($2, @$.first_column + 1));" ], [ "start_interpolated_string end_interpolated_string", "$$ = yy.terms.interpolatedString([]);" ] ],
            interpolated_string_components: [ [ "interpolated_string_components interpolated_string_component", "$1.push($2); $$ = $1;" ], [ "interpolated_string_component", "$$ = [$1];" ] ],
            interpolated_string_component: [ [ "interpolated_terminal", "$$ = $1;" ], [ "interpolated_string_body", "$$ = yy.terms.string(yy.normaliseInterpolatedString($1));" ], [ "escaped_interpolated_string_terminal_start", '$$ = yy.terms.string("#");' ], [ "escape_sequence", "$$ = yy.terms.string(yy.normaliseInterpolatedString($1));" ] ]
        }
    };
}).call(this);
},{}],15:[function(require,module,exports){
(function() {
    var self = this;
    var object, createIndentStack;
    object = require("./runtime").object;
    exports.createIndentStack = createIndentStack = function() {
        return {
            indents: [ 0 ],
            indentationRegex: /\r?\n( *)$/,
            multiNewLineRegex: /\r?\n *\r?\n/,
            isMultiNewLine: function(text) {
                var self = this;
                return self.multiNewLineRegex.test(text);
            },
            hasNewLine: function(text) {
                var self = this;
                return self.indentationRegex.test(text);
            },
            indentation: function(newLine) {
                var self = this;
                return self.indentationRegex.exec(newLine)[1].length;
            },
            currentIndentation: function() {
                var self = this;
                return self.indents[0];
            },
            setIndentation: function(text) {
                var self = this;
                var current;
                if (self.hasNewLine(text)) {
                    self.indents.unshift("bracket");
                    return self.indents.unshift(self.indentation(text));
                } else {
                    current = self.currentIndentation();
                    self.indents.unshift("bracket");
                    return self.indents.unshift(current);
                }
            },
            unsetIndentation: function() {
                var self = this;
                var tokens;
                self.indents.shift();
                tokens = [];
                while (self.indents.length > 0 && self.indents[0] !== "bracket") {
                    tokens.push("}");
                    self.indents.shift();
                }
                self.indents.shift();
                return tokens;
            },
            tokensForEof: function() {
                var self = this;
                var tokens, indents;
                tokens = [];
                indents = self.indents.length;
                while (indents > 1) {
                    tokens.push("}");
                    --indents;
                }
                tokens.push("eof");
                return tokens;
            },
            tokensForNewLine: function(text) {
                var self = this;
                var currentIndentation, indentation, tokens;
                if (self.hasNewLine(text)) {
                    currentIndentation = self.currentIndentation();
                    indentation = self.indentation(text);
                    if (currentIndentation === indentation) {
                        return [ "," ];
                    } else if (currentIndentation < indentation) {
                        self.indents.unshift(indentation);
                        return [ "@{" ];
                    } else {
                        tokens = [];
                        while (self.indents[0] > indentation) {
                            tokens.push("}");
                            self.indents.shift();
                        }
                        if (self.isMultiNewLine(text)) {
                            tokens.push(",");
                        }
                        if (self.indents[0] < indentation) {
                            tokens.push("@{");
                            self.indents.unshift(indentation);
                        }
                        return tokens;
                    }
                } else {
                    return [];
                }
            }
        };
    };
}).call(this);
},{"./runtime":23}],16:[function(require,module,exports){
(function() {
    var self = this;
    exports.createInterpolation = function() {
        var self = this;
        return {
            stack: [],
            startInterpolation: function() {
                var self = this;
                return self.stack.unshift({
                    brackets: 0
                });
            },
            openBracket: function() {
                var self = this;
                return self.stack[0].brackets = self.stack[0].brackets + 1;
            },
            closeBracket: function() {
                var self = this;
                return self.stack[0].brackets = self.stack[0].brackets - 1;
            },
            finishedInterpolation: function() {
                var self = this;
                return self.stack[0].brackets < 0;
            },
            stopInterpolation: function() {
                var self = this;
                return self.stack.shift();
            },
            interpolating: function() {
                var self = this;
                return self.stack.length > 0;
            }
        };
    };
}).call(this);
},{}],17:[function(require,module,exports){
(function (process){
/* parser generated by jison 0.4.13 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"module_statements":3,"statements":4,"eof":5,"statements_list":6,"hash_entries":7,",":8,"expression":9,"statement":10,"arguments":11,"arguments_list":12,"argument":13,":":14,"parameters":15,"parameter_list":16,"parameter":17,"=":18,":=":19,"operator_expression":20,"operator_with_newline":21,"operator":22,"unary_operator_expression":23,"object_operation":24,"unary_operator":25,"object_reference_with_newline":26,".":27,"complex_expression":28,"basic_expression_list":29,"terminal_list":30,"terminal":31,"call_operator":32,"!":33,"?":34,"(":35,")":36,"@":37,"block_start":38,"}":39,"=>":40,"[":41,"]":42,"{":43,"float":44,"integer":45,"hex":46,"identifier":47,"string":48,"reg_exp":49,"interpolated_string":50,"...":51,"^":52,"@{":53,"interpolated_terminal":54,"start_interpolated_string":55,"interpolated_string_components":56,"end_interpolated_string":57,"interpolated_string_component":58,"interpolated_string_body":59,"escaped_interpolated_string_terminal_start":60,"escape_sequence":61,"$accept":0,"$end":1},
terminals_: {2:"error",5:"eof",8:",",14:":",18:"=",19:":=",22:"operator",27:".",33:"!",34:"?",35:"(",36:")",37:"@",39:"}",40:"=>",41:"[",42:"]",43:"{",44:"float",45:"integer",46:"hex",47:"identifier",48:"string",49:"reg_exp",51:"...",52:"^",53:"@{",55:"start_interpolated_string",57:"end_interpolated_string",59:"interpolated_string_body",60:"escaped_interpolated_string_terminal_start",61:"escape_sequence"},
productions_: [0,[3,2],[4,1],[7,3],[7,1],[7,0],[6,3],[6,1],[6,0],[11,1],[11,0],[12,3],[12,1],[13,3],[13,1],[15,1],[15,0],[16,3],[16,1],[17,3],[17,1],[10,1],[9,3],[9,3],[9,1],[21,2],[21,1],[20,3],[20,1],[23,1],[23,2],[26,2],[26,1],[24,3],[24,1],[28,1],[29,1],[30,2],[30,2],[30,1],[32,1],[32,1],[31,3],[31,4],[31,3],[31,4],[31,3],[31,3],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[38,2],[38,1],[25,1],[25,1],[54,3],[50,3],[50,2],[56,2],[56,1],[58,1],[58,1],[58,1],[58,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:return $$[$0-1];
break;
case 2:this.$ = yy.terms.asyncStatements($$[$0]);
break;
case 3:$$[$0-2].push($$[$0].hashEntry()); this.$ = $$[$0-2];
break;
case 4:this.$ = [$$[$0].hashEntry()];
break;
case 5:this.$ = [];
break;
case 6:$$[$0-2].push($$[$0]); this.$ = $$[$0-2];
break;
case 7:this.$ = [$$[$0]];
break;
case 8:this.$ = [];
break;
case 9:this.$ = $$[$0];
break;
case 10:this.$ = [];
break;
case 11:$$[$0-2].push($$[$0]); this.$ = $$[$0-2];
break;
case 12:this.$ = [$$[$0]];
break;
case 13:this.$ = $$[$0-2].definition($$[$0].expression()).hashEntry(true);
break;
case 14:this.$ = $$[$0]
break;
case 15:this.$ = $$[$0];
break;
case 16:this.$ = [];
break;
case 17:$$[$0-2].push($$[$0]); this.$ = $$[$0-2];
break;
case 18:this.$ = [$$[$0]];
break;
case 19:this.$ = $$[$0-2].definition($$[$0].expression()).hashEntry(true);
break;
case 20:this.$ = $$[$0]
break;
case 21:this.$ = $$[$0].expression();
break;
case 22:this.$ = $$[$0-2].definition($$[$0].expression());
break;
case 23:this.$ = $$[$0-2].definition($$[$0].expression(), {assignment: true});
break;
case 24:this.$ = $$[$0];
break;
case 25:this.$ = $$[$0-1]
break;
case 26:this.$ = $$[$0]
break;
case 27:$$[$0-2].addOperatorExpression($$[$0-1], $$[$0]); this.$ = $$[$0-2];
break;
case 28:this.$ = yy.terms.operatorExpression($$[$0]);
break;
case 29:this.$ = $$[$0];
break;
case 30:this.$ = yy.terms.unaryOperatorExpression($$[$0-1], $$[$0].expression());
break;
case 31:this.$ = $$[$0-1]
break;
case 32:this.$ = $$[$0]
break;
case 33:this.$ = $$[$0].objectOperation($$[$0-2].expression());
break;
case 34:this.$ = $$[$0];
break;
case 35:this.$ = yy.terms.complexExpression($$[$0]);
break;
case 36:this.$ = [$$[$0]];
break;
case 37:$$[$0-1].push($$[$0]); this.$ = $$[$0-1];
break;
case 38:$$[$0-1].push($$[$0]); this.$ = $$[$0-1];
break;
case 39:this.$ = [$$[$0]];
break;
case 40:this.$ = yy.loc(yy.terms.asyncArgument(), this._$);
break;
case 41:this.$ = yy.loc(yy.terms.futureArgument(), this._$);
break;
case 42:this.$ = yy.loc(yy.terms.argumentList($$[$0-1]), this._$);
break;
case 43:this.$ = yy.loc(yy.terms.parameters($$[$0-1]), this._$);
break;
case 44:this.$ = yy.loc(yy.terms.block([], $$[$0-1]), this._$);
break;
case 45:this.$ = yy.loc(yy.terms.block([], $$[$0-1], {redefinesSelf: true}), this._$);
break;
case 46:this.$ = yy.loc(yy.terms.list($$[$0-1]), this._$);
break;
case 47:this.$ = yy.loc(yy.terms.hash($$[$0-1]), this._$);
break;
case 48:this.$ = yy.loc(yy.terms.float(parseFloat(yytext)), this._$);
break;
case 49:this.$ = yy.loc(yy.terms.integer(parseInt(yytext, 10)), this._$);
break;
case 50:this.$ = yy.loc(yy.terms.integer(parseInt(yytext, 16)), this._$);
break;
case 51:this.$ = yy.loc(yy.terms.identifier(yytext), this._$);
break;
case 52:this.$ = yy.loc(yy.terms.string(yy.unindentBy(yy.normaliseString(yytext), this._$.first_column + 1)), this._$);
break;
case 53:this.$ = yy.loc(yy.terms.regExp(yy.parseRegExp(yy.unindentBy(yytext, this._$.first_column + 2))), this._$);
break;
case 54:this.$ = yy.loc($$[$0], this._$);
break;
case 55:this.$ = yy.loc(yy.terms.splat(), this._$);
break;
case 56:this.$ = yy.loc(yy.terms.callback(), this._$);
break;
case 57:this.$ = '@{'
break;
case 58:this.$ = '@{'
break;
case 59:this.$ = $$[$0];
break;
case 60:this.$ = $$[$0];
break;
case 61:this.$ = $$[$0-1];
break;
case 62:this.$ = yy.terms.interpolatedString(yy.normaliseStringComponentsUnindentingBy($$[$0-1], this._$.first_column + 1));
break;
case 63:this.$ = yy.terms.interpolatedString([]);
break;
case 64:$$[$0-1].push($$[$0]); this.$ = $$[$0-1];
break;
case 65:this.$ = [$$[$0]];
break;
case 66:this.$ = $$[$0];
break;
case 67:this.$ = yy.terms.string(yy.normaliseInterpolatedString($$[$0]));
break;
case 68:this.$ = yy.terms.string("#");
break;
case 69:this.$ = yy.terms.string(yy.normaliseInterpolatedString($$[$0]));
break;
}
},
table: [{3:1,4:2,5:[2,8],6:3,8:[2,8],9:5,10:4,20:6,22:[1,11],23:7,24:8,25:9,28:10,29:13,30:14,31:15,33:[1,12],35:[1,16],37:[1,17],38:18,40:[1,19],41:[1,20],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{1:[3]},{5:[1,33]},{5:[2,2],8:[1,34],39:[2,2]},{5:[2,7],8:[2,7],39:[2,7]},{5:[2,21],8:[2,21],18:[1,35],19:[1,36],36:[2,21],39:[2,21]},{5:[2,24],8:[2,24],14:[2,24],18:[2,24],19:[2,24],21:37,22:[1,38],36:[2,24],39:[2,24],42:[2,24]},{5:[2,28],8:[2,28],14:[2,28],18:[2,28],19:[2,28],22:[2,28],36:[2,28],39:[2,28],42:[2,28]},{5:[2,29],8:[2,29],14:[2,29],18:[2,29],19:[2,29],22:[2,29],26:39,27:[1,40],36:[2,29],39:[2,29],42:[2,29]},{22:[1,11],23:41,24:8,25:9,28:10,29:13,30:14,31:15,33:[1,12],35:[1,16],37:[1,17],38:18,40:[1,19],41:[1,20],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{5:[2,34],8:[2,34],14:[2,34],18:[2,34],19:[2,34],22:[2,34],27:[2,34],36:[2,34],39:[2,34],42:[2,34]},{22:[2,59],33:[2,59],35:[2,59],37:[2,59],40:[2,59],41:[2,59],43:[2,59],44:[2,59],45:[2,59],46:[2,59],47:[2,59],48:[2,59],49:[2,59],51:[2,59],52:[2,59],53:[2,59],55:[2,59]},{22:[2,60],33:[2,60],35:[2,60],37:[2,60],40:[2,60],41:[2,60],43:[2,60],44:[2,60],45:[2,60],46:[2,60],47:[2,60],48:[2,60],49:[2,60],51:[2,60],52:[2,60],53:[2,60],55:[2,60]},{5:[2,35],8:[2,35],14:[2,35],18:[2,35],19:[2,35],22:[2,35],27:[2,35],36:[2,35],39:[2,35],42:[2,35]},{5:[2,36],8:[2,36],14:[2,36],18:[2,36],19:[2,36],22:[2,36],27:[2,36],31:42,32:43,33:[1,44],34:[1,45],35:[1,16],36:[2,36],37:[1,17],38:18,39:[2,36],40:[1,19],41:[1,20],42:[2,36],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{5:[2,39],8:[2,39],14:[2,39],18:[2,39],19:[2,39],22:[2,39],27:[2,39],33:[2,39],34:[2,39],35:[2,39],36:[2,39],37:[2,39],39:[2,39],40:[2,39],41:[2,39],42:[2,39],43:[2,39],44:[2,39],45:[2,39],46:[2,39],47:[2,39],48:[2,39],49:[2,39],51:[2,39],52:[2,39],53:[2,39],55:[2,39]},{9:49,10:50,11:46,12:47,13:48,20:6,22:[1,11],23:7,24:8,25:9,28:10,29:13,30:14,31:15,33:[1,12],35:[1,16],36:[2,10],37:[1,17],38:18,40:[1,19],41:[1,20],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{35:[1,51],43:[1,52]},{4:53,6:3,8:[2,8],9:5,10:4,20:6,22:[1,11],23:7,24:8,25:9,28:10,29:13,30:14,31:15,33:[1,12],35:[1,16],37:[1,17],38:18,39:[2,8],40:[1,19],41:[1,20],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{37:[1,55],38:54,53:[1,31]},{9:49,10:50,11:56,12:47,13:48,20:6,22:[1,11],23:7,24:8,25:9,28:10,29:13,30:14,31:15,33:[1,12],35:[1,16],37:[1,17],38:18,40:[1,19],41:[1,20],42:[2,10],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{7:57,8:[2,5],9:58,20:6,22:[1,11],23:7,24:8,25:9,28:10,29:13,30:14,31:15,33:[1,12],35:[1,16],37:[1,17],38:18,39:[2,5],40:[1,19],41:[1,20],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{5:[2,48],8:[2,48],14:[2,48],18:[2,48],19:[2,48],22:[2,48],27:[2,48],33:[2,48],34:[2,48],35:[2,48],36:[2,48],37:[2,48],39:[2,48],40:[2,48],41:[2,48],42:[2,48],43:[2,48],44:[2,48],45:[2,48],46:[2,48],47:[2,48],48:[2,48],49:[2,48],51:[2,48],52:[2,48],53:[2,48],55:[2,48]},{5:[2,49],8:[2,49],14:[2,49],18:[2,49],19:[2,49],22:[2,49],27:[2,49],33:[2,49],34:[2,49],35:[2,49],36:[2,49],37:[2,49],39:[2,49],40:[2,49],41:[2,49],42:[2,49],43:[2,49],44:[2,49],45:[2,49],46:[2,49],47:[2,49],48:[2,49],49:[2,49],51:[2,49],52:[2,49],53:[2,49],55:[2,49]},{5:[2,50],8:[2,50],14:[2,50],18:[2,50],19:[2,50],22:[2,50],27:[2,50],33:[2,50],34:[2,50],35:[2,50],36:[2,50],37:[2,50],39:[2,50],40:[2,50],41:[2,50],42:[2,50],43:[2,50],44:[2,50],45:[2,50],46:[2,50],47:[2,50],48:[2,50],49:[2,50],51:[2,50],52:[2,50],53:[2,50],55:[2,50]},{5:[2,51],8:[2,51],14:[2,51],18:[2,51],19:[2,51],22:[2,51],27:[2,51],33:[2,51],34:[2,51],35:[2,51],36:[2,51],37:[2,51],39:[2,51],40:[2,51],41:[2,51],42:[2,51],43:[2,51],44:[2,51],45:[2,51],46:[2,51],47:[2,51],48:[2,51],49:[2,51],51:[2,51],52:[2,51],53:[2,51],55:[2,51]},{5:[2,52],8:[2,52],14:[2,52],18:[2,52],19:[2,52],22:[2,52],27:[2,52],33:[2,52],34:[2,52],35:[2,52],36:[2,52],37:[2,52],39:[2,52],40:[2,52],41:[2,52],42:[2,52],43:[2,52],44:[2,52],45:[2,52],46:[2,52],47:[2,52],48:[2,52],49:[2,52],51:[2,52],52:[2,52],53:[2,52],55:[2,52]},{5:[2,53],8:[2,53],14:[2,53],18:[2,53],19:[2,53],22:[2,53],27:[2,53],33:[2,53],34:[2,53],35:[2,53],36:[2,53],37:[2,53],39:[2,53],40:[2,53],41:[2,53],42:[2,53],43:[2,53],44:[2,53],45:[2,53],46:[2,53],47:[2,53],48:[2,53],49:[2,53],51:[2,53],52:[2,53],53:[2,53],55:[2,53]},{5:[2,54],8:[2,54],14:[2,54],18:[2,54],19:[2,54],22:[2,54],27:[2,54],33:[2,54],34:[2,54],35:[2,54],36:[2,54],37:[2,54],39:[2,54],40:[2,54],41:[2,54],42:[2,54],43:[2,54],44:[2,54],45:[2,54],46:[2,54],47:[2,54],48:[2,54],49:[2,54],51:[2,54],52:[2,54],53:[2,54],55:[2,54]},{5:[2,55],8:[2,55],14:[2,55],18:[2,55],19:[2,55],22:[2,55],27:[2,55],33:[2,55],34:[2,55],35:[2,55],36:[2,55],37:[2,55],39:[2,55],40:[2,55],41:[2,55],42:[2,55],43:[2,55],44:[2,55],45:[2,55],46:[2,55],47:[2,55],48:[2,55],49:[2,55],51:[2,55],52:[2,55],53:[2,55],55:[2,55]},{5:[2,56],8:[2,56],14:[2,56],18:[2,56],19:[2,56],22:[2,56],27:[2,56],33:[2,56],34:[2,56],35:[2,56],36:[2,56],37:[2,56],39:[2,56],40:[2,56],41:[2,56],42:[2,56],43:[2,56],44:[2,56],45:[2,56],46:[2,56],47:[2,56],48:[2,56],49:[2,56],51:[2,56],52:[2,56],53:[2,56],55:[2,56]},{8:[2,58],22:[2,58],33:[2,58],35:[2,58],37:[2,58],39:[2,58],40:[2,58],41:[2,58],43:[2,58],44:[2,58],45:[2,58],46:[2,58],47:[2,58],48:[2,58],49:[2,58],51:[2,58],52:[2,58],53:[2,58],55:[2,58]},{35:[1,66],54:62,56:59,57:[1,60],58:61,59:[1,63],60:[1,64],61:[1,65]},{1:[2,1]},{9:5,10:67,20:6,22:[1,11],23:7,24:8,25:9,28:10,29:13,30:14,31:15,33:[1,12],35:[1,16],37:[1,17],38:18,40:[1,19],41:[1,20],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{9:68,20:6,22:[1,11],23:7,24:8,25:9,28:10,29:13,30:14,31:15,33:[1,12],35:[1,16],37:[1,17],38:18,40:[1,19],41:[1,20],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{9:69,20:6,22:[1,11],23:7,24:8,25:9,28:10,29:13,30:14,31:15,33:[1,12],35:[1,16],37:[1,17],38:18,40:[1,19],41:[1,20],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{22:[1,11],23:70,24:8,25:9,28:10,29:13,30:14,31:15,33:[1,12],35:[1,16],37:[1,17],38:18,40:[1,19],41:[1,20],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{8:[1,71],22:[2,26],33:[2,26],35:[2,26],37:[2,26],40:[2,26],41:[2,26],43:[2,26],44:[2,26],45:[2,26],46:[2,26],47:[2,26],48:[2,26],49:[2,26],51:[2,26],52:[2,26],53:[2,26],55:[2,26]},{28:72,29:13,30:14,31:15,35:[1,16],37:[1,17],38:18,40:[1,19],41:[1,20],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{8:[1,73],35:[2,32],37:[2,32],40:[2,32],41:[2,32],43:[2,32],44:[2,32],45:[2,32],46:[2,32],47:[2,32],48:[2,32],49:[2,32],51:[2,32],52:[2,32],53:[2,32],55:[2,32]},{5:[2,30],8:[2,30],14:[2,30],18:[2,30],19:[2,30],22:[2,30],36:[2,30],39:[2,30],42:[2,30]},{5:[2,37],8:[2,37],14:[2,37],18:[2,37],19:[2,37],22:[2,37],27:[2,37],33:[2,37],34:[2,37],35:[2,37],36:[2,37],37:[2,37],39:[2,37],40:[2,37],41:[2,37],42:[2,37],43:[2,37],44:[2,37],45:[2,37],46:[2,37],47:[2,37],48:[2,37],49:[2,37],51:[2,37],52:[2,37],53:[2,37],55:[2,37]},{5:[2,38],8:[2,38],14:[2,38],18:[2,38],19:[2,38],22:[2,38],27:[2,38],33:[2,38],34:[2,38],35:[2,38],36:[2,38],37:[2,38],39:[2,38],40:[2,38],41:[2,38],42:[2,38],43:[2,38],44:[2,38],45:[2,38],46:[2,38],47:[2,38],48:[2,38],49:[2,38],51:[2,38],52:[2,38],53:[2,38],55:[2,38]},{5:[2,40],8:[2,40],14:[2,40],18:[2,40],19:[2,40],22:[2,40],27:[2,40],33:[2,40],34:[2,40],35:[2,40],36:[2,40],37:[2,40],39:[2,40],40:[2,40],41:[2,40],42:[2,40],43:[2,40],44:[2,40],45:[2,40],46:[2,40],47:[2,40],48:[2,40],49:[2,40],51:[2,40],52:[2,40],53:[2,40],55:[2,40]},{5:[2,41],8:[2,41],14:[2,41],18:[2,41],19:[2,41],22:[2,41],27:[2,41],33:[2,41],34:[2,41],35:[2,41],36:[2,41],37:[2,41],39:[2,41],40:[2,41],41:[2,41],42:[2,41],43:[2,41],44:[2,41],45:[2,41],46:[2,41],47:[2,41],48:[2,41],49:[2,41],51:[2,41],52:[2,41],53:[2,41],55:[2,41]},{36:[1,74]},{8:[1,75],36:[2,9],42:[2,9]},{8:[2,12],36:[2,12],42:[2,12]},{8:[2,21],14:[1,76],18:[1,35],19:[1,36],36:[2,21],42:[2,21]},{8:[2,14],36:[2,14],42:[2,14]},{9:80,10:81,15:77,16:78,17:79,20:6,22:[1,11],23:7,24:8,25:9,28:10,29:13,30:14,31:15,33:[1,12],35:[1,16],36:[2,16],37:[1,17],38:18,40:[1,19],41:[1,20],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{8:[2,57],22:[2,57],33:[2,57],35:[2,57],37:[2,57],39:[2,57],40:[2,57],41:[2,57],43:[2,57],44:[2,57],45:[2,57],46:[2,57],47:[2,57],48:[2,57],49:[2,57],51:[2,57],52:[2,57],53:[2,57],55:[2,57]},{39:[1,82]},{4:83,6:3,8:[2,8],9:5,10:4,20:6,22:[1,11],23:7,24:8,25:9,28:10,29:13,30:14,31:15,33:[1,12],35:[1,16],37:[1,17],38:18,39:[2,8],40:[1,19],41:[1,20],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{43:[1,52]},{42:[1,84]},{8:[1,86],39:[1,85]},{8:[2,4],18:[1,35],19:[1,36],39:[2,4]},{35:[1,66],54:62,57:[1,87],58:88,59:[1,63],60:[1,64],61:[1,65]},{5:[2,63],8:[2,63],14:[2,63],18:[2,63],19:[2,63],22:[2,63],27:[2,63],33:[2,63],34:[2,63],35:[2,63],36:[2,63],37:[2,63],39:[2,63],40:[2,63],41:[2,63],42:[2,63],43:[2,63],44:[2,63],45:[2,63],46:[2,63],47:[2,63],48:[2,63],49:[2,63],51:[2,63],52:[2,63],53:[2,63],55:[2,63]},{35:[2,65],57:[2,65],59:[2,65],60:[2,65],61:[2,65]},{35:[2,66],57:[2,66],59:[2,66],60:[2,66],61:[2,66]},{35:[2,67],57:[2,67],59:[2,67],60:[2,67],61:[2,67]},{35:[2,68],57:[2,68],59:[2,68],60:[2,68],61:[2,68]},{35:[2,69],57:[2,69],59:[2,69],60:[2,69],61:[2,69]},{9:5,10:89,20:6,22:[1,11],23:7,24:8,25:9,28:10,29:13,30:14,31:15,33:[1,12],35:[1,16],37:[1,17],38:18,40:[1,19],41:[1,20],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{5:[2,6],8:[2,6],39:[2,6]},{5:[2,22],8:[2,22],14:[2,22],18:[1,35],19:[1,36],36:[2,22],39:[2,22],42:[2,22]},{5:[2,23],8:[2,23],14:[2,23],18:[1,35],19:[1,36],36:[2,23],39:[2,23],42:[2,23]},{5:[2,27],8:[2,27],14:[2,27],18:[2,27],19:[2,27],22:[2,27],36:[2,27],39:[2,27],42:[2,27]},{22:[2,25],33:[2,25],35:[2,25],37:[2,25],40:[2,25],41:[2,25],43:[2,25],44:[2,25],45:[2,25],46:[2,25],47:[2,25],48:[2,25],49:[2,25],51:[2,25],52:[2,25],53:[2,25],55:[2,25]},{5:[2,33],8:[2,33],14:[2,33],18:[2,33],19:[2,33],22:[2,33],27:[2,33],36:[2,33],39:[2,33],42:[2,33]},{35:[2,31],37:[2,31],40:[2,31],41:[2,31],43:[2,31],44:[2,31],45:[2,31],46:[2,31],47:[2,31],48:[2,31],49:[2,31],51:[2,31],52:[2,31],53:[2,31],55:[2,31]},{5:[2,42],8:[2,42],14:[2,42],18:[2,42],19:[2,42],22:[2,42],27:[2,42],33:[2,42],34:[2,42],35:[2,42],36:[2,42],37:[2,42],39:[2,42],40:[2,42],41:[2,42],42:[2,42],43:[2,42],44:[2,42],45:[2,42],46:[2,42],47:[2,42],48:[2,42],49:[2,42],51:[2,42],52:[2,42],53:[2,42],55:[2,42]},{9:49,10:50,13:90,20:6,22:[1,11],23:7,24:8,25:9,28:10,29:13,30:14,31:15,33:[1,12],35:[1,16],37:[1,17],38:18,40:[1,19],41:[1,20],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{9:91,20:6,22:[1,11],23:7,24:8,25:9,28:10,29:13,30:14,31:15,33:[1,12],35:[1,16],37:[1,17],38:18,40:[1,19],41:[1,20],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{36:[1,92]},{8:[1,93],36:[2,15]},{8:[2,18],36:[2,18]},{8:[2,21],14:[1,94],18:[1,35],19:[1,36],36:[2,21]},{8:[2,20],36:[2,20]},{5:[2,44],8:[2,44],14:[2,44],18:[2,44],19:[2,44],22:[2,44],27:[2,44],33:[2,44],34:[2,44],35:[2,44],36:[2,44],37:[2,44],39:[2,44],40:[2,44],41:[2,44],42:[2,44],43:[2,44],44:[2,44],45:[2,44],46:[2,44],47:[2,44],48:[2,44],49:[2,44],51:[2,44],52:[2,44],53:[2,44],55:[2,44]},{39:[1,95]},{5:[2,46],8:[2,46],14:[2,46],18:[2,46],19:[2,46],22:[2,46],27:[2,46],33:[2,46],34:[2,46],35:[2,46],36:[2,46],37:[2,46],39:[2,46],40:[2,46],41:[2,46],42:[2,46],43:[2,46],44:[2,46],45:[2,46],46:[2,46],47:[2,46],48:[2,46],49:[2,46],51:[2,46],52:[2,46],53:[2,46],55:[2,46]},{5:[2,47],8:[2,47],14:[2,47],18:[2,47],19:[2,47],22:[2,47],27:[2,47],33:[2,47],34:[2,47],35:[2,47],36:[2,47],37:[2,47],39:[2,47],40:[2,47],41:[2,47],42:[2,47],43:[2,47],44:[2,47],45:[2,47],46:[2,47],47:[2,47],48:[2,47],49:[2,47],51:[2,47],52:[2,47],53:[2,47],55:[2,47]},{9:96,20:6,22:[1,11],23:7,24:8,25:9,28:10,29:13,30:14,31:15,33:[1,12],35:[1,16],37:[1,17],38:18,40:[1,19],41:[1,20],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{5:[2,62],8:[2,62],14:[2,62],18:[2,62],19:[2,62],22:[2,62],27:[2,62],33:[2,62],34:[2,62],35:[2,62],36:[2,62],37:[2,62],39:[2,62],40:[2,62],41:[2,62],42:[2,62],43:[2,62],44:[2,62],45:[2,62],46:[2,62],47:[2,62],48:[2,62],49:[2,62],51:[2,62],52:[2,62],53:[2,62],55:[2,62]},{35:[2,64],57:[2,64],59:[2,64],60:[2,64],61:[2,64]},{36:[1,97]},{8:[2,11],36:[2,11],42:[2,11]},{8:[2,13],18:[1,35],19:[1,36],36:[2,13],42:[2,13]},{5:[2,43],8:[2,43],14:[2,43],18:[2,43],19:[2,43],22:[2,43],27:[2,43],33:[2,43],34:[2,43],35:[2,43],36:[2,43],37:[2,43],39:[2,43],40:[2,43],41:[2,43],42:[2,43],43:[2,43],44:[2,43],45:[2,43],46:[2,43],47:[2,43],48:[2,43],49:[2,43],51:[2,43],52:[2,43],53:[2,43],55:[2,43]},{9:80,10:81,17:98,20:6,22:[1,11],23:7,24:8,25:9,28:10,29:13,30:14,31:15,33:[1,12],35:[1,16],37:[1,17],38:18,40:[1,19],41:[1,20],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{9:99,20:6,22:[1,11],23:7,24:8,25:9,28:10,29:13,30:14,31:15,33:[1,12],35:[1,16],37:[1,17],38:18,40:[1,19],41:[1,20],43:[1,21],44:[1,22],45:[1,23],46:[1,24],47:[1,25],48:[1,26],49:[1,27],50:28,51:[1,29],52:[1,30],53:[1,31],55:[1,32]},{5:[2,45],8:[2,45],14:[2,45],18:[2,45],19:[2,45],22:[2,45],27:[2,45],33:[2,45],34:[2,45],35:[2,45],36:[2,45],37:[2,45],39:[2,45],40:[2,45],41:[2,45],42:[2,45],43:[2,45],44:[2,45],45:[2,45],46:[2,45],47:[2,45],48:[2,45],49:[2,45],51:[2,45],52:[2,45],53:[2,45],55:[2,45]},{8:[2,3],18:[1,35],19:[1,36],39:[2,3]},{35:[2,61],57:[2,61],59:[2,61],60:[2,61],61:[2,61]},{8:[2,17],36:[2,17]},{8:[2,19],18:[1,35],19:[1,36],36:[2,19]}],
defaultActions: {33:[2,1]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                this.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.2.1 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input) {
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* ignore hashbang */
break;
case 1:/* ignore whitespace */
break;
case 2:return yy.eof();
break;
case 3:return yy.eof();
break;
case 4:var indentation = yy.indentation(yy_.yytext); if (indentation) { return indentation; }
break;
case 5:yy.setIndentation(yy_.yytext); if (yy.interpolation.interpolating()) {yy.interpolation.openBracket()} return "(";
break;
case 6:if (yy.interpolation.interpolating()) {yy.interpolation.closeBracket(); if (yy.interpolation.finishedInterpolation()) {this.popState(); yy.interpolation.stopInterpolation()}} return yy.unsetIndentation(')');
break;
case 7:yy.setIndentation(yy_.yytext); return 43;
break;
case 8:return yy.unsetIndentation('}');
break;
case 9:yy.setIndentation(yy_.yytext); return 41;
break;
case 10:return yy.unsetIndentation(']')
break;
case 11:return yy.indentation(yy_.yytext);
break;
case 12:return 46;
break;
case 13:return 44;
break;
case 14:return 45;
break;
case 15:return "operator";
break;
case 16:return "...";
break;
case 17:return yy.lexOperator(yy, yy_.yytext);
break;
case 18:return ",";
break;
case 19:return 49;
break;
case 20:return 47;
break;
case 21:return 5;
break;
case 22:return 48;
break;
case 23:this.begin('interpolated_string'); return 55;
break;
case 24:return 60;
break;
case 25:yy.setIndentation('('); yy.interpolation.startInterpolation(); this.begin('INITIAL'); return 35;
break;
case 26:return 59;
break;
case 27:this.popState(); return 57;
break;
case 28:return 61;
break;
case 29:return 59;
break;
case 30:return 'non_token';
break;
}
},
rules: [/^(?:^#![^\n]*)/,/^(?: +)/,/^(?:\s*$)/,/^(?:\s*((\/\*([^*](\*+[^\/]|))*(\*\/|$)|\/\/.*(\r?\n|$))\s*)+$)/,/^(?:\s*((\/\*([^*](\*+[^\/]|))*(\*\/|$)|\/\/.*(\r?\n|$))\s*)+)/,/^(?:\(\s*)/,/^(?:\s*\))/,/^(?:{\s*)/,/^(?:\s*})/,/^(?:\[\s*)/,/^(?:\s*\])/,/^(?:(\r?\n *)*\r?\n *)/,/^(?:0x[0-9a-fA-F]+)/,/^(?:[0-9]+\.[0-9]+)/,/^(?:[0-9]+)/,/^(?:@[a-zA-Z\u4E00-\u9FFF\u3400-\u4DFF_$][a-zA-Z\u4E00-\u9FFF\u3400-\u4DFF_$0-9]*)/,/^(?:\.\.\.)/,/^(?:([:;=?!.@~#%^&*+<>\/?\\|-])+)/,/^(?:,)/,/^(?:r\/([^\\\/]*\\.)*[^\/]*\/(img|mgi|gim|igm|gmi|mig|im|ig|gm|mg|mi|gi|i|m|g|))/,/^(?:[a-zA-Z\u4E00-\u9FFF\u3400-\u4DFF_$][a-zA-Z\u4E00-\u9FFF\u3400-\u4DFF_$0-9]*)/,/^(?:$)/,/^(?:'([^']*'')*[^']*')/,/^(?:")/,/^(?:\\#)/,/^(?:#\()/,/^(?:#)/,/^(?:")/,/^(?:\\.)/,/^(?:[^"#\\]*)/,/^(?:.)/],
conditions: {"interpolated_string":{"rules":[24,25,26,27,28,29],"inclusive":false},"interpolated_string_terminal":{"rules":[],"inclusive":false},"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,30],"inclusive":true}}
};
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
}).call(this,require("FWaASH"))
},{"FWaASH":97,"fs":"liyfGr","path":96}],18:[function(require,module,exports){
(function() {
    var self = this;
    var _;
    _ = require("underscore");
    module.exports = function(terms) {
        var self = this;
        var macros, isValidComprehension, comprehensionExpressionFor, comprehensionExpressionsFrom, generator, map, definition, filter, expressions, isDefinition;
        macros = terms.macroDirectory();
        isValidComprehension = function(term) {
            var firstItemIsNotHashEntry, secondItemIsWhereHashEntry, secondItemIsGenerator, theRestOfTheItemsAreNotHashEntries;
            if (term.items.length < 2) {
                return false;
            }
            firstItemIsNotHashEntry = function() {
                return !term.items[0].isHashEntry;
            };
            secondItemIsWhereHashEntry = function() {
                return term.items[1].isHashEntry && term.items[1].field.length === 1 && term.items[1].field[0] === "where";
            };
            secondItemIsGenerator = function() {
                return term.items[1].value.isGenerator;
            };
            theRestOfTheItemsAreNotHashEntries = function() {
                return !_.any(term.items.slice(2), function(item) {
                    return item.isHashEntry;
                });
            };
            return firstItemIsNotHashEntry() && secondItemIsWhereHashEntry() && secondItemIsGenerator() && theRestOfTheItemsAreNotHashEntries();
        };
        comprehensionExpressionFor = function(expr) {
            if (expr.isGenerator) {
                return generator(expr);
            } else if (isDefinition(expr)) {
                return definition(expr);
            } else {
                return filter(expr);
            }
        };
        comprehensionExpressionsFrom = function(term, resultsVariable) {
            var exprs, comprehensionExprs;
            exprs = term.items.slice(2);
            exprs.unshift(term.items[1].value);
            comprehensionExprs = function() {
                var gen1_results, gen2_items, gen3_i, expr;
                gen1_results = [];
                gen2_items = exprs;
                for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
                    expr = gen2_items[gen3_i];
                    gen1_results.push(comprehensionExpressionFor(expr));
                }
                return gen1_results;
            }();
            comprehensionExprs.push(map(term.items[0], resultsVariable));
            return expressions(comprehensionExprs);
        };
        generator = function(expression) {
            return {
                isGenerator: true,
                iterator: expression.operatorArguments[0],
                collection: expression.operatorArguments[1],
                generate: function(rest) {
                    var self = this;
                    return [ terms.forEach(self.collection, self.iterator, terms.asyncStatements(rest.generate())) ];
                }
            };
        };
        map = function(expression, resultsVariable) {
            return {
                isMap: true,
                generate: function() {
                    var self = this;
                    return [ terms.methodCall(resultsVariable, [ "push" ], [ expression ]) ];
                }
            };
        };
        definition = function(expression) {
            return {
                isDefinition: true,
                generate: function(rest) {
                    var self = this;
                    var statements, gen4_o;
                    statements = [ expression ];
                    gen4_o = statements;
                    gen4_o.push.apply(gen4_o, rest.generate());
                    return statements;
                }
            };
        };
        filter = function(expression) {
            return {
                isFilter: true,
                generate: function(rest) {
                    var self = this;
                    return [ terms.ifExpression([ {
                        condition: expression,
                        body: terms.asyncStatements(rest.generate())
                    } ]) ];
                }
            };
        };
        expressions = function(exprs) {
            return {
                expressions: exprs,
                generate: function() {
                    var self = this;
                    if (exprs.length > 0) {
                        return exprs[0].generate(expressions(exprs.slice(1)));
                    } else {
                        return [];
                    }
                }
            };
        };
        isDefinition = function(expression) {
            return expression.isDefinition;
        };
        macros.addMacro([ "where" ], function(term, name, args) {
            var badComprehension, resultsVariable, exprs, statements, gen5_o;
            badComprehension = function() {
                return terms.errors.addTermWithMessage(term, "not a list comprehension, try:\n\n    [y + 1, where: x <- [1..10], x % 2, y = x + 10]");
            };
            if (isValidComprehension(term)) {
                resultsVariable = terms.generatedVariable([ "results" ]);
                exprs = comprehensionExpressionsFrom(term, resultsVariable);
                statements = [ terms.definition(resultsVariable, terms.list([])) ];
                gen5_o = statements;
                gen5_o.push.apply(gen5_o, exprs.generate());
                statements.push(resultsVariable);
                return terms.scope(statements);
            } else {
                return badComprehension();
            }
        });
        return macros;
    };
}).call(this);
},{"underscore":110}],19:[function(require,module,exports){
var _ = require('underscore');
var errors = require('./errors');
var codegenUtils = require('../terms/codegenUtils');
var prototypeSource = require('../prototype');

exports.macros = function (terms) {
  var macros = terms.macroDirectory();

  var createOperator = function(term, name, args) {
    return terms.operator(name[0], args);
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
    '<<'
  ];

  _.each(javaScriptOperators, function(op) {
    macros.addMacro([op], createOperator);
  });

  macros.addMacro(['=='], function (term, name, args) {
    return terms.operator('===', args);
  });

  macros.addMacro(['^^'], function (term, name, args) {
    return terms.operator('^', args);
  });

  macros.addMacro(['!='], function (term, name, args) {
    return terms.operator('!==', args);
  });

  macros.addMacro(['in'], function (term, name, args) {
    return terms.operator('in', args);
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
      return terms.typeof (args[0], type);
    } else {
      return terms.operator('instanceof', args);
    }
  });

  macros.addMacro(['..'], function (term, name, args) {
    return terms.range(args);
  });

  var matchMultiOperator = function (name) {
    var firstOp = name[0];

    for (var n = 1; n < name.length; n++) {
      if (name[n] != firstOp) {
        return;
      }
    }

    return function (term, name, args) {
      return terms.operator(name[0], args);
    };
  };

  _.each(['+', '*'], function(op) {
    macros.addWildCardMacro([op], matchMultiOperator);
  });

  var createIfExpression = function(term, name, args) {
    var cases = [];
    var errorMsg = 'arguments to if else in are incorrect, try:\n\nif (condition)\n    then ()\nelse if (another condition)\n    do this ()\nelse\n    otherwise ()';

    if (args.length < 2) {
        return terms.errors.addTermWithMessage(term, errorMsg);
    }

    if ((name[name.length - 1] === 'else') !== (args.length % 2 === 1)) {
        return terms.errors.addTermWithMessage(term, errorMsg);
    }

    for (var n = 0; n + 1 < args.length; n += 2) {
      if (!isAny(args[n]) || !isClosureWithParameters(0)(args[n + 1])) {
        return terms.errors.addTermWithMessage(term, errorMsg);
      }

      var body = args[n + 1].body;
      cases.push({condition: args[n], body: body});
    }

    var elseBody;

    if (args.length % 2 === 1) {
      var body = args[args.length - 1].body;
      elseBody = body;
    }

    return terms.ifExpression(cases, elseBody);
  };

  var matchIfMacro = function (name) {
    if (/^if(ElseIf)*(Else)?$/.test(codegenUtils.concatName(name))) {
      return createIfExpression;
    }
  };

  macros.addWildCardMacro(['if'], matchIfMacro);

  macros.addMacro(['promise'], function(term, name, args) {
    return terms.newPromise({closure: args[0]});
  });

  macros.addMacro(['new'], function(term, name, args) {
    var constructor;

    if (args[0].isSubExpression) {
      constructor = args[0].statements[0];
    } else {
      constructor = args[0];
    }

    return terms.newOperator(constructor);
  });

  var areValidArguments = function () {
    var args = arguments[0];
    var argValidators = Array.prototype.slice.call(arguments, 1);

    if (args && args.length === argValidators.length) {
      return _.all(_.zip(args, argValidators), function (argval) {
        return argval[1](argval[0]);
      });
    } else {
      return false;
    }
  };

  var isClosureWithParameters = function (paramterCount) {
    return function (arg) {
      return arg.isClosure && arg.parameters.length === paramterCount;
    };
  };

  var isAny = function (arg) {
    return arg !== undefined;
  };

  var isDefinition = function (arg) {
    return arg.isDefinition;
  };

  var createForEach = function (term, name, args) {
    if (areValidArguments(args, isAny, isClosureWithParameters(1))) {
      var collection = args[0];
      var block = args[1];
      var body = block.body;

      var itemVariable = block.parameters[0];

      return terms.forEach(collection, itemVariable, block.body);
    } else {
      return terms.errors.addTermWithMessage(term, 'arguments to for each in are incorrect, try:\n\nfor each @(item) in (items)\n    do something with (item)');
    }
  };

  macros.addMacro(['for', 'each', 'in'], createForEach);

  macros.addMacro(['for', 'in'], function (term, name, args) {
    if (areValidArguments(args, isAny, isClosureWithParameters(1))) {
      var collection = args[0];
      var block = args[1];
      var iterator = block.parameters[0];
      var body = block.body;

      return terms.forIn(iterator, collection, block.body);
    } else {
      return terms.errors.addTermWithMessage(term, 'arguments to for in are incorrect, try:\n\nfor @(field) in (object)\n    do something with (field)');
    }
  });

  macros.addMacro(['for'], function(term, name, args) {
    if (areValidArguments(args, isDefinition, isAny, isAny, isClosureWithParameters(0))) {
      var init = args[0];
      var test = args[1];
      var incr = args[2];

      if (!init)
        return errors.addTermWithMessage(args[0], 'expected init, as in (n = 0. ...)');

      if (!test)
        return errors.addTermWithMessage(args[0], 'expected test, as in (... . n < 10. ...)');

      if (!incr)
        return errors.addTermWithMessage(args[0], 'expected incr, as in (... . ... . n = n + 1)');

      return terms.forStatement(init, test, incr, args[3].body);
    } else {
      return terms.errors.addTermWithMessage(term, 'arguments to for are incorrect, try:\n\nfor (n = 0, n < 10, ++n)\n    do something with (n)');
    }
  });

  macros.addMacro(['while'], function(term, name, args) {
    if (areValidArguments(args, isAny, isClosureWithParameters(0))) {
      var test = args[0];
      var statements = args[1].body;

      return terms.whileStatement(test, statements);
    } else {
      return terms.errors.addTermWithMessage(term, 'arguments to while are incorrect, try:\n\nwhile (condition)\n    do something ()');
    }
  });

  macros.addMacro(['with'], function(term, name, args) {
    if (areValidArguments(args, isAny, isClosureWithParameters(0))) {
      return terms.withStatement(args[0], args[1].body);
    } else {
      return terms.errors.addTermWithMessage(term, 'arguments to with are incorrect, try:\n\nwith (object)\n    do something with (field)');
    }
  });

  macros.addMacro(['and'], function (term, name, args) {
    return terms.operator('&&', args);
  });

  macros.addMacro(['or'], function (term, name, args) {
    return terms.operator('||', args);
  });

  macros.addMacro(['not'], function (term, name, args) {
    return terms.operator('!', args);
  });

  macros.addMacro(['return'], function(term, name, args) {
    return terms.returnStatement(args && args[0]);
  });

  macros.addMacro(['throw'], function(term, name, args) {
    if (areValidArguments(args, isAny)) {
      return terms.throwStatement(args[0]);
    } else {
      return terms.errors.addTermWithMessage(term, 'arguments to throw are incorrect, try: @throw error');
    }
  });

  macros.addMacro(['break'], function(term, name, args) {
    return terms.breakStatement();
  });

  macros.addMacro(['continue'], function(term, name, args) {
    return terms.continueStatement();
  });

  macros.addMacro(['try', 'catch'], function (term, name, args) {
    if (areValidArguments(args, isClosureWithParameters(0), isAny, isClosureWithParameters(0))) {
      var body = args[0].body;
      var catchParameter = args[1];
      var catchBody = args[2].body;

      return terms.tryExpression(body, {catchBody: catchBody, catchParameter: catchParameter});
    } else {
      return terms.errors.addTermWithMessage(term, 'arguments to try catch are incorrect, try:\n\ntry\n    something dangerous ()\ncatch (error)\n    handle (error)');
    }
  });

  macros.addMacro(['try', 'catch', 'finally'], function (term, name, args) {
    if (areValidArguments(args, isClosureWithParameters(0), isAny, isClosureWithParameters(0), isClosureWithParameters(0))) {
      var body = args[0].body;
      var catchParameter = args[1];
      var catchBody = args[2].body;
      var finallyBody = args[3].body;

      return terms.tryExpression(body, {catchBody: catchBody, catchParameter: catchParameter, finallyBody: finallyBody});
    } else {
      return terms.errors.addTermWithMessage(term, 'arguments to try catch finally are incorrect, try:\n\ntry\n    something dangerous ()\ncatch (error)\n    handle (error)\nfinally\n    always do this ()');
    }
  });

  macros.addMacro(['try', 'finally'], function (term, name, args) {
    if (areValidArguments(args, isClosureWithParameters(0), isClosureWithParameters(0))) {
      var body = args[0].body;
      var finallyBody = args[1].body;

      return terms.tryExpression(body, {finallyBody: finallyBody});
    } else {
      return terms.errors.addTermWithMessage(term, 'arguments to try finally are incorrect, try:\n\ntry\n    something dangerous ()\nfinally\n    always do this ()');
    }
  });

  macros.addMacro(['nil'], function (term) {
    return terms.nil();
  });

  macros.addMacro(['<-'], function (term) {
    return terms.generator(term.functionArguments[0], term.functionArguments[1]);
  });

  function functionMacro(name, source) {
    macros.addMacro([name], function (term, _, args) {
      var f = terms.moduleConstants.defineAs(
        [name],
        terms.javascript(source.toString()),
        {generated: false}
      );

      if (args) {
        return terms.functionCall(f, args, {couldBeMacro: false, options: true});
      } else {
        return f;
      }
    });
  }

  functionMacro('prototype', prototypeSource._prototype);
  functionMacro('prototypeExtending', prototypeSource.prototypeExtending);

  return macros;
};

},{"../prototype":25,"../terms/codegenUtils":39,"./errors":13,"underscore":110}],20:[function(require,module,exports){
(function() {
    var self = this;
    var _, codegenUtils;
    _ = require("underscore");
    codegenUtils = require("../terms/codegenUtils");
    module.exports = function(terms) {
        var self = this;
        var operatorStack, operatorsInDecreasingPrecedenceOrder, operatorTable, createOperatorCall;
        operatorStack = function() {
            var operators;
            operators = [];
            return {
                push: function(op, popped) {
                    var self = this;
                    popped = popped || [];
                    if (operators.length === 0) {
                        operators.unshift(op);
                        return popped;
                    } else if (!op.precedence || !operators[0].precedence) {
                        if (!op.precedence) {
                            throw new Error(op.name + " cannot be used with other operators");
                        } else if (!operators[0].precedence) {
                            throw new Error(operators[0].name + " cannot be used with other operators");
                        }
                    } else if (op.leftAssociative && op.precedence <= operators[0].precedence) {
                        popped.push(operators.shift());
                        return self.push(op, popped);
                    } else if (op.precedence < operators[0].precedence) {
                        popped.push(operators.shift());
                        return self.push(op, popped);
                    } else {
                        operators.unshift(op);
                        return popped;
                    }
                },
                pop: function() {
                    var self = this;
                    return operators;
                }
            };
        };
        operatorsInDecreasingPrecedenceOrder = function(opsString) {
            var opLines, precedence, operators, gen1_items, gen2_i, line, match, names, assoc, gen3_items, gen4_i, name;
            opLines = opsString.trim().split(/\n/);
            precedence = opLines.length + 1;
            operators = {};
            gen1_items = opLines;
            for (gen2_i = 0; gen2_i < gen1_items.length; ++gen2_i) {
                line = gen1_items[gen2_i];
                match = /\s*((\S+\s+)*)(left|right)/.exec(line);
                names = match[1].trim().split(/\s+/);
                assoc = match[3];
                --precedence;
                gen3_items = names;
                for (gen4_i = 0; gen4_i < gen3_items.length; ++gen4_i) {
                    name = gen3_items[gen4_i];
                    operators[name] = {
                        name: name,
                        leftAssociative: assoc === "left",
                        precedence: precedence
                    };
                }
            }
            return operators;
        };
        operatorTable = function() {
            var table;
            table = operatorsInDecreasingPrecedenceOrder("\n            / * % left\n            - + left\n            << >> >>> left\n            > >= < <= left\n            == != left\n            & left\n            ^^ left\n            | left\n            && @and left\n            || @or left\n            <- left\n        ");
            return {
                findOp: function(op) {
                    var self = this;
                    if (table.hasOwnProperty(op)) {
                        return table[op];
                    } else {
                        return {
                            name: op
                        };
                    }
                }
            };
        }();
        createOperatorCall = function(name, arguments) {
            return terms.functionCall(name, arguments);
        };
        return terms.term({
            constructor: function(complexExpression) {
                var self = this;
                self.arguments = [ complexExpression ];
                return self.name = [];
            },
            addOperatorExpression: function(operator, expression) {
                var self = this;
                self.name.push(operator);
                return self.arguments.push(expression);
            },
            expression: function() {
                var self = this;
                var operands, operators, applyOperators, n, poppedOps;
                if (self.arguments.length > 1) {
                    operands = [ self.arguments[0].expression() ];
                    operators = operatorStack();
                    applyOperators = function(ops) {
                        var gen5_items, gen6_i, op, right, left, name;
                        gen5_items = ops;
                        for (gen6_i = 0; gen6_i < gen5_items.length; ++gen6_i) {
                            op = gen5_items[gen6_i];
                            right = operands.shift();
                            left = operands.shift();
                            name = terms.variable([ codegenUtils.normaliseOperatorName(op.name) ], {
                                couldBeMacro: false
                            });
                            operands.unshift(createOperatorCall(name, [ left, right ]));
                        }
                        return void 0;
                    };
                    for (n = 0; n < self.name.length; ++n) {
                        poppedOps = operators.push(operatorTable.findOp(self.name[n]));
                        applyOperators(poppedOps);
                        operands.unshift(self.arguments[n + 1].expression());
                    }
                    applyOperators(operators.pop());
                    return operands[0];
                } else {
                    return self.arguments[0].expression();
                }
            },
            hashEntry: function() {
                var self = this;
                if (self.arguments.length === 1) {
                    return self.arguments[0].hashEntry();
                } else {
                    return terms.errors.addTermWithMessage(self, "cannot be used as a hash entry");
                }
            },
            definition: function(source, gen7_options) {
                var self = this;
                var assignment;
                assignment = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "assignment") && gen7_options.assignment !== void 0 ? gen7_options.assignment : false;
                var object, parms;
                if (self.arguments.length > 1) {
                    object = self.arguments[0].expression();
                    parms = function() {
                        var gen8_results, gen9_items, gen10_i, arg;
                        gen8_results = [];
                        gen9_items = self.arguments.slice(1);
                        for (gen10_i = 0; gen10_i < gen9_items.length; ++gen10_i) {
                            arg = gen9_items[gen10_i];
                            gen8_results.push(arg.expression().parameter());
                        }
                        return gen8_results;
                    }();
                    return terms.definition(terms.fieldReference(object, self.name), source.blockify(parms, []), {
                        assignment: assignment
                    });
                } else {
                    return self.arguments[0].definition(source, {
                        assignment: assignment
                    });
                }
            }
        });
    };
}).call(this);
},{"../terms/codegenUtils":39,"underscore":110}],21:[function(require,module,exports){
(function() {
    var self = this;
    var ms, createParserContext, createDynamicLexer, parser, jisonLexer;
    ms = require("../memorystream");
    createParserContext = require("./parserContext").createParserContext;
    createDynamicLexer = require("./dynamicLexer").createDynamicLexer;
    parser = require("./jisonParser").parser;
    jisonLexer = parser.lexer;
    exports.createParser = function(gen1_options) {
        var self = this;
        var terms, filename;
        terms = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "terms") && gen1_options.terms !== void 0 ? gen1_options.terms : terms;
        filename = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "filename") && gen1_options.filename !== void 0 ? gen1_options.filename : void 0;
        return {
            parse: function(source) {
                var self = this;
                var dynamicLexer, parserContext;
                dynamicLexer = createDynamicLexer({
                    nextLexer: jisonLexer
                });
                parserContext = createParserContext({
                    terms: terms,
                    filename: filename
                });
                parserContext.lexer = dynamicLexer;
                jisonLexer.yy = parserContext;
                parser.yy = parserContext;
                parser.lexer = dynamicLexer;
                return parser.parse(source);
            },
            errors: terms.errors,
            lex: function(source) {
                var self = this;
                var tokens, lexer, parserContext, tokenIndex, token, text, lexerToken;
                tokens = [];
                lexer = createDynamicLexer({
                    nextLexer: jisonLexer,
                    source: source
                });
                parserContext = createParserContext({
                    terms: terms
                });
                parserContext.lexer = lexer;
                jisonLexer.yy = parserContext;
                tokenIndex = lexer.lex();
                while (tokenIndex !== 1) {
                    token = function() {
                        if (typeof tokenIndex === "number") {
                            return parser.terminals_[tokenIndex];
                        } else if (tokenIndex === "") {
                            return undefined;
                        } else {
                            return tokenIndex;
                        }
                    }();
                    text = function() {
                        if (lexer.yytext === "") {
                            return undefined;
                        } else if (lexer.yytext === token) {
                            return undefined;
                        } else {
                            return lexer.yytext;
                        }
                    }();
                    lexerToken = function() {
                        if (text) {
                            return [ token, text ];
                        } else {
                            return [ token ];
                        }
                    }();
                    tokens.push(lexerToken);
                    tokenIndex = lexer.lex();
                }
                return tokens;
            }
        };
    };
}).call(this);
},{"../memorystream":5,"./dynamicLexer":12,"./jisonParser":17,"./parserContext":22}],22:[function(require,module,exports){
(function() {
    var self = this;
    var object, _, createIndentStack, createInterpolation, createParserContext;
    object = require("./runtime").object;
    _ = require("underscore");
    createIndentStack = require("./indentStack").createIndentStack;
    createInterpolation = require("./interpolation").createInterpolation;
    exports.createParserContext = createParserContext = function(gen1_options) {
        var terms, filename;
        terms = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "terms") && gen1_options.terms !== void 0 ? gen1_options.terms : void 0;
        filename = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "filename") && gen1_options.filename !== void 0 ? gen1_options.filename : void 0;
        return {
            terms: terms,
            indentStack: createIndentStack(),
            tokens: function(tokens) {
                var self = this;
                self.lexer.tokens = tokens;
                return tokens.shift();
            },
            setIndentation: function(text) {
                var self = this;
                return self.indentStack.setIndentation(text);
            },
            unsetIndentation: function(token) {
                var self = this;
                var tokens;
                tokens = self.indentStack.unsetIndentation();
                tokens.push(token);
                return self.tokens(tokens);
            },
            indentation: function(text) {
                var self = this;
                var tokens;
                tokens = self.indentStack.tokensForNewLine(text);
                return self.tokens(tokens);
            },
            eof: function() {
                var self = this;
                return self.tokens(self.indentStack.tokensForEof());
            },
            interpolation: createInterpolation(),
            lexOperator: function(parserContext, op) {
                var self = this;
                if (/^!\.|\^!$/.test(op)) {
                    return parserContext.tokens([ op[0], op[1] ]);
                } else if (/^\^!\.$/.test(op)) {
                    return parserContext.tokens([ op[0], op[1], op[2] ]);
                } else if (/^\^\.$/.test(op)) {
                    return parserContext.tokens([ op[0], op[1] ]);
                } else if (/^(=>|\.\.\.|@:|[#@:!?^,.=;]|:=)$/.test(op)) {
                    return op;
                } else {
                    return "operator";
                }
            },
            loc: function(term, location) {
                var self = this;
                var loc;
                loc = {
                    firstLine: location.first_line,
                    lastLine: location.last_line,
                    firstColumn: location.first_column,
                    lastColumn: location.last_column,
                    filename: filename
                };
                term.setLocation(loc);
                return term;
            },
            unindentBy: function(string, columns) {
                var self = this;
                var r;
                r = new RegExp("\\n {" + columns + "}", "g");
                return string.replace(r, "\n");
            },
            normaliseString: function(s) {
                var self = this;
                return s.substring(1, s.length - 1).replace(/''/g, "'").replace("\r", "");
            },
            parseRegExp: function(s) {
                var self = this;
                var match;
                match = /^r\/((\n|.)*)\/([^\/]*)$/.exec(s);
                return {
                    pattern: match[1].replace(/\\\//g, "/").replace(/\n/, "\\n"),
                    options: match[3]
                };
            },
            actualCharacters: [ [ /\r/g, "" ], [ /\\\\/g, "\\" ], [ /\\b/g, "\b" ], [ /\\f/g, "\f" ], [ /\\n/g, "\n" ], [ /\\0/g, "\x00" ], [ /\\r/g, "\r" ], [ /\\t/g, "	" ], [ /\\v/g, "" ], [ /\\'/g, "'" ], [ /\\"/g, '"' ] ],
            normaliseInterpolatedString: function(s) {
                var self = this;
                var gen2_items, gen3_i, mapping;
                gen2_items = self.actualCharacters;
                for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
                    mapping = gen2_items[gen3_i];
                    s = s.replace(mapping[0], mapping[1]);
                }
                return s;
            },
            compressInterpolatedStringComponents: function(components) {
                var self = this;
                var compressedComponents, lastString, gen4_items, gen5_i, component;
                compressedComponents = [];
                lastString = void 0;
                gen4_items = components;
                for (gen5_i = 0; gen5_i < gen4_items.length; ++gen5_i) {
                    component = gen4_items[gen5_i];
                    if (!lastString && component.isString) {
                        lastString = component;
                        compressedComponents.push(lastString);
                    } else if (lastString && component.isString) {
                        lastString.string = lastString.string + component.string;
                    } else {
                        lastString = void 0;
                        compressedComponents.push(component);
                    }
                }
                return compressedComponents;
            },
            unindentStringComponentsBy: function(components, columns) {
                var self = this;
                return _.map(components, function(component) {
                    if (component.isString) {
                        return self.terms.string(self.unindentBy(component.string, columns));
                    } else {
                        return component;
                    }
                });
            },
            separateExpressionComponentsWithStrings: function(components) {
                var self = this;
                var separatedComponents, lastComponentWasExpression, gen6_items, gen7_i, component;
                separatedComponents = [];
                lastComponentWasExpression = false;
                gen6_items = components;
                for (gen7_i = 0; gen7_i < gen6_items.length; ++gen7_i) {
                    component = gen6_items[gen7_i];
                    if (lastComponentWasExpression && !component.isString) {
                        separatedComponents.push(self.terms.string(""));
                    }
                    separatedComponents.push(component);
                    lastComponentWasExpression = !component.isString;
                }
                return separatedComponents;
            },
            normaliseStringComponentsUnindentingBy: function(components, indentColumns) {
                var self = this;
                return self.separateExpressionComponentsWithStrings(self.compressInterpolatedStringComponents(self.unindentStringComponentsBy(components, indentColumns)));
            }
        };
    };
}).call(this);
},{"./indentStack":15,"./interpolation":16,"./runtime":23,"underscore":110}],23:[function(require,module,exports){
(function() {
    var self = this;
    var constructor;
    constructor = function(members) {
        if (members instanceof Function) {
            return function() {
                var self = this;
                members.call(self);
                return undefined;
            };
        } else {
            return function() {
                var self = this;
                var member;
                for (member in members) {
                    (function(member) {
                        if (members.hasOwnProperty(member)) {
                            self[member] = members[member];
                        }
                    })(member);
                }
                return void 0;
            };
        }
    };
    exports.object = function(members) {
        var self = this;
        var c;
        c = constructor(members);
        return new c();
    };
    exports.objectExtending = function(base, members) {
        var self = this;
        var c;
        c = constructor(members);
        c.prototype = base;
        return new c();
    };
}).call(this);
},{}],24:[function(require,module,exports){
(function() {
    var self = this;
    var codegenUtils;
    codegenUtils = require("../terms/codegenUtils");
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(operator, expression) {
                var self = this;
                self.operator = operator;
                return self.expr = expression;
            },
            expression: function() {
                var self = this;
                var name, foundMacro;
                name = codegenUtils.normaliseOperatorName(self.operator);
                foundMacro = terms.macros.findMacro([ name ]);
                if (foundMacro) {
                    return foundMacro(self, [ self.operator ], [ self.expr ]);
                } else {
                    return terms.functionCall(terms.variable([ name ]), [ self.expr ]);
                }
            },
            hashEntry: function() {
                var self = this;
                return terms.errors.addTermWithMessage(self, "cannot be a hash entry");
            }
        });
    };
}).call(this);
},{"../terms/codegenUtils":39}],25:[function(require,module,exports){
var prototype = exports._prototype = function(p) {
  function constructor() {}

  p = p || {};

  constructor.prototype = p;

  function derive(derived) {
    var o = new constructor();

    if (derived) {
      var keys = Object.keys(derived);

      for (var n = 0; n < keys.length; n++) {
        var key = keys[n];
        o[key] = derived[key];
      }
    }

    return o;
  }

  derive.prototype = p;

  return derive;
}

exports.prototypeExtending = function(p, obj) {
  return prototype(prototype(p.prototype)(obj));
};

},{}],26:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var resolve, createResolve;
        resolve = terms.term({
            constructor: function(term) {
                var self = this;
                self.isResolve = true;
                return self.resolve = term.promisify();
            },
            makeAsyncCallWithCallback: function(onFulfilled, onRejected) {
                var self = this;
                var args;
                args = [];
                if (onFulfilled && onFulfilled !== terms.onFulfilledFunction) {
                    args.push(onFulfilled);
                }
                if (args.length > 0) {
                    return terms.methodCall(self.resolve, [ "then" ], args);
                } else {
                    return self.resolve;
                }
            }
        });
        return createResolve = function(term, gen1_options) {
            var alreadyPromise;
            alreadyPromise = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "alreadyPromise") && gen1_options.alreadyPromise !== void 0 ? gen1_options.alreadyPromise : false;
            var asyncResult;
            asyncResult = terms.asyncResult();
            return terms.subStatements([ terms.definition(asyncResult, resolve(term, {
                alreadyPromise: alreadyPromise
            }), {
                async: true
            }), asyncResult ]);
        };
    };
}).call(this);
},{}],27:[function(require,module,exports){
(function() {
    var self = this;
    var UniqueNames, SymbolScope;
    UniqueNames = function() {
        var self = this;
        var unique;
        unique = 0;
        self.generateName = function(name) {
            var self = this;
            unique = unique + 1;
            return "gen" + unique + "_" + name;
        };
        return void 0;
    };
    SymbolScope = exports.SymbolScope = function(parentScope, gen1_options) {
        var self = this;
        var uniqueNames;
        uniqueNames = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "uniqueNames") && gen1_options.uniqueNames !== void 0 ? gen1_options.uniqueNames : new UniqueNames();
        var variables, tags;
        variables = {};
        tags = {};
        self.define = function(name) {
            var self = this;
            return variables[name] = true;
        };
        self.generateVariable = function(name) {
            var self = this;
            return uniqueNames.generateName(name);
        };
        self.isDefined = function(name) {
            var self = this;
            return self.isDefinedInThisScope(name) || parentScope && parentScope.isDefined(name);
        };
        self.isDefinedInThisScope = function(name) {
            var self = this;
            return variables.hasOwnProperty(name);
        };
        self.subScope = function() {
            var self = this;
            return new SymbolScope(self, {
                uniqueNames: uniqueNames
            });
        };
        self.defineWithTag = function(name, tag) {
            var self = this;
            self.define(name);
            return tags[tag] = name;
        };
        self.findTag = function(tag) {
            var self = this;
            return tags[tag] || parentScope && parentScope.findTag(tag);
        };
        self.names = function() {
            var self = this;
            return function() {
                var gen2_results, gen3_items, gen4_i, key;
                gen2_results = [];
                gen3_items = Object.keys(variables);
                for (gen4_i = 0; gen4_i < gen3_items.length; ++gen4_i) {
                    key = gen3_items[gen4_i];
                    (function(key) {
                        if (variables.hasOwnProperty(key)) {
                            return gen2_results.push(key);
                        }
                    })(key);
                }
                return gen2_results;
            }();
        };
        return void 0;
    };
}).call(this);
},{}],28:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(args) {
                var self = this;
                self.isArgumentList = true;
                return self.args = args;
            },
            arguments: function() {
                var self = this;
                return self.args;
            }
        });
    };
}).call(this);
},{}],29:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return {
            asyncifyArguments: function(arguments, optionalArguments) {
                var self = this;
                var gen1_items, gen2_i, arg, gen3_items, gen4_i, optArg;
                gen1_items = arguments;
                for (gen2_i = 0; gen2_i < gen1_items.length; ++gen2_i) {
                    arg = gen1_items[gen2_i];
                    arg.asyncify();
                }
                gen3_items = optionalArguments;
                for (gen4_i = 0; gen4_i < gen3_items.length; ++gen4_i) {
                    optArg = gen3_items[gen4_i];
                    optArg.asyncify();
                }
                return void 0;
            },
            asyncifyBody: function(body, args) {
                var self = this;
                if (body) {
                    return terms.closure(args || [], body);
                } else {
                    return terms.nil();
                }
            },
            optionalArguments: function(args) {
                var self = this;
                return function() {
                    var gen5_results, gen6_items, gen7_i, arg;
                    gen5_results = [];
                    gen6_items = args;
                    for (gen7_i = 0; gen7_i < gen6_items.length; ++gen7_i) {
                        arg = gen6_items[gen7_i];
                        (function(arg) {
                            if (arg.isDefinition || arg.isHashEntry) {
                                return gen5_results.push(arg.hashEntry());
                            }
                        })(arg);
                    }
                    return gen5_results;
                }();
            },
            positionalArguments: function(args) {
                var self = this;
                return function() {
                    var gen8_results, gen9_items, gen10_i, arg;
                    gen8_results = [];
                    gen9_items = args;
                    for (gen10_i = 0; gen10_i < gen9_items.length; ++gen10_i) {
                        arg = gen9_items[gen10_i];
                        (function(arg) {
                            if (!(arg.isDefinition || arg.isHashEntry)) {
                                return gen8_results.push(arg);
                            }
                        })(arg);
                    }
                    return gen8_results;
                }();
            }
        };
    };
}).call(this);
},{}],30:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function() {
                var self = this;
                return self.isAsyncArgument = true;
            },
            arguments: function() {
                var self = this;
                return void 0;
            }
        });
    };
}).call(this);
},{}],31:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var asyncCallback;
        return asyncCallback = function(body, gen1_options) {
            var resultVariable;
            resultVariable = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "resultVariable") && gen1_options.resultVariable !== void 0 ? gen1_options.resultVariable : void 0;
            var params;
            params = function() {
                if (resultVariable) {
                    return [ resultVariable ];
                } else {
                    return [];
                }
            }();
            return terms.closure(params, body, {
                isNewScope: false
            });
        };
    };
}).call(this);
},{}],32:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var asyncResult;
        return asyncResult = function() {
            var resultVariable;
            resultVariable = terms.generatedVariable([ "async", "result" ]);
            resultVariable.isAsyncResult = true;
            return resultVariable;
        };
    };
}).call(this);
},{}],33:[function(require,module,exports){
(function() {
    var self = this;
    var _, codegenUtils, statementsUtils;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    statementsUtils = require("./statementsUtils");
    module.exports = function(terms) {
        var self = this;
        var createCallbackWithStatements, putStatementsInCallbackForNextAsyncCall, asyncStatements;
        createCallbackWithStatements = function(callbackStatements, gen1_options) {
            var resultVariable, forceAsync, containsContinuation;
            resultVariable = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "resultVariable") && gen1_options.resultVariable !== void 0 ? gen1_options.resultVariable : void 0;
            forceAsync = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "forceAsync") && gen1_options.forceAsync !== void 0 ? gen1_options.forceAsync : false;
            containsContinuation = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "containsContinuation") && gen1_options.containsContinuation !== void 0 ? gen1_options.containsContinuation : containsContinuation;
            var asyncStmts;
            if (callbackStatements.length === 1 && callbackStatements[0].isAsyncResult) {
                return terms.onFulfilledFunction;
            } else {
                asyncStmts = putStatementsInCallbackForNextAsyncCall(callbackStatements, {
                    forceAsync: forceAsync,
                    forceNotAsync: true,
                    definitions: []
                });
                return terms.asyncCallback(asyncStmts, {
                    resultVariable: resultVariable
                });
            }
        };
        putStatementsInCallbackForNextAsyncCall = function(statements, gen2_options) {
            var forceAsync, forceNotAsync, definitions;
            forceAsync = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "forceAsync") && gen2_options.forceAsync !== void 0 ? gen2_options.forceAsync : false;
            forceNotAsync = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "forceNotAsync") && gen2_options.forceNotAsync !== void 0 ? gen2_options.forceNotAsync : false;
            definitions = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "definitions") && gen2_options.definitions !== void 0 ? gen2_options.definitions : void 0;
            var containsContinuation, n, gen3_forResult;
            containsContinuation = function() {
                if (statements.length > 0) {
                    return function() {
                        var gen4_results, gen5_items, gen6_i, stmt;
                        gen4_results = [];
                        gen5_items = statements;
                        for (gen6_i = 0; gen6_i < gen5_items.length; ++gen6_i) {
                            stmt = gen5_items[gen6_i];
                            gen4_results.push(stmt.containsContinuation());
                        }
                        return gen4_results;
                    }().reduce(function(l, r) {
                        return l || r;
                    });
                } else {
                    return false;
                }
            }();
            for (n = 0; n < statements.length; ++n) {
                gen3_forResult = void 0;
                if (function(n) {
                    var statement, asyncStatement, firstStatements;
                    statement = statements[n];
                    asyncStatement = statement.makeAsyncWithCallbackForResult(function(resultVariable) {
                        return createCallbackWithStatements(statements.slice(n + 1), {
                            resultVariable: resultVariable,
                            forceAsync: forceAsync,
                            containsContinuation: containsContinuation
                        });
                    });
                    if (asyncStatement) {
                        firstStatements = statements.slice(0, n);
                        firstStatements.push(asyncStatement);
                        gen3_forResult = terms.statements(firstStatements, {
                            async: !forceNotAsync,
                            definitions: []
                        });
                        return true;
                    }
                }(n)) {
                    return gen3_forResult;
                }
            }
            return terms.statements(statements, {
                async: forceAsync,
                definitions: definitions
            });
        };
        return asyncStatements = function(statements, gen7_options) {
            var forceAsync;
            forceAsync = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "forceAsync") && gen7_options.forceAsync !== void 0 ? gen7_options.forceAsync : false;
            var definitions, serialisedStatements, stmts;
            definitions = statementsUtils.definitions(statements);
            serialisedStatements = statementsUtils.serialiseStatements(statements);
            stmts = putStatementsInCallbackForNextAsyncCall(serialisedStatements, {
                forceAsync: forceAsync,
                definitions: definitions
            });
            if (stmts.isAsync) {
                return stmts.promisify({
                    definitions: definitions,
                    statements: true
                });
            } else {
                return stmts;
            }
        };
    };
}).call(this);
},{"./codegenUtils":39,"./statementsUtils":84,"underscore":110}],34:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(cg) {
        var self = this;
        return cg.term({
            constructor: function(value) {
                var self = this;
                self.boolean = value;
                return self.isBoolean = true;
            },
            generate: function(scope) {
                var self = this;
                return self.code(function() {
                    if (self.boolean) {
                        return "true";
                    } else {
                        return "false";
                    }
                }());
            }
        });
    };
}).call(this);
},{}],35:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function() {
                var self = this;
                return self.isBreak = true;
            },
            generateStatement: function(scope) {
                var self = this;
                return self.code("break;");
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return self;
            }
        });
    };
}).call(this);
},{}],36:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function() {
                var self = this;
                return self.isCallback = true;
            },
            parameter: function() {
                var self = this;
                return self;
            },
            generate: function(scope) {
                var self = this;
                return terms.callbackFunction.generate(scope);
            }
        });
    };
}).call(this);
},{}],37:[function(require,module,exports){
(function() {
    var self = this;
    var _, codegenUtils, blockParameters, selfParameter, splatParameters, parseSplatParameters, takeFromWhile;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        var optionalParameters, optional, asyncParameters, containsSplatParameter, createSplatParameterStrategyFor, createOptionalParameterStrategyFor;
        optionalParameters = function(optionalParameters, next) {
            if (optionalParameters.length > 0) {
                return {
                    options: terms.generatedVariable([ "options" ]),
                    parameters: function() {
                        var self = this;
                        return next.parameters().concat([ self.options ]);
                    },
                    statements: function() {
                        var self = this;
                        var optionalStatements;
                        optionalStatements = _.map(optionalParameters, function(parm) {
                            return terms.definition(terms.variable(parm.field), optional(self.options, parm.field, parm.value), {
                                shadow: true
                            });
                        });
                        return optionalStatements.concat(next.statements());
                    },
                    hasOptionals: true
                };
            } else {
                return next;
            }
        };
        optional = terms.term({
            constructor: function(options, name, defaultValue) {
                var self = this;
                self.options = options;
                self.name = name;
                return self.defaultValue = defaultValue;
            },
            properDefaultValue: function() {
                var self = this;
                if (self.defaultValue === void 0) {
                    return terms.variable([ "undefined" ]);
                } else {
                    return self.defaultValue;
                }
            },
            generate: function(scope) {
                var self = this;
                return self.code("(", self.options.generate(scope), "&&", self.options.generate(scope), ".hasOwnProperty('" + codegenUtils.concatName(self.name) + "')&&", self.options.generate(scope), "." + codegenUtils.concatName(self.name) + "!==void 0)?", self.options.generate(scope), "." + codegenUtils.concatName(self.name) + ":", self.properDefaultValue().generate(scope));
            }
        });
        asyncParameters = function(closure, next) {
            return {
                parameters: function() {
                    var self = this;
                    return next.parameters();
                },
                statements: function() {
                    var self = this;
                    return next.statements();
                }
            };
        };
        containsSplatParameter = function(closure) {
            return _.any(closure.parameters, function(parameter) {
                return parameter.isSplat;
            });
        };
        createSplatParameterStrategyFor = function(closure) {
            var nonSplatParams, before, splat, after;
            nonSplatParams = takeFromWhile(closure.parameters, function(parameter) {
                return !parameter.isSplat;
            });
            before = nonSplatParams.slice(0, nonSplatParams.length - 1);
            splat = nonSplatParams[nonSplatParams.length - 1];
            after = closure.parameters.slice(nonSplatParams.length + 1);
            return terms.closureParameterStrategies.splatStrategy({
                before: before,
                splat: splat,
                after: after
            });
        };
        createOptionalParameterStrategyFor = function(closure) {
            return terms.closureParameterStrategies.optionalStrategy({
                before: closure.parameters,
                options: closure.optionalParameters
            });
        };
        return terms.term({
            constructor: function(parameters, body, gen1_options) {
                var self = this;
                var returnLastStatement, redefinesSelf, async, definesModuleConstants, returnPromise, callsFulfillOnReturn, isNewScope;
                returnLastStatement = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "returnLastStatement") && gen1_options.returnLastStatement !== void 0 ? gen1_options.returnLastStatement : true;
                redefinesSelf = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "redefinesSelf") && gen1_options.redefinesSelf !== void 0 ? gen1_options.redefinesSelf : false;
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                definesModuleConstants = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "definesModuleConstants") && gen1_options.definesModuleConstants !== void 0 ? gen1_options.definesModuleConstants : false;
                returnPromise = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "returnPromise") && gen1_options.returnPromise !== void 0 ? gen1_options.returnPromise : false;
                callsFulfillOnReturn = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "callsFulfillOnReturn") && gen1_options.callsFulfillOnReturn !== void 0 ? gen1_options.callsFulfillOnReturn : false;
                isNewScope = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "isNewScope") && gen1_options.isNewScope !== void 0 ? gen1_options.isNewScope : true;
                self.isBlock = true;
                self.isClosure = true;
                self.isNewScope = isNewScope;
                self.setParameters(parameters);
                self.body = function() {
                    if (returnPromise) {
                        return body.promisify({
                            statements: true
                        });
                    } else {
                        return body;
                    }
                }();
                self.redefinesSelf = redefinesSelf;
                self.makeAsync(async || self.body.isAsync);
                self.returnLastStatement = returnLastStatement;
                self.definesModuleConstants = definesModuleConstants;
                return self.callsFulfillOnReturn = callsFulfillOnReturn;
            },
            blockify: function(parameters, gen2_options) {
                var self = this;
                var returnPromise, redefinesSelf;
                returnPromise = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "returnPromise") && gen2_options.returnPromise !== void 0 ? gen2_options.returnPromise : false;
                redefinesSelf = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "redefinesSelf") && gen2_options.redefinesSelf !== void 0 ? gen2_options.redefinesSelf : void 0;
                self.setParameters(parameters);
                if (returnPromise) {
                    self.body = self.body.promisify({
                        statements: true
                    });
                }
                if (redefinesSelf !== void 0) {
                    self.redefinesSelf = redefinesSelf;
                }
                return self;
            },
            setParameters: function(parameters) {
                var self = this;
                self.parameters = terms.argumentUtils.positionalArguments(parameters);
                return self.optionalParameters = terms.argumentUtils.optionalArguments(parameters);
            },
            makeAsync: function(a) {
                var self = this;
                return self.isAsync = a;
            },
            scopify: function() {
                var self = this;
                if (self.parameters.length === 0 && self.optionalParameters.length === 0 && !self.notScope) {
                    if (self.body.returnsPromise) {
                        return terms.resolve(terms.functionCall(self, []));
                    } else {
                        return terms.scope(self.body.statements, {
                            async: false
                        });
                    }
                } else {
                    return self;
                }
            },
            parameterTransforms: function() {
                var self = this;
                var optionals, splat;
                if (self._parameterTransforms) {
                    return self._parameterTransforms;
                }
                optionals = optionalParameters(self.optionalParameters, selfParameter(terms, self.redefinesSelf, blockParameters(self)));
                splat = splatParameters(terms, optionals);
                if (optionals.hasOptionals && splat.hasSplat) {
                    terms.errors.addTermsWithMessage(self.optionalParameters, "cannot have splat parameters with optional parameters");
                }
                return self._parameterTransforms = splat;
            },
            transformedStatements: function() {
                var self = this;
                return terms.statements(self.parameterTransforms().statements());
            },
            transformedParameters: function() {
                var self = this;
                return self.parameterTransforms().parameters();
            },
            defineParameters: function(scope, parameters) {
                var self = this;
                var gen3_items, gen4_i, parameter;
                gen3_items = parameters;
                for (gen4_i = 0; gen4_i < gen3_items.length; ++gen4_i) {
                    parameter = gen3_items[gen4_i];
                    parameter.declare(scope);
                }
                return void 0;
            },
            generate: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    var parametersStrategy, definedParameters, bodyScope;
                    parametersStrategy = self.parametersStrategy();
                    self.rewriteResultTermToReturn();
                    buffer.write("function(");
                    definedParameters = parametersStrategy.definedParameters();
                    parametersStrategy.generateJavaScriptParameters(buffer, scope);
                    buffer.write("){");
                    bodyScope = scope.subScope();
                    self.defineParameters(bodyScope, definedParameters);
                    if (self.definesModuleConstants) {
                        buffer.write(terms.moduleConstants.generate(scope));
                    }
                    buffer.write(self.generateSelfAssignment());
                    parametersStrategy.generateJavaScriptParameterStatements(buffer, scope, terms.variable([ "arguments" ]));
                    buffer.write(self.body.generateStatements(bodyScope, {
                        isScope: self.isNewScope
                    }));
                    return buffer.write("}");
                });
            },
            generateFunction: function(scope) {
                var self = this;
                return self.code("(", self.generate(scope), ")");
            },
            generateSelfAssignment: function() {
                var self = this;
                if (self.redefinesSelf) {
                    return "var self=this;";
                } else {
                    return "";
                }
            },
            rewriteResultTermToReturn: function() {
                var self = this;
                if (self.returnLastStatement) {
                    return self.body.rewriteLastStatementToReturn({
                        async: self.callsFulfillOnReturn
                    });
                }
            },
            asyncify: function() {
                var self = this;
                self.body.asyncify({
                    returnCallToContinuation: self.returnLastStatement
                });
                return self.makeAsync(true);
            },
            parametersStrategy: function() {
                var self = this;
                var strategy;
                strategy = function() {
                    if (containsSplatParameter(self)) {
                        return createSplatParameterStrategyFor(self);
                    } else if (self.optionalParameters.length > 0) {
                        return createOptionalParameterStrategyFor(self);
                    } else {
                        return terms.closureParameterStrategies.normalStrategy(self.parameters);
                    }
                }();
                return terms.closureParameterStrategies.functionStrategy(strategy);
            }
        });
    };
    blockParameters = function(block) {
        return {
            parameters: function() {
                var self = this;
                return block.parameters;
            },
            statements: function() {
                var self = this;
                return block.body.statements;
            }
        };
    };
    selfParameter = function(cg, redefinesSelf, next) {
        if (redefinesSelf) {
            return {
                parameters: function() {
                    var self = this;
                    return next.parameters();
                },
                statements: function() {
                    var self = this;
                    return [ cg.definition(cg.selfExpression(), cg.variable([ "this" ]), {
                        shadow: true
                    }) ].concat(next.statements());
                }
            };
        } else {
            return next;
        }
    };
    splatParameters = function(cg, next) {
        var parsedSplatParameters;
        parsedSplatParameters = parseSplatParameters(cg, next.parameters());
        return {
            parameters: function() {
                var self = this;
                return parsedSplatParameters.firstParameters;
            },
            statements: function() {
                var self = this;
                var splat, lastIndex, splatParameter, lastParameterStatements, n, param;
                splat = parsedSplatParameters;
                if (splat.splatParameter) {
                    lastIndex = "arguments.length";
                    if (splat.lastParameters.length > 0) {
                        lastIndex = lastIndex + " - " + splat.lastParameters.length;
                    }
                    splatParameter = cg.definition(splat.splatParameter, cg.javascript("Array.prototype.slice.call(arguments, " + splat.firstParameters.length + ", " + lastIndex + ")"), {
                        shadow: true
                    });
                    lastParameterStatements = [ splatParameter ];
                    for (n = 0; n < splat.lastParameters.length; ++n) {
                        param = splat.lastParameters[n];
                        lastParameterStatements.push(cg.definition(param, cg.javascript("arguments[arguments.length - " + (splat.lastParameters.length - n) + "]"), {
                            shadow: true
                        }));
                    }
                    return lastParameterStatements.concat(next.statements());
                } else {
                    return next.statements();
                }
            },
            hasSplat: parsedSplatParameters.splatParameter
        };
    };
    parseSplatParameters = module.exports.parseSplatParameters = function(cg, parameters) {
        var self = this;
        var firstParameters, maybeSplat, splatParam, lastParameters;
        firstParameters = takeFromWhile(parameters, function(param) {
            return !param.isSplat;
        });
        maybeSplat = parameters[firstParameters.length];
        splatParam = void 0;
        lastParameters = void 0;
        if (maybeSplat && maybeSplat.isSplat) {
            splatParam = firstParameters.pop();
            splatParam.shadow = true;
            lastParameters = parameters.slice(firstParameters.length + 2);
            lastParameters = _.filter(lastParameters, function(param) {
                if (param.isSplat) {
                    cg.errors.addTermWithMessage(param, "cannot have more than one splat parameter");
                    return false;
                } else {
                    return true;
                }
            });
        } else {
            lastParameters = [];
        }
        return {
            firstParameters: firstParameters,
            splatParameter: splatParam,
            lastParameters: lastParameters
        };
    };
    takeFromWhile = function(list, canTake) {
        var takenList, gen5_items, gen6_i, gen7_forResult;
        takenList = [];
        gen5_items = list;
        for (gen6_i = 0; gen6_i < gen5_items.length; ++gen6_i) {
            gen7_forResult = void 0;
            if (function(gen6_i) {
                var item;
                item = gen5_items[gen6_i];
                if (canTake(item)) {
                    takenList.push(item);
                } else {
                    gen7_forResult = takenList;
                    return true;
                }
            }(gen6_i)) {
                return gen7_forResult;
            }
        }
        return takenList;
    };
}).call(this);
},{"./codegenUtils":39,"underscore":110}],38:[function(require,module,exports){
(function() {
    var self = this;
    var _, codegenUtils;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        return {
            functionStrategy: function(strategy) {
                var self = this;
                return {
                    strategy: strategy,
                    generateJavaScriptParameters: function(buffer, scope) {
                        var self = this;
                        return codegenUtils.writeToBufferWithDelimiter(self.strategy.functionParameters(), ",", buffer, scope);
                    },
                    generateJavaScriptParameterStatements: function(buffer, scope, args) {
                        var self = this;
                        return self.strategy.generateJavaScriptParameterStatements(buffer, scope, args);
                    },
                    functionParameters: function() {
                        var self = this;
                        return strategy.functionParameters();
                    },
                    definedParameters: function() {
                        var self = this;
                        return strategy.definedParameters();
                    }
                };
            },
            normalStrategy: function(parameters) {
                var self = this;
                return {
                    parameters: parameters,
                    functionParameters: function() {
                        var self = this;
                        return self.parameters;
                    },
                    generateJavaScriptParameterStatements: function(buffer, scope, args) {
                        var self = this;
                        return void 0;
                    },
                    definedParameters: function() {
                        var self = this;
                        return self.parameters;
                    }
                };
            },
            splatStrategy: function(gen1_options) {
                var self = this;
                var before, splat, after;
                before = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "before") && gen1_options.before !== void 0 ? gen1_options.before : void 0;
                splat = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "splat") && gen1_options.splat !== void 0 ? gen1_options.splat : void 0;
                after = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "after") && gen1_options.after !== void 0 ? gen1_options.after : void 0;
                return {
                    before: before,
                    splat: splat,
                    after: after,
                    functionParameters: function() {
                        var self = this;
                        return self.before;
                    },
                    definedParameters: function() {
                        var self = this;
                        return self.before.concat([ self.splat ]).concat(self.after);
                    },
                    generateJavaScriptParameterStatements: function(buffer, scope, args) {
                        var self = this;
                        var n, afterArg, argsIndex;
                        buffer.write("var ");
                        buffer.write(self.splat.generate(scope));
                        buffer.write("=Array.prototype.slice.call(");
                        buffer.write(args.generate(scope));
                        buffer.write("," + self.before.length + ",");
                        buffer.write(args.generate(scope));
                        buffer.write(".length");
                        if (self.after.length > 0) {
                            buffer.write("-" + self.after.length);
                        }
                        buffer.write(");");
                        if (before.length > 0 && after.length > 0) {
                            buffer.write("if(");
                            buffer.write(args.generate(scope));
                            buffer.write(".length>" + before.length + "){");
                        }
                        for (n = 0; n < self.after.length; ++n) {
                            afterArg = self.after[n];
                            argsIndex = self.after.length - n;
                            buffer.write("var ");
                            buffer.write(afterArg.generate(scope));
                            buffer.write("=");
                            buffer.write(args.generate(scope));
                            buffer.write("[");
                            buffer.write(args.generate(scope));
                            buffer.write(".length-" + argsIndex + "];");
                        }
                        if (before.length > 0 && after.length > 0) {
                            return buffer.write("}");
                        }
                    }
                };
            },
            optionalStrategy: function(gen2_options) {
                var self = this;
                var before, options;
                before = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "before") && gen2_options.before !== void 0 ? gen2_options.before : void 0;
                options = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "options") && gen2_options.options !== void 0 ? gen2_options.options : void 0;
                return {
                    before: before,
                    options: options,
                    optionsVariable: terms.generatedVariable([ "options" ]),
                    functionParameters: function() {
                        var self = this;
                        return self.before.concat([ self.optionsVariable ]);
                    },
                    definedParameters: function() {
                        var self = this;
                        return before.concat(function() {
                            var gen3_results, gen4_items, gen5_i, option, param;
                            gen3_results = [];
                            gen4_items = self.options;
                            for (gen5_i = 0; gen5_i < gen4_items.length; ++gen5_i) {
                                option = gen4_items[gen5_i];
                                param = terms.variable(option.field);
                                gen3_results.push(param);
                            }
                            return gen3_results;
                        }());
                    },
                    generateJavaScriptParameterStatements: function(buffer, scope, args) {
                        var self = this;
                        var optionNames, gen6_items, gen7_i, option, optionName;
                        optionNames = _.map(self.options, function(option) {
                            return codegenUtils.concatName(option.field);
                        });
                        buffer.write("var ");
                        buffer.write(optionNames.join(","));
                        buffer.write(";");
                        gen6_items = self.options;
                        for (gen7_i = 0; gen7_i < gen6_items.length; ++gen7_i) {
                            option = gen6_items[gen7_i];
                            optionName = codegenUtils.concatName(option.field);
                            buffer.write(optionName + "=");
                            buffer.write(self.optionsVariable.generate(scope));
                            buffer.write("!==void 0&&Object.prototype.hasOwnProperty.call(");
                            buffer.write(self.optionsVariable.generate(scope));
                            buffer.write(",'" + optionName + "')&&");
                            buffer.write(self.optionsVariable.generate(scope));
                            buffer.write("." + optionName + "!==void 0?");
                            buffer.write(self.optionsVariable.generate(scope));
                            buffer.write("." + optionName + ":");
                            buffer.write(option.value.generate(scope));
                            buffer.write(";");
                        }
                        return void 0;
                    }
                };
            }
        };
    };
}).call(this);
},{"./codegenUtils":39,"underscore":110}],39:[function(require,module,exports){
(function() {
    var self = this;
    var _, grammar, actualCharacters, nameSegmentRenderedInJavaScript, operatorRenderedInJavaScript, capitalise, reservedWords, escapeReservedWord;
    _ = require("underscore");
    grammar = require("../parser/grammar");
    exports.writeToBufferWithDelimiter = function(array, delimiter, buffer, scope) {
        var self = this;
        var writer, first;
        writer = void 0;
        if (scope instanceof Function) {
            writer = scope;
        } else {
            writer = function(item) {
                return buffer.write(item.generate(scope));
            };
        }
        first = true;
        return _(array).each(function(item) {
            if (!first) {
                buffer.write(delimiter);
            }
            first = false;
            return writer(item);
        });
    };
    actualCharacters = [ [ /\\/g, "\\\\" ], [ new RegExp("\b"), "\\b" ], [ /\f/g, "\\f" ], [ /\n/g, "\\n" ], [ /\0/g, "\\0" ], [ /\r/g, "\\r" ], [ /\t/g, "\\t" ], [ /\v/g, "\\v" ], [ /'/g, "\\'" ], [ /"/g, '\\"' ] ];
    exports.formatJavaScriptString = function(s) {
        var self = this;
        var gen1_items, gen2_i, mapping;
        gen1_items = actualCharacters;
        for (gen2_i = 0; gen2_i < gen1_items.length; ++gen2_i) {
            mapping = gen1_items[gen2_i];
            s = s.replace(mapping[0], mapping[1]);
        }
        return "'" + s + "'";
    };
    exports.concatName = function(nameSegments, options) {
        var self = this;
        var name, n, segment;
        name = "";
        for (n = 0; n < nameSegments.length; ++n) {
            segment = nameSegments[n];
            name = name + nameSegmentRenderedInJavaScript(segment, n === 0);
        }
        if (options && options.hasOwnProperty("escape") && options.escape) {
            return escapeReservedWord(name);
        } else {
            return name;
        }
    };
    nameSegmentRenderedInJavaScript = function(nameSegment, isFirst) {
        if (/[_$a-zA-Z0-9]+/.test(nameSegment)) {
            if (isFirst) {
                return nameSegment;
            } else {
                return capitalise(nameSegment);
            }
        } else {
            return operatorRenderedInJavaScript(nameSegment);
        }
    };
    operatorRenderedInJavaScript = function(operator) {
        var javaScriptName, n;
        javaScriptName = "";
        for (n = 0; n < operator.length; ++n) {
            javaScriptName = javaScriptName + "$" + operator.charCodeAt(n).toString(16);
        }
        return javaScriptName;
    };
    capitalise = function(s) {
        return s[0].toUpperCase() + s.substring(1);
    };
    reservedWords = {
        "class": true,
        "function": true,
        "else": true,
        "case": true,
        "switch": true
    };
    escapeReservedWord = function(word) {
        if (reservedWords.hasOwnProperty(word)) {
            return "$" + word;
        } else {
            return word;
        }
    };
    exports.concatArgs = function(args, gen3_options) {
        var self = this;
        var optionalArgs, asyncCallbackArg, terms;
        optionalArgs = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "optionalArgs") && gen3_options.optionalArgs !== void 0 ? gen3_options.optionalArgs : void 0;
        asyncCallbackArg = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "asyncCallbackArg") && gen3_options.asyncCallbackArg !== void 0 ? gen3_options.asyncCallbackArg : void 0;
        terms = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "terms") && gen3_options.terms !== void 0 ? gen3_options.terms : void 0;
        var a;
        a = args.slice();
        if (optionalArgs && optionalArgs.length > 0) {
            a.push(terms.hash(optionalArgs));
        }
        if (asyncCallbackArg) {
            a.push(asyncCallbackArg);
        }
        return a;
    };
    exports.normaliseOperatorName = function(name) {
        var self = this;
        var op, match;
        op = new RegExp("^@(" + grammar.identifier + ")$");
        match = op.exec(name);
        if (match) {
            return match[1];
        } else {
            return name;
        }
    };
    exports.definedVariables = function(scope) {
        var self = this;
        return {
            variables: [],
            scope: scope,
            define: function(variable) {
                var self = this;
                scope.define(variable);
                return self.variables.push(variable);
            },
            defineWithTag: function(name, tag) {
                var self = this;
                return scope.defineWithTag(name, tag);
            },
            generateVariable: function(name) {
                var self = this;
                return scope.generateVariable(name);
            },
            isDefined: function(variable) {
                var self = this;
                return scope.isDefined(variable);
            },
            isDefinedInThisScope: function(variable) {
                var self = this;
                return scope.isDefinedInThisScope(variable);
            },
            names: function() {
                var self = this;
                return _.uniq(self.variables);
            }
        };
    };
}).call(this);
},{"../parser/grammar":14,"underscore":110}],40:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var continuationOrDefault;
        return continuationOrDefault = function() {
            return terms.moduleConstants.defineAs([ "continuation", "or", "default" ], terms.javascript("function(args){var c=args[args.length-1];if(typeof c === 'function'){return {continuation: c, arguments: Array.prototype.slice.call(args, 0, args.length - 1)};}else{return { continuation: function(error, result) { if (error) { throw error; } else { return result; } }, arguments: args }}}"));
        };
    };
}).call(this);
},{}],41:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function() {
                var self = this;
                return self.isContinue = true;
            },
            generateStatement: function(scope) {
                var self = this;
                return self.code("continue;");
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return self;
            }
        });
    };
}).call(this);
},{}],42:[function(require,module,exports){
(function() {
    var self = this;
    var asyncControl;
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        return function() {
            terms.promise();
            return terms.moduleConstants.defineAs([ "promise" ], terms.javascript(asyncControl.promise.toString()));
        };
    };
}).call(this);
},{"../asyncControl":1}],43:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(target, source, gen1_options) {
                var self = this;
                var async, shadow, assignment;
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                shadow = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "shadow") && gen1_options.shadow !== void 0 ? gen1_options.shadow : false;
                assignment = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "assignment") && gen1_options.assignment !== void 0 ? gen1_options.assignment : false;
                self.isDefinition = true;
                self.target = target;
                self.source = source;
                self.isAsync = async;
                self.shadow = shadow;
                self.global = false;
                return self.isAssignment = assignment;
            },
            expression: function() {
                var self = this;
                return self;
            },
            parameter: function() {
                var self = this;
                return self;
            },
            hashEntry: function() {
                var self = this;
                return self.cg.hashEntry(self.target.hashEntryField(), self.source);
            },
            generate: function(scope) {
                var self = this;
                return self.code(self.target.generateTarget(scope), "=", self.source.generate(scope));
            },
            defineVariables: function(scope) {
                var self = this;
                var name;
                name = self.target.canonicalName(scope);
                if (name) {
                    if (!self.isAssignment) {
                        if (scope.isDefined(name) && !self.shadow) {
                            return terms.errors.addTermWithMessage(self, "variable " + self.target.displayName() + " is already defined, use := to reassign it");
                        } else if (!self.global) {
                            return self.target.declare(scope);
                        }
                    } else if (!scope.isDefined(name)) {
                        return terms.errors.addTermWithMessage(self, "variable " + self.target.displayName() + " is not defined, use = to define it");
                    }
                }
            },
            makeAsyncWithCallbackForResult: function(createCallbackForResult) {
                var self = this;
                var callback;
                if (self.isAsync) {
                    callback = createCallbackForResult(self.target);
                    return self.source.makeAsyncCallWithCallback(callback);
                }
            }
        });
    };
}).call(this);
},{}],44:[function(require,module,exports){
(function() {
    var self = this;
    var codegenUtils;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(object, name) {
                var self = this;
                self.object = object;
                self.name = name;
                return self.isFieldReference = true;
            },
            generate: function(scope) {
                var self = this;
                return self.code(self.object.generate(scope), ".", codegenUtils.concatName(self.name));
            },
            generateTarget: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen1_o;
                gen1_o = self;
                return gen1_o.generate.apply(gen1_o, args);
            }
        });
    };
}).call(this);
},{"./codegenUtils":39}],45:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(cg) {
        var self = this;
        return cg.term({
            constructor: function(value) {
                var self = this;
                self.isFloat = true;
                return self.float = value;
            },
            generate: function(scope) {
                var self = this;
                return self.code(self.float.toString());
            }
        });
    };
}).call(this);
},{}],46:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var forEach;
        return forEach = function(collection, itemVariable, stmts) {
            var itemsVar, indexVar, s, gen1_o, statementsWithItemAssignment, init, test, incr;
            itemsVar = terms.generatedVariable([ "items" ]);
            indexVar = terms.generatedVariable([ "i" ]);
            s = [ terms.definition(itemVariable, terms.indexer(itemsVar, indexVar)) ];
            gen1_o = s;
            gen1_o.push.apply(gen1_o, stmts.statements);
            statementsWithItemAssignment = terms.statements(s, {
                returnsPromise: stmts.returnsPromise
            });
            init = terms.definition(indexVar, terms.integer(0));
            test = terms.operator("<", [ indexVar, terms.fieldReference(itemsVar, [ "length" ]) ]);
            incr = terms.increment(indexVar);
            return terms.subStatements([ terms.definition(itemsVar, collection), terms.forStatement(init, test, incr, statementsWithItemAssignment) ]);
        };
    };
}).call(this);
},{}],47:[function(require,module,exports){
(function() {
    var self = this;
    var asyncControl;
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        var forExpressionTerm, forExpression;
        forExpressionTerm = terms.term({
            constructor: function(init, test, incr, stmts) {
                var self = this;
                self.isFor = true;
                self.initialization = init;
                self.test = test;
                self.increment = incr;
                self.indexVariable = init.target;
                self.statements = stmts;
                return self.statements = self._scopedBody();
            },
            _scopedBody: function() {
                var self = this;
                var containsReturn, forResultVariable, rewrittenStatements, loopStatements;
                containsReturn = false;
                forResultVariable = self.cg.generatedVariable([ "for", "result" ]);
                rewrittenStatements = self.statements.rewrite({
                    rewrite: function(term) {
                        if (term.isReturn) {
                            containsReturn = true;
                            return terms.subStatements([ self.cg.definition(forResultVariable, term.expression, {
                                assignment: true
                            }), self.cg.returnStatement(self.cg.boolean(true)) ]);
                        }
                    },
                    limit: function(term, gen1_options) {
                        var path;
                        path = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "path") && gen1_options.path !== void 0 ? gen1_options.path : path;
                        return term.isClosure;
                    }
                }).serialiseAllStatements();
                if (containsReturn) {
                    loopStatements = [];
                    loopStatements.push(self.cg.definition(forResultVariable, self.cg.nil()));
                    loopStatements.push(self.cg.ifExpression([ {
                        condition: self.cg.subExpression(self.cg.functionCall(self.cg.block([ self.indexVariable ], rewrittenStatements, {
                            returnLastStatement: false
                        }), [ self.indexVariable ])),
                        body: self.cg.statements([ self.cg.returnStatement(forResultVariable) ])
                    } ]));
                    return self.cg.asyncStatements(loopStatements);
                } else {
                    return self.statements;
                }
            },
            generate: function(scope) {
                var self = this;
                return self.code("for(", self.initialization.generate(scope), ";", self.test.generate(scope), ";", self.increment.generate(scope), "){", self.statements.generateStatements(scope), "}");
            },
            generateStatement: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen2_o;
                gen2_o = self;
                return gen2_o.generate.apply(gen2_o, args);
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return void 0;
            }
        });
        return forExpression = function(init, test, incr, body) {
            var initStatements, testStatements, incrStatements, asyncForFunction;
            initStatements = terms.asyncStatements([ init ]);
            testStatements = terms.asyncStatements([ test ]);
            incrStatements = terms.asyncStatements([ incr ]);
            if (initStatements.returnsPromise || testStatements.returnsPromise || (incrStatements.returnsPromise || body.returnsPromise)) {
                asyncForFunction = terms.moduleConstants.defineAs([ "async", "for" ], terms.javascript(asyncControl.for.toString()));
                return terms.scope([ init, terms.resolve(terms.functionCall(asyncForFunction, [ terms.closure([], testStatements), terms.closure([], incrStatements), terms.closure([], body) ]).alreadyPromise()) ]);
            } else {
                return forExpressionTerm(init, test, incr, body);
            }
        };
    };
}).call(this);
},{"../asyncControl":1}],48:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(iterator, collection, stmts) {
                var self = this;
                self.isForIn = true;
                self.iterator = terms.definition(iterator, terms.nil());
                self.collection = collection;
                return self.statements = terms.subExpression(terms.functionCall(terms.block([ iterator ], stmts, {
                    returnLastStatement: false
                }), [ iterator ]));
            },
            generate: function(scope) {
                var self = this;
                return self.code("for(", self.iterator.target.generate(scope), " in ", self.collection.generate(scope), "){", self.statements.generateStatement(scope), "}");
            },
            generateStatement: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen1_o;
                gen1_o = self;
                return gen1_o.generate.apply(gen1_o, args);
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return void 0;
            }
        });
    };
}).call(this);
},{}],49:[function(require,module,exports){
(function() {
    var self = this;
    var codegenUtils, _, asyncControl;
    codegenUtils = require("./codegenUtils");
    _ = require("underscore");
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        var functionCallTerm, functionCall;
        functionCallTerm = terms.term({
            constructor: function(fun, args, gen1_options) {
                var self = this;
                var async, passThisToApply, options;
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                passThisToApply = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "passThisToApply") && gen1_options.passThisToApply !== void 0 ? gen1_options.passThisToApply : false;
                options = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "options") && gen1_options.options !== void 0 ? gen1_options.options : false;
                self.isFunctionCall = true;
                self.function = fun;
                if (options) {
                    self.functionArguments = terms.argumentUtils.positionalArguments(args);
                    self.optionalArguments = terms.argumentUtils.optionalArguments(args);
                } else {
                    self.functionArguments = args;
                }
                self.passThisToApply = passThisToApply;
                return self.isAsync = async;
            },
            hasSplatArguments: function() {
                var self = this;
                return _.any(self.functionArguments, function(arg) {
                    return arg.isSplat;
                });
            },
            generate: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    var args, splattedArguments;
                    buffer.write(self.function.generateFunction(scope));
                    args = codegenUtils.concatArgs(self.functionArguments, {
                        optionalArgs: self.optionalArguments,
                        terms: terms
                    });
                    splattedArguments = self.cg.splatArguments(args);
                    if (splattedArguments && self.function.isIndexer) {
                        buffer.write(".apply(");
                        buffer.write(self.function.object.generate(scope));
                        buffer.write(",");
                        buffer.write(splattedArguments.generate(scope));
                        return buffer.write(")");
                    } else if (splattedArguments) {
                        buffer.write(".apply(");
                        if (self.passThisToApply) {
                            buffer.write("this");
                        } else {
                            buffer.write("null");
                        }
                        buffer.write(",");
                        buffer.write(splattedArguments.generate(scope));
                        return buffer.write(")");
                    } else {
                        buffer.write("(");
                        codegenUtils.writeToBufferWithDelimiter(args, ",", buffer, scope);
                        return buffer.write(")");
                    }
                });
            }
        });
        return functionCall = function(fun, args, gen2_options) {
            var passThisToApply, couldBeMacro, promisify, options;
            passThisToApply = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "passThisToApply") && gen2_options.passThisToApply !== void 0 ? gen2_options.passThisToApply : false;
            couldBeMacro = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "couldBeMacro") && gen2_options.couldBeMacro !== void 0 ? gen2_options.couldBeMacro : true;
            promisify = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "promisify") && gen2_options.promisify !== void 0 ? gen2_options.promisify : false;
            options = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "options") && gen2_options.options !== void 0 ? gen2_options.options : false;
            var name, macro, funCall;
            if (!promisify && function() {
                var gen3_results, gen4_items, gen5_i, a;
                gen3_results = [];
                gen4_items = args;
                for (gen5_i = 0; gen5_i < gen4_items.length; ++gen5_i) {
                    a = gen4_items[gen5_i];
                    (function(a) {
                        if (a.isCallback) {
                            return gen3_results.push(a);
                        }
                    })(a);
                }
                return gen3_results;
            }().length > 0) {
                return terms.promisify(terms.functionCall(fun, args, {
                    passThisToApply: false,
                    couldBeMacro: true,
                    promisify: true,
                    options: options
                }));
            } else if (fun.variable && couldBeMacro) {
                name = fun.variable;
                macro = terms.macros.findMacro(name);
                funCall = functionCallTerm(fun, args, {
                    options: options
                });
                if (macro) {
                    return macro(funCall, name, args);
                }
            }
            return functionCallTerm(fun, args, {
                passThisToApply: passThisToApply,
                options: options
            });
        };
    };
}).call(this);
},{"../asyncControl":1,"./codegenUtils":39,"underscore":110}],50:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function() {
                var self = this;
                return self.isFutureArgument = true;
            },
            arguments: function() {
                var self = this;
                return [];
            }
        });
    };
}).call(this);
},{}],51:[function(require,module,exports){
(function() {
    var self = this;
    var codegenUtils;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(name, gen1_options) {
                var self = this;
                var tag;
                tag = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "tag") && gen1_options.tag !== void 0 ? gen1_options.tag : void 0;
                self.name = name;
                self.isVariable = true;
                self.genVar = void 0;
                return self.tag = tag;
            },
            dontClone: true,
            declare: function(scope) {
                var self = this;
                if (self.tag) {
                    return scope.defineWithTag(self.canonicalName(scope), self.tag);
                } else {
                    return scope.define(self.canonicalName(scope));
                }
            },
            generatedName: function(scope) {
                var self = this;
                if (!self.genVar) {
                    self.genVar = scope.generateVariable(codegenUtils.concatName(self.name));
                }
                return self.genVar;
            },
            canonicalName: function(scope) {
                var self = this;
                return self.generatedName(scope);
            },
            displayName: function() {
                var self = this;
                return self.name;
            },
            generate: function(scope) {
                var self = this;
                var variable;
                if (self.tag) {
                    variable = scope.findTag(self.tag);
                    if (variable) {
                        return self.code(variable);
                    } else {
                        return self.code(self.canonicalName(scope));
                    }
                } else {
                    return self.code(self.canonicalName(scope));
                }
            },
            generateTarget: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen2_o;
                gen2_o = self;
                return gen2_o.generate.apply(gen2_o, args);
            }
        });
    };
}).call(this);
},{"./codegenUtils":39}],52:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(variable, list) {
                var self = this;
                self.operator = "<-";
                self.isOperator = true;
                self.isGenerator = true;
                self.variable = variable;
                self.list = list;
                return self.operatorArguments = [ variable, list ];
            }
        });
    };
}).call(this);
},{}],53:[function(require,module,exports){
(function() {
    var self = this;
    var codegenUtils;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(entries) {
                var self = this;
                self.isHash = true;
                return self.entries = entries;
            },
            generate: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    buffer.write("{");
                    codegenUtils.writeToBufferWithDelimiter(self.entries, ",", buffer, function(item) {
                        return buffer.write(item.generateHashEntry(scope));
                    });
                    return buffer.write("}");
                });
            },
            generateStatement: function(scope) {
                var self = this;
                return terms.definition(terms.generatedVariable([ "o" ]), self).generateStatement(scope);
            }
        });
    };
}).call(this);
},{"./codegenUtils":39}],54:[function(require,module,exports){
(function() {
    var self = this;
    var codegenUtils, isLegalJavaScriptIdentifier;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(field, value) {
                var self = this;
                self.isHashEntry = true;
                self.field = field;
                return self.value = value;
            },
            legalFieldName: function() {
                var self = this;
                var f;
                if (self.field.isString) {
                    return codegenUtils.formatJavaScriptString(self.field.string);
                }
                f = codegenUtils.concatName(self.field);
                if (isLegalJavaScriptIdentifier(f)) {
                    return f;
                } else {
                    return codegenUtils.formatJavaScriptString(f);
                }
            },
            valueOrTrue: function() {
                var self = this;
                if (self.value === undefined) {
                    return self.cg.boolean(true);
                } else {
                    return self.value;
                }
            },
            hashEntry: function() {
                var self = this;
                return self;
            },
            parameter: function() {
                var self = this;
                return self;
            },
            generateHashEntry: function(scope) {
                var self = this;
                return self.code(self.legalFieldName(), ":", self.valueOrTrue().generate(scope));
            },
            asyncify: function() {
                var self = this;
                return self.value.asyncify();
            }
        });
    };
    isLegalJavaScriptIdentifier = function(id) {
        return /^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(id);
    };
}).call(this);
},{"./codegenUtils":39}],55:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(cg) {
        var self = this;
        return cg.term({
            constructor: function(name) {
                var self = this;
                self.isIdentifier = true;
                return self.identifier = name;
            },
            arguments: function() {
                var self = this;
                return void 0;
            }
        });
    };
}).call(this);
},{}],56:[function(require,module,exports){
(function() {
    var self = this;
    var codegenUtils, _, asyncControl;
    codegenUtils = require("./codegenUtils");
    _ = require("underscore");
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        var ifExpressionTerm, ifExpression;
        ifExpressionTerm = terms.term({
            constructor: function(cases, elseBody) {
                var self = this;
                self.isIfExpression = true;
                self.cases = cases;
                return self.elseBody = elseBody;
            },
            generateStatement: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    codegenUtils.writeToBufferWithDelimiter(self.cases, "else ", buffer, function(case_) {
                        buffer.write("if(");
                        buffer.write(case_.condition.generate(scope));
                        buffer.write("){");
                        buffer.write(case_.body.generateStatements(scope));
                        return buffer.write("}");
                    });
                    if (self.elseBody) {
                        buffer.write("else{");
                        buffer.write(self.elseBody.generateStatements(scope));
                        return buffer.write("}");
                    }
                });
            },
            generate: function(scope) {
                var self = this;
                self.rewriteResultTermInto(function(term) {
                    return terms.returnStatement(term);
                });
                return self.code("(function(){", self.generateStatement(scope), "})()");
            },
            rewriteResultTermInto: function(returnTerm, gen1_options) {
                var self = this;
                var async;
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                var gen2_items, gen3_i, _case;
                gen2_items = self.cases;
                for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
                    _case = gen2_items[gen3_i];
                    _case.body.rewriteResultTermInto(returnTerm);
                }
                if (self.elseBody) {
                    self.elseBody.rewriteResultTermInto(returnTerm);
                } else if (async) {
                    self.elseBody = terms.statements([ terms.functionCall(terms.continuationFunction, []) ]);
                }
                return self;
            }
        });
        return ifExpression = function(cases, elseBody, gen4_options) {
            var isPromise;
            isPromise = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "isPromise") && gen4_options.isPromise !== void 0 ? gen4_options.isPromise : false;
            var anyAsyncCases, splitIfElseIf;
            anyAsyncCases = _.any(cases, function(_case) {
                return _case.body.returnsPromise || _case.condition.containsAsync();
            });
            if (!isPromise && (anyAsyncCases || elseBody && elseBody.returnsPromise)) {
                splitIfElseIf = function(cases, elseBody) {
                    var casesTail;
                    casesTail = cases.slice(1);
                    if (casesTail.length > 0) {
                        return ifExpressionTerm([ cases[0] ], terms.asyncStatements([ splitIfElseIf(casesTail, elseBody) ]));
                    } else {
                        return ifExpressionTerm(cases, elseBody);
                    }
                };
                return terms.resolve(splitIfElseIf(cases, elseBody));
            } else {
                return ifExpressionTerm(cases, elseBody);
            }
        };
    };
}).call(this);
},{"../asyncControl":1,"./codegenUtils":39,"underscore":110}],57:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(expr) {
                var self = this;
                self.isIncrement = true;
                return self.expression = expr;
            },
            generate: function(scope) {
                var self = this;
                return self.code("++", self.expression.generate(scope));
            }
        });
    };
}).call(this);
},{}],58:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(object, indexer) {
                var self = this;
                self.object = object;
                self.indexer = indexer;
                return self.isIndexer = true;
            },
            generate: function(scope) {
                var self = this;
                return self.code(self.object.generate(scope), "[", self.indexer.generate(scope), "]");
            },
            generateTarget: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen1_o;
                gen1_o = self;
                return gen1_o.generate.apply(gen1_o, args);
            }
        });
    };
}).call(this);
},{}],59:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(cg) {
        var self = this;
        return cg.term({
            constructor: function(value) {
                var self = this;
                self.isInteger = true;
                return self.integer = value;
            },
            generate: function(scope) {
                var self = this;
                return self.code(self.integer.toString());
            }
        });
    };
}).call(this);
},{}],60:[function(require,module,exports){
(function() {
    var self = this;
    var codegenUtils;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        var createInterpolatedString, interpolatedString;
        createInterpolatedString = terms.term({
            constructor: function(components) {
                var self = this;
                self.isInterpolatedString = true;
                return self.components = components;
            },
            generate: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    buffer.write("(");
                    codegenUtils.writeToBufferWithDelimiter(self.components, "+", buffer, scope);
                    return buffer.write(")");
                });
            }
        });
        return interpolatedString = function(components) {
            if (components.length === 1) {
                return components[0];
            } else if (components.length === 0) {
                return terms.string("");
            } else {
                return createInterpolatedString(components);
            }
        };
    };
}).call(this);
},{"./codegenUtils":39}],61:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(source) {
                var self = this;
                self.isJavaScript = true;
                return self.source = source;
            },
            generate: function(scope) {
                var self = this;
                return self.code(self.source);
            }
        });
    };
}).call(this);
},{}],62:[function(require,module,exports){
(function() {
    var self = this;
    var codegenUtils, _;
    codegenUtils = require("./codegenUtils");
    _ = require("underscore");
    module.exports = function(terms) {
        var self = this;
        var listTerm, insertSplatsAfterRanges, list;
        listTerm = terms.term({
            constructor: function(items) {
                var self = this;
                self.isList = true;
                return self.items = items;
            },
            generate: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    var splatArguments;
                    splatArguments = terms.splatArguments(self.items);
                    if (splatArguments) {
                        return buffer.write(splatArguments.generate(scope));
                    } else {
                        buffer.write("[");
                        codegenUtils.writeToBufferWithDelimiter(self.items, ",", buffer, scope);
                        return buffer.write("]");
                    }
                });
            }
        });
        insertSplatsAfterRanges = function(items) {
            var itemsWithSplats, n, item;
            itemsWithSplats = [];
            for (n = 0; n < items.length; ++n) {
                item = items[n];
                itemsWithSplats.push(item);
                if (item.isRange) {
                    item.inList = true;
                    itemsWithSplats.push(terms.splat());
                }
            }
            return itemsWithSplats;
        };
        return list = function(listItems) {
            var items, hashEntry, hasGenerator, macro;
            items = insertSplatsAfterRanges(listItems);
            hashEntry = _.find(items, function(item) {
                return item.isHashEntry;
            });
            hasGenerator = _.find(items, function(item) {
                return item.isGenerator;
            });
            if (hashEntry) {
                macro = terms.listMacros.findMacro(hashEntry.field);
                if (macro) {
                    return macro(listTerm(items), hashEntry.field);
                } else {
                    return terms.errors.addTermWithMessage(hashEntry, "no macro for " + hashEntry.field.join(" "));
                }
            } else if (hasGenerator) {
                return terms.listComprehension(items);
            } else {
                return listTerm(items);
            }
        };
    };
}).call(this);
},{"./codegenUtils":39,"underscore":110}],63:[function(require,module,exports){
(function() {
    var self = this;
    var _, asyncControl;
    _ = require("underscore");
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        var macros, comprehensionExpressionFor, comprehensionExpressionFrom, generator, sortEach, map, definition, filter, isDefinition, listComprehension;
        macros = terms.macroDirectory();
        comprehensionExpressionFor = function(expr) {
            if (expr.isGenerator) {
                return generator(expr);
            } else if (isDefinition(expr)) {
                return definition(expr);
            } else {
                return filter(expr);
            }
        };
        comprehensionExpressionFrom = function(items) {
            var exprs, comprehensionExprs, n;
            exprs = items.slice(0, items.length - 1);
            comprehensionExprs = function() {
                var gen1_results, gen2_items, gen3_i, expr;
                gen1_results = [];
                gen2_items = exprs;
                for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
                    expr = gen2_items[gen3_i];
                    gen1_results.push(comprehensionExpressionFor(expr));
                }
                return gen1_results;
            }();
            comprehensionExprs.push(map(items[items.length - 1]));
            comprehensionExprs.unshift(sortEach());
            for (n = 0; n < comprehensionExprs.length - 1; ++n) {
                comprehensionExprs[n].next = comprehensionExprs[n + 1];
            }
            return comprehensionExprs[0];
        };
        generator = function(expression) {
            return {
                isGenerator: true,
                iterator: expression.operatorArguments[0],
                collection: expression.operatorArguments[1],
                hasGenerator: function() {
                    var self = this;
                    return true;
                },
                generate: function(isAsync, result, index) {
                    var self = this;
                    var listComprehension, innerResult, innerIndex, asyncStatements, call, scope;
                    if (isAsync) {
                        listComprehension = terms.moduleConstants.defineAs([ "list", "comprehension" ], terms.javascript(asyncControl.listComprehension.toString()));
                        innerResult = terms.generatedVariable([ "result" ]);
                        innerIndex = terms.generatedVariable([ "index" ]);
                        asyncStatements = terms.asyncStatements(self.next.generate(isAsync, innerResult, innerIndex));
                        call = terms.resolve(terms.functionCall(listComprehension, [ self.collection, terms.boolean(self.next.hasGenerator()), terms.closure([ innerIndex, self.iterator, innerResult ], asyncStatements) ]));
                        if (result) {
                            return [ terms.functionCall(result, [ call, index ]) ];
                        } else {
                            return [ call ];
                        }
                    } else {
                        scope = terms.scope(self.next.generate(isAsync, result, index), {
                            alwaysGenerateFunction: true,
                            variables: [ self.iterator ]
                        });
                        return [ terms.forEach(self.collection, self.iterator, terms.asyncStatements([ scope ])) ];
                    }
                }
            };
        };
        sortEach = function() {
            return {
                isSortEach: true,
                generateListComprehension: function(isAsync) {
                    var self = this;
                    var resultsVariable, statements, gen4_o;
                    if (isAsync) {
                        return self.next.generate(isAsync)[0];
                    } else {
                        resultsVariable = terms.generatedVariable([ "results" ]);
                        statements = [ terms.definition(resultsVariable, terms.list([])) ];
                        gen4_o = statements;
                        statements.push.apply(statements, self.next.generate(isAsync, resultsVariable));
                        statements.push(resultsVariable);
                        return terms.scope(statements);
                    }
                }
            };
        };
        map = function(expression) {
            return {
                isMap: true,
                hasGenerator: function() {
                    var self = this;
                    return false;
                },
                generate: function(isAsync, result, index) {
                    var self = this;
                    if (isAsync) {
                        return [ terms.functionCall(result, [ expression, index ]) ];
                    } else {
                        return [ terms.methodCall(result, [ "push" ], [ expression ]) ];
                    }
                }
            };
        };
        definition = function(expression) {
            return {
                isDefinition: true,
                hasGenerator: function() {
                    var self = this;
                    return self.next.hasGenerator();
                },
                generate: function(isAsync, result, index) {
                    var self = this;
                    var statements, gen5_o;
                    statements = [ expression ];
                    gen5_o = statements;
                    statements.push.apply(statements, self.next.generate(isAsync, result, index));
                    return statements;
                }
            };
        };
        filter = function(expression) {
            return {
                isFilter: true,
                hasGenerator: function() {
                    var self = this;
                    return self.next.hasGenerator();
                },
                generate: function(isAsync, result, index) {
                    var self = this;
                    return [ terms.ifExpression([ {
                        condition: expression,
                        body: terms.asyncStatements(self.next.generate(isAsync, result, index))
                    } ]) ];
                }
            };
        };
        isDefinition = function(expression) {
            return expression.isDefinition;
        };
        return listComprehension = function(items) {
            var isAsync, expr;
            isAsync = _.any(items, function(item) {
                return item.containsAsync();
            });
            expr = comprehensionExpressionFrom(items);
            return expr.generateListComprehension(isAsync);
        };
    };
}).call(this);
},{"../asyncControl":1,"underscore":110}],64:[function(require,module,exports){
(function() {
    var self = this;
    var codegenUtils, argumentUtils, asyncControl, _;
    codegenUtils = require("./codegenUtils");
    argumentUtils = require("./argumentUtils");
    asyncControl = require("../asyncControl");
    _ = require("underscore");
    module.exports = function(terms) {
        var self = this;
        var methodCallTerm, methodCall;
        methodCallTerm = terms.term({
            constructor: function(object, name, args, gen1_options) {
                var self = this;
                var asyncCallbackArgument, options;
                asyncCallbackArgument = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "asyncCallbackArgument") && gen1_options.asyncCallbackArgument !== void 0 ? gen1_options.asyncCallbackArgument : void 0;
                options = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "options") && gen1_options.options !== void 0 ? gen1_options.options : false;
                self.isMethodCall = true;
                self.object = object;
                self.name = name;
                if (options) {
                    self.methodArguments = terms.argumentUtils.positionalArguments(args);
                    self.optionalArguments = terms.argumentUtils.optionalArguments(args);
                } else {
                    self.methodArguments = args;
                }
                return self.asyncCallbackArgument = asyncCallbackArgument;
            },
            generate: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    var args, splattedArguments;
                    args = codegenUtils.concatArgs(self.methodArguments, {
                        optionalArgs: self.optionalArguments,
                        terms: terms,
                        asyncCallbackArg: self.asyncCallbackArgument
                    });
                    splattedArguments = terms.splatArguments(args);
                    if (splattedArguments) {
                        buffer.write(self.object.generate(scope));
                        buffer.write(".");
                        buffer.write(codegenUtils.concatName(self.name));
                        buffer.write(".apply(");
                        buffer.write(self.object.generate(scope));
                        buffer.write(",");
                        buffer.write(splattedArguments.generate(scope));
                        return buffer.write(")");
                    } else {
                        buffer.write(self.object.generate(scope));
                        buffer.write(".");
                        buffer.write(codegenUtils.concatName(self.name));
                        buffer.write("(");
                        codegenUtils.writeToBufferWithDelimiter(args, ",", buffer, scope);
                        return buffer.write(")");
                    }
                });
            }
        });
        return methodCall = function(object, name, args, gen2_options) {
            var asyncCallbackArgument, containsSplatArguments, promisify, options;
            asyncCallbackArgument = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "asyncCallbackArgument") && gen2_options.asyncCallbackArgument !== void 0 ? gen2_options.asyncCallbackArgument : void 0;
            containsSplatArguments = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "containsSplatArguments") && gen2_options.containsSplatArguments !== void 0 ? gen2_options.containsSplatArguments : false;
            promisify = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "promisify") && gen2_options.promisify !== void 0 ? gen2_options.promisify : false;
            options = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "options") && gen2_options.options !== void 0 ? gen2_options.options : false;
            var objectVar;
            if (_.any(args, function(arg) {
                return arg.isSplat;
            }) && !containsSplatArguments) {
                objectVar = terms.generatedVariable([ "o" ]);
                return terms.subStatements([ terms.definition(objectVar, object), methodCall(objectVar, name, args, {
                    asyncCallbackArgument: void 0,
                    containsSplatArguments: true
                }) ]);
            } else if (!promisify && function() {
                var gen3_results, gen4_items, gen5_i, a;
                gen3_results = [];
                gen4_items = args;
                for (gen5_i = 0; gen5_i < gen4_items.length; ++gen5_i) {
                    a = gen4_items[gen5_i];
                    (function(a) {
                        if (a.isCallback) {
                            return gen3_results.push(a);
                        }
                    })(a);
                }
                return gen3_results;
            }().length > 0) {
                return terms.promisify(methodCall(object, name, args, {
                    asyncCallbackArgument: void 0,
                    containsSplatArguments: false,
                    promisify: true,
                    options: options
                }));
            } else {
                return methodCallTerm(object, name, args, {
                    asyncCallbackArgument: asyncCallbackArgument,
                    options: options
                });
            }
        };
    };
}).call(this);
},{"../asyncControl":1,"./argumentUtils":29,"./codegenUtils":39,"underscore":110}],65:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var moduleTerm, module;
        moduleTerm = terms.term({
            constructor: function(statements, gen1_options) {
                var self = this;
                var global, returnLastStatement, bodyStatements;
                global = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "global") && gen1_options.global !== void 0 ? gen1_options.global : false;
                returnLastStatement = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "returnLastStatement") && gen1_options.returnLastStatement !== void 0 ? gen1_options.returnLastStatement : false;
                bodyStatements = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "bodyStatements") && gen1_options.bodyStatements !== void 0 ? gen1_options.bodyStatements : void 0;
                self.statements = statements;
                self.isModule = true;
                self.global = global;
                return self.bodyStatements = bodyStatements || statements;
            },
            generateModule: function() {
                var self = this;
                var scope;
                scope = new terms.SymbolScope(void 0);
                return self.code(self.statements.generateStatements(scope, {
                    global: self.global,
                    inClosure: true
                }));
            }
        });
        return module = function(statements, gen2_options) {
            var inScope, global, returnLastStatement, bodyStatements;
            inScope = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "inScope") && gen2_options.inScope !== void 0 ? gen2_options.inScope : true;
            global = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "global") && gen2_options.global !== void 0 ? gen2_options.global : false;
            returnLastStatement = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "returnLastStatement") && gen2_options.returnLastStatement !== void 0 ? gen2_options.returnLastStatement : false;
            bodyStatements = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "bodyStatements") && gen2_options.bodyStatements !== void 0 ? gen2_options.bodyStatements : bodyStatements;
            var scope, args, methodCall, call;
            if (returnLastStatement) {
                statements.rewriteLastStatementToReturn({
                    async: false
                });
            }
            if (inScope) {
                scope = terms.closure([], statements, {
                    returnLastStatement: returnLastStatement,
                    redefinesSelf: true,
                    definesModuleConstants: true
                });
                args = [ terms.variable([ "this" ]) ];
                methodCall = terms.methodCall(terms.subExpression(scope), [ "call" ], args);
                call = function() {
                    if (statements.isAsync) {
                        return methodCall;
                    } else {
                        return methodCall;
                    }
                }();
                return moduleTerm(terms.statements([ call ]), {
                    bodyStatements: statements,
                    global: global
                });
            } else {
                return moduleTerm(statements, {
                    global: global,
                    returnLastStatement: returnLastStatement,
                    bodyStatements: bodyStatements
                });
            }
        };
    };
}).call(this);
},{}],66:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var newOperatorTerm, newOperator;
        newOperatorTerm = terms.term({
            constructor: function(fn) {
                var self = this;
                self.isNewOperator = true;
                return self.functionCall = fn;
            },
            generate: function(scope) {
                var self = this;
                return self.code("new ", function() {
                    if (self.functionCall.isVariable) {
                        return terms.functionCall(self.functionCall, []).generate(scope);
                    } else if (self.functionCall.isFunctionCall && self.functionCall.hasSplatArguments()) {
                        return self.cg.block([], self.cg.statements([ self.functionCall ]), {
                            returnLastStatement: false
                        }).generate(scope);
                    } else {
                        return self.functionCall.generate(scope);
                    }
                }());
            }
        });
        return newOperator = function(fn) {
            var statements, constructor, constructorVariable;
            if (fn.isFunctionCall && fn.hasSplatArguments()) {
                statements = [];
                fn.passThisToApply = true;
                constructor = terms.block([], terms.statements([ fn ]), {
                    returnLastStatement: false
                });
                constructorVariable = terms.generatedVariable([ "c" ]);
                statements.push(terms.definition(constructorVariable, constructor));
                statements.push(terms.definition(terms.fieldReference(constructorVariable, [ "prototype" ]), terms.fieldReference(fn.function, [ "prototype" ])));
                statements.push(terms.newOperator(constructorVariable));
                return terms.subStatements(statements);
            } else {
                return newOperatorTerm(fn);
            }
        };
    };
}).call(this);
},{}],67:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return function(gen1_options) {
            var closure, statements, term, callsFulfillOnReturn;
            closure = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "closure") && gen1_options.closure !== void 0 ? gen1_options.closure : void 0;
            statements = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "statements") && gen1_options.statements !== void 0 ? gen1_options.statements : void 0;
            term = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "term") && gen1_options.term !== void 0 ? gen1_options.term : void 0;
            callsFulfillOnReturn = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "callsFulfillOnReturn") && gen1_options.callsFulfillOnReturn !== void 0 ? gen1_options.callsFulfillOnReturn : true;
            return terms.newOperator(terms.functionCall(terms.promise(), [ closure || terms.closure([ terms.onFulfilledFunction ], statements || terms.statements([ term ]), {
                isNewScope: false,
                callsFulfillOnReturn: callsFulfillOnReturn
            }) ])).alreadyPromise();
        };
    };
}).call(this);
},{}],68:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function() {
                var self = this;
                return self.isNil = true;
            },
            generate: function(scope) {
                var self = this;
                return self.code("void 0");
            }
        });
    };
}).call(this);
},{}],69:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(parameters) {
                var self = this;
                return self.parameters = parameters;
            }
        });
    };
}).call(this);
},{}],70:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(op, args) {
                var self = this;
                self.isOperator = true;
                self.operator = op;
                return self.operatorArguments = args;
            },
            isOperatorAlpha: function() {
                var self = this;
                return /[a-zA-Z]+/.test(self.operator);
            },
            generate: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    var alpha, n;
                    buffer.write("(");
                    if (self.operatorArguments.length === 1) {
                        buffer.write(self.operator);
                        if (self.isOperatorAlpha()) {
                            buffer.write(" ");
                        }
                        buffer.write(self.operatorArguments[0].generate(scope));
                    } else {
                        alpha = self.isOperatorAlpha();
                        buffer.write(self.operatorArguments[0].generate(scope));
                        for (n = 1; n < self.operatorArguments.length; ++n) {
                            if (alpha) {
                                buffer.write(" ");
                            }
                            buffer.write(self.operator);
                            if (alpha) {
                                buffer.write(" ");
                            }
                            buffer.write(self.operatorArguments[n].generate(scope));
                        }
                    }
                    return buffer.write(")");
                });
            }
        });
    };
}).call(this);
},{}],71:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(parms) {
                var self = this;
                self.isParameters = true;
                return self.parameters = parms;
            },
            arguments: function() {
                var self = this;
                return void 0;
            }
        });
    };
}).call(this);
},{}],72:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var promisesModule, js;
        return function() {
            var promisesModule, js;
            if (terms.promisesModule) {
                promisesModule = JSON.stringify(terms.promisesModule);
                js = "require(" + promisesModule + ")";
                return terms.moduleConstants.defineAs([ "Promise" ], terms.javascript(js), {
                    generated: false
                });
            } else {
                return terms.javascript("Promise");
            }
        };
    };
}).call(this);
},{}],73:[function(require,module,exports){
(function() {
    var self = this;
    var asyncControl;
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(term) {
                var self = this;
                self.isPromisify = true;
                terms.promise();
                self.promisifyFunction = terms.moduleConstants.defineAs([ "promisify" ], terms.javascript(asyncControl.promisify.toString()));
                return self.term = term;
            },
            generate: function(scope) {
                var self = this;
                return terms.functionCall(self.promisifyFunction, [ terms.closure([ terms.callbackFunction ], terms.statements([ self.term ])) ]).generate(scope);
            },
            promisify: function() {
                var self = this;
                return self;
            }
        });
    };
}).call(this);
},{"../asyncControl":1}],74:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(items) {
                var self = this;
                self.isRange = true;
                self.items = items;
                self.inList = false;
                return self.range = terms.moduleConstants.defineAs([ "range" ], terms.javascript("function (a, b) {\n   var items = [];\n   for (var n = a; n <= b; n++) {\n       items.push(n);\n   }\n   return items;\n                }"));
            },
            generate: function(scope) {
                var self = this;
                if (self.inList) {
                    return terms.functionCall(self.range, self.items).generate(scope);
                } else {
                    return terms.errors.addTermWithMessage(self, "range operator can only be used in a list, as in [1..3]").generate(scope);
                }
            }
        });
    };
}).call(this);
},{}],75:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(patternOptions) {
                var self = this;
                self.isRegExp = true;
                self.pattern = patternOptions.pattern;
                return self.options = patternOptions.options;
            },
            generate: function(scope) {
                var self = this;
                var options;
                options = self.options || "";
                return self.code("/" + self.pattern.replace(/\//g, "\\/") + "/" + options);
            }
        });
    };
}).call(this);
},{}],76:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(expr, gen1_options) {
                var self = this;
                var implicit;
                implicit = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "implicit") && gen1_options.implicit !== void 0 ? gen1_options.implicit : false;
                self.isReturn = true;
                self.expression = expr;
                return self.isImplicit = implicit;
            },
            generateStatement: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    if (self.expression) {
                        buffer.write("return ");
                        buffer.write(self.expression.generate(scope));
                        return buffer.write(";");
                    } else {
                        return buffer.write("return;");
                    }
                });
            },
            rewriteResultTermInto: function(returnTerm, gen2_options) {
                var self = this;
                var async;
                async = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "async") && gen2_options.async !== void 0 ? gen2_options.async : false;
                var arguments;
                if (async) {
                    arguments = function() {
                        if (self.expression) {
                            return [ self.expression ];
                        } else {
                            return [];
                        }
                    }();
                    return terms.functionCall(terms.onRejectedFunction, arguments);
                } else {
                    return self;
                }
            }
        });
    };
}).call(this);
},{}],77:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var scope;
        return scope = function(statementList, gen1_options) {
            var alwaysGenerateFunction, variables;
            alwaysGenerateFunction = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "alwaysGenerateFunction") && gen1_options.alwaysGenerateFunction !== void 0 ? gen1_options.alwaysGenerateFunction : false;
            variables = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "variables") && gen1_options.variables !== void 0 ? gen1_options.variables : [];
            var statement, statements, fn;
            if (statementList.length === 1 && !alwaysGenerateFunction) {
                statement = statementList[0];
                if (statement.isReturn) {
                    return statement.expression;
                } else {
                    return statement;
                }
            } else {
                statements = terms.asyncStatements(statementList);
                fn = terms.functionCall(terms.subExpression(terms.block(variables, statements)), variables);
                if (statements.returnsPromise) {
                    return terms.resolve(fn.alreadyPromise());
                } else {
                    return fn;
                }
            }
        };
    };
}).call(this);
},{}],78:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var selfExpression;
        return selfExpression = function() {
            return terms.variable([ "self" ], {
                shadow: true
            });
        };
    };
}).call(this);
},{}],79:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(errorTerms, message) {
                var self = this;
                self.isSemanticError = true;
                self.errorTerms = errorTerms;
                return self.message = message;
            },
            generate: function() {
                var self = this;
                return "";
            },
            printError: function(sourceFile, buffer) {
                var self = this;
                sourceFile.printLocation(self.errorTerms[0].location(), buffer);
                return buffer.write(self.message + "\n");
            },
            generateHashEntry: function() {
                var self = this;
                return "";
            },
            declare: function() {
                var self = this;
                return void 0;
            }
        });
    };
}).call(this);
},{}],80:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function() {
                var self = this;
                return self.isSplat = true;
            },
            parameter: function() {
                var self = this;
                return self;
            }
        });
    };
}).call(this);
},{}],81:[function(require,module,exports){
(function() {
    var self = this;
    var _;
    _ = require("underscore");
    module.exports = function(terms) {
        var self = this;
        var splatArgumentsTerm, splatArguments;
        splatArgumentsTerm = terms.term({
            constructor: function(splatArguments) {
                var self = this;
                return self.splatArguments = splatArguments;
            },
            generate: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    var i, splatArgument;
                    for (i = 0; i < self.splatArguments.length; ++i) {
                        splatArgument = self.splatArguments[i];
                        if (i === 0) {
                            buffer.write(splatArgument.generate(scope));
                        } else {
                            buffer.write(".concat(");
                            buffer.write(splatArgument.generate(scope));
                            buffer.write(")");
                        }
                    }
                    return void 0;
                });
            }
        });
        return splatArguments = function(args, optionalArgs) {
            var splatArgs, previousArgs, foundSplat, i, current, next, concat;
            splatArgs = [];
            previousArgs = [];
            foundSplat = false;
            i = 0;
            while (i < args.length) {
                current = args[i];
                next = args[i + 1];
                if (next && next.isSplat) {
                    foundSplat = true;
                    if (previousArgs.length > 0) {
                        splatArgs.push(terms.list(previousArgs));
                        previousArgs = [];
                    }
                    splatArgs.push(current);
                    ++i;
                } else if (current.isSplat) {
                    terms.errors.addTermWithMessage(current, "splat keyword with no argument to splat");
                } else {
                    previousArgs.push(current);
                }
                ++i;
            }
            if (optionalArgs && optionalArgs.length > 0) {
                previousArgs.push(terms.hash(optionalArgs));
            }
            if (previousArgs.length > 0) {
                splatArgs.push(terms.list(previousArgs));
            }
            if (foundSplat) {
                concat = function(initial, last) {
                    if (initial.length > 0) {
                        return terms.methodCall(concat(_.initial(initial), _.last(initial)), [ "concat" ], [ last ]);
                    } else {
                        return last;
                    }
                };
                return concat(_.initial(splatArgs), _.last(splatArgs));
            }
        };
    };
}).call(this);
},{"underscore":110}],82:[function(require,module,exports){
module.exports=require(69)
},{}],83:[function(require,module,exports){
(function() {
    var self = this;
    var _, codegenUtils, statementsUtils;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    statementsUtils = require("./statementsUtils");
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(statements, gen1_options) {
                var self = this;
                var async, definitions, returnsPromise;
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                definitions = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "definitions") && gen1_options.definitions !== void 0 ? gen1_options.definitions : definitions;
                returnsPromise = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "returnsPromise") && gen1_options.returnsPromise !== void 0 ? gen1_options.returnsPromise : false;
                self.isStatements = true;
                self.statements = statements;
                self.isAsync = async;
                self.returnsPromise = returnsPromise;
                return self._definitions = definitions;
            },
            generateStatements: function(scope, gen2_options) {
                var self = this;
                var isScope, global;
                isScope = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "isScope") && gen2_options.isScope !== void 0 ? gen2_options.isScope : false;
                global = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "global") && gen2_options.global !== void 0 ? gen2_options.global : false;
                return self.generateIntoBuffer(function(buffer) {
                    var definedVariables, s, statement;
                    if (isScope) {
                        definedVariables = self.findDefinedVariables(scope);
                        self.generateVariableDeclarations(definedVariables, buffer, {
                            global: global
                        });
                    }
                    for (s = 0; s < self.statements.length; ++s) {
                        statement = self.statements[s];
                        buffer.write(statement.generateStatement(scope));
                    }
                    return void 0;
                });
            },
            promisify: function(gen3_options) {
                var self = this;
                var definitions, statements;
                definitions = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "definitions") && gen3_options.definitions !== void 0 ? gen3_options.definitions : void 0;
                statements = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "statements") && gen3_options.statements !== void 0 ? gen3_options.statements : false;
                var newPromise;
                if (!self.returnsPromise) {
                    newPromise = terms.newPromise({
                        statements: self
                    });
                    if (statements) {
                        return terms.statements([ terms.newPromise({
                            statements: self
                        }) ], {
                            returnsPromise: true,
                            definitions: definitions
                        });
                    } else {
                        if (self.statements.length === 1) {
                            return self.statements[0].promisify();
                        } else {
                            return terms.newPromise({
                                statements: self
                            });
                        }
                    }
                } else {
                    if (statements) {
                        return self;
                    } else {
                        return self.statements[0];
                    }
                }
            },
            rewriteResultTermInto: function(returnTerm, gen4_options) {
                var self = this;
                var async;
                async = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "async") && gen4_options.async !== void 0 ? gen4_options.async : false;
                var lastStatement, rewrittenLastStatement;
                if (self.statements.length > 0) {
                    lastStatement = self.statements[self.statements.length - 1];
                    rewrittenLastStatement = lastStatement.rewriteResultTermInto(function(term) {
                        return returnTerm(term);
                    }, {
                        async: async
                    });
                    if (rewrittenLastStatement) {
                        return self.statements[self.statements.length - 1] = rewrittenLastStatement;
                    } else {
                        return self.statements.push(returnTerm(terms.nil()));
                    }
                } else if (async) {
                    return self.statements.push(terms.functionCall(terms.onFulfilledFunction, []));
                }
            },
            rewriteLastStatementToReturn: function(gen5_options) {
                var self = this;
                var async;
                async = gen5_options !== void 0 && Object.prototype.hasOwnProperty.call(gen5_options, "async") && gen5_options.async !== void 0 ? gen5_options.async : false;
                var containsContinuation;
                containsContinuation = self.containsContinuation();
                return self.rewriteResultTermInto(function(term) {
                    if (async) {
                        return terms.functionCall(terms.onFulfilledFunction, [ term ]);
                    } else {
                        return terms.returnStatement(term, {
                            implicit: true
                        });
                    }
                });
            },
            generateVariableDeclarations: function(variables, buffer, gen6_options) {
                var self = this;
                var global;
                global = gen6_options !== void 0 && Object.prototype.hasOwnProperty.call(gen6_options, "global") && gen6_options.global !== void 0 ? gen6_options.global : false;
                if (variables.length > 0) {
                    if (!global) {
                        buffer.write("var ");
                        codegenUtils.writeToBufferWithDelimiter(variables, ",", buffer, function(variable) {
                            return buffer.write(variable);
                        });
                        return buffer.write(";");
                    }
                }
            },
            findDefinedVariables: function(scope) {
                var self = this;
                var definitions, variables, gen7_items, gen8_i, def;
                definitions = self._definitions || self.definitions();
                variables = codegenUtils.definedVariables(scope);
                gen7_items = definitions;
                for (gen8_i = 0; gen8_i < gen7_items.length; ++gen8_i) {
                    def = gen7_items[gen8_i];
                    def.defineVariables(variables);
                }
                return variables.names();
            },
            blockify: function(parameters, options) {
                var self = this;
                var statements;
                statements = function() {
                    if (self.isExpressionStatements) {
                        return self.cg.statements([ self ]);
                    } else {
                        return self;
                    }
                }();
                return terms.block(parameters, statements, options);
            },
            scopify: function() {
                var self = this;
                return self.cg.functionCall(self.cg.block([], self), []);
            },
            generate: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    if (self.statements.length > 0) {
                        return buffer.write(self.statements[self.statements.length - 1].generate(scope));
                    }
                });
            },
            generateStatement: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    if (self.statements.length > 0) {
                        return buffer.write(self.statements[self.statements.length - 1].generateStatement(scope));
                    }
                });
            },
            definitions: function(scope) {
                var self = this;
                return statementsUtils.definitions(self.statements);
            },
            serialiseStatements: function() {
                var self = this;
                self.statements = statementsUtils.serialiseStatements(self.statements);
                return void 0;
            },
            asyncify: function(gen9_options) {
                var self = this;
                var returnCallToContinuation;
                returnCallToContinuation = gen9_options !== void 0 && Object.prototype.hasOwnProperty.call(gen9_options, "returnCallToContinuation") && gen9_options.returnCallToContinuation !== void 0 ? gen9_options.returnCallToContinuation : true;
                if (!self.isAsync) {
                    self.rewriteLastStatementToReturn({
                        async: true,
                        returnCallToContinuation: returnCallToContinuation
                    });
                    return self.isAsync = true;
                }
            }
        });
    };
}).call(this);
},{"./codegenUtils":39,"./statementsUtils":84,"underscore":110}],84:[function(require,module,exports){
(function() {
    var self = this;
    exports.serialiseStatements = function(statements) {
        var self = this;
        var serialisedStatements, n, statement;
        serialisedStatements = [];
        for (n = 0; n < statements.length; ++n) {
            statement = statements[n].rewrite({
                rewrite: function(term, gen1_options) {
                    var rewrite;
                    rewrite = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "rewrite") && gen1_options.rewrite !== void 0 ? gen1_options.rewrite : void 0;
                    return term.serialiseSubStatements(serialisedStatements, {
                        rewrite: rewrite
                    });
                },
                limit: function(term) {
                    return term.isStatements;
                }
            });
            serialisedStatements.push(statement);
        }
        return serialisedStatements;
    };
    exports.definitions = function(statements) {
        var self = this;
        return function() {
            var gen2_results, gen3_items, gen4_i, s;
            gen2_results = [];
            gen3_items = statements;
            for (gen4_i = 0; gen4_i < gen3_items.length; ++gen4_i) {
                s = gen3_items[gen4_i];
                (function(s) {
                    var gen5_items, gen6_i, d;
                    if (!s.isNewScope) {
                        gen5_items = s.definitions();
                        for (gen6_i = 0; gen6_i < gen5_items.length; ++gen6_i) {
                            d = gen5_items[gen6_i];
                            (function(d) {
                                return gen2_results.push(d);
                            })(d);
                        }
                        return void 0;
                    }
                })(s);
            }
            return gen2_results;
        }();
    };
}).call(this);
},{}],85:[function(require,module,exports){
(function() {
    var self = this;
    var codegenUtils;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(value) {
                var self = this;
                self.isString = true;
                return self.string = value;
            },
            generate: function(scope) {
                var self = this;
                return self.code(codegenUtils.formatJavaScriptString(self.string));
            }
        });
    };
}).call(this);
},{"./codegenUtils":39}],86:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(expression) {
                var self = this;
                self.isSubExpression = true;
                return self.expression = expression;
            },
            generate: function(scope) {
                var self = this;
                return self.code("(", self.expression.generate(scope), ")");
            }
        });
    };
}).call(this);
},{}],87:[function(require,module,exports){
(function() {
    var self = this;
    var _, codegenUtils;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(statements) {
                var self = this;
                self.isSubStatements = true;
                return self.statements = statements;
            },
            serialiseSubStatements: function(statements, gen1_options) {
                var self = this;
                var rewrite;
                rewrite = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "rewrite") && gen1_options.rewrite !== void 0 ? gen1_options.rewrite : void 0;
                var firstStatements, rewrittenStatements, gen2_o, lastStatement;
                firstStatements = self.statements.slice(0, self.statements.length - 1);
                rewrittenStatements = _.map(firstStatements, function(statement) {
                    return rewrite(statement);
                });
                gen2_o = statements;
                gen2_o.push.apply(gen2_o, rewrittenStatements);
                lastStatement = self.statements[self.statements.length - 1];
                if (lastStatement.isSubStatements) {
                    return lastStatement.serialiseSubStatements(statements, {
                        rewrite: rewrite
                    });
                } else {
                    return lastStatement;
                }
            },
            generate: function() {
                var self = this;
                self.show();
                throw new Error("sub statements does not generate java script");
            }
        });
    };
}).call(this);
},{"./codegenUtils":39,"underscore":110}],88:[function(require,module,exports){
(function() {
    var self = this;
    var $class, classExtending, _, ms, sourceMap, buffer;
    $class = require("../class").class;
    classExtending = require("../class").classExtending;
    _ = require("underscore");
    ms = require("../memorystream");
    sourceMap = require("source-map");
    buffer = function() {
        var chunks;
        chunks = [];
        return {
            write: function(code) {
                var self = this;
                return chunks.push(code);
            },
            chunks: function() {
                var self = this;
                return chunks;
            }
        };
    };
    module.exports = function(cg) {
        var self = this;
        var Node, Term, termPrototype, term;
        Node = $class({
            cg: cg,
            constructor: function(members) {
                var self = this;
                var member;
                if (members) {
                    for (member in members) {
                        (function(member) {
                            if (members.hasOwnProperty(member)) {
                                self[member] = members[member];
                            }
                        })(member);
                    }
                    return void 0;
                }
            },
            setLocation: function(newLocation) {
                var self = this;
                return Object.defineProperty(self, "_location", {
                    value: newLocation,
                    writable: true
                });
            },
            location: function() {
                var self = this;
                var children, locations, firstLine, lastLine, locationsOnFirstLine, locationsOnLastLine;
                if (self._location) {
                    return self._location;
                } else {
                    children = self.children();
                    locations = function() {
                        var gen1_results, gen2_items, gen3_i, c;
                        gen1_results = [];
                        gen2_items = children;
                        for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
                            c = gen2_items[gen3_i];
                            (function(c) {
                                var loc;
                                loc = c.location();
                                if (loc) {
                                    return gen1_results.push(loc);
                                }
                            })(c);
                        }
                        return gen1_results;
                    }();
                    if (locations.length > 0) {
                        firstLine = _.min(function() {
                            var gen4_results, gen5_items, gen6_i, l;
                            gen4_results = [];
                            gen5_items = locations;
                            for (gen6_i = 0; gen6_i < gen5_items.length; ++gen6_i) {
                                l = gen5_items[gen6_i];
                                (function(l) {
                                    return gen4_results.push(l.firstLine);
                                })(l);
                            }
                            return gen4_results;
                        }());
                        lastLine = _.max(function() {
                            var gen7_results, gen8_items, gen9_i, l;
                            gen7_results = [];
                            gen8_items = locations;
                            for (gen9_i = 0; gen9_i < gen8_items.length; ++gen9_i) {
                                l = gen8_items[gen9_i];
                                (function(l) {
                                    return gen7_results.push(l.lastLine);
                                })(l);
                            }
                            return gen7_results;
                        }());
                        locationsOnFirstLine = function() {
                            var gen10_results, gen11_items, gen12_i, l;
                            gen10_results = [];
                            gen11_items = locations;
                            for (gen12_i = 0; gen12_i < gen11_items.length; ++gen12_i) {
                                l = gen11_items[gen12_i];
                                (function(l) {
                                    if (l.firstLine === firstLine) {
                                        return gen10_results.push(l);
                                    }
                                })(l);
                            }
                            return gen10_results;
                        }();
                        locationsOnLastLine = function() {
                            var gen13_results, gen14_items, gen15_i, l;
                            gen13_results = [];
                            gen14_items = locations;
                            for (gen15_i = 0; gen15_i < gen14_items.length; ++gen15_i) {
                                l = gen14_items[gen15_i];
                                (function(l) {
                                    if (l.lastLine === lastLine) {
                                        return gen13_results.push(l);
                                    }
                                })(l);
                            }
                            return gen13_results;
                        }();
                        return {
                            firstLine: firstLine,
                            lastLine: lastLine,
                            firstColumn: _.min(function() {
                                var gen16_results, gen17_items, gen18_i, l;
                                gen16_results = [];
                                gen17_items = locationsOnFirstLine;
                                for (gen18_i = 0; gen18_i < gen17_items.length; ++gen18_i) {
                                    l = gen17_items[gen18_i];
                                    (function(l) {
                                        return gen16_results.push(l.firstColumn);
                                    })(l);
                                }
                                return gen16_results;
                            }()),
                            lastColumn: _.max(function() {
                                var gen19_results, gen20_items, gen21_i, l;
                                gen19_results = [];
                                gen20_items = locationsOnLastLine;
                                for (gen21_i = 0; gen21_i < gen20_items.length; ++gen21_i) {
                                    l = gen20_items[gen21_i];
                                    (function(l) {
                                        return gen19_results.push(l.lastColumn);
                                    })(l);
                                }
                                return gen19_results;
                            }()),
                            filename: locations[0].filename
                        };
                    } else {
                        return void 0;
                    }
                }
            },
            clone: function(gen22_options) {
                var self = this;
                var rewrite, limit, createObject;
                rewrite = gen22_options !== void 0 && Object.prototype.hasOwnProperty.call(gen22_options, "rewrite") && gen22_options.rewrite !== void 0 ? gen22_options.rewrite : function(subterm) {
                    return void 0;
                };
                limit = gen22_options !== void 0 && Object.prototype.hasOwnProperty.call(gen22_options, "limit") && gen22_options.limit !== void 0 ? gen22_options.limit : function(subterm) {
                    return false;
                };
                createObject = gen22_options !== void 0 && Object.prototype.hasOwnProperty.call(gen22_options, "createObject") && gen22_options.createObject !== void 0 ? gen22_options.createObject : function(node) {
                    return Object.create(Object.getPrototypeOf(node));
                };
                var cloneObject, cloneNode, cloneArray, cloneSubterm;
                cloneObject = function(node, allowRewrite, path) {
                    var t, member;
                    t = createObject(node);
                    for (member in node) {
                        (function(member) {
                            if (node.hasOwnProperty(member)) {
                                t[member] = cloneSubterm(node[member], allowRewrite && member[0] !== "_", path);
                            }
                        })(member);
                    }
                    return t;
                };
                cloneNode = function(originalNode, allowRewrite, path) {
                    var rewrittenNode, subClone;
                    if (originalNode.dontClone) {
                        return originalNode;
                    } else {
                        try {
                            path.push(originalNode);
                            rewrittenNode = function() {
                                if (originalNode instanceof Node && allowRewrite) {
                                    subClone = function(node) {
                                        if (node) {
                                            return cloneSubterm(node, allowRewrite, path);
                                        } else {
                                            return cloneObject(originalNode, allowRewrite, path);
                                        }
                                    };
                                    return rewrite(originalNode, {
                                        path: path,
                                        clone: subClone,
                                        rewrite: subClone
                                    });
                                } else {
                                    return void 0;
                                }
                            }();
                            if (!rewrittenNode) {
                                return cloneObject(originalNode, allowRewrite, path);
                            } else {
                                if (!(rewrittenNode instanceof Node)) {
                                    throw new Error("rewritten node not an instance of Node");
                                }
                                rewrittenNode.isDerivedFrom(originalNode);
                                return rewrittenNode;
                            }
                        } finally {
                            path.pop();
                        }
                    }
                };
                cloneArray = function(terms, allowRewrite, path) {
                    try {
                        path.push(terms);
                        return function() {
                            var gen23_results, gen24_items, gen25_i, node;
                            gen23_results = [];
                            gen24_items = terms;
                            for (gen25_i = 0; gen25_i < gen24_items.length; ++gen25_i) {
                                node = gen24_items[gen25_i];
                                (function(node) {
                                    return gen23_results.push(cloneSubterm(node, allowRewrite, path));
                                })(node);
                            }
                            return gen23_results;
                        }();
                    } finally {
                        path.pop();
                    }
                };
                cloneSubterm = function(subterm, allowRewrite, path) {
                    if (subterm instanceof Array) {
                        return cloneArray(subterm, allowRewrite, path);
                    } else if (subterm instanceof Function) {
                        return subterm;
                    } else if (subterm instanceof Object) {
                        return cloneNode(subterm, allowRewrite && !limit(subterm, {
                            path: path
                        }), path);
                    } else {
                        return subterm;
                    }
                };
                return cloneSubterm(self, true, []);
            },
            isDerivedFrom: function(ancestorNode) {
                var self = this;
                return self.setLocation(ancestorNode.location());
            },
            rewrite: function(options) {
                var self = this;
                options = options || {};
                options.createObject = function(node) {
                    var self = this;
                    return node;
                };
                return self.clone(options);
            },
            children: function() {
                var self = this;
                var children, addMember, addMembersInObject;
                children = [];
                addMember = function(member) {
                    var gen26_items, gen27_i, item;
                    if (member instanceof Node) {
                        return children.push(member);
                    } else if (member instanceof Array) {
                        gen26_items = member;
                        for (gen27_i = 0; gen27_i < gen26_items.length; ++gen27_i) {
                            item = gen26_items[gen27_i];
                            addMember(item);
                        }
                        return void 0;
                    } else if (member instanceof Object) {
                        return addMembersInObject(member);
                    }
                };
                addMembersInObject = function(object) {
                    var property;
                    for (property in object) {
                        (function(property) {
                            var member;
                            if (object.hasOwnProperty(property) && property[0] !== "_") {
                                member = object[property];
                                addMember(member);
                            }
                        })(property);
                    }
                    return void 0;
                };
                addMembersInObject(self);
                return children;
            },
            walkDescendants: function(walker, gen28_options) {
                var self = this;
                var limit;
                limit = gen28_options !== void 0 && Object.prototype.hasOwnProperty.call(gen28_options, "limit") && gen28_options.limit !== void 0 ? gen28_options.limit : function() {
                    return false;
                };
                var path, walkChildren;
                path = [];
                walkChildren = function(node) {
                    var gen29_items, gen30_i, child;
                    try {
                        path.push(node);
                        gen29_items = node.children();
                        for (gen30_i = 0; gen30_i < gen29_items.length; ++gen30_i) {
                            child = gen29_items[gen30_i];
                            walker(child, path);
                            if (!limit(child, path)) {
                                walkChildren(child);
                            }
                        }
                        return void 0;
                    } finally {
                        path.pop();
                    }
                };
                return walkChildren(self);
            },
            walkDescendantsNotBelowIf: function(walker, limit) {
                var self = this;
                return self.walkDescendants(walker, {
                    limit: limit
                });
            },
            reduceWithReducedChildrenInto: function(reducer, gen31_options) {
                var self = this;
                var limit, cacheName;
                limit = gen31_options !== void 0 && Object.prototype.hasOwnProperty.call(gen31_options, "limit") && gen31_options.limit !== void 0 ? gen31_options.limit : function(term) {
                    return false;
                };
                cacheName = gen31_options !== void 0 && Object.prototype.hasOwnProperty.call(gen31_options, "cacheName") && gen31_options.cacheName !== void 0 ? gen31_options.cacheName : void 0;
                var path, cachingReducer, mapReduceChildren;
                path = [];
                cachingReducer = function() {
                    if (cacheName) {
                        return function(node, reducedChildren) {
                            var reducedValue;
                            if (node.hasOwnProperty("reductionCache")) {
                                if (node.reductionCache.hasOwnProperty(cacheName)) {
                                    return node.reductionCache[cacheName];
                                }
                            } else {
                                reducedValue = reducer(node, reducedChildren);
                                if (!node.hasOwnProperty("reductionCache")) {
                                    node.reductionCache = {};
                                }
                                node.reductionCache[cacheName] = reducedValue;
                                return reducedValue;
                            }
                        };
                    } else {
                        return reducer;
                    }
                }();
                mapReduceChildren = function(node) {
                    var mappedChildren, gen32_items, gen33_i, child;
                    try {
                        path.push(node);
                        mappedChildren = [];
                        gen32_items = node.children();
                        for (gen33_i = 0; gen33_i < gen32_items.length; ++gen33_i) {
                            child = gen32_items[gen33_i];
                            if (!limit(child, path)) {
                                mappedChildren.push(mapReduceChildren(child));
                            }
                        }
                        return cachingReducer(node, mappedChildren);
                    } finally {
                        path.pop();
                    }
                };
                return mapReduceChildren(self);
            }
        });
        Term = classExtending(Node, {
            arguments: function() {
                var self = this;
                return self;
            },
            inspectTerm: function(gen34_options) {
                var self = this;
                var depth;
                depth = gen34_options !== void 0 && Object.prototype.hasOwnProperty.call(gen34_options, "depth") && gen34_options.depth !== void 0 ? gen34_options.depth : 20;
                var util;
                util = require("util");
                return util.inspect(self, false, depth);
            },
            show: function(gen35_options) {
                var self = this;
                var desc, depth;
                desc = gen35_options !== void 0 && Object.prototype.hasOwnProperty.call(gen35_options, "desc") && gen35_options.desc !== void 0 ? gen35_options.desc : void 0;
                depth = gen35_options !== void 0 && Object.prototype.hasOwnProperty.call(gen35_options, "depth") && gen35_options.depth !== void 0 ? gen35_options.depth : 20;
                if (desc) {
                    return console.log(desc, self.inspectTerm({
                        depth: depth
                    }));
                } else {
                    return console.log(self.inspectTerm({
                        depth: depth
                    }));
                }
            },
            hashEntry: function() {
                var self = this;
                return self.cg.errors.addTermWithMessage(self, "cannot be used as a hash entry");
            },
            hashEntryField: function() {
                var self = this;
                return self.cg.errors.addTermWithMessage(self, "cannot be used as a field name");
            },
            blockify: function(parameters, options) {
                var self = this;
                return self.cg.block(parameters, self.cg.asyncStatements([ self ]), options);
            },
            scopify: function() {
                var self = this;
                return self;
            },
            parameter: function() {
                var self = this;
                return self.cg.errors.addTermWithMessage(self, "this cannot be used as a parameter");
            },
            subterms: function() {
                var self = this;
                return void 0;
            },
            expandMacro: function() {
                var self = this;
                return void 0;
            },
            expandMacros: function() {
                var self = this;
                return self.clone({
                    rewrite: function(term, gen36_options) {
                        var clone;
                        clone = gen36_options !== void 0 && Object.prototype.hasOwnProperty.call(gen36_options, "clone") && gen36_options.clone !== void 0 ? gen36_options.clone : void 0;
                        return term.expandMacro(clone);
                    }
                });
            },
            rewriteStatements: function() {
                var self = this;
                return void 0;
            },
            rewriteAllStatements: function() {
                var self = this;
                return self.clone({
                    rewrite: function(term, gen37_options) {
                        var clone;
                        clone = gen37_options !== void 0 && Object.prototype.hasOwnProperty.call(gen37_options, "clone") && gen37_options.clone !== void 0 ? gen37_options.clone : void 0;
                        return term.rewriteStatements(clone);
                    }
                });
            },
            serialiseSubStatements: function() {
                var self = this;
                return void 0;
            },
            serialiseStatements: function() {
                var self = this;
                return void 0;
            },
            serialiseAllStatements: function() {
                var self = this;
                return self.rewrite({
                    rewrite: function(term) {
                        return term.serialiseStatements();
                    }
                });
            },
            defineVariables: function() {
                var self = this;
                return void 0;
            },
            canonicalName: function() {
                var self = this;
                return void 0;
            },
            definitions: function() {
                var self = this;
                var defs;
                defs = [];
                self.walkDescendantsNotBelowIf(function(term) {
                    if (term.isDefinition) {
                        return defs.push(term);
                    }
                }, function(term) {
                    return term.isNewScope;
                });
                if (self.isDefinition) {
                    defs.push(self);
                }
                return defs;
            },
            makeAsyncWithCallbackForResult: function(createCallbackForResult) {
                var self = this;
                return void 0;
            },
            containsContinuation: function() {
                var self = this;
                var found;
                found = false;
                self.walkDescendants(function(term) {
                    return found = term.isContinuation || found;
                }, {
                    limit: function(term) {
                        return term.isClosure && term.isAsync;
                    }
                });
                return found;
            },
            containsAsync: function() {
                var self = this;
                var isAsync;
                isAsync = false;
                self.walkDescendants(function(term) {
                    return isAsync = isAsync || term.isDefinition && term.isAsync;
                }, {
                    limit: function(term) {
                        return term.isClosure;
                    }
                });
                return isAsync;
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return returnTerm(self);
            },
            asyncify: function() {
                var self = this;
                return void 0;
            },
            alreadyPromise: function() {
                var self = this;
                self._alreadyPromise = true;
                return self;
            },
            promisify: function() {
                var self = this;
                if (self._alreadyPromise) {
                    return self;
                } else {
                    return cg.methodCall(cg.promise(), [ "resolve" ], [ self ]).alreadyPromise();
                }
            },
            code: function() {
                var self = this;
                var chunks = Array.prototype.slice.call(arguments, 0, arguments.length);
                var location;
                location = self.location();
                if (location) {
                    return new sourceMap.SourceNode(location.firstLine, location.firstColumn, location.filename, chunks);
                } else {
                    return chunks;
                }
            },
            generateIntoBuffer: function(generateCodeIntoBuffer) {
                var self = this;
                var chunks, location;
                chunks = function() {
                    var b;
                    b = buffer();
                    generateCodeIntoBuffer(b);
                    return b.chunks();
                }();
                location = self.location();
                if (location) {
                    return new sourceMap.SourceNode(location.firstLine, location.firstColumn, location.filename, chunks);
                } else {
                    return chunks;
                }
            },
            generateStatement: function(scope) {
                var self = this;
                return self.code(self.generate(scope), ";");
            },
            generateFunction: function(scope) {
                var self = this;
                return self.generate(scope);
            }
        });
        termPrototype = new Term();
        term = function(members) {
            var termConstructor, gen38_c;
            termConstructor = classExtending(Term, members);
            return function() {
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen38_c;
                gen38_c = function() {
                    termConstructor.apply(this, args);
                };
                gen38_c.prototype = termConstructor.prototype;
                return new gen38_c();
            };
        };
        return {
            Node: Node,
            Term: Term,
            term: term,
            termPrototype: termPrototype
        };
    };
}).call(this);
},{"../class":2,"../memorystream":5,"source-map":100,"underscore":110,"util":99}],89:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(expr) {
                var self = this;
                self.isThrow = true;
                return self.expression = expr;
            },
            generateStatement: function(scope) {
                var self = this;
                return self.code("throw ", self.expression.generate(scope), ";");
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return self;
            }
        });
    };
}).call(this);
},{}],90:[function(require,module,exports){
(function() {
    var self = this;
    var asyncControl;
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        var tryExpressionTerm, catchClause, finallyClause, tryExpression;
        tryExpressionTerm = terms.term({
            constructor: function(body, gen1_options) {
                var self = this;
                var catchBody, catchParameter, finallyBody;
                catchBody = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "catchBody") && gen1_options.catchBody !== void 0 ? gen1_options.catchBody : void 0;
                catchParameter = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "catchParameter") && gen1_options.catchParameter !== void 0 ? gen1_options.catchParameter : void 0;
                finallyBody = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "finallyBody") && gen1_options.finallyBody !== void 0 ? gen1_options.finallyBody : void 0;
                self.isTryExpression = true;
                self.body = body;
                self.catchBody = catchBody;
                self.catchParameter = catchParameter;
                return self.finallyBody = finallyBody;
            },
            generateStatement: function(scope, returnStatements) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    buffer.write("try{");
                    buffer.write(self.body.generateStatements(scope));
                    buffer.write("}");
                    if (self.catchBody) {
                        buffer.write("catch(");
                        buffer.write(self.catchParameter.generate(scope));
                        buffer.write("){");
                        buffer.write(self.catchBody.generateStatements(scope));
                        buffer.write("}");
                    }
                    if (self.finallyBody) {
                        buffer.write("finally{");
                        buffer.write(self.finallyBody.generateStatements(scope));
                        return buffer.write("}");
                    }
                });
            },
            generate: function(symbolScope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    if (self.alreadyCalled) {
                        throw new Error("stuff");
                    }
                    self.alreadyCalled = true;
                    return buffer.write(self.cg.scope([ self ], {
                        alwaysGenerateFunction: true
                    }).generate(symbolScope));
                });
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                self.body.rewriteResultTermInto(returnTerm);
                if (self.catchBody) {
                    self.catchBody.rewriteResultTermInto(returnTerm);
                }
                return self;
            }
        });
        catchClause = function(body, catchParameter, catchBody) {
            return terms.methodCall(body, [ "then" ], [ terms.nil(), terms.closure([ catchParameter ], catchBody) ]).alreadyPromise();
        };
        finallyClause = function(body, finallyBody) {
            var result, finallyBlock;
            result = terms.generatedVariable([ "result" ]);
            finallyBlock = function(gen2_options) {
                var throwResult;
                throwResult = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "throwResult") && gen2_options.throwResult !== void 0 ? gen2_options.throwResult : false;
                var resultStatement;
                resultStatement = function() {
                    if (throwResult) {
                        return terms.throwStatement(result);
                    } else {
                        return result;
                    }
                }();
                return terms.closure([ result ], terms.statements([ terms.methodCall(finallyBody.promisify(), [ "then" ], [ terms.closure([], terms.statements([ resultStatement ])) ]) ]));
            };
            return terms.methodCall(body, [ "then" ], [ finallyBlock(), finallyBlock({
                throwResult: true
            }) ]).alreadyPromise();
        };
        return tryExpression = function(body, gen3_options) {
            var catchBody, catchParameter, finallyBody;
            catchBody = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "catchBody") && gen3_options.catchBody !== void 0 ? gen3_options.catchBody : void 0;
            catchParameter = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "catchParameter") && gen3_options.catchParameter !== void 0 ? gen3_options.catchParameter : void 0;
            finallyBody = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "finallyBody") && gen3_options.finallyBody !== void 0 ? gen3_options.finallyBody : void 0;
            if (body.returnsPromise || catchBody && catchBody.returnsPromise || finallyBody && finallyBody.returnsPromise) {
                if (catchBody) {
                    if (finallyBody) {
                        return terms.resolve(finallyClause(catchClause(body.promisify(), catchParameter, catchBody), finallyBody));
                    } else {
                        return terms.resolve(catchClause(body.promisify(), catchParameter, catchBody));
                    }
                } else if (finallyBody) {
                    return terms.resolve(finallyClause(body.promisify(), finallyBody));
                } else {
                    return terms.resolve(body);
                }
            } else {
                return tryExpressionTerm(body, {
                    catchBody: catchBody,
                    catchParameter: catchParameter,
                    finallyBody: finallyBody
                });
            }
        };
    };
}).call(this);
},{"../asyncControl":1}],91:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(expression, type) {
                var self = this;
                self.isInstanceOf = true;
                self.expression = expression;
                return self.type = type;
            },
            generate: function(scope) {
                var self = this;
                return self.code("(typeof(", self.expression.generate(scope), ") === '" + self.type + "')");
            }
        });
    };
}).call(this);
},{}],92:[function(require,module,exports){
(function() {
    var self = this;
    var codegenUtils;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        var variableTerm, variable;
        variableTerm = terms.term({
            constructor: function(name, gen1_options) {
                var self = this;
                var location, tag;
                location = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "location") && gen1_options.location !== void 0 ? gen1_options.location : void 0;
                tag = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "tag") && gen1_options.tag !== void 0 ? gen1_options.tag : void 0;
                self.variable = name;
                self.isVariable = true;
                self.setLocation(location);
                return self.tag = tag;
            },
            declare: function(scope) {
                var self = this;
                if (self.tag) {
                    return scope.defineWithTag(self.canonicalName(), self.tag);
                } else {
                    return scope.define(self.canonicalName());
                }
            },
            canonicalName: function() {
                var self = this;
                return codegenUtils.concatName(self.variable, {
                    escape: true
                });
            },
            displayName: function() {
                var self = this;
                return self.variable.join(" ");
            },
            generate: function(scope) {
                var self = this;
                if (self.tag) {
                    return self.code(scope.findTag(self.tag));
                } else {
                    return self.code(self.canonicalName());
                }
            },
            generateTarget: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen2_o;
                gen2_o = self;
                return gen2_o.generate.apply(gen2_o, args);
            },
            hashEntryField: function() {
                var self = this;
                return self.variable;
            },
            parameter: function() {
                var self = this;
                return self;
            }
        });
        return variable = function(name, gen3_options) {
            var couldBeMacro, location, tag;
            couldBeMacro = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "couldBeMacro") && gen3_options.couldBeMacro !== void 0 ? gen3_options.couldBeMacro : true;
            location = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "location") && gen3_options.location !== void 0 ? gen3_options.location : void 0;
            tag = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "tag") && gen3_options.tag !== void 0 ? gen3_options.tag : void 0;
            var v, macro;
            v = variableTerm(name, {
                location: location,
                tag: tag
            });
            if (couldBeMacro) {
                macro = terms.macros.findMacro(name);
                if (macro) {
                    return macro(v, name);
                }
            }
            return v;
        };
    };
}).call(this);
},{"./codegenUtils":39}],93:[function(require,module,exports){
(function() {
    var self = this;
    var asyncControl;
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        var whileExpressionTerm, whileExpression;
        whileExpressionTerm = terms.term({
            constructor: function(condition, statements) {
                var self = this;
                self.isWhile = true;
                self.condition = condition;
                return self.statements = statements;
            },
            generate: function(scope) {
                var self = this;
                return self.code("while(", self.condition.generate(scope), "){", self.statements.generateStatements(scope), "}");
            },
            generateStatement: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen1_o;
                gen1_o = self;
                return gen1_o.generate.apply(gen1_o, args);
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return void 0;
            }
        });
        return whileExpression = function(condition, statements) {
            var conditionStatements, asyncWhileFunction;
            conditionStatements = terms.asyncStatements([ condition ]);
            if (statements.isAsync || conditionStatements.isAsync) {
                asyncWhileFunction = terms.moduleConstants.defineAs([ "async", "while" ], terms.javascript(asyncControl.while.toString()));
                return terms.functionCall(asyncWhileFunction, [ terms.argumentUtils.asyncifyBody(conditionStatements), terms.argumentUtils.asyncifyBody(statements) ], {
                    async: true
                });
            } else {
                return whileExpressionTerm(condition, statements);
            }
        };
    };
}).call(this);
},{"../asyncControl":1}],94:[function(require,module,exports){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var withExpressionTerm, withExpression;
        withExpressionTerm = terms.term({
            constructor: function(subject, statements) {
                var self = this;
                self.isWith = true;
                self.subject = subject;
                return self.statements = statements;
            },
            generate: function(scope) {
                var self = this;
                return self.code("with(", self.subject.generate(scope), "){", self.statements.generateStatements(scope), "}");
            },
            generateStatement: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen1_o;
                gen1_o = self;
                return gen1_o.generate.apply(gen1_o, args);
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return self;
            }
        });
        return withExpression = function(subject, statements) {
            return withExpressionTerm(subject, statements);
        };
    };
}).call(this);
},{}],95:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],96:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require("FWaASH"))
},{"FWaASH":97}],97:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],98:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],99:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("FWaASH"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":98,"FWaASH":97,"inherits":95}],100:[function(require,module,exports){
/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
exports.SourceMapGenerator = require('./source-map/source-map-generator').SourceMapGenerator;
exports.SourceMapConsumer = require('./source-map/source-map-consumer').SourceMapConsumer;
exports.SourceNode = require('./source-map/source-node').SourceNode;

},{"./source-map/source-map-consumer":105,"./source-map/source-map-generator":106,"./source-map/source-node":107}],101:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');

  /**
   * A data structure which is a combination of an array and a set. Adding a new
   * member is O(1), testing for membership is O(1), and finding the index of an
   * element is O(1). Removing elements from the set is not supported. Only
   * strings are supported for membership.
   */
  function ArraySet() {
    this._array = [];
    this._set = {};
  }

  /**
   * Static method for creating ArraySet instances from an existing array.
   */
  ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
    var set = new ArraySet();
    for (var i = 0, len = aArray.length; i < len; i++) {
      set.add(aArray[i], aAllowDuplicates);
    }
    return set;
  };

  /**
   * Add the given string to this set.
   *
   * @param String aStr
   */
  ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
    var isDuplicate = this.has(aStr);
    var idx = this._array.length;
    if (!isDuplicate || aAllowDuplicates) {
      this._array.push(aStr);
    }
    if (!isDuplicate) {
      this._set[util.toSetString(aStr)] = idx;
    }
  };

  /**
   * Is the given string a member of this set?
   *
   * @param String aStr
   */
  ArraySet.prototype.has = function ArraySet_has(aStr) {
    return Object.prototype.hasOwnProperty.call(this._set,
                                                util.toSetString(aStr));
  };

  /**
   * What is the index of the given string in the array?
   *
   * @param String aStr
   */
  ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
    if (this.has(aStr)) {
      return this._set[util.toSetString(aStr)];
    }
    throw new Error('"' + aStr + '" is not in the set.');
  };

  /**
   * What is the element at the given index?
   *
   * @param Number aIdx
   */
  ArraySet.prototype.at = function ArraySet_at(aIdx) {
    if (aIdx >= 0 && aIdx < this._array.length) {
      return this._array[aIdx];
    }
    throw new Error('No element indexed by ' + aIdx);
  };

  /**
   * Returns the array representation of this set (which has the proper indices
   * indicated by indexOf). Note that this is a copy of the internal array used
   * for storing the members so that no one can mess with internal state.
   */
  ArraySet.prototype.toArray = function ArraySet_toArray() {
    return this._array.slice();
  };

  exports.ArraySet = ArraySet;

});

},{"./util":108,"amdefine":109}],102:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var base64 = require('./base64');

  // A single base 64 digit can contain 6 bits of data. For the base 64 variable
  // length quantities we use in the source map spec, the first bit is the sign,
  // the next four bits are the actual value, and the 6th bit is the
  // continuation bit. The continuation bit tells us whether there are more
  // digits in this value following this digit.
  //
  //   Continuation
  //   |    Sign
  //   |    |
  //   V    V
  //   101011

  var VLQ_BASE_SHIFT = 5;

  // binary: 100000
  var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

  // binary: 011111
  var VLQ_BASE_MASK = VLQ_BASE - 1;

  // binary: 100000
  var VLQ_CONTINUATION_BIT = VLQ_BASE;

  /**
   * Converts from a two-complement value to a value where the sign bit is
   * is placed in the least significant bit.  For example, as decimals:
   *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
   *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
   */
  function toVLQSigned(aValue) {
    return aValue < 0
      ? ((-aValue) << 1) + 1
      : (aValue << 1) + 0;
  }

  /**
   * Converts to a two-complement value from a value where the sign bit is
   * is placed in the least significant bit.  For example, as decimals:
   *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
   *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
   */
  function fromVLQSigned(aValue) {
    var isNegative = (aValue & 1) === 1;
    var shifted = aValue >> 1;
    return isNegative
      ? -shifted
      : shifted;
  }

  /**
   * Returns the base 64 VLQ encoded value.
   */
  exports.encode = function base64VLQ_encode(aValue) {
    var encoded = "";
    var digit;

    var vlq = toVLQSigned(aValue);

    do {
      digit = vlq & VLQ_BASE_MASK;
      vlq >>>= VLQ_BASE_SHIFT;
      if (vlq > 0) {
        // There are still more digits in this value, so we must make sure the
        // continuation bit is marked.
        digit |= VLQ_CONTINUATION_BIT;
      }
      encoded += base64.encode(digit);
    } while (vlq > 0);

    return encoded;
  };

  /**
   * Decodes the next base 64 VLQ value from the given string and returns the
   * value and the rest of the string.
   */
  exports.decode = function base64VLQ_decode(aStr) {
    var i = 0;
    var strLen = aStr.length;
    var result = 0;
    var shift = 0;
    var continuation, digit;

    do {
      if (i >= strLen) {
        throw new Error("Expected more digits in base 64 VLQ value.");
      }
      digit = base64.decode(aStr.charAt(i++));
      continuation = !!(digit & VLQ_CONTINUATION_BIT);
      digit &= VLQ_BASE_MASK;
      result = result + (digit << shift);
      shift += VLQ_BASE_SHIFT;
    } while (continuation);

    return {
      value: fromVLQSigned(result),
      rest: aStr.slice(i)
    };
  };

});

},{"./base64":103,"amdefine":109}],103:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var charToIntMap = {};
  var intToCharMap = {};

  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    .split('')
    .forEach(function (ch, index) {
      charToIntMap[ch] = index;
      intToCharMap[index] = ch;
    });

  /**
   * Encode an integer in the range of 0 to 63 to a single base 64 digit.
   */
  exports.encode = function base64_encode(aNumber) {
    if (aNumber in intToCharMap) {
      return intToCharMap[aNumber];
    }
    throw new TypeError("Must be between 0 and 63: " + aNumber);
  };

  /**
   * Decode a single base 64 digit to an integer.
   */
  exports.decode = function base64_decode(aChar) {
    if (aChar in charToIntMap) {
      return charToIntMap[aChar];
    }
    throw new TypeError("Not a valid base 64 digit: " + aChar);
  };

});

},{"amdefine":109}],104:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  /**
   * Recursive implementation of binary search.
   *
   * @param aLow Indices here and lower do not contain the needle.
   * @param aHigh Indices here and higher do not contain the needle.
   * @param aNeedle The element being searched for.
   * @param aHaystack The non-empty array being searched.
   * @param aCompare Function which takes two elements and returns -1, 0, or 1.
   */
  function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare) {
    // This function terminates when one of the following is true:
    //
    //   1. We find the exact element we are looking for.
    //
    //   2. We did not find the exact element, but we can return the next
    //      closest element that is less than that element.
    //
    //   3. We did not find the exact element, and there is no next-closest
    //      element which is less than the one we are searching for, so we
    //      return null.
    var mid = Math.floor((aHigh - aLow) / 2) + aLow;
    var cmp = aCompare(aNeedle, aHaystack[mid], true);
    if (cmp === 0) {
      // Found the element we are looking for.
      return aHaystack[mid];
    }
    else if (cmp > 0) {
      // aHaystack[mid] is greater than our needle.
      if (aHigh - mid > 1) {
        // The element is in the upper half.
        return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare);
      }
      // We did not find an exact match, return the next closest one
      // (termination case 2).
      return aHaystack[mid];
    }
    else {
      // aHaystack[mid] is less than our needle.
      if (mid - aLow > 1) {
        // The element is in the lower half.
        return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare);
      }
      // The exact needle element was not found in this haystack. Determine if
      // we are in termination case (2) or (3) and return the appropriate thing.
      return aLow < 0
        ? null
        : aHaystack[aLow];
    }
  }

  /**
   * This is an implementation of binary search which will always try and return
   * the next lowest value checked if there is no exact hit. This is because
   * mappings between original and generated line/col pairs are single points,
   * and there is an implicit region between each of them, so a miss just means
   * that you aren't on the very start of a region.
   *
   * @param aNeedle The element you are looking for.
   * @param aHaystack The array that is being searched.
   * @param aCompare A function which takes the needle and an element in the
   *     array and returns -1, 0, or 1 depending on whether the needle is less
   *     than, equal to, or greater than the element, respectively.
   */
  exports.search = function search(aNeedle, aHaystack, aCompare) {
    return aHaystack.length > 0
      ? recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare)
      : null;
  };

});

},{"amdefine":109}],105:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');
  var binarySearch = require('./binary-search');
  var ArraySet = require('./array-set').ArraySet;
  var base64VLQ = require('./base64-vlq');

  /**
   * A SourceMapConsumer instance represents a parsed source map which we can
   * query for information about the original file positions by giving it a file
   * position in the generated source.
   *
   * The only parameter is the raw source map (either as a JSON string, or
   * already parsed to an object). According to the spec, source maps have the
   * following attributes:
   *
   *   - version: Which version of the source map spec this map is following.
   *   - sources: An array of URLs to the original source files.
   *   - names: An array of identifiers which can be referrenced by individual mappings.
   *   - sourceRoot: Optional. The URL root from which all sources are relative.
   *   - sourcesContent: Optional. An array of contents of the original source files.
   *   - mappings: A string of base64 VLQs which contain the actual mappings.
   *   - file: Optional. The generated file this source map is associated with.
   *
   * Here is an example source map, taken from the source map spec[0]:
   *
   *     {
   *       version : 3,
   *       file: "out.js",
   *       sourceRoot : "",
   *       sources: ["foo.js", "bar.js"],
   *       names: ["src", "maps", "are", "fun"],
   *       mappings: "AA,AB;;ABCDE;"
   *     }
   *
   * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
   */
  function SourceMapConsumer(aSourceMap) {
    var sourceMap = aSourceMap;
    if (typeof aSourceMap === 'string') {
      sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
    }

    var version = util.getArg(sourceMap, 'version');
    var sources = util.getArg(sourceMap, 'sources');
    // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
    // requires the array) to play nice here.
    var names = util.getArg(sourceMap, 'names', []);
    var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
    var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
    var mappings = util.getArg(sourceMap, 'mappings');
    var file = util.getArg(sourceMap, 'file', null);

    // Once again, Sass deviates from the spec and supplies the version as a
    // string rather than a number, so we use loose equality checking here.
    if (version != this._version) {
      throw new Error('Unsupported version: ' + version);
    }

    // Pass `true` below to allow duplicate names and sources. While source maps
    // are intended to be compressed and deduplicated, the TypeScript compiler
    // sometimes generates source maps with duplicates in them. See Github issue
    // #72 and bugzil.la/889492.
    this._names = ArraySet.fromArray(names, true);
    this._sources = ArraySet.fromArray(sources, true);

    this.sourceRoot = sourceRoot;
    this.sourcesContent = sourcesContent;
    this._mappings = mappings;
    this.file = file;
  }

  /**
   * Create a SourceMapConsumer from a SourceMapGenerator.
   *
   * @param SourceMapGenerator aSourceMap
   *        The source map that will be consumed.
   * @returns SourceMapConsumer
   */
  SourceMapConsumer.fromSourceMap =
    function SourceMapConsumer_fromSourceMap(aSourceMap) {
      var smc = Object.create(SourceMapConsumer.prototype);

      smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
      smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
      smc.sourceRoot = aSourceMap._sourceRoot;
      smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                              smc.sourceRoot);
      smc.file = aSourceMap._file;

      smc.__generatedMappings = aSourceMap._mappings.slice()
        .sort(util.compareByGeneratedPositions);
      smc.__originalMappings = aSourceMap._mappings.slice()
        .sort(util.compareByOriginalPositions);

      return smc;
    };

  /**
   * The version of the source mapping spec that we are consuming.
   */
  SourceMapConsumer.prototype._version = 3;

  /**
   * The list of original sources.
   */
  Object.defineProperty(SourceMapConsumer.prototype, 'sources', {
    get: function () {
      return this._sources.toArray().map(function (s) {
        return this.sourceRoot != null ? util.join(this.sourceRoot, s) : s;
      }, this);
    }
  });

  // `__generatedMappings` and `__originalMappings` are arrays that hold the
  // parsed mapping coordinates from the source map's "mappings" attribute. They
  // are lazily instantiated, accessed via the `_generatedMappings` and
  // `_originalMappings` getters respectively, and we only parse the mappings
  // and create these arrays once queried for a source location. We jump through
  // these hoops because there can be many thousands of mappings, and parsing
  // them is expensive, so we only want to do it if we must.
  //
  // Each object in the arrays is of the form:
  //
  //     {
  //       generatedLine: The line number in the generated code,
  //       generatedColumn: The column number in the generated code,
  //       source: The path to the original source file that generated this
  //               chunk of code,
  //       originalLine: The line number in the original source that
  //                     corresponds to this chunk of generated code,
  //       originalColumn: The column number in the original source that
  //                       corresponds to this chunk of generated code,
  //       name: The name of the original symbol which generated this chunk of
  //             code.
  //     }
  //
  // All properties except for `generatedLine` and `generatedColumn` can be
  // `null`.
  //
  // `_generatedMappings` is ordered by the generated positions.
  //
  // `_originalMappings` is ordered by the original positions.

  SourceMapConsumer.prototype.__generatedMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
    get: function () {
      if (!this.__generatedMappings) {
        this.__generatedMappings = [];
        this.__originalMappings = [];
        this._parseMappings(this._mappings, this.sourceRoot);
      }

      return this.__generatedMappings;
    }
  });

  SourceMapConsumer.prototype.__originalMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
    get: function () {
      if (!this.__originalMappings) {
        this.__generatedMappings = [];
        this.__originalMappings = [];
        this._parseMappings(this._mappings, this.sourceRoot);
      }

      return this.__originalMappings;
    }
  });

  /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */
  SourceMapConsumer.prototype._parseMappings =
    function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      var generatedLine = 1;
      var previousGeneratedColumn = 0;
      var previousOriginalLine = 0;
      var previousOriginalColumn = 0;
      var previousSource = 0;
      var previousName = 0;
      var mappingSeparator = /^[,;]/;
      var str = aStr;
      var mapping;
      var temp;

      while (str.length > 0) {
        if (str.charAt(0) === ';') {
          generatedLine++;
          str = str.slice(1);
          previousGeneratedColumn = 0;
        }
        else if (str.charAt(0) === ',') {
          str = str.slice(1);
        }
        else {
          mapping = {};
          mapping.generatedLine = generatedLine;

          // Generated column.
          temp = base64VLQ.decode(str);
          mapping.generatedColumn = previousGeneratedColumn + temp.value;
          previousGeneratedColumn = mapping.generatedColumn;
          str = temp.rest;

          if (str.length > 0 && !mappingSeparator.test(str.charAt(0))) {
            // Original source.
            temp = base64VLQ.decode(str);
            mapping.source = this._sources.at(previousSource + temp.value);
            previousSource += temp.value;
            str = temp.rest;
            if (str.length === 0 || mappingSeparator.test(str.charAt(0))) {
              throw new Error('Found a source, but no line and column');
            }

            // Original line.
            temp = base64VLQ.decode(str);
            mapping.originalLine = previousOriginalLine + temp.value;
            previousOriginalLine = mapping.originalLine;
            // Lines are stored 0-based
            mapping.originalLine += 1;
            str = temp.rest;
            if (str.length === 0 || mappingSeparator.test(str.charAt(0))) {
              throw new Error('Found a source and line, but no column');
            }

            // Original column.
            temp = base64VLQ.decode(str);
            mapping.originalColumn = previousOriginalColumn + temp.value;
            previousOriginalColumn = mapping.originalColumn;
            str = temp.rest;

            if (str.length > 0 && !mappingSeparator.test(str.charAt(0))) {
              // Original name.
              temp = base64VLQ.decode(str);
              mapping.name = this._names.at(previousName + temp.value);
              previousName += temp.value;
              str = temp.rest;
            }
          }

          this.__generatedMappings.push(mapping);
          if (typeof mapping.originalLine === 'number') {
            this.__originalMappings.push(mapping);
          }
        }
      }

      this.__generatedMappings.sort(util.compareByGeneratedPositions);
      this.__originalMappings.sort(util.compareByOriginalPositions);
    };

  /**
   * Find the mapping that best matches the hypothetical "needle" mapping that
   * we are searching for in the given "haystack" of mappings.
   */
  SourceMapConsumer.prototype._findMapping =
    function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                           aColumnName, aComparator) {
      // To return the position we are searching for, we must first find the
      // mapping for the given position and then return the opposite position it
      // points to. Because the mappings are sorted, we can use binary search to
      // find the best mapping.

      if (aNeedle[aLineName] <= 0) {
        throw new TypeError('Line must be greater than or equal to 1, got '
                            + aNeedle[aLineName]);
      }
      if (aNeedle[aColumnName] < 0) {
        throw new TypeError('Column must be greater than or equal to 0, got '
                            + aNeedle[aColumnName]);
      }

      return binarySearch.search(aNeedle, aMappings, aComparator);
    };

  /**
   * Returns the original source, line, and column information for the generated
   * source's line and column positions provided. The only argument is an object
   * with the following properties:
   *
   *   - line: The line number in the generated source.
   *   - column: The column number in the generated source.
   *
   * and an object is returned with the following properties:
   *
   *   - source: The original source file, or null.
   *   - line: The line number in the original source, or null.
   *   - column: The column number in the original source, or null.
   *   - name: The original identifier, or null.
   */
  SourceMapConsumer.prototype.originalPositionFor =
    function SourceMapConsumer_originalPositionFor(aArgs) {
      var needle = {
        generatedLine: util.getArg(aArgs, 'line'),
        generatedColumn: util.getArg(aArgs, 'column')
      };

      var mapping = this._findMapping(needle,
                                      this._generatedMappings,
                                      "generatedLine",
                                      "generatedColumn",
                                      util.compareByGeneratedPositions);

      if (mapping && mapping.generatedLine === needle.generatedLine) {
        var source = util.getArg(mapping, 'source', null);
        if (source != null && this.sourceRoot != null) {
          source = util.join(this.sourceRoot, source);
        }
        return {
          source: source,
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: util.getArg(mapping, 'name', null)
        };
      }

      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    };

  /**
   * Returns the original source content. The only argument is the url of the
   * original source file. Returns null if no original source content is
   * availible.
   */
  SourceMapConsumer.prototype.sourceContentFor =
    function SourceMapConsumer_sourceContentFor(aSource) {
      if (!this.sourcesContent) {
        return null;
      }

      if (this.sourceRoot != null) {
        aSource = util.relative(this.sourceRoot, aSource);
      }

      if (this._sources.has(aSource)) {
        return this.sourcesContent[this._sources.indexOf(aSource)];
      }

      var url;
      if (this.sourceRoot != null
          && (url = util.urlParse(this.sourceRoot))) {
        // XXX: file:// URIs and absolute paths lead to unexpected behavior for
        // many users. We can help them out when they expect file:// URIs to
        // behave like it would if they were running a local HTTP server. See
        // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
        var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
        if (url.scheme == "file"
            && this._sources.has(fileUriAbsPath)) {
          return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
        }

        if ((!url.path || url.path == "/")
            && this._sources.has("/" + aSource)) {
          return this.sourcesContent[this._sources.indexOf("/" + aSource)];
        }
      }

      throw new Error('"' + aSource + '" is not in the SourceMap.');
    };

  /**
   * Returns the generated line and column information for the original source,
   * line, and column positions provided. The only argument is an object with
   * the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *   - column: The column number in the original source.
   *
   * and an object is returned with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */
  SourceMapConsumer.prototype.generatedPositionFor =
    function SourceMapConsumer_generatedPositionFor(aArgs) {
      var needle = {
        source: util.getArg(aArgs, 'source'),
        originalLine: util.getArg(aArgs, 'line'),
        originalColumn: util.getArg(aArgs, 'column')
      };

      if (this.sourceRoot != null) {
        needle.source = util.relative(this.sourceRoot, needle.source);
      }

      var mapping = this._findMapping(needle,
                                      this._originalMappings,
                                      "originalLine",
                                      "originalColumn",
                                      util.compareByOriginalPositions);

      if (mapping) {
        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null)
        };
      }

      return {
        line: null,
        column: null
      };
    };

  SourceMapConsumer.GENERATED_ORDER = 1;
  SourceMapConsumer.ORIGINAL_ORDER = 2;

  /**
   * Iterate over each mapping between an original source/line/column and a
   * generated line/column in this source map.
   *
   * @param Function aCallback
   *        The function that is called with each mapping.
   * @param Object aContext
   *        Optional. If specified, this object will be the value of `this` every
   *        time that `aCallback` is called.
   * @param aOrder
   *        Either `SourceMapConsumer.GENERATED_ORDER` or
   *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
   *        iterate over the mappings sorted by the generated file's line/column
   *        order or the original's source/line/column order, respectively. Defaults to
   *        `SourceMapConsumer.GENERATED_ORDER`.
   */
  SourceMapConsumer.prototype.eachMapping =
    function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
      var context = aContext || null;
      var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

      var mappings;
      switch (order) {
      case SourceMapConsumer.GENERATED_ORDER:
        mappings = this._generatedMappings;
        break;
      case SourceMapConsumer.ORIGINAL_ORDER:
        mappings = this._originalMappings;
        break;
      default:
        throw new Error("Unknown order of iteration.");
      }

      var sourceRoot = this.sourceRoot;
      mappings.map(function (mapping) {
        var source = mapping.source;
        if (source != null && sourceRoot != null) {
          source = util.join(sourceRoot, source);
        }
        return {
          source: source,
          generatedLine: mapping.generatedLine,
          generatedColumn: mapping.generatedColumn,
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: mapping.name
        };
      }).forEach(aCallback, context);
    };

  exports.SourceMapConsumer = SourceMapConsumer;

});

},{"./array-set":101,"./base64-vlq":102,"./binary-search":104,"./util":108,"amdefine":109}],106:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var base64VLQ = require('./base64-vlq');
  var util = require('./util');
  var ArraySet = require('./array-set').ArraySet;

  /**
   * An instance of the SourceMapGenerator represents a source map which is
   * being built incrementally. You may pass an object with the following
   * properties:
   *
   *   - file: The filename of the generated source.
   *   - sourceRoot: A root for all relative URLs in this source map.
   */
  function SourceMapGenerator(aArgs) {
    if (!aArgs) {
      aArgs = {};
    }
    this._file = util.getArg(aArgs, 'file', null);
    this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
    this._sources = new ArraySet();
    this._names = new ArraySet();
    this._mappings = [];
    this._sourcesContents = null;
  }

  SourceMapGenerator.prototype._version = 3;

  /**
   * Creates a new SourceMapGenerator based on a SourceMapConsumer
   *
   * @param aSourceMapConsumer The SourceMap.
   */
  SourceMapGenerator.fromSourceMap =
    function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
      var sourceRoot = aSourceMapConsumer.sourceRoot;
      var generator = new SourceMapGenerator({
        file: aSourceMapConsumer.file,
        sourceRoot: sourceRoot
      });
      aSourceMapConsumer.eachMapping(function (mapping) {
        var newMapping = {
          generated: {
            line: mapping.generatedLine,
            column: mapping.generatedColumn
          }
        };

        if (mapping.source != null) {
          newMapping.source = mapping.source;
          if (sourceRoot != null) {
            newMapping.source = util.relative(sourceRoot, newMapping.source);
          }

          newMapping.original = {
            line: mapping.originalLine,
            column: mapping.originalColumn
          };

          if (mapping.name != null) {
            newMapping.name = mapping.name;
          }
        }

        generator.addMapping(newMapping);
      });
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          generator.setSourceContent(sourceFile, content);
        }
      });
      return generator;
    };

  /**
   * Add a single mapping from original source line and column to the generated
   * source's line and column for this source map being created. The mapping
   * object should have the following properties:
   *
   *   - generated: An object with the generated line and column positions.
   *   - original: An object with the original line and column positions.
   *   - source: The original source file (relative to the sourceRoot).
   *   - name: An optional original token name for this mapping.
   */
  SourceMapGenerator.prototype.addMapping =
    function SourceMapGenerator_addMapping(aArgs) {
      var generated = util.getArg(aArgs, 'generated');
      var original = util.getArg(aArgs, 'original', null);
      var source = util.getArg(aArgs, 'source', null);
      var name = util.getArg(aArgs, 'name', null);

      this._validateMapping(generated, original, source, name);

      if (source != null && !this._sources.has(source)) {
        this._sources.add(source);
      }

      if (name != null && !this._names.has(name)) {
        this._names.add(name);
      }

      this._mappings.push({
        generatedLine: generated.line,
        generatedColumn: generated.column,
        originalLine: original != null && original.line,
        originalColumn: original != null && original.column,
        source: source,
        name: name
      });
    };

  /**
   * Set the source content for a source file.
   */
  SourceMapGenerator.prototype.setSourceContent =
    function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
      var source = aSourceFile;
      if (this._sourceRoot != null) {
        source = util.relative(this._sourceRoot, source);
      }

      if (aSourceContent != null) {
        // Add the source content to the _sourcesContents map.
        // Create a new _sourcesContents map if the property is null.
        if (!this._sourcesContents) {
          this._sourcesContents = {};
        }
        this._sourcesContents[util.toSetString(source)] = aSourceContent;
      } else {
        // Remove the source file from the _sourcesContents map.
        // If the _sourcesContents map is empty, set the property to null.
        delete this._sourcesContents[util.toSetString(source)];
        if (Object.keys(this._sourcesContents).length === 0) {
          this._sourcesContents = null;
        }
      }
    };

  /**
   * Applies the mappings of a sub-source-map for a specific source file to the
   * source map being generated. Each mapping to the supplied source file is
   * rewritten using the supplied source map. Note: The resolution for the
   * resulting mappings is the minimium of this map and the supplied map.
   *
   * @param aSourceMapConsumer The source map to be applied.
   * @param aSourceFile Optional. The filename of the source file.
   *        If omitted, SourceMapConsumer's file property will be used.
   * @param aSourceMapPath Optional. The dirname of the path to the source map
   *        to be applied. If relative, it is relative to the SourceMapConsumer.
   *        This parameter is needed when the two source maps aren't in the same
   *        directory, and the source map to be applied contains relative source
   *        paths. If so, those relative source paths need to be rewritten
   *        relative to the SourceMapGenerator.
   */
  SourceMapGenerator.prototype.applySourceMap =
    function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
      var sourceFile = aSourceFile;
      // If aSourceFile is omitted, we will use the file property of the SourceMap
      if (aSourceFile == null) {
        if (aSourceMapConsumer.file == null) {
          throw new Error(
            'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
            'or the source map\'s "file" property. Both were omitted.'
          );
        }
        sourceFile = aSourceMapConsumer.file;
      }
      var sourceRoot = this._sourceRoot;
      // Make "sourceFile" relative if an absolute Url is passed.
      if (sourceRoot != null) {
        sourceFile = util.relative(sourceRoot, sourceFile);
      }
      // Applying the SourceMap can add and remove items from the sources and
      // the names array.
      var newSources = new ArraySet();
      var newNames = new ArraySet();

      // Find mappings for the "sourceFile"
      this._mappings.forEach(function (mapping) {
        if (mapping.source === sourceFile && mapping.originalLine != null) {
          // Check if it can be mapped by the source map, then update the mapping.
          var original = aSourceMapConsumer.originalPositionFor({
            line: mapping.originalLine,
            column: mapping.originalColumn
          });
          if (original.source != null) {
            // Copy mapping
            mapping.source = original.source;
            if (aSourceMapPath != null) {
              mapping.source = util.join(aSourceMapPath, mapping.source)
            }
            if (sourceRoot != null) {
              mapping.source = util.relative(sourceRoot, mapping.source);
            }
            mapping.originalLine = original.line;
            mapping.originalColumn = original.column;
            if (original.name != null && mapping.name != null) {
              // Only use the identifier name if it's an identifier
              // in both SourceMaps
              mapping.name = original.name;
            }
          }
        }

        var source = mapping.source;
        if (source != null && !newSources.has(source)) {
          newSources.add(source);
        }

        var name = mapping.name;
        if (name != null && !newNames.has(name)) {
          newNames.add(name);
        }

      }, this);
      this._sources = newSources;
      this._names = newNames;

      // Copy sourcesContents of applied map.
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          if (aSourceMapPath != null) {
            sourceFile = util.join(aSourceMapPath, sourceFile);
          }
          if (sourceRoot != null) {
            sourceFile = util.relative(sourceRoot, sourceFile);
          }
          this.setSourceContent(sourceFile, content);
        }
      }, this);
    };

  /**
   * A mapping can have one of the three levels of data:
   *
   *   1. Just the generated position.
   *   2. The Generated position, original position, and original source.
   *   3. Generated and original position, original source, as well as a name
   *      token.
   *
   * To maintain consistency, we validate that any new mapping being added falls
   * in to one of these categories.
   */
  SourceMapGenerator.prototype._validateMapping =
    function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                                aName) {
      if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
          && aGenerated.line > 0 && aGenerated.column >= 0
          && !aOriginal && !aSource && !aName) {
        // Case 1.
        return;
      }
      else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
               && aOriginal && 'line' in aOriginal && 'column' in aOriginal
               && aGenerated.line > 0 && aGenerated.column >= 0
               && aOriginal.line > 0 && aOriginal.column >= 0
               && aSource) {
        // Cases 2 and 3.
        return;
      }
      else {
        throw new Error('Invalid mapping: ' + JSON.stringify({
          generated: aGenerated,
          source: aSource,
          original: aOriginal,
          name: aName
        }));
      }
    };

  /**
   * Serialize the accumulated mappings in to the stream of base 64 VLQs
   * specified by the source map format.
   */
  SourceMapGenerator.prototype._serializeMappings =
    function SourceMapGenerator_serializeMappings() {
      var previousGeneratedColumn = 0;
      var previousGeneratedLine = 1;
      var previousOriginalColumn = 0;
      var previousOriginalLine = 0;
      var previousName = 0;
      var previousSource = 0;
      var result = '';
      var mapping;

      // The mappings must be guaranteed to be in sorted order before we start
      // serializing them or else the generated line numbers (which are defined
      // via the ';' separators) will be all messed up. Note: it might be more
      // performant to maintain the sorting as we insert them, rather than as we
      // serialize them, but the big O is the same either way.
      this._mappings.sort(util.compareByGeneratedPositions);

      for (var i = 0, len = this._mappings.length; i < len; i++) {
        mapping = this._mappings[i];

        if (mapping.generatedLine !== previousGeneratedLine) {
          previousGeneratedColumn = 0;
          while (mapping.generatedLine !== previousGeneratedLine) {
            result += ';';
            previousGeneratedLine++;
          }
        }
        else {
          if (i > 0) {
            if (!util.compareByGeneratedPositions(mapping, this._mappings[i - 1])) {
              continue;
            }
            result += ',';
          }
        }

        result += base64VLQ.encode(mapping.generatedColumn
                                   - previousGeneratedColumn);
        previousGeneratedColumn = mapping.generatedColumn;

        if (mapping.source != null) {
          result += base64VLQ.encode(this._sources.indexOf(mapping.source)
                                     - previousSource);
          previousSource = this._sources.indexOf(mapping.source);

          // lines are stored 0-based in SourceMap spec version 3
          result += base64VLQ.encode(mapping.originalLine - 1
                                     - previousOriginalLine);
          previousOriginalLine = mapping.originalLine - 1;

          result += base64VLQ.encode(mapping.originalColumn
                                     - previousOriginalColumn);
          previousOriginalColumn = mapping.originalColumn;

          if (mapping.name != null) {
            result += base64VLQ.encode(this._names.indexOf(mapping.name)
                                       - previousName);
            previousName = this._names.indexOf(mapping.name);
          }
        }
      }

      return result;
    };

  SourceMapGenerator.prototype._generateSourcesContent =
    function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
      return aSources.map(function (source) {
        if (!this._sourcesContents) {
          return null;
        }
        if (aSourceRoot != null) {
          source = util.relative(aSourceRoot, source);
        }
        var key = util.toSetString(source);
        return Object.prototype.hasOwnProperty.call(this._sourcesContents,
                                                    key)
          ? this._sourcesContents[key]
          : null;
      }, this);
    };

  /**
   * Externalize the source map.
   */
  SourceMapGenerator.prototype.toJSON =
    function SourceMapGenerator_toJSON() {
      var map = {
        version: this._version,
        sources: this._sources.toArray(),
        names: this._names.toArray(),
        mappings: this._serializeMappings()
      };
      if (this._file != null) {
        map.file = this._file;
      }
      if (this._sourceRoot != null) {
        map.sourceRoot = this._sourceRoot;
      }
      if (this._sourcesContents) {
        map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
      }

      return map;
    };

  /**
   * Render the source map being generated to a string.
   */
  SourceMapGenerator.prototype.toString =
    function SourceMapGenerator_toString() {
      return JSON.stringify(this);
    };

  exports.SourceMapGenerator = SourceMapGenerator;

});

},{"./array-set":101,"./base64-vlq":102,"./util":108,"amdefine":109}],107:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var SourceMapGenerator = require('./source-map-generator').SourceMapGenerator;
  var util = require('./util');

  // Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
  // operating systems these days (capturing the result).
  var REGEX_NEWLINE = /(\r?\n)/;

  // Matches a Windows-style newline, or any character.
  var REGEX_CHARACTER = /\r\n|[\s\S]/g;

  /**
   * SourceNodes provide a way to abstract over interpolating/concatenating
   * snippets of generated JavaScript source code while maintaining the line and
   * column information associated with the original source code.
   *
   * @param aLine The original line number.
   * @param aColumn The original column number.
   * @param aSource The original source's filename.
   * @param aChunks Optional. An array of strings which are snippets of
   *        generated JS, or other SourceNodes.
   * @param aName The original identifier.
   */
  function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
    this.children = [];
    this.sourceContents = {};
    this.line = aLine == null ? null : aLine;
    this.column = aColumn == null ? null : aColumn;
    this.source = aSource == null ? null : aSource;
    this.name = aName == null ? null : aName;
    if (aChunks != null) this.add(aChunks);
  }

  /**
   * Creates a SourceNode from generated code and a SourceMapConsumer.
   *
   * @param aGeneratedCode The generated code
   * @param aSourceMapConsumer The SourceMap for the generated code
   * @param aRelativePath Optional. The path that relative sources in the
   *        SourceMapConsumer should be relative to.
   */
  SourceNode.fromStringWithSourceMap =
    function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
      // The SourceNode we want to fill with the generated code
      // and the SourceMap
      var node = new SourceNode();

      // All even indices of this array are one line of the generated code,
      // while all odd indices are the newlines between two adjacent lines
      // (since `REGEX_NEWLINE` captures its match).
      // Processed fragments are removed from this array, by calling `shiftNextLine`.
      var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
      var shiftNextLine = function() {
        var lineContents = remainingLines.shift();
        // The last line of a file might not have a newline.
        var newLine = remainingLines.shift() || "";
        return lineContents + newLine;
      };

      // We need to remember the position of "remainingLines"
      var lastGeneratedLine = 1, lastGeneratedColumn = 0;

      // The generate SourceNodes we need a code range.
      // To extract it current and last mapping is used.
      // Here we store the last mapping.
      var lastMapping = null;

      aSourceMapConsumer.eachMapping(function (mapping) {
        if (lastMapping !== null) {
          // We add the code from "lastMapping" to "mapping":
          // First check if there is a new line in between.
          if (lastGeneratedLine < mapping.generatedLine) {
            var code = "";
            // Associate first line with "lastMapping"
            addMappingWithCode(lastMapping, shiftNextLine());
            lastGeneratedLine++;
            lastGeneratedColumn = 0;
            // The remaining code is added without mapping
          } else {
            // There is no new line in between.
            // Associate the code between "lastGeneratedColumn" and
            // "mapping.generatedColumn" with "lastMapping"
            var nextLine = remainingLines[0];
            var code = nextLine.substr(0, mapping.generatedColumn -
                                          lastGeneratedColumn);
            remainingLines[0] = nextLine.substr(mapping.generatedColumn -
                                                lastGeneratedColumn);
            lastGeneratedColumn = mapping.generatedColumn;
            addMappingWithCode(lastMapping, code);
            // No more remaining code, continue
            lastMapping = mapping;
            return;
          }
        }
        // We add the generated code until the first mapping
        // to the SourceNode without any mapping.
        // Each line is added as separate string.
        while (lastGeneratedLine < mapping.generatedLine) {
          node.add(shiftNextLine());
          lastGeneratedLine++;
        }
        if (lastGeneratedColumn < mapping.generatedColumn) {
          var nextLine = remainingLines[0];
          node.add(nextLine.substr(0, mapping.generatedColumn));
          remainingLines[0] = nextLine.substr(mapping.generatedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
        }
        lastMapping = mapping;
      }, this);
      // We have processed all mappings.
      if (remainingLines.length > 0) {
        if (lastMapping) {
          // Associate the remaining code in the current line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
        }
        // and add the remaining lines without any mapping
        node.add(remainingLines.join(""));
      }

      // Copy sourcesContent into SourceNode
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          if (aRelativePath != null) {
            sourceFile = util.join(aRelativePath, sourceFile);
          }
          node.setSourceContent(sourceFile, content);
        }
      });

      return node;

      function addMappingWithCode(mapping, code) {
        if (mapping === null || mapping.source === undefined) {
          node.add(code);
        } else {
          var source = aRelativePath
            ? util.join(aRelativePath, mapping.source)
            : mapping.source;
          node.add(new SourceNode(mapping.originalLine,
                                  mapping.originalColumn,
                                  source,
                                  code,
                                  mapping.name));
        }
      }
    };

  /**
   * Add a chunk of generated JS to this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  SourceNode.prototype.add = function SourceNode_add(aChunk) {
    if (Array.isArray(aChunk)) {
      aChunk.forEach(function (chunk) {
        this.add(chunk);
      }, this);
    }
    else if (aChunk instanceof SourceNode || typeof aChunk === "string") {
      if (aChunk) {
        this.children.push(aChunk);
      }
    }
    else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  };

  /**
   * Add a chunk of generated JS to the beginning of this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
    if (Array.isArray(aChunk)) {
      for (var i = aChunk.length-1; i >= 0; i--) {
        this.prepend(aChunk[i]);
      }
    }
    else if (aChunk instanceof SourceNode || typeof aChunk === "string") {
      this.children.unshift(aChunk);
    }
    else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  };

  /**
   * Walk over the tree of JS snippets in this node and its children. The
   * walking function is called once for each snippet of JS and is passed that
   * snippet and the its original associated source's line/column location.
   *
   * @param aFn The traversal function.
   */
  SourceNode.prototype.walk = function SourceNode_walk(aFn) {
    var chunk;
    for (var i = 0, len = this.children.length; i < len; i++) {
      chunk = this.children[i];
      if (chunk instanceof SourceNode) {
        chunk.walk(aFn);
      }
      else {
        if (chunk !== '') {
          aFn(chunk, { source: this.source,
                       line: this.line,
                       column: this.column,
                       name: this.name });
        }
      }
    }
  };

  /**
   * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
   * each of `this.children`.
   *
   * @param aSep The separator.
   */
  SourceNode.prototype.join = function SourceNode_join(aSep) {
    var newChildren;
    var i;
    var len = this.children.length;
    if (len > 0) {
      newChildren = [];
      for (i = 0; i < len-1; i++) {
        newChildren.push(this.children[i]);
        newChildren.push(aSep);
      }
      newChildren.push(this.children[i]);
      this.children = newChildren;
    }
    return this;
  };

  /**
   * Call String.prototype.replace on the very right-most source snippet. Useful
   * for trimming whitespace from the end of a source node, etc.
   *
   * @param aPattern The pattern to replace.
   * @param aReplacement The thing to replace the pattern with.
   */
  SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
    var lastChild = this.children[this.children.length - 1];
    if (lastChild instanceof SourceNode) {
      lastChild.replaceRight(aPattern, aReplacement);
    }
    else if (typeof lastChild === 'string') {
      this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
    }
    else {
      this.children.push(''.replace(aPattern, aReplacement));
    }
    return this;
  };

  /**
   * Set the source content for a source file. This will be added to the SourceMapGenerator
   * in the sourcesContent field.
   *
   * @param aSourceFile The filename of the source file
   * @param aSourceContent The content of the source file
   */
  SourceNode.prototype.setSourceContent =
    function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
      this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
    };

  /**
   * Walk over the tree of SourceNodes. The walking function is called for each
   * source file content and is passed the filename and source content.
   *
   * @param aFn The traversal function.
   */
  SourceNode.prototype.walkSourceContents =
    function SourceNode_walkSourceContents(aFn) {
      for (var i = 0, len = this.children.length; i < len; i++) {
        if (this.children[i] instanceof SourceNode) {
          this.children[i].walkSourceContents(aFn);
        }
      }

      var sources = Object.keys(this.sourceContents);
      for (var i = 0, len = sources.length; i < len; i++) {
        aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
      }
    };

  /**
   * Return the string representation of this source node. Walks over the tree
   * and concatenates all the various snippets together to one string.
   */
  SourceNode.prototype.toString = function SourceNode_toString() {
    var str = "";
    this.walk(function (chunk) {
      str += chunk;
    });
    return str;
  };

  /**
   * Returns the string representation of this source node along with a source
   * map.
   */
  SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
    var generated = {
      code: "",
      line: 1,
      column: 0
    };
    var map = new SourceMapGenerator(aArgs);
    var sourceMappingActive = false;
    var lastOriginalSource = null;
    var lastOriginalLine = null;
    var lastOriginalColumn = null;
    var lastOriginalName = null;
    this.walk(function (chunk, original) {
      generated.code += chunk;
      if (original.source !== null
          && original.line !== null
          && original.column !== null) {
        if(lastOriginalSource !== original.source
           || lastOriginalLine !== original.line
           || lastOriginalColumn !== original.column
           || lastOriginalName !== original.name) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
        lastOriginalSource = original.source;
        lastOriginalLine = original.line;
        lastOriginalColumn = original.column;
        lastOriginalName = original.name;
        sourceMappingActive = true;
      } else if (sourceMappingActive) {
        map.addMapping({
          generated: {
            line: generated.line,
            column: generated.column
          }
        });
        lastOriginalSource = null;
        sourceMappingActive = false;
      }
      chunk.match(REGEX_CHARACTER).forEach(function (ch, idx, array) {
        if (REGEX_NEWLINE.test(ch)) {
          generated.line++;
          generated.column = 0;
          // Mappings end at eol
          if (idx + 1 === array.length) {
            lastOriginalSource = null;
            sourceMappingActive = false;
          } else if (sourceMappingActive) {
            map.addMapping({
              source: original.source,
              original: {
                line: original.line,
                column: original.column
              },
              generated: {
                line: generated.line,
                column: generated.column
              },
              name: original.name
            });
          }
        } else {
          generated.column += ch.length;
        }
      });
    });
    this.walkSourceContents(function (sourceFile, sourceContent) {
      map.setSourceContent(sourceFile, sourceContent);
    });

    return { code: generated.code, map: map };
  };

  exports.SourceNode = SourceNode;

});

},{"./source-map-generator":106,"./util":108,"amdefine":109}],108:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  /**
   * This is a helper function for getting values from parameter/options
   * objects.
   *
   * @param args The object we are extracting values from
   * @param name The name of the property we are getting.
   * @param defaultValue An optional value to return if the property is missing
   * from the object. If this is not specified and the property is missing, an
   * error will be thrown.
   */
  function getArg(aArgs, aName, aDefaultValue) {
    if (aName in aArgs) {
      return aArgs[aName];
    } else if (arguments.length === 3) {
      return aDefaultValue;
    } else {
      throw new Error('"' + aName + '" is a required argument.');
    }
  }
  exports.getArg = getArg;

  var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
  var dataUrlRegexp = /^data:.+\,.+$/;

  function urlParse(aUrl) {
    var match = aUrl.match(urlRegexp);
    if (!match) {
      return null;
    }
    return {
      scheme: match[1],
      auth: match[2],
      host: match[3],
      port: match[4],
      path: match[5]
    };
  }
  exports.urlParse = urlParse;

  function urlGenerate(aParsedUrl) {
    var url = '';
    if (aParsedUrl.scheme) {
      url += aParsedUrl.scheme + ':';
    }
    url += '//';
    if (aParsedUrl.auth) {
      url += aParsedUrl.auth + '@';
    }
    if (aParsedUrl.host) {
      url += aParsedUrl.host;
    }
    if (aParsedUrl.port) {
      url += ":" + aParsedUrl.port
    }
    if (aParsedUrl.path) {
      url += aParsedUrl.path;
    }
    return url;
  }
  exports.urlGenerate = urlGenerate;

  /**
   * Normalizes a path, or the path portion of a URL:
   *
   * - Replaces consequtive slashes with one slash.
   * - Removes unnecessary '.' parts.
   * - Removes unnecessary '<dir>/..' parts.
   *
   * Based on code in the Node.js 'path' core module.
   *
   * @param aPath The path or url to normalize.
   */
  function normalize(aPath) {
    var path = aPath;
    var url = urlParse(aPath);
    if (url) {
      if (!url.path) {
        return aPath;
      }
      path = url.path;
    }
    var isAbsolute = (path.charAt(0) === '/');

    var parts = path.split(/\/+/);
    for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
      part = parts[i];
      if (part === '.') {
        parts.splice(i, 1);
      } else if (part === '..') {
        up++;
      } else if (up > 0) {
        if (part === '') {
          // The first part is blank if the path is absolute. Trying to go
          // above the root is a no-op. Therefore we can remove all '..' parts
          // directly after the root.
          parts.splice(i + 1, up);
          up = 0;
        } else {
          parts.splice(i, 2);
          up--;
        }
      }
    }
    path = parts.join('/');

    if (path === '') {
      path = isAbsolute ? '/' : '.';
    }

    if (url) {
      url.path = path;
      return urlGenerate(url);
    }
    return path;
  }
  exports.normalize = normalize;

  /**
   * Joins two paths/URLs.
   *
   * @param aRoot The root path or URL.
   * @param aPath The path or URL to be joined with the root.
   *
   * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
   *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
   *   first.
   * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
   *   is updated with the result and aRoot is returned. Otherwise the result
   *   is returned.
   *   - If aPath is absolute, the result is aPath.
   *   - Otherwise the two paths are joined with a slash.
   * - Joining for example 'http://' and 'www.example.com' is also supported.
   */
  function join(aRoot, aPath) {
    var aPathUrl = urlParse(aPath);
    var aRootUrl = urlParse(aRoot);
    if (aRootUrl) {
      aRoot = aRootUrl.path || '/';
    }

    // `join(foo, '//www.example.org')`
    if (aPathUrl && !aPathUrl.scheme) {
      if (aRootUrl) {
        aPathUrl.scheme = aRootUrl.scheme;
      }
      return urlGenerate(aPathUrl);
    }

    if (aPathUrl || aPath.match(dataUrlRegexp)) {
      return aPath;
    }

    // `join('http://', 'www.example.com')`
    if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
      aRootUrl.host = aPath;
      return urlGenerate(aRootUrl);
    }

    var joined = aPath.charAt(0) === '/'
      ? aPath
      : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

    if (aRootUrl) {
      aRootUrl.path = joined;
      return urlGenerate(aRootUrl);
    }
    return joined;
  }
  exports.join = join;

  /**
   * Because behavior goes wacky when you set `__proto__` on objects, we
   * have to prefix all the strings in our set with an arbitrary character.
   *
   * See https://github.com/mozilla/source-map/pull/31 and
   * https://github.com/mozilla/source-map/issues/30
   *
   * @param String aStr
   */
  function toSetString(aStr) {
    return '$' + aStr;
  }
  exports.toSetString = toSetString;

  function fromSetString(aStr) {
    return aStr.substr(1);
  }
  exports.fromSetString = fromSetString;

  function relative(aRoot, aPath) {
    aRoot = aRoot.replace(/\/$/, '');

    var url = urlParse(aRoot);
    if (aPath.charAt(0) == "/" && url && url.path == "/") {
      return aPath.slice(1);
    }

    return aPath.indexOf(aRoot + '/') === 0
      ? aPath.substr(aRoot.length + 1)
      : aPath;
  }
  exports.relative = relative;

  function strcmp(aStr1, aStr2) {
    var s1 = aStr1 || "";
    var s2 = aStr2 || "";
    return (s1 > s2) - (s1 < s2);
  }

  /**
   * Comparator between two mappings where the original positions are compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same original source/line/column, but different generated
   * line and column the same. Useful when searching for a mapping with a
   * stubbed out mapping.
   */
  function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
    var cmp;

    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp || onlyCompareOriginal) {
      return cmp;
    }

    cmp = strcmp(mappingA.name, mappingB.name);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp) {
      return cmp;
    }

    return mappingA.generatedColumn - mappingB.generatedColumn;
  };
  exports.compareByOriginalPositions = compareByOriginalPositions;

  /**
   * Comparator between two mappings where the generated positions are
   * compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same generated line and column, but different
   * source/name/original line and column the same. Useful when searching for a
   * mapping with a stubbed out mapping.
   */
  function compareByGeneratedPositions(mappingA, mappingB, onlyCompareGenerated) {
    var cmp;

    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
    if (cmp || onlyCompareGenerated) {
      return cmp;
    }

    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp) {
      return cmp;
    }

    return strcmp(mappingA.name, mappingB.name);
  };
  exports.compareByGeneratedPositions = compareByGeneratedPositions;

});

},{"amdefine":109}],109:[function(require,module,exports){
(function (process,__filename){
/** vim: et:ts=4:sw=4:sts=4
 * @license amdefine 0.1.0 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/amdefine for details
 */

/*jslint node: true */
/*global module, process */
'use strict';

/**
 * Creates a define for node.
 * @param {Object} module the "module" object that is defined by Node for the
 * current module.
 * @param {Function} [requireFn]. Node's require function for the current module.
 * It only needs to be passed in Node versions before 0.5, when module.require
 * did not exist.
 * @returns {Function} a define function that is usable for the current node
 * module.
 */
function amdefine(module, requireFn) {
    'use strict';
    var defineCache = {},
        loaderCache = {},
        alreadyCalled = false,
        path = require('path'),
        makeRequire, stringRequire;

    /**
     * Trims the . and .. from an array of path segments.
     * It will keep a leading path segment if a .. will become
     * the first path segment, to help with module name lookups,
     * which act like paths, but can be remapped. But the end result,
     * all paths that use this function should look normalized.
     * NOTE: this method MODIFIES the input array.
     * @param {Array} ary the array of path segments.
     */
    function trimDots(ary) {
        var i, part;
        for (i = 0; ary[i]; i+= 1) {
            part = ary[i];
            if (part === '.') {
                ary.splice(i, 1);
                i -= 1;
            } else if (part === '..') {
                if (i === 1 && (ary[2] === '..' || ary[0] === '..')) {
                    //End of the line. Keep at least one non-dot
                    //path segment at the front so it can be mapped
                    //correctly to disk. Otherwise, there is likely
                    //no path mapping for a path starting with '..'.
                    //This can still fail, but catches the most reasonable
                    //uses of ..
                    break;
                } else if (i > 0) {
                    ary.splice(i - 1, 2);
                    i -= 2;
                }
            }
        }
    }

    function normalize(name, baseName) {
        var baseParts;

        //Adjust any relative paths.
        if (name && name.charAt(0) === '.') {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                baseParts = baseName.split('/');
                baseParts = baseParts.slice(0, baseParts.length - 1);
                baseParts = baseParts.concat(name.split('/'));
                trimDots(baseParts);
                name = baseParts.join('/');
            }
        }

        return name;
    }

    /**
     * Create the normalize() function passed to a loader plugin's
     * normalize method.
     */
    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(id) {
        function load(value) {
            loaderCache[id] = value;
        }

        load.fromText = function (id, text) {
            //This one is difficult because the text can/probably uses
            //define, and any relative paths and requires should be relative
            //to that id was it would be found on disk. But this would require
            //bootstrapping a module/require fairly deeply from node core.
            //Not sure how best to go about that yet.
            throw new Error('amdefine does not implement load.fromText');
        };

        return load;
    }

    makeRequire = function (systemRequire, exports, module, relId) {
        function amdRequire(deps, callback) {
            if (typeof deps === 'string') {
                //Synchronous, single module require('')
                return stringRequire(systemRequire, exports, module, deps, relId);
            } else {
                //Array of dependencies with a callback.

                //Convert the dependencies to modules.
                deps = deps.map(function (depName) {
                    return stringRequire(systemRequire, exports, module, depName, relId);
                });

                //Wait for next tick to call back the require call.
                process.nextTick(function () {
                    callback.apply(null, deps);
                });
            }
        }

        amdRequire.toUrl = function (filePath) {
            if (filePath.indexOf('.') === 0) {
                return normalize(filePath, path.dirname(module.filename));
            } else {
                return filePath;
            }
        };

        return amdRequire;
    };

    //Favor explicit value, passed in if the module wants to support Node 0.4.
    requireFn = requireFn || function req() {
        return module.require.apply(module, arguments);
    };

    function runFactory(id, deps, factory) {
        var r, e, m, result;

        if (id) {
            e = loaderCache[id] = {};
            m = {
                id: id,
                uri: __filename,
                exports: e
            };
            r = makeRequire(requireFn, e, m, id);
        } else {
            //Only support one define call per file
            if (alreadyCalled) {
                throw new Error('amdefine with no module ID cannot be called more than once per file.');
            }
            alreadyCalled = true;

            //Use the real variables from node
            //Use module.exports for exports, since
            //the exports in here is amdefine exports.
            e = module.exports;
            m = module;
            r = makeRequire(requireFn, e, m, module.id);
        }

        //If there are dependencies, they are strings, so need
        //to convert them to dependency values.
        if (deps) {
            deps = deps.map(function (depName) {
                return r(depName);
            });
        }

        //Call the factory with the right dependencies.
        if (typeof factory === 'function') {
            result = factory.apply(m.exports, deps);
        } else {
            result = factory;
        }

        if (result !== undefined) {
            m.exports = result;
            if (id) {
                loaderCache[id] = m.exports;
            }
        }
    }

    stringRequire = function (systemRequire, exports, module, id, relId) {
        //Split the ID by a ! so that
        var index = id.indexOf('!'),
            originalId = id,
            prefix, plugin;

        if (index === -1) {
            id = normalize(id, relId);

            //Straight module lookup. If it is one of the special dependencies,
            //deal with it, otherwise, delegate to node.
            if (id === 'require') {
                return makeRequire(systemRequire, exports, module, relId);
            } else if (id === 'exports') {
                return exports;
            } else if (id === 'module') {
                return module;
            } else if (loaderCache.hasOwnProperty(id)) {
                return loaderCache[id];
            } else if (defineCache[id]) {
                runFactory.apply(null, defineCache[id]);
                return loaderCache[id];
            } else {
                if(systemRequire) {
                    return systemRequire(originalId);
                } else {
                    throw new Error('No module with ID: ' + id);
                }
            }
        } else {
            //There is a plugin in play.
            prefix = id.substring(0, index);
            id = id.substring(index + 1, id.length);

            plugin = stringRequire(systemRequire, exports, module, prefix, relId);

            if (plugin.normalize) {
                id = plugin.normalize(id, makeNormalize(relId));
            } else {
                //Normalize the ID normally.
                id = normalize(id, relId);
            }

            if (loaderCache[id]) {
                return loaderCache[id];
            } else {
                plugin.load(id, makeRequire(systemRequire, exports, module, relId), makeLoad(id), {});

                return loaderCache[id];
            }
        }
    };

    //Create a define function specific to the module asking for amdefine.
    function define(id, deps, factory) {
        if (Array.isArray(id)) {
            factory = deps;
            deps = id;
            id = undefined;
        } else if (typeof id !== 'string') {
            factory = id;
            id = deps = undefined;
        }

        if (deps && !Array.isArray(deps)) {
            factory = deps;
            deps = undefined;
        }

        if (!deps) {
            deps = ['require', 'exports', 'module'];
        }

        //Set up properties for this module. If an ID, then use
        //internal cache. If no ID, then use the external variables
        //for this node module.
        if (id) {
            //Put the module in deep freeze until there is a
            //require call for it.
            defineCache[id] = [id, deps, factory];
        } else {
            runFactory(id, deps, factory);
        }
    }

    //define.require, which has access to all the values in the
    //cache. Useful for AMD modules that all have IDs in the file,
    //but need to finally export a value to node based on one of those
    //IDs.
    define.require = function (id) {
        if (loaderCache[id]) {
            return loaderCache[id];
        }

        if (defineCache[id]) {
            runFactory.apply(null, defineCache[id]);
            return loaderCache[id];
        }
    };

    define.amd = {};

    return define;
}

module.exports = amdefine;

}).call(this,require("FWaASH"),"/../../node_modules/source-map/node_modules/amdefine/amdefine.js")
},{"FWaASH":97,"path":96}],110:[function(require,module,exports){
//     Underscore.js 1.4.4
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.4.4';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? null : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value || _.identity);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(concat.apply(ArrayProto, arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(context, args.concat(slice.call(arguments)));
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, result;
    var previous = 0;
    var later = function() {
      previous = new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(n);
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

},{}]},{},[8])