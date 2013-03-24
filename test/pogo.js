/* PogoScript Tests */
;(function(){
  

/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!has.call(require.modules, from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};

  require.register("pogoscript-tests/lib/asyncControl.js", function(exports, require, module){
exports.try = function(body, catchBody, finallyBody, cb) {
  var callbackCalled = false;

  var callback = function (error, result) {
    if (!callbackCalled) {
      callbackCalled = true;
      cb(error, result);
    }
  };

  try {
    body(function (error, result) {
      if (error) {
        if (finallyBody && catchBody) {
          try {
            catchBody(error, function (error, result) {
              try {
                finallyBody(function (finallyError) {
                  callback(finallyError || error, finallyError || error? undefined: result);
                });
              } catch (error) {
                callback(error);
              }
            });
          } catch (error) {
            try {
              finallyBody(function (finallyError) {
                callback(finallyError || error);
              });
            } catch (error) {
              callback(error);
            }
          }
        } else if (catchBody) {
          try {
            catchBody(error, callback);
          } catch (error) {
            callback(error);
          }
        } else {
          try {
            finallyBody(function (finallyError) {
              callback(finallyError || error, finallyError? undefined: result);
            });
          } catch (error) {
            callback(error);
          }
        }
      } else {
        if (finallyBody) {
          try {
            finallyBody(function (finallyError) {
              callback(finallyError, finallyError? undefined: result);
            });
          } catch (error) {
            callback(error);
          }
        } else {
          callback(undefined, result);
        }
      }
    });
  } catch (error) {
    if (finallyBody && catchBody) {
      try {
        catchBody(error, function (error, result) {
          try {
            finallyBody(function (finallyError) {
              callback(finallyError || error, finallyError? undefined: result);
            });
          } catch (error) {
            callback(error);
          }
        });
      } catch (error) {
        try {
          finallyBody(function (finallyError) {
            callback(finallyError || error);
          });
        } catch (error) {
          callback(error);
        }
      }
    } else if (catchBody) {
      try {
        catchBody(error, callback);
      } catch (error) {
        callback(error);
      }
    } else {
      try {
        finallyBody(function (finallyError) {
          callback(finallyError || error);
        });
      } catch (error) {
        callback(error);
      }
    }
  }
};

exports.fork = function (block) {
    block(function () {});
};

exports.if = function (condition, thenBody, cb) {
  if (condition) {
    try {
      thenBody(cb);
    } catch (ex) {
      cb(ex);
    }
  } else {
    cb();
  }
};

exports.ifElse = function (condition, thenBody, elseBody, cb) {
  if (condition) {
    try {
      thenBody(cb);
    } catch (ex) {
      cb(ex);
    }
  } else {
    try {
      elseBody(cb);
    } catch (ex) {
      cb(ex);
    }
  }
};

exports.ifElseIfElse = function (cases, cb) {
    for (var n = 0; n < cases.length; n++) {
        var _case = cases[n];
        if (_case.condition) {
            try {
                _case.body (cb)
            } catch (error) {
                cb(error);
            }
            return;
        }
    }

    cb();
};

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

exports.for = function (test, incr, loop, cb) {
  try {
    var testAndLoop = function () {
      test(function (error, anotherLoop) {
        if (error) {
          cb(error);
        } else {
          if (anotherLoop) {
            loop(incrTestAndLoop);
          } else {
            cb();
          }
        }
      })
    };

    var incrTestAndLoop = function (error) {
      if (error) {
        cb(error);
      } else {
        incr(function (error) {
          if (error) {
            cb(error);
          } else {
            testAndLoop();
          }
        });
      }
    };

    testAndLoop();
  } catch (error) {
    cb(error);
  }
};

});
require.register("pogoscript-tests/lib/class.js", function(exports, require, module){
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
        prototype = new prototypeConstructor;
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
});
require.register("pogoscript-tests/lib/codeGenerator.js", function(exports, require, module){
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

});
require.register("pogoscript-tests/lib/debugPogo.js", function(exports, require, module){
(function() {
    var self = this;
    var removeFrom, moveToHeadOf, nodeArguments;
    removeFrom = function(arg, args) {
        var index, rest, gen1_o;
        index = args.indexOf(arg);
        if (index > -1) {
            rest = args.slice(index + 1);
            args.length = index;
            gen1_o = args;
            return gen1_o.push.apply(gen1_o, rest);
        }
    };
    moveToHeadOf = function(arg, args) {
        removeFrom(arg, args);
        return args.unshift(arg);
    };
    nodeArguments = function() {
        var args;
        args = process.argv.slice(1);
        if (options.debug) {
            moveToHeadOf("--debug", args);
        }
        if (options.debugBrk) {
            moveToHeadOf("--debug-brk", args);
        }
        if (options._[0] === "debug") {
            moveToHeadOf("debug", args);
        }
        return args;
    }();
    exports.debugPogo = function() {
        var self = this;
        var childProcess;
        childProcess = require("child_process");
        return childProcess.spawn(process.argv[0], nodeArguments, {
            customFds: [ 0, 1, 2 ]
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/macroDirectory.js", function(exports, require, module){
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
            return new gen1_c;
        };
    };
}).call(this);
});
require.register("pogoscript-tests/lib/memorystream.js", function(exports, require, module){
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

});
require.register("pogoscript-tests/lib/moduleConstants.js", function(exports, require, module){
(function() {
    var self = this;
    var $class, codegenUtils;
    $class = require("./class").class;
    codegenUtils = require("./terms/codegenUtils");
    module.exports = function(terms) {
        var self = this;
        var moduleConstants;
        return moduleConstants = $class({
            constructor: function() {
                var self = this;
                return self.namedDefinitions = {};
            },
            defineAs: function(name, expression) {
                var self = this;
                var canonicalName, existingDefinition, variable;
                canonicalName = codegenUtils.concatName(name);
                existingDefinition = self.namedDefinitions[canonicalName];
                if (existingDefinition) {
                    return existingDefinition.target;
                } else {
                    variable = terms.generatedVariable(name);
                    self.namedDefinitions[canonicalName] = terms.definition(variable, expression);
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
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/optionParser.js", function(exports, require, module){
(function() {
    var self = this;
    var $class, BooleanOption, OptionParser;
    $class = require("./class").class;
    BooleanOption = $class({
        constructor: function(gen1_options) {
            var self = this;
            var shortName, longName, description;
            shortName = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "shortName") && gen1_options.shortName !== void 0 ? gen1_options.shortName : void 0;
            longName = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "longName") && gen1_options.longName !== void 0 ? gen1_options.longName : void 0;
            description = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "description") && gen1_options.description !== void 0 ? gen1_options.description : void 0;
            self.shortName = shortName;
            self.name = self._camelCaseName(longName);
            self.longName = longName;
            return self.description = description;
        },
        _camelCaseName: function(longName) {
            var self = this;
            var segments, name, n, segment;
            segments = longName.split(/-/);
            name = segments[0];
            for (n = 1; n < segments.length; ++n) {
                segment = segments[n];
                name = name + (segment[0].toUpperCase() + segment.substring(1));
            }
            return name;
        },
        init: function(options) {
            var self = this;
            return options[self.name] = false;
        },
        set: function(options) {
            var self = this;
            return options[self.name] = true;
        },
        toString: function() {
            var self = this;
            var switches;
            switches = [ function() {
                if (self.shortName) {
                    return "-" + self.shortName;
                }
            }(), function() {
                if (self.longName) {
                    return "--" + self.longName;
                }
            }() ].filter(function(s) {
                return s;
            }).join(", ");
            return "    " + switches + "\n\n        " + self.description + "\n";
        }
    });
    OptionParser = $class({
        constructor: function() {
            var self = this;
            self._longOptions = {};
            self._shortOptions = {};
            return self._options = [];
        },
        option: function(description) {
            var self = this;
            var match, shortName, longName, option;
            match = /(-([a-z0-9])\s*,\s*)?--([a-z0-9-]*)\s*(.*)/i.exec(description);
            if (!match) {
                throw new Error("expected option be of the form '[-x, ]--xxxx some description of xxxx'");
            }
            shortName = match[2];
            longName = match[3];
            option = new BooleanOption({
                shortName: shortName,
                longName: longName,
                description: match[4]
            });
            return self._addOption(option);
        },
        _addOption: function(option) {
            var self = this;
            self._longOptions[option.longName] = option;
            self._shortOptions[option.shortName] = option;
            return self._options.push(option);
        },
        _findLongOption: function(name) {
            var self = this;
            var option;
            option = self._longOptions[name];
            if (option) {
                return option;
            } else {
                throw new Error("no such option --" + name);
            }
        },
        _findShortOption: function(name) {
            var self = this;
            var option;
            option = self._shortOptions[name];
            if (option) {
                return option;
            } else {
                throw new Error("no such option -" + name);
            }
        },
        _setDefaultOptions: function(options) {
            var self = this;
            var gen2_items, gen3_i, option;
            gen2_items = self._options;
            for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
                option = gen2_items[gen3_i];
                option.init(options);
            }
            return void 0;
        },
        parse: function(args) {
            var self = this;
            var options, n, gen4_forResult;
            if (!args) {
                args = process.argv;
            }
            options = {
                _: []
            };
            self._setDefaultOptions(options);
            for (n = 0; n < args.length; ++n) {
                gen4_forResult = void 0;
                if (function(n) {
                    var arg, longMatch, shortMatch, option, gen5_items, gen6_i, shortOption, gen7_o;
                    arg = args[n];
                    longMatch = /^--([a-z0-9-]*)$/.exec(arg);
                    shortMatch = /^-([a-z0-9-]*)$/.exec(arg);
                    option = void 0;
                    if (longMatch) {
                        option = self._findLongOption(longMatch[1]);
                        option.set(options);
                    } else if (shortMatch) {
                        gen5_items = shortMatch[1];
                        for (gen6_i = 0; gen6_i < gen5_items.length; ++gen6_i) {
                            shortOption = gen5_items[gen6_i];
                            option = self._findShortOption(shortOption);
                            option.set(options);
                        }
                    } else {
                        gen7_o = options._;
                        gen7_o.push.apply(gen7_o, args.slice(n));
                        gen4_forResult = options;
                        return true;
                    }
                }(n)) {
                    return gen4_forResult;
                }
            }
            return options;
        },
        help: function() {
            var self = this;
            var gen8_items, gen9_i, option;
            process.stdout.write("usage:\n\n    pogo [debug] script.pogo [script options]\n    pogo [options] scripts ...\n\noptions:\n\n");
            gen8_items = self._options;
            for (gen9_i = 0; gen9_i < gen8_items.length; ++gen9_i) {
                option = gen8_items[gen9_i];
                process.stdout.write(option + "\n");
            }
            return void 0;
        }
    });
    exports.createParser = function() {
        var self = this;
        return new OptionParser;
    };
}).call(this);
});
require.register("pogoscript-tests/lib/symbolScope.js", function(exports, require, module){
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
        var variables;
        variables = {};
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
            return variables.hasOwnProperty(name) || parentScope && parentScope.isDefined(name);
        };
        self.subScope = function() {
            var self = this;
            return new SymbolScope(self, {
                uniqueNames: uniqueNames
            });
        };
        return void 0;
    };
}).call(this);
});
require.register("pogoscript-tests/lib/versions.js", function(exports, require, module){
(function() {
    var self = this;
    var _;
    _ = require("underscore");
    exports.isLessThan = function(a, b) {
        var self = this;
        var parseVersion, compare, gen1_items, gen2_i, gen3_forResult;
        parseVersion = function(v) {
            if (v[0] === "v") {
                v = v.substring(1);
            }
            return v.split(".");
        };
        compare = function(v1, v2) {
            if (v1 > v2) {
                return 1;
            } else if (v2 > v1) {
                return -1;
            } else {
                return 0;
            }
        };
        gen1_items = _.zip(parseVersion(a), parseVersion(b));
        for (gen2_i = 0; gen2_i < gen1_items.length; ++gen2_i) {
            gen3_forResult = void 0;
            if (function(gen2_i) {
                var versionNumbers, comparison;
                versionNumbers = gen1_items[gen2_i];
                comparison = compare(versionNumbers[0], versionNumbers[1]);
                if (comparison) {
                    gen3_forResult = comparison < 0;
                    return true;
                }
            }(gen2_i)) {
                return gen3_forResult;
            }
        }
        return false;
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/argumentList.js", function(exports, require, module){
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
});
require.register("pogoscript-tests/lib/terms/argumentUtils.js", function(exports, require, module){
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
                var closure;
                if (body) {
                    closure = terms.closure(args || [], body);
                    closure.asyncify();
                    return closure;
                } else {
                    return terms.nil();
                }
            }
        };
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/asyncArgument.js", function(exports, require, module){
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
                return [];
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/asyncCallback.js", function(exports, require, module){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var asyncCallback;
        return asyncCallback = function(body, gen1_options) {
            var resultVariable;
            resultVariable = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "resultVariable") && gen1_options.resultVariable !== void 0 ? gen1_options.resultVariable : void 0;
            var errorVariable, catchErrorVariable;
            errorVariable = terms.generatedVariable([ "error" ]);
            catchErrorVariable = terms.generatedVariable([ "exception" ]);
            if (!body.containsContinuation()) {
                body.rewriteResultTermInto(function(term) {
                    if (!term.originallyAsync) {
                        return terms.functionCall(terms.callbackFunction, [ terms.nil(), term ]);
                    } else {
                        return term;
                    }
                }, {
                    async: true
                });
            }
            return terms.closure([ errorVariable, resultVariable ], terms.statements([ terms.ifExpression([ {
                condition: errorVariable,
                body: terms.statements([ terms.functionCall(terms.callbackFunction, [ errorVariable ]) ])
            } ], terms.statements([ terms.tryExpression(body, {
                catchParameter: catchErrorVariable,
                catchBody: terms.statements([ terms.functionCall(terms.callbackFunction, [ catchErrorVariable ]) ])
            }) ])) ]), {
                returnLastStatement: false
            });
        };
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/asyncResult.js", function(exports, require, module){
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
});
require.register("pogoscript-tests/lib/terms/asyncStatements.js", function(exports, require, module){
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
            var resultVariable, forceAsync, global, containsContinuation;
            resultVariable = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "resultVariable") && gen1_options.resultVariable !== void 0 ? gen1_options.resultVariable : void 0;
            forceAsync = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "forceAsync") && gen1_options.forceAsync !== void 0 ? gen1_options.forceAsync : false;
            global = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "global") && gen1_options.global !== void 0 ? gen1_options.global : false;
            containsContinuation = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "containsContinuation") && gen1_options.containsContinuation !== void 0 ? gen1_options.containsContinuation : containsContinuation;
            var errorVariable, asyncStmts;
            if (callbackStatements.length === 1 && callbackStatements[0].isAsyncResult) {
                if (containsContinuation) {
                    errorVariable = terms.generatedVariable([ "error" ]);
                    return terms.closure([ errorVariable ], terms.statements([ terms.ifExpression([ {
                        condition: errorVariable,
                        body: terms.statements([ terms.functionCall(terms.callbackFunction, [ errorVariable ]) ])
                    } ]) ]));
                } else {
                    return terms.callbackFunction;
                }
            } else {
                asyncStmts = putStatementsInCallbackForNextAsyncCall(callbackStatements, {
                    forceAsync: forceAsync,
                    forceNotAsync: true,
                    global: global
                });
                return terms.asyncCallback(asyncStmts, {
                    resultVariable: resultVariable
                });
            }
        };
        putStatementsInCallbackForNextAsyncCall = function(statements, gen2_options) {
            var forceAsync, forceNotAsync, global;
            forceAsync = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "forceAsync") && gen2_options.forceAsync !== void 0 ? gen2_options.forceAsync : false;
            forceNotAsync = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "forceNotAsync") && gen2_options.forceNotAsync !== void 0 ? gen2_options.forceNotAsync : false;
            global = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "global") && gen2_options.global !== void 0 ? gen2_options.global : false;
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
                            global: global,
                            containsContinuation: containsContinuation
                        });
                    });
                    if (asyncStatement) {
                        firstStatements = statements.slice(0, n);
                        firstStatements.push(asyncStatement);
                        gen3_forResult = terms.statements(firstStatements, {
                            async: true && !forceNotAsync
                        });
                        return true;
                    }
                }(n)) {
                    return gen3_forResult;
                }
            }
            return terms.statements(statements, {
                global: global,
                async: forceAsync
            });
        };
        return asyncStatements = function(statements, gen7_options) {
            var forceAsync, global;
            forceAsync = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "forceAsync") && gen7_options.forceAsync !== void 0 ? gen7_options.forceAsync : false;
            global = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "global") && gen7_options.global !== void 0 ? gen7_options.global : false;
            var serialisedStatements;
            serialisedStatements = statementsUtils.serialiseStatements(statements);
            return putStatementsInCallbackForNextAsyncCall(serialisedStatements, {
                forceAsync: forceAsync,
                global: global
            });
        };
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/boolean.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                if (self.boolean) {
                    return buffer.write("true");
                } else {
                    return buffer.write("false");
                }
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/breakStatement.js", function(exports, require, module){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function() {
                var self = this;
                return self.isBreak = true;
            },
            generateJavaScriptStatement: function(buffer, scope) {
                var self = this;
                return buffer.write("break;");
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return self;
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/closure.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                buffer.write("(");
                self.options.generateJavaScript(buffer, scope);
                buffer.write("&&");
                self.options.generateJavaScript(buffer, scope);
                buffer.write(".hasOwnProperty('" + codegenUtils.concatName(self.name) + "')&&");
                self.options.generateJavaScript(buffer, scope);
                buffer.write("." + codegenUtils.concatName(self.name) + "!==void 0)?");
                self.options.generateJavaScript(buffer, scope);
                buffer.write("." + codegenUtils.concatName(self.name) + ":");
                return self.properDefaultValue().generateJavaScript(buffer, scope);
            }
        });
        asyncParameters = function(closure, next) {
            return {
                parameters: function() {
                    var self = this;
                    if (closure.isAsync) {
                        return next.parameters().concat([ terms.callbackFunction ]);
                    } else {
                        return next.parameters();
                    }
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
                var optionalParameters, returnLastStatement, redefinesSelf, async;
                optionalParameters = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "optionalParameters") && gen1_options.optionalParameters !== void 0 ? gen1_options.optionalParameters : [];
                returnLastStatement = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "returnLastStatement") && gen1_options.returnLastStatement !== void 0 ? gen1_options.returnLastStatement : true;
                redefinesSelf = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "redefinesSelf") && gen1_options.redefinesSelf !== void 0 ? gen1_options.redefinesSelf : false;
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                self.isBlock = true;
                self.isClosure = true;
                self.parameters = parameters;
                self.body = body;
                self.redefinesSelf = redefinesSelf;
                self.optionalParameters = optionalParameters;
                self.isAsync = async || body.isAsync;
                return self.returnLastStatement = returnLastStatement;
            },
            blockify: function(parameters, gen2_options) {
                var self = this;
                var optionalParameters, async;
                optionalParameters = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "optionalParameters") && gen2_options.optionalParameters !== void 0 ? gen2_options.optionalParameters : [];
                async = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "async") && gen2_options.async !== void 0 ? gen2_options.async : false;
                self.parameters = parameters;
                self.optionalParameters = optionalParameters;
                self.isAsync = self.isAsync || async;
                return self;
            },
            scopify: function() {
                var self = this;
                if (self.parameters.length === 0 && self.optionalParameters.length === 0) {
                    if (self.isAsync) {
                        return terms.functionCall(terms.subExpression(self), [], {
                            async: true
                        });
                    } else {
                        return terms.scope(self.body.statements, {
                            async: self.isAsync
                        });
                    }
                } else {
                    return self;
                }
            },
            parameterTransforms: function() {
                var self = this;
                var optionals, async, splat;
                if (self._parameterTransforms) {
                    return self._parameterTransforms;
                }
                optionals = optionalParameters(self.optionalParameters, selfParameter(terms, self.redefinesSelf, blockParameters(self)));
                async = asyncParameters(self, optionals);
                splat = splatParameters(terms, async);
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
            declareParameters: function(scope, parameters) {
                var self = this;
                var gen3_items, gen4_i, parameter;
                gen3_items = parameters;
                for (gen4_i = 0; gen4_i < gen3_items.length; ++gen4_i) {
                    parameter = gen3_items[gen4_i];
                    scope.define(parameter.canonicalName(scope));
                }
                return void 0;
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                var parametersStrategy, parameters, bodyScope;
                parametersStrategy = self.parametersStrategy();
                self.rewriteResultTermToReturn();
                buffer.write("function(");
                parameters = parametersStrategy.namedParameters();
                parametersStrategy.generateJavaScriptParameters(buffer, scope);
                buffer.write("){");
                bodyScope = scope.subScope();
                self.declareParameters(bodyScope, parameters);
                self.generateSelfAssignment(buffer);
                parametersStrategy.generateJavaScriptParameterStatements(buffer, scope, terms.variable([ "arguments" ]));
                self.body.generateJavaScriptStatements(buffer, bodyScope, {
                    inClosure: true
                });
                return buffer.write("}");
            },
            generateSelfAssignment: function(buffer) {
                var self = this;
                if (self.redefinesSelf) {
                    return buffer.write("var self=this;");
                }
            },
            rewriteResultTermToReturn: function() {
                var self = this;
                if (self.returnLastStatement && !self.body.isAsync) {
                    return self.body.rewriteLastStatementToReturn({
                        async: self.isAsync
                    });
                }
            },
            asyncify: function() {
                var self = this;
                self.body.asyncify();
                return self.isAsync = true;
            },
            parametersStrategy: function() {
                var self = this;
                var innerStrategy, strategy;
                innerStrategy = function() {
                    if (containsSplatParameter(self)) {
                        return createSplatParameterStrategyFor(self);
                    } else if (self.optionalParameters.length > 0) {
                        return createOptionalParameterStrategyFor(self);
                    } else {
                        return terms.closureParameterStrategies.normalStrategy(self.parameters);
                    }
                }();
                strategy = function() {
                    if (self.isAsync) {
                        return terms.closureParameterStrategies.callbackStrategy(innerStrategy);
                    } else {
                        return innerStrategy;
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
});
require.register("pogoscript-tests/lib/terms/closureParameterStrategies.js", function(exports, require, module){
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
                        return codegenUtils.writeToBufferWithDelimiter(self.strategy.namedParameters(), ",", buffer, scope);
                    },
                    generateJavaScriptParameterStatements: function(buffer, scope, args) {
                        var self = this;
                        return self.strategy.generateJavaScriptParameterStatements(buffer, scope, args);
                    },
                    namedParameters: function() {
                        var self = this;
                        return strategy.namedParameters();
                    }
                };
            },
            normalStrategy: function(parameters) {
                var self = this;
                return {
                    parameters: parameters,
                    namedParameters: function() {
                        var self = this;
                        return self.parameters;
                    },
                    generateJavaScriptParameterStatements: function(buffer, scope, args) {
                        var self = this;
                        return void 0;
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
                    namedParameters: function() {
                        var self = this;
                        return self.before;
                    },
                    generateJavaScriptParameterStatements: function(buffer, scope, args) {
                        var self = this;
                        var n, afterArg, argsIndex;
                        buffer.write("var ");
                        self.splat.generateJavaScript(buffer, scope);
                        buffer.write("=Array.prototype.slice.call(");
                        args.generateJavaScript(buffer, scope);
                        buffer.write("," + self.before.length + ",");
                        args.generateJavaScript(buffer, scope);
                        buffer.write(".length");
                        if (self.after.length > 0) {
                            buffer.write("-" + self.after.length);
                        }
                        buffer.write(");");
                        if (before.length > 0 && after.length > 0) {
                            buffer.write("if(");
                            args.generateJavaScript(buffer, scope);
                            buffer.write(".length>" + before.length + "){");
                        }
                        for (n = 0; n < self.after.length; ++n) {
                            afterArg = self.after[n];
                            argsIndex = self.after.length - n;
                            buffer.write("var ");
                            afterArg.generateJavaScript(buffer, scope);
                            buffer.write("=");
                            args.generateJavaScript(buffer, scope);
                            buffer.write("[");
                            args.generateJavaScript(buffer, scope);
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
                    namedParameters: function() {
                        var self = this;
                        return self.before.concat([ self.optionsVariable ]);
                    },
                    generateJavaScriptParameterStatements: function(buffer, scope, args) {
                        var self = this;
                        var optionNames, gen3_items, gen4_i, option, optionName;
                        optionNames = _.map(self.options, function(option) {
                            return codegenUtils.concatName(option.field);
                        });
                        buffer.write("var ");
                        buffer.write(optionNames.join(","));
                        buffer.write(";");
                        gen3_items = self.options;
                        for (gen4_i = 0; gen4_i < gen3_items.length; ++gen4_i) {
                            option = gen3_items[gen4_i];
                            optionName = codegenUtils.concatName(option.field);
                            buffer.write(optionName + "=");
                            self.optionsVariable.generateJavaScript(buffer, scope);
                            buffer.write("!==void 0&&Object.prototype.hasOwnProperty.call(");
                            self.optionsVariable.generateJavaScript(buffer, scope);
                            buffer.write(",'" + optionName + "')&&");
                            self.optionsVariable.generateJavaScript(buffer, scope);
                            buffer.write("." + optionName + "!==void 0?");
                            self.optionsVariable.generateJavaScript(buffer, scope);
                            buffer.write("." + optionName + ":");
                            option.value.generateJavaScript(buffer, scope);
                            buffer.write(";");
                        }
                        return void 0;
                    }
                };
            },
            callbackStrategy: function(strategy) {
                var self = this;
                return {
                    strategy: strategy,
                    namedParameters: function() {
                        var self = this;
                        return self.strategy.namedParameters().concat(terms.callbackFunction);
                    },
                    generateJavaScriptParameterStatements: function(buffer, scope, args) {
                        var self = this;
                        var innerArgs, namedParameters, n, namedParam;
                        innerArgs = terms.generatedVariable([ "arguments" ]);
                        buffer.write("var ");
                        innerArgs.generateJavaScript(buffer, scope);
                        buffer.write("=Array.prototype.slice.call(");
                        args.generateJavaScript(buffer, scope);
                        buffer.write(",0,");
                        args.generateJavaScript(buffer, scope);
                        buffer.write(".length-1);");
                        terms.callbackFunction.generateJavaScript(buffer, scope);
                        buffer.write("=");
                        args.generateJavaScript(buffer, scope);
                        buffer.write("[");
                        args.generateJavaScript(buffer, scope);
                        buffer.write(".length-1];");
                        buffer.write("if(!(");
                        terms.callbackFunction.generateJavaScript(buffer, scope);
                        buffer.write(" instanceof Function)){throw new Error('asynchronous function called synchronously');}");
                        namedParameters = self.strategy.namedParameters();
                        for (n = 0; n < namedParameters.length; ++n) {
                            namedParam = self.strategy.namedParameters()[n];
                            namedParam.generateJavaScript(buffer, scope);
                            buffer.write("=");
                            innerArgs.generateJavaScript(buffer, scope);
                            buffer.write("[" + n + "];");
                        }
                        return self.strategy.generateJavaScriptParameterStatements(buffer, scope, innerArgs);
                    }
                };
            }
        };
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/codegenUtils.js", function(exports, require, module){
(function() {
    var self = this;
    var _, actualCharacters, nameSegmentRenderedInJavaScript, operatorRenderedInJavaScript, capitalise, reservedWords, escapeReservedWord;
    _ = require("underscore");
    exports.writeToBufferWithDelimiter = function(array, delimiter, buffer, scope) {
        var self = this;
        var writer, first;
        writer = void 0;
        if (scope instanceof Function) {
            writer = scope;
        } else {
            writer = function(item) {
                return item.generateJavaScript(buffer, scope);
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
        var match;
        match = /^@([a-z_$]+)$/i.exec(name);
        if (match) {
            return match[1];
        } else {
            return name;
        }
    };
    exports.declaredVariables = function(scope) {
        var self = this;
        return {
            variables: [],
            scope: scope,
            declare: function(variable) {
                var self = this;
                scope.define(variable);
                return self.variables.push(variable);
            },
            isDeclared: function(variable) {
                var self = this;
                return scope.isDefined(variable);
            },
            uniqueVariables: function() {
                var self = this;
                return _.uniq(self.variables);
            }
        };
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/continueStatement.js", function(exports, require, module){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function() {
                var self = this;
                return self.isContinue = true;
            },
            generateJavaScriptStatement: function(buffer, scope) {
                var self = this;
                return buffer.write("continue;");
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return self;
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/definition.js", function(exports, require, module){
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
                return self.isAssignment = assignment;
            },
            expression: function() {
                var self = this;
                return self;
            },
            hashEntry: function() {
                var self = this;
                return self.cg.hashEntry(self.target.hashEntryField(), self.source);
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                self.target.generateJavaScriptTarget(buffer, scope);
                buffer.write("=");
                return self.source.generateJavaScript(buffer, scope);
            },
            declareVariables: function(variables) {
                var self = this;
                var name;
                name = self.target.canonicalName(variables.scope);
                if (name) {
                    if (!self.isAssignment) {
                        if (self.shadow || !variables.isDeclared(name)) {
                            return variables.declare(name);
                        } else if (variables.isDeclared(name)) {
                            return terms.errors.addTermWithMessage(self, "variable " + self.target.displayName() + " is already defined, use := to reassign it");
                        }
                    } else if (!variables.isDeclared(name)) {
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
});
require.register("pogoscript-tests/lib/terms/fieldReference.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                self.object.generateJavaScript(buffer, scope);
                buffer.write(".");
                return buffer.write(codegenUtils.concatName(self.name));
            },
            generateJavaScriptTarget: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen1_o;
                gen1_o = self;
                return gen1_o.generateJavaScript.apply(gen1_o, args);
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/float.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return buffer.write(self.float.toString());
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/forEach.js", function(exports, require, module){
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
                async: stmts.isAsync
            });
            init = terms.definition(indexVar, terms.integer(0));
            test = terms.operator("<", [ indexVar, terms.fieldReference(itemsVar, [ "length" ]) ]);
            incr = terms.increment(indexVar);
            return terms.subStatements([ terms.definition(itemsVar, collection), terms.forStatement(init, test, incr, statementsWithItemAssignment) ]);
        };
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/forExpression.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                buffer.write("for(");
                self.initialization.generateJavaScript(buffer, scope);
                buffer.write(";");
                self.test.generateJavaScript(buffer, scope);
                buffer.write(";");
                self.increment.generateJavaScript(buffer, scope);
                buffer.write("){");
                self.statements.generateJavaScriptStatements(buffer, scope);
                return buffer.write("}");
            },
            generateJavaScriptStatement: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen2_o;
                gen2_o = self;
                return gen2_o.generateJavaScript.apply(gen2_o, args);
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
            if (initStatements.isAsync || testStatements.isAsync || incrStatements.isAsync || body.isAsync) {
                asyncForFunction = terms.moduleConstants.defineAs([ "async", "for" ], terms.javascript(asyncControl.for.toString()));
                return terms.scope([ init, terms.functionCall(asyncForFunction, [ terms.argumentUtils.asyncifyBody(testStatements), terms.argumentUtils.asyncifyBody(incrStatements), terms.argumentUtils.asyncifyBody(body) ], {
                    async: true
                }) ]);
            } else {
                return forExpressionTerm(init, test, incr, body);
            }
        };
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/forIn.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                buffer.write("for(");
                self.iterator.target.generateJavaScript(buffer, scope);
                buffer.write(" in ");
                self.collection.generateJavaScript(buffer, scope);
                buffer.write("){");
                self.statements.generateJavaScriptStatement(buffer, scope);
                return buffer.write("}");
            },
            generateJavaScriptStatement: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen1_o;
                gen1_o = self;
                return gen1_o.generateJavaScript.apply(gen1_o, args);
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return void 0;
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/functionCall.js", function(exports, require, module){
(function() {
    var self = this;
    var codegenUtils, argumentUtils, _;
    codegenUtils = require("./codegenUtils");
    argumentUtils = require("./argumentUtils");
    _ = require("underscore");
    module.exports = function(terms) {
        var self = this;
        var functionCallTerm, functionCall;
        functionCallTerm = terms.term({
            constructor: function(fun, args, gen1_options) {
                var self = this;
                var optionalArguments, async, passThisToApply, originallyAsync, asyncCallbackArgument;
                optionalArguments = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "optionalArguments") && gen1_options.optionalArguments !== void 0 ? gen1_options.optionalArguments : [];
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                passThisToApply = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "passThisToApply") && gen1_options.passThisToApply !== void 0 ? gen1_options.passThisToApply : false;
                originallyAsync = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "originallyAsync") && gen1_options.originallyAsync !== void 0 ? gen1_options.originallyAsync : false;
                asyncCallbackArgument = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "asyncCallbackArgument") && gen1_options.asyncCallbackArgument !== void 0 ? gen1_options.asyncCallbackArgument : void 0;
                self.isFunctionCall = true;
                self.function = fun;
                self.functionArguments = args;
                self.optionalArguments = optionalArguments;
                self.passThisToApply = passThisToApply;
                self.isAsync = async;
                self.originallyAsync = originallyAsync;
                return self.asyncCallbackArgument = asyncCallbackArgument;
            },
            hasSplatArguments: function() {
                var self = this;
                return _.any(self.functionArguments, function(arg) {
                    return arg.isSplat;
                });
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                var args, splattedArguments;
                self.function.generateJavaScript(buffer, scope);
                args = codegenUtils.concatArgs(self.functionArguments, {
                    optionalArgs: self.optionalArguments,
                    asyncCallbackArg: self.asyncCallbackArgument,
                    terms: terms
                });
                splattedArguments = self.cg.splatArguments(args);
                if (splattedArguments && self.function.isIndexer) {
                    buffer.write(".apply(");
                    self.function.object.generateJavaScript(buffer, scope);
                    buffer.write(",");
                    splattedArguments.generateJavaScript(buffer, scope);
                    return buffer.write(")");
                } else if (splattedArguments) {
                    buffer.write(".apply(");
                    if (self.passThisToApply) {
                        buffer.write("this");
                    } else {
                        buffer.write("null");
                    }
                    buffer.write(",");
                    splattedArguments.generateJavaScript(buffer, scope);
                    return buffer.write(")");
                } else {
                    buffer.write("(");
                    codegenUtils.writeToBufferWithDelimiter(args, ",", buffer, scope);
                    return buffer.write(")");
                }
            },
            makeAsyncCallWithCallback: function(callback) {
                var self = this;
                self.asyncCallbackArgument = callback;
                return self;
            }
        });
        return functionCall = function(fun, args, gen2_options) {
            var optionalArguments, async, passThisToApply, originallyAsync, asyncCallbackArgument, couldBeMacro;
            optionalArguments = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "optionalArguments") && gen2_options.optionalArguments !== void 0 ? gen2_options.optionalArguments : [];
            async = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "async") && gen2_options.async !== void 0 ? gen2_options.async : false;
            passThisToApply = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "passThisToApply") && gen2_options.passThisToApply !== void 0 ? gen2_options.passThisToApply : false;
            originallyAsync = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "originallyAsync") && gen2_options.originallyAsync !== void 0 ? gen2_options.originallyAsync : false;
            asyncCallbackArgument = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "asyncCallbackArgument") && gen2_options.asyncCallbackArgument !== void 0 ? gen2_options.asyncCallbackArgument : void 0;
            couldBeMacro = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "couldBeMacro") && gen2_options.couldBeMacro !== void 0 ? gen2_options.couldBeMacro : true;
            var asyncResult, name, macro, funCall;
            if (async) {
                asyncResult = terms.asyncResult();
                terms.argumentUtils.asyncifyArguments(args, optionalArguments);
                return terms.subStatements([ terms.definition(asyncResult, functionCallTerm(fun, args, {
                    optionalArguments: optionalArguments,
                    passThisToApply: passThisToApply,
                    originallyAsync: true,
                    asyncCallbackArgument: asyncCallbackArgument
                }), {
                    async: true
                }), asyncResult ]);
            } else if (fun.variable && couldBeMacro) {
                name = fun.variable;
                macro = terms.macros.findMacro(name);
                funCall = functionCallTerm(fun, args, {
                    optionalArguments: optionalArguments
                });
                if (macro) {
                    return macro(funCall, name, args, optionalArguments);
                }
            }
            return functionCallTerm(fun, args, {
                optionalArguments: optionalArguments,
                passThisToApply: passThisToApply,
                originallyAsync: originallyAsync,
                asyncCallbackArgument: asyncCallbackArgument
            });
        };
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/generatedVariable.js", function(exports, require, module){
(function() {
    var self = this;
    var codegenUtils;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(name) {
                var self = this;
                self.name = name;
                self.isVariable = true;
                return self.genVar = void 0;
            },
            dontClone: true,
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return buffer.write(self.generatedName(scope));
            },
            generateJavaScriptParameter: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen1_o;
                gen1_o = self;
                return gen1_o.generateJavaScript.apply(gen1_o, args);
            },
            generateJavaScriptTarget: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen2_o;
                gen2_o = self;
                return gen2_o.generateJavaScript.apply(gen2_o, args);
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/hash.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                buffer.write("{");
                codegenUtils.writeToBufferWithDelimiter(self.entries, ",", buffer, function(item) {
                    return item.generateJavaScriptHashEntry(buffer, scope);
                });
                return buffer.write("}");
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/hashEntry.js", function(exports, require, module){
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
            generateJavaScriptHashEntry: function(buffer, scope) {
                var self = this;
                var f;
                f = codegenUtils.concatName(self.field);
                buffer.write(self.legalFieldName());
                buffer.write(":");
                return self.valueOrTrue().generateJavaScript(buffer, scope);
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
});
require.register("pogoscript-tests/lib/terms/identifier.js", function(exports, require, module){
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
});
require.register("pogoscript-tests/lib/terms/ifExpression.js", function(exports, require, module){
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
            generateJavaScriptStatement: function(buffer, scope) {
                var self = this;
                codegenUtils.writeToBufferWithDelimiter(self.cases, "else ", buffer, function(case_) {
                    buffer.write("if(");
                    case_.condition.generateJavaScript(buffer, scope);
                    buffer.write("){");
                    case_.body.generateJavaScriptStatements(buffer, scope);
                    return buffer.write("}");
                });
                if (self.elseBody) {
                    buffer.write("else{");
                    self.elseBody.generateJavaScriptStatements(buffer, scope);
                    return buffer.write("}");
                }
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                self.rewriteResultTermInto(function(term) {
                    return terms.returnStatement(term);
                });
                buffer.write("(function(){");
                self.generateJavaScriptStatement(buffer, scope);
                return buffer.write("})()");
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
                    self.elseBody = terms.statements([ terms.functionCall(terms.callbackFunction, []) ]);
                }
                return self;
            }
        });
        return ifExpression = function(cases, elseBody) {
            var anyAsyncCases, caseForConditionAndBody, casesList, asyncIfElseIfElseFunction, asyncIfElseFunction, asyncIfFunction;
            anyAsyncCases = _.any(cases, function(_case) {
                return _case.body.isAsync;
            });
            if (anyAsyncCases || elseBody && elseBody.isAsync) {
                if (cases.length > 1) {
                    caseForConditionAndBody = function(condition, body) {
                        return terms.hash([ terms.hashEntry([ "condition" ], condition), terms.hashEntry([ "body" ], terms.argumentUtils.asyncifyBody(body)) ]);
                    };
                    casesList = _.map(cases, function(_case) {
                        return caseForConditionAndBody(_case.condition, _case.body);
                    });
                    if (elseBody) {
                        casesList.push(caseForConditionAndBody(terms.boolean(true), elseBody));
                    }
                    asyncIfElseIfElseFunction = terms.moduleConstants.defineAs([ "async", "if", "else", "if", "else" ], terms.javascript(asyncControl.ifElseIfElse.toString()));
                    return terms.functionCall(asyncIfElseIfElseFunction, [ terms.list(casesList) ], {
                        async: true
                    });
                } else if (elseBody) {
                    asyncIfElseFunction = terms.moduleConstants.defineAs([ "async", "if", "else" ], terms.javascript(asyncControl.ifElse.toString()));
                    return terms.functionCall(asyncIfElseFunction, [ cases[0].condition, terms.argumentUtils.asyncifyBody(cases[0].body), terms.argumentUtils.asyncifyBody(elseBody) ], {
                        async: true
                    });
                } else {
                    asyncIfFunction = terms.moduleConstants.defineAs([ "async", "if" ], terms.javascript(asyncControl.if.toString()));
                    return terms.functionCall(asyncIfFunction, [ cases[0].condition, terms.argumentUtils.asyncifyBody(cases[0].body) ], {
                        async: true
                    });
                }
            } else {
                return ifExpressionTerm(cases, elseBody);
            }
        };
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/increment.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                buffer.write("++");
                return self.expression.generateJavaScript(buffer, scope);
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/indexer.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                self.object.generateJavaScript(buffer, scope);
                buffer.write("[");
                self.indexer.generateJavaScript(buffer, scope);
                return buffer.write("]");
            },
            generateJavaScriptTarget: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen1_o;
                gen1_o = self;
                return gen1_o.generateJavaScript.apply(gen1_o, args);
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/integer.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return buffer.write(self.integer.toString());
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/interpolatedString.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                buffer.write("(");
                codegenUtils.writeToBufferWithDelimiter(this.components, "+", buffer, scope);
                return buffer.write(")");
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
});
require.register("pogoscript-tests/lib/terms/javascript.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return buffer.write(self.source);
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/list.js", function(exports, require, module){
(function() {
    var self = this;
    var codegenUtils, _;
    codegenUtils = require("./codegenUtils");
    _ = require("underscore");
    module.exports = function(terms) {
        var self = this;
        var listTerm, list;
        listTerm = terms.term({
            constructor: function(items) {
                var self = this;
                self.isList = true;
                return self.items = items;
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                buffer.write("[");
                codegenUtils.writeToBufferWithDelimiter(self.items, ",", buffer, scope);
                return buffer.write("]");
            }
        });
        return list = function(items) {
            var hashEntry, macro;
            hashEntry = _.find(items, function(item) {
                return item.isHashEntry;
            });
            if (hashEntry) {
                macro = terms.listMacros.findMacro(hashEntry.field);
                if (macro) {
                    return macro(listTerm(items), hashEntry.field);
                } else {
                    return terms.errors.addTermWithMessage(hashEntry, "no macro for " + hashEntry.field.join(" "));
                }
            } else {
                return listTerm(items);
            }
        };
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/methodCall.js", function(exports, require, module){
(function() {
    var self = this;
    var codegenUtils, argumentUtils;
    codegenUtils = require("./codegenUtils");
    argumentUtils = require("./argumentUtils");
    module.exports = function(terms) {
        var self = this;
        var methodCallTerm, methodCall;
        methodCallTerm = terms.term({
            constructor: function(object, name, args, gen1_options) {
                var self = this;
                var optionalArguments, async, originallyAsync, asyncCallbackArgument;
                optionalArguments = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "optionalArguments") && gen1_options.optionalArguments !== void 0 ? gen1_options.optionalArguments : [];
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                originallyAsync = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "originallyAsync") && gen1_options.originallyAsync !== void 0 ? gen1_options.originallyAsync : false;
                asyncCallbackArgument = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "asyncCallbackArgument") && gen1_options.asyncCallbackArgument !== void 0 ? gen1_options.asyncCallbackArgument : void 0;
                self.isMethodCall = true;
                self.object = object;
                self.name = name;
                self.methodArguments = args;
                self.optionalArguments = optionalArguments;
                self.isAsync = async;
                self.originallyAsync = originallyAsync;
                return self.asyncCallbackArgument = asyncCallbackArgument;
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                var args;
                self.object.generateJavaScript(buffer, scope);
                buffer.write(".");
                buffer.write(codegenUtils.concatName(self.name));
                buffer.write("(");
                args = codegenUtils.concatArgs(self.methodArguments, {
                    optionalArgs: self.optionalArguments,
                    terms: terms,
                    asyncCallbackArg: self.asyncCallbackArgument
                });
                codegenUtils.writeToBufferWithDelimiter(args, ",", buffer, scope);
                return buffer.write(")");
            },
            makeAsyncCallWithCallback: function(callback) {
                var self = this;
                self.asyncCallbackArgument = callback;
                return self;
            }
        });
        return methodCall = function(object, name, args, gen2_options) {
            var optionalArguments, async;
            optionalArguments = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "optionalArguments") && gen2_options.optionalArguments !== void 0 ? gen2_options.optionalArguments : [];
            async = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "async") && gen2_options.async !== void 0 ? gen2_options.async : false;
            var splattedArgs, objectVar, asyncResult;
            splattedArgs = terms.splatArguments(args, optionalArguments);
            if (splattedArgs) {
                objectVar = terms.generatedVariable([ "o" ]);
                return terms.subStatements([ terms.definition(objectVar, object), methodCall(terms.fieldReference(objectVar, name), [ "apply" ], [ objectVar, splattedArgs ], void 0, {
                    async: async
                }) ]);
            } else if (async) {
                terms.argumentUtils.asyncifyArguments(args, optionalArguments);
                asyncResult = terms.asyncResult();
                return terms.subStatements([ terms.definition(asyncResult, methodCallTerm(object, name, args, {
                    optionalArguments: optionalArguments,
                    async: async,
                    originallyAsync: true
                }), {
                    async: true
                }), asyncResult ]);
            } else {
                return methodCallTerm(object, name, args, {
                    optionalArguments: optionalArguments,
                    async: async
                });
            }
        };
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/module.js", function(exports, require, module){
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
            generateJavaScriptModule: function(buffer) {
                var self = this;
                var scope, definitions, gen2_o;
                scope = new terms.SymbolScope(void 0);
                definitions = terms.moduleConstants.definitions();
                gen2_o = self.bodyStatements.statements;
                gen2_o.unshift.apply(gen2_o, definitions);
                return self.statements.generateJavaScriptStatements(buffer, scope, {
                    global: self.global,
                    inClosure: true
                });
            }
        });
        return module = function(statements, gen3_options) {
            var inScope, global, returnLastStatement, bodyStatements;
            inScope = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "inScope") && gen3_options.inScope !== void 0 ? gen3_options.inScope : true;
            global = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "global") && gen3_options.global !== void 0 ? gen3_options.global : false;
            returnLastStatement = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "returnLastStatement") && gen3_options.returnLastStatement !== void 0 ? gen3_options.returnLastStatement : false;
            bodyStatements = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "bodyStatements") && gen3_options.bodyStatements !== void 0 ? gen3_options.bodyStatements : bodyStatements;
            var scope, args, errorVariable, throwIfError, methodCall;
            if (returnLastStatement) {
                statements.rewriteLastStatementToReturn({
                    async: false
                });
            }
            if (inScope) {
                scope = terms.closure([], statements, {
                    returnLastStatement: returnLastStatement,
                    redefinesSelf: true
                });
                args = [ terms.variable([ "this" ]) ];
                if (statements.isAsync) {
                    errorVariable = terms.generatedVariable([ "error" ]);
                    throwIfError = terms.ifExpression([ {
                        condition: errorVariable,
                        body: terms.statements([ terms.functionCall(terms.variable([ "set", "timeout" ]), [ terms.closure([], terms.statements([ terms.throwStatement(errorVariable) ])), terms.integer(0) ]) ])
                    } ]);
                    args.push(terms.closure([ errorVariable ], terms.statements([ throwIfError ])));
                }
                methodCall = terms.methodCall(terms.subExpression(scope), [ "call" ], args);
                return moduleTerm(terms.statements([ methodCall ]), {
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
});
require.register("pogoscript-tests/lib/terms/newOperator.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                buffer.write("new ");
                if (self.functionCall.isVariable) {
                    return terms.functionCall(self.functionCall, []).generateJavaScript(buffer, scope);
                } else if (self.functionCall.isFunctionCall && self.functionCall.hasSplatArguments()) {
                    return self.cg.block([], self.cg.statements([ self.functionCall ]), {
                        returnLastStatement: false
                    }).generateJavaScript(buffer, scope);
                } else {
                    return self.functionCall.generateJavaScript(buffer, scope);
                }
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
});
require.register("pogoscript-tests/lib/terms/nil.js", function(exports, require, module){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function() {
                var self = this;
                return self.isNil = true;
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return terms.javascript("void 0").generateJavaScript(buffer, scope);
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/normalParameters.js", function(exports, require, module){
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
});
require.register("pogoscript-tests/lib/terms/operator.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                var alpha, n;
                buffer.write("(");
                if (self.operatorArguments.length === 1) {
                    buffer.write(self.operator);
                    if (self.isOperatorAlpha()) {
                        buffer.write(" ");
                    }
                    self.operatorArguments[0].generateJavaScript(buffer, scope);
                } else {
                    alpha = self.isOperatorAlpha();
                    self.operatorArguments[0].generateJavaScript(buffer, scope);
                    for (n = 1; n < self.operatorArguments.length; ++n) {
                        if (alpha) {
                            buffer.write(" ");
                        }
                        buffer.write(self.operator);
                        if (alpha) {
                            buffer.write(" ");
                        }
                        self.operatorArguments[n].generateJavaScript(buffer, scope);
                    }
                }
                return buffer.write(")");
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/parameters.js", function(exports, require, module){
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
                return [];
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/regExp.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                var options;
                options = function() {
                    if (self.options) {
                        return "/" + self.options;
                    } else {
                        return "/";
                    }
                }();
                return buffer.write("/" + this.pattern.replace(/\//g, "\\/") + options);
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/returnStatement.js", function(exports, require, module){
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
            generateJavaScriptStatement: function(buffer, scope) {
                var self = this;
                if (self.expression) {
                    buffer.write("return ");
                    self.expression.generateJavaScript(buffer, scope);
                    return buffer.write(";");
                } else {
                    return buffer.write("return;");
                }
            },
            rewriteResultTermInto: function(returnTerm, gen2_options) {
                var self = this;
                var async;
                async = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "async") && gen2_options.async !== void 0 ? gen2_options.async : false;
                var arguments;
                if (async) {
                    arguments = function() {
                        if (self.expression) {
                            return [ terms.nil(), self.expression ];
                        } else {
                            return [];
                        }
                    }();
                    return terms.functionCall(terms.callbackFunction, arguments);
                } else {
                    return self;
                }
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/scope.js", function(exports, require, module){
(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var scope;
        return scope = function(statementList) {
            var statement, statements;
            if (statementList.length === 1) {
                statement = statementList[0];
                if (statement.isReturn) {
                    return statement.expression;
                } else {
                    return statement;
                }
            } else {
                statements = terms.asyncStatements(statementList);
                return terms.functionCall(terms.subExpression(terms.block([], statements)), [], {
                    async: statements.isAsync
                });
            }
        };
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/selfExpression.js", function(exports, require, module){
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
});
require.register("pogoscript-tests/lib/terms/semanticError.js", function(exports, require, module){
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
            generateJavaScript: function() {
                var self = this;
                return void 0;
            },
            printError: function(sourceFile, buffer) {
                var self = this;
                sourceFile.printLocation(self.errorTerms[0].location(), buffer);
                return buffer.write(this.message + "\n");
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/splat.js", function(exports, require, module){
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
});
require.register("pogoscript-tests/lib/terms/splatArguments.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                var i, splatArgument;
                for (i = 0; i < self.splatArguments.length; ++i) {
                    splatArgument = self.splatArguments[i];
                    if (i === 0) {
                        splatArgument.generateJavaScript(buffer, scope);
                    } else {
                        buffer.write(".concat(");
                        splatArgument.generateJavaScript(buffer, scope);
                        buffer.write(")");
                    }
                }
                return void 0;
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
});
require.register("pogoscript-tests/lib/terms/splatParameters.js", function(exports, require, module){
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
});
require.register("pogoscript-tests/lib/terms/statements.js", function(exports, require, module){
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
                var async;
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                self.isStatements = true;
                self.statements = statements;
                return self.isAsync = async;
            },
            generateStatements: function(statements, buffer, scope, gen2_options) {
                var self = this;
                var inClosure, global;
                inClosure = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "inClosure") && gen2_options.inClosure !== void 0 ? gen2_options.inClosure : false;
                global = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "global") && gen2_options.global !== void 0 ? gen2_options.global : false;
                var declaredVariables, s, statement;
                if (inClosure) {
                    declaredVariables = self.findDeclaredVariables(scope);
                    self.generateVariableDeclarations(declaredVariables, buffer, scope, {
                        global: global
                    });
                }
                for (s = 0; s < statements.length; ++s) {
                    statement = statements[s];
                    statement.generateJavaScriptStatement(buffer, scope);
                }
                return void 0;
            },
            rewriteResultTermInto: function(returnTerm, gen3_options) {
                var self = this;
                var async;
                async = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "async") && gen3_options.async !== void 0 ? gen3_options.async : false;
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
                }
            },
            rewriteLastStatementToReturn: function(gen4_options) {
                var self = this;
                var async;
                async = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "async") && gen4_options.async !== void 0 ? gen4_options.async : false;
                var containsContinuation;
                containsContinuation = self.containsContinuation();
                return self.rewriteResultTermInto(function(term) {
                    if (async && !containsContinuation) {
                        return terms.functionCall(terms.callbackFunction, [ terms.nil(), term ]);
                    } else {
                        return terms.returnStatement(term, {
                            implicit: true
                        });
                    }
                }, {
                    async: async
                });
            },
            generateVariableDeclarations: function(variables, buffer, scope, gen5_options) {
                var self = this;
                var global;
                global = gen5_options !== void 0 && Object.prototype.hasOwnProperty.call(gen5_options, "global") && gen5_options.global !== void 0 ? gen5_options.global : false;
                if (variables.length > 0) {
                    _(variables).each(function(name) {
                        return scope.define(name);
                    });
                    if (!global) {
                        buffer.write("var ");
                        codegenUtils.writeToBufferWithDelimiter(variables, ",", buffer, function(variable) {
                            return buffer.write(variable);
                        });
                        return buffer.write(";");
                    }
                }
            },
            findDeclaredVariables: function(scope) {
                var self = this;
                var variables;
                variables = codegenUtils.declaredVariables(scope);
                self.walkDescendantsNotBelowIf(function(subterm, path) {
                    return subterm.declareVariables(variables, scope);
                }, function(subterm, path) {
                    return subterm.isClosure;
                });
                return variables.uniqueVariables();
            },
            generateJavaScriptStatements: function(buffer, scope, gen6_options) {
                var self = this;
                var inClosure, global;
                inClosure = gen6_options !== void 0 && Object.prototype.hasOwnProperty.call(gen6_options, "inClosure") && gen6_options.inClosure !== void 0 ? gen6_options.inClosure : false;
                global = gen6_options !== void 0 && Object.prototype.hasOwnProperty.call(gen6_options, "global") && gen6_options.global !== void 0 ? gen6_options.global : false;
                return self.generateStatements(self.statements, buffer, scope, {
                    inClosure: inClosure,
                    global: global
                });
            },
            blockify: function(parameters, gen7_options) {
                var self = this;
                var optionalParameters, async;
                optionalParameters = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "optionalParameters") && gen7_options.optionalParameters !== void 0 ? gen7_options.optionalParameters : void 0;
                async = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "async") && gen7_options.async !== void 0 ? gen7_options.async : false;
                var statements;
                statements = function() {
                    if (self.isExpressionStatements) {
                        return self.cg.statements([ self ]);
                    } else {
                        return self;
                    }
                }();
                return terms.block(parameters, statements, {
                    optionalParameters: optionalParameters,
                    async: async
                });
            },
            scopify: function() {
                var self = this;
                return self.cg.functionCall(self.cg.block([], self), []);
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                if (self.statements.length > 0) {
                    return self.statements[self.statements.length - 1].generateJavaScript(buffer, scope);
                }
            },
            generateJavaScriptStatement: function(buffer, scope) {
                var self = this;
                if (self.statements.length > 0) {
                    return self.statements[self.statements.length - 1].generateJavaScriptStatement(buffer, scope);
                }
            },
            definitions: function(scope) {
                var self = this;
                return _(self.statements).reduce(function(list, statement) {
                    var defs;
                    defs = statement.definitions(scope);
                    return list.concat(defs);
                }, []);
            },
            serialiseStatements: function() {
                var self = this;
                self.statements = statementsUtils.serialiseStatements(self.statements);
                return void 0;
            },
            asyncify: function() {
                var self = this;
                if (!self.isAsync) {
                    self.rewriteLastStatementToReturn({
                        async: true
                    });
                    return self.isAsync = true;
                }
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/statementsUtils.js", function(exports, require, module){
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
}).call(this);
});
require.register("pogoscript-tests/lib/terms/string.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return buffer.write(codegenUtils.formatJavaScriptString(this.string));
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/subExpression.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                buffer.write("(");
                self.expression.generateJavaScript(buffer, scope);
                return buffer.write(")");
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/subStatements.js", function(exports, require, module){
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
            generateJavaScript: function() {
                var self = this;
                self.show();
                throw new Error("sub statements does not generate java script");
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/terms.js", function(exports, require, module){
(function() {
    var self = this;
    var $class, classExtending, _;
    $class = require("../class").class;
    classExtending = require("../class").classExtending;
    _ = require("underscore");
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
                    locations = _.filter(_.map(children, function(child) {
                        return child.location();
                    }), function(location) {
                        return location;
                    });
                    if (locations.length > 0) {
                        firstLine = _.min(_.map(locations, function(location) {
                            return location.firstLine;
                        }));
                        lastLine = _.max(_.map(locations, function(location) {
                            return location.lastLine;
                        }));
                        locationsOnFirstLine = _.filter(locations, function(location) {
                            return location.firstLine === firstLine;
                        });
                        locationsOnLastLine = _.filter(locations, function(location) {
                            return location.lastLine === lastLine;
                        });
                        return {
                            firstLine: firstLine,
                            lastLine: lastLine,
                            firstColumn: _.min(_.map(locationsOnFirstLine, function(location) {
                                return location.firstColumn;
                            })),
                            lastColumn: _.max(_.map(locationsOnLastLine, function(location) {
                                return location.lastColumn;
                            }))
                        };
                    } else {
                        return void 0;
                    }
                }
            },
            clone: function(gen1_options) {
                var self = this;
                var rewrite, limit, createObject;
                rewrite = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "rewrite") && gen1_options.rewrite !== void 0 ? gen1_options.rewrite : function(subterm) {
                    return void 0;
                };
                limit = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "limit") && gen1_options.limit !== void 0 ? gen1_options.limit : function(subterm) {
                    return false;
                };
                createObject = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "createObject") && gen1_options.createObject !== void 0 ? gen1_options.createObject : function(node) {
                    return Object.create(Object.getPrototypeOf(node));
                };
                var cloneObject, cloneNode, cloneArray, cloneSubterm;
                cloneObject = function(node, allowRewrite, path) {
                    var t, member;
                    t = createObject(node);
                    for (member in node) {
                        (function(member) {
                            if (node.hasOwnProperty(member)) {
                                t[member] = cloneSubterm(node[member], allowRewrite, path);
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
                        return _.map(terms, function(node) {
                            return cloneSubterm(node, allowRewrite, path);
                        });
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
                    var gen2_items, gen3_i, item;
                    if (member instanceof Node) {
                        return children.push(member);
                    } else if (member instanceof Array) {
                        gen2_items = member;
                        for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
                            item = gen2_items[gen3_i];
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
                            if (object.hasOwnProperty(property)) {
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
            walkDescendants: function(walker, gen4_options) {
                var self = this;
                var limit;
                limit = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "limit") && gen4_options.limit !== void 0 ? gen4_options.limit : function() {
                    return false;
                };
                var path, walkChildren;
                path = [];
                walkChildren = function(node) {
                    var gen5_items, gen6_i, child;
                    try {
                        path.push(node);
                        gen5_items = node.children();
                        for (gen6_i = 0; gen6_i < gen5_items.length; ++gen6_i) {
                            child = gen5_items[gen6_i];
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
            reduceWithReducedChildrenInto: function(reducer, gen7_options) {
                var self = this;
                var limit, cacheName;
                limit = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "limit") && gen7_options.limit !== void 0 ? gen7_options.limit : function(term) {
                    return false;
                };
                cacheName = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "cacheName") && gen7_options.cacheName !== void 0 ? gen7_options.cacheName : void 0;
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
                    var mappedChildren, gen8_items, gen9_i, child;
                    try {
                        path.push(node);
                        mappedChildren = [];
                        gen8_items = node.children();
                        for (gen9_i = 0; gen9_i < gen8_items.length; ++gen9_i) {
                            child = gen8_items[gen9_i];
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
            generateJavaScriptStatement: function(buffer, scope) {
                var self = this;
                self.generateJavaScript(buffer, scope);
                return buffer.write(";");
            },
            arguments: function() {
                var self = this;
                return self;
            },
            inspectTerm: function(gen10_options) {
                var self = this;
                var depth;
                depth = gen10_options !== void 0 && Object.prototype.hasOwnProperty.call(gen10_options, "depth") && gen10_options.depth !== void 0 ? gen10_options.depth : 20;
                var util;
                util = require("util");
                return util.inspect(self, false, depth);
            },
            show: function(gen11_options) {
                var self = this;
                var desc, depth;
                desc = gen11_options !== void 0 && Object.prototype.hasOwnProperty.call(gen11_options, "desc") && gen11_options.desc !== void 0 ? gen11_options.desc : void 0;
                depth = gen11_options !== void 0 && Object.prototype.hasOwnProperty.call(gen11_options, "depth") && gen11_options.depth !== void 0 ? gen11_options.depth : 20;
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
            blockify: function(parameters, gen12_options) {
                var self = this;
                var optionalParameters, async;
                optionalParameters = gen12_options !== void 0 && Object.prototype.hasOwnProperty.call(gen12_options, "optionalParameters") && gen12_options.optionalParameters !== void 0 ? gen12_options.optionalParameters : void 0;
                async = gen12_options !== void 0 && Object.prototype.hasOwnProperty.call(gen12_options, "async") && gen12_options.async !== void 0 ? gen12_options.async : false;
                return self.cg.block(parameters, self.cg.asyncStatements([ self ]), {
                    optionalParameters: optionalParameters,
                    async: async
                });
            },
            scopify: function() {
                var self = this;
                return self;
            },
            parameter: function() {
                var self = this;
                return this.cg.errors.addTermWithMessage(self, "this cannot be used as a parameter");
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
                    rewrite: function(term, gen13_options) {
                        var clone;
                        clone = gen13_options !== void 0 && Object.prototype.hasOwnProperty.call(gen13_options, "clone") && gen13_options.clone !== void 0 ? gen13_options.clone : void 0;
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
                    rewrite: function(term, gen14_options) {
                        var clone;
                        clone = gen14_options !== void 0 && Object.prototype.hasOwnProperty.call(gen14_options, "clone") && gen14_options.clone !== void 0 ? gen14_options.clone : void 0;
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
            declareVariables: function() {
                var self = this;
                return void 0;
            },
            canonicalName: function() {
                var self = this;
                return void 0;
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
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                if (self.containsContinuation()) {
                    return self;
                } else {
                    return returnTerm(self);
                }
            },
            asyncify: function() {
                var self = this;
                return void 0;
            }
        });
        termPrototype = new Term();
        term = function(members) {
            var termConstructor;
            termConstructor = classExtending(Term, members);
            return function() {
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen15_c;
                gen15_c = function() {
                    termConstructor.apply(this, args);
                };
                gen15_c.prototype = termConstructor.prototype;
                return new gen15_c();
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
});
require.register("pogoscript-tests/lib/terms/throwStatement.js", function(exports, require, module){
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
            generateJavaScriptStatement: function(buffer, scope) {
                var self = this;
                buffer.write("throw ");
                self.expression.generateJavaScript(buffer, scope);
                return buffer.write(";");
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return self;
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/terms/tryExpression.js", function(exports, require, module){
(function() {
    var self = this;
    var asyncControl;
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        var tryExpressionTerm, tryExpression;
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
            generateJavaScriptStatement: function(buffer, scope, returnStatements) {
                var self = this;
                buffer.write("try{");
                if (returnStatements) {
                    self.body.generateJavaScriptStatementsReturn(buffer, scope);
                } else {
                    self.body.generateJavaScriptStatements(buffer, scope);
                }
                buffer.write("}");
                if (self.catchBody) {
                    buffer.write("catch(");
                    self.catchParameter.generateJavaScript(buffer, scope);
                    buffer.write("){");
                    if (returnStatements) {
                        self.catchBody.generateJavaScriptStatementsReturn(buffer, scope);
                    } else {
                        self.catchBody.generateJavaScriptStatements(buffer, scope);
                    }
                    buffer.write("}");
                }
                if (self.finallyBody) {
                    buffer.write("finally{");
                    self.finallyBody.generateJavaScriptStatements(buffer, scope);
                    return buffer.write("}");
                }
            },
            generateJavaScript: function(buffer, symbolScope) {
                var self = this;
                if (self.alreadyCalled) {
                    throw new Error("stuff");
                }
                self.alreadyCalled = true;
                return self.cg.scope([ self ], {
                    alwaysGenerateFunction: true
                }).generateJavaScript(buffer, symbolScope);
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
        return tryExpression = function(body, gen2_options) {
            var catchBody, catchParameter, finallyBody;
            catchBody = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "catchBody") && gen2_options.catchBody !== void 0 ? gen2_options.catchBody : void 0;
            catchParameter = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "catchParameter") && gen2_options.catchParameter !== void 0 ? gen2_options.catchParameter : void 0;
            finallyBody = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "finallyBody") && gen2_options.finallyBody !== void 0 ? gen2_options.finallyBody : void 0;
            var asyncTryFunction;
            if (body.isAsync || catchBody && catchBody.isAsync || finallyBody && finallyBody.isAsync) {
                asyncTryFunction = terms.moduleConstants.defineAs([ "async", "try" ], terms.javascript(asyncControl.try.toString()));
                return terms.functionCall(asyncTryFunction, [ terms.argumentUtils.asyncifyBody(body), terms.argumentUtils.asyncifyBody(catchBody, [ catchParameter ]), terms.argumentUtils.asyncifyBody(finallyBody) ], {
                    async: true
                });
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
});
require.register("pogoscript-tests/lib/terms/typeof.js", function(exports, require, module){
exports.typeof = function (expression, type) {
  return this.term(function () {
    this.isInstanceOf = true;
    this.expression = expression;
    this.type = type;

    this.generateJavaScript = function (buffer, scope) {
        buffer.write("(typeof(");
        this.expression.generateJavaScript(buffer, scope);
        buffer.write(") === '" + this.type + "')");
    };
  });
};

});
require.register("pogoscript-tests/lib/terms/variable.js", function(exports, require, module){
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
                var location;
                location = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "location") && gen1_options.location !== void 0 ? gen1_options.location : void 0;
                self.variable = name;
                self.isVariable = true;
                return self.setLocation(location);
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return buffer.write(this.canonicalName());
            },
            generateJavaScriptTarget: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen2_o;
                gen2_o = self;
                return gen2_o.generateJavaScript.apply(gen2_o, args);
            },
            hashEntryField: function() {
                var self = this;
                return self.variable;
            },
            generateJavaScriptParameter: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen3_o;
                gen3_o = self;
                return gen3_o.generateJavaScript.apply(gen3_o, args);
            },
            parameter: function() {
                var self = this;
                return self;
            }
        });
        return variable = function(name, gen4_options) {
            var couldBeMacro, location;
            couldBeMacro = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "couldBeMacro") && gen4_options.couldBeMacro !== void 0 ? gen4_options.couldBeMacro : true;
            location = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "location") && gen4_options.location !== void 0 ? gen4_options.location : void 0;
            var v, macro;
            v = variableTerm(name, {
                location: location
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
});
require.register("pogoscript-tests/lib/terms/whileExpression.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                buffer.write("while(");
                self.condition.generateJavaScript(buffer, scope);
                buffer.write("){");
                self.statements.generateJavaScriptStatements(buffer, scope);
                return buffer.write("}");
            },
            generateJavaScriptStatement: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen1_o;
                gen1_o = self;
                return gen1_o.generateJavaScript.apply(gen1_o, args);
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
});
require.register("pogoscript-tests/lib/terms/withExpression.js", function(exports, require, module){
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
            generateJavaScript: function(buffer, scope) {
                var self = this;
                buffer.write("with(");
                self.subject.generateJavaScript(buffer, scope);
                buffer.write("){");
                self.statements.generateJavaScriptStatements(buffer, scope);
                return buffer.write("}");
            },
            generateJavaScriptStatement: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen1_o;
                gen1_o = self;
                return gen1_o.generateJavaScript.apply(gen1_o, args);
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
});
require.register("pogoscript-tests/lib/parser/basicExpression.js", function(exports, require, module){
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
        return this.terminals.length > 1;
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
      
      var args = _(this.arguments()).filter(function (a) {
        return !a.isHashEntry;
      });

			if (skipFirstParameter) {
				args = args.slice(1);
			}

      return this._parameters = _(args).map(function (arg) {
        return arg.parameter();
      });
    };
    
    this.optionalParameters = function () {
      if (this._optionalParameters) {
        return this._optionalParameters;
      }
      
      var args = _(this.arguments()).filter(function (a) {
        return a.isHashEntry;
      });

      return this._optionalParameters = args;
    };
    
    this.hasParameters = function () {
      return this._hasParameters || (this._hasParameters =
        this.argumentTerminals().length > 0
      );
    };
    
    this._buildBlocks = function () {
      var parameters = [];

      _(this.terminals).each(function (terminal) {
        if (terminal.isParameters) {
          parameters.push.apply(parameters, terminal.parameters);
        } else if (terminal.isBlock) {
          terminal.parameters = parameters;
          parameters = [];
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

});
require.register("pogoscript-tests/lib/parser/codeGenerator.js", function(exports, require, module){
var cg = require('../codeGenerator');

exports.codeGenerator = function () {
  var codegen = {};

  var term = require('../terms/terms')(codegen);

  var importTerm = function (name) {
    importModule('../terms/' + name);
  };

  var importModule = function (path) {
    var name = /[^/]*$/.exec(path)[0];
    codegen[name] = require(path)(codegen);
  };
  
  codegen.term = term.term;
  codegen.termPrototype = term.termPrototype;
  codegen.moduleConstants = new (require('../moduleConstants')(codegen));
  importTerm('generatedVariable');
  importTerm('definition');
  importTerm('javascript');
  codegen.basicExpression = require('./basicExpression');
  importTerm('splatArguments');
  importTerm('variable');
  importTerm('selfExpression');
  importTerm('statements');
  importTerm('asyncStatements');
  importTerm('subStatements');
  importTerm('closure');
  importTerm('normalParameters');
  importTerm('splatParameters');
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
  importTerm('argumentList');
  importTerm('subExpression');
  importTerm('fieldReference');
  importTerm('hash');
  importTerm('asyncArgument');
  codegen.complexExpression = require('./complexExpression');
  codegen.operatorExpression = require('../parser/operatorExpression')(codegen);
  codegen.unaryOperatorExpression = require('../parser/unaryOperatorExpression')(codegen);
  importTerm('operator');
  importTerm('splat');
  importTerm('hashEntry');
  codegen.concatName = cg.concatName;
  codegen.parseSplatParameters = cg.parseSplatParameters;
  codegen.collapse = cg.collapse;
  importTerm('functionCall');
  importTerm('scope');
  codegen.SymbolScope = require('../symbolScope').SymbolScope;
  importModule('../macroDirectory');
  importTerm('boolean');
  importTerm('increment');
  codegen.typeof = require('../terms/typeof').typeof;
  importTerm('tryExpression');
  importTerm('ifExpression');
  importTerm('nil');
  importTerm('continueStatement');
  importTerm('breakStatement');
  importTerm('throwStatement');
  importTerm('returnStatement');
  importTerm('methodCall');
  importTerm('asyncResult');
  importTerm('indexer');
  importTerm('whileExpression');
  codegen.whileStatement = codegen.whileExpression;
  importTerm('withExpression');
  codegen.withStatement = codegen.withExpression;
  importTerm('forExpression');
  codegen.forStatement = codegen.forExpression;
  importTerm('forIn');
  importTerm('forEach');
  importTerm('newOperator');
  codegen.loc = loc;
  importTerm('asyncCallback');
  codegen.callbackFunction = codegen.variable(['continuation'], {couldBeMacro: false});
  codegen.callbackFunction.isContinuation = true;
  codegen.optional = cg.optional;
  codegen.postIncrement = cg.postIncrement;
  codegen.oldTerm = cg.oldTerm;
  importTerm('semanticError');
  codegen.errors = require('./errors').errors(codegen);
  codegen.macros = require('./macros').macros(codegen);
  codegen.listMacros = require('./listMacros')(codegen);
  importTerm('argumentUtils');
  importTerm('closureParameterStrategies');
  
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

});
require.register("pogoscript-tests/lib/parser/commandLine.js", function(exports, require, module){
(function() {
    var self = this;
    var fs, createParser, Module, path, repl, vm, versions, compiler, createTerms, runningOnNodeOrHigher, compileFile, whenChanges, jsFilenameFromPogoFilename, compileFromFile;
    fs = require("fs");
    createParser = require("./parser").createParser;
    Module = require("module");
    path = require("path");
    repl = require("repl");
    vm = require("vm");
    versions = require("../versions");
    compiler = require("./compiler");
    createTerms = function() {
        return require("./codeGenerator").codeGenerator();
    };
    runningOnNodeOrHigher = function(version) {
        return !versions.isLessThan(process.version, version);
    };
    exports.compileFile = compileFile = function(filename, gen1_options) {
        var ugly;
        ugly = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "ugly") && gen1_options.ugly !== void 0 ? gen1_options.ugly : false;
        var js, jsFilename;
        js = compileFromFile(filename, {
            ugly: ugly
        });
        jsFilename = jsFilenameFromPogoFilename(filename);
        return fs.writeFileSync(jsFilename, js);
    };
    whenChanges = function(filename, act) {
        return fs.watchFile(filename, {
            persistent: true,
            interval: 500
        }, function(prev, curr) {
            if (curr.size === prev.size && curr.mtime.getTime() === prev.mtime.getTime()) {
                return;
            }
            return act();
        });
    };
    exports.showCompilingFile = function(filename, options) {
        var self = this;
        console.log("compiling " + filename + " => " + jsFilenameFromPogoFilename(filename));
        return compileFile(filename, options);
    };
    exports.watchFile = function(filename, options) {
        var self = this;
        var compile;
        compile = function() {
            return self.showCompilingFile(filename, options);
        };
        compile();
        return whenChanges(filename, function() {
            return compile();
        });
    };
    exports.compileFileIfStale = function(filename, options) {
        var self = this;
        var jsFilename, jsFile;
        jsFilename = jsFilenameFromPogoFilename(filename);
        jsFile = function() {
            if (fs.existsSync(jsFilename)) {
                return fs.statSync(jsFilename);
            }
        }();
        if (!jsFile || fs.statSync(filename).mtime > jsFile.mtime) {
            return self.showCompilingFile(filename, options);
        }
    };
    exports.lexFile = function(filename) {
        var self = this;
        var source, parser, tokens, gen2_items, gen3_i, token, text;
        source = fs.readFileSync(filename, "utf-8");
        parser = createParser({
            terms: createTerms()
        });
        tokens = parser.lex(source);
        gen2_items = tokens;
        for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
            token = gen2_items[gen3_i];
            text = token[1] && "'" + token[1] + "'" || "";
            console.log("<" + token[0] + "> " + text);
        }
        return void 0;
    };
    jsFilenameFromPogoFilename = function(pogo) {
        return pogo.replace(/\.pogo$/, "") + ".js";
    };
    exports.runFileInModule = function(filename, module) {
        var self = this;
        var js;
        js = compileFromFile(filename);
        return module._compile(js, filename);
    };
    exports.runMain = function(filename) {
        var self = this;
        var fullFilename, module;
        fullFilename = fs.realpathSync(filename);
        process.argv.shift();
        process.argv[0] = "pogo";
        process.argv[1] = fullFilename;
        module = new Module(fullFilename, null);
        process.mainModule = module;
        module.id = ".";
        module.filename = fullFilename;
        module.paths = Module._nodeModulePaths(path.dirname(fullFilename));
        exports.runFileInModule(fullFilename, module);
        return module.loaded = true;
    };
    exports.repl = function() {
        var self = this;
        var compilePogo, evalPogo;
        compilePogo = function(source, filename, terms) {
            return exports.compile(source, {
                filename: filename,
                ugly: true,
                inScope: false,
                global: true,
                returnResult: false,
                async: true,
                terms: terms
            });
        };
        evalPogo = function(sourceWithParens, context, filename, callback) {
            var source, terms, js, result;
            source = sourceWithParens.replace(/^\(((.|[\r\n])*)\)$/gm, "$1");
            terms = createTerms();
            js = compilePogo(source, filename, terms);
            if (source.trim() === "") {
                return callback();
            } else {
                try {
                    context[terms.callbackFunction.canonicalName()] = callback;
                    return result = vm.runInContext(js, context, filename);
                } catch (error) {
                    return callback(error);
                }
            }
        };
        if (runningOnNodeOrHigher("v0.8.0")) {
            return repl.start({
                eval: evalPogo
            });
        } else {
            return repl.start(undefined, undefined, evalPogo);
        }
    };
    compileFromFile = function(filename, gen4_options) {
        var ugly;
        ugly = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "ugly") && gen4_options.ugly !== void 0 ? gen4_options.ugly : false;
        var contents;
        contents = fs.readFileSync(filename, "utf-8");
        return exports.compile(contents, {
            filename: filename,
            ugly: ugly
        });
    };
    exports.compile = compiler.compile;
    exports.evaluate = compiler.evaluate;
}).call(this);
});
require.register("pogoscript-tests/lib/parser/compiler.js", function(exports, require, module){
(function() {
    var self = this;
    var ms, createParser, createTerms, object, beautify, generateCode, sourceLocationPrinter;
    ms = require("../memorystream");
    createParser = require("./parser").createParser;
    createTerms = function() {
        return require("./codeGenerator").codeGenerator();
    };
    object = require("./runtime").object;
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
    generateCode = function(term) {
        var memoryStream;
        memoryStream = new ms.MemoryStream();
        term.generateJavaScriptModule(memoryStream);
        return memoryStream.toString();
    };
    exports.compile = function(pogo, gen1_options) {
        var self = this;
        var filename, inScope, ugly, global, returnResult, async, terms;
        filename = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "filename") && gen1_options.filename !== void 0 ? gen1_options.filename : void 0;
        inScope = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "inScope") && gen1_options.inScope !== void 0 ? gen1_options.inScope : true;
        ugly = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "ugly") && gen1_options.ugly !== void 0 ? gen1_options.ugly : false;
        global = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "global") && gen1_options.global !== void 0 ? gen1_options.global : false;
        returnResult = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "returnResult") && gen1_options.returnResult !== void 0 ? gen1_options.returnResult : false;
        async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
        terms = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "terms") && gen1_options.terms !== void 0 ? gen1_options.terms : createTerms();
        var parser, statements, moduleTerm, code, memoryStream, error;
        parser = createParser({
            terms: terms
        });
        statements = parser.parse(pogo);
        if (async) {
            statements.asyncify();
        }
        moduleTerm = terms.module(statements, {
            inScope: inScope,
            global: global,
            returnLastStatement: returnResult
        });
        code = generateCode(moduleTerm);
        if (parser.errors.hasErrors()) {
            memoryStream = new ms.MemoryStream();
            parser.errors.printErrors(sourceLocationPrinter({
                filename: filename,
                source: pogo
            }), memoryStream);
            error = new Error(memoryStream.toString());
            error.isSemanticErrors = true;
            throw error;
        } else {
            if (ugly) {
                return code;
            } else {
                return beautify(code);
            }
        }
    };
    exports.evaluate = function(pogo, gen2_options) {
        var self = this;
        var definitions, ugly, global;
        definitions = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "definitions") && gen2_options.definitions !== void 0 ? gen2_options.definitions : {};
        ugly = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "ugly") && gen2_options.ugly !== void 0 ? gen2_options.ugly : true;
        global = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "global") && gen2_options.global !== void 0 ? gen2_options.global : false;
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
            var gen3_results, gen4_items, gen5_i, name;
            gen3_results = [];
            gen4_items = definitionNames;
            for (gen5_i = 0; gen5_i < gen4_items.length; ++gen5_i) {
                name = gen4_items[gen5_i];
                gen3_results.push(definitions[name]);
            }
            return gen3_results;
        }();
        return runScript.apply(undefined, definitionValues);
    };
    sourceLocationPrinter = function(gen6_options) {
        var filename, source;
        filename = gen6_options !== void 0 && Object.prototype.hasOwnProperty.call(gen6_options, "filename") && gen6_options.filename !== void 0 ? gen6_options.filename : void 0;
        source = gen6_options !== void 0 && Object.prototype.hasOwnProperty.call(gen6_options, "source") && gen6_options.source !== void 0 ? gen6_options.source : void 0;
        return object(function() {
            var self = this;
            self.linesInRange = function(range) {
                var self = this;
                var lines;
                lines = source.split(/\n/);
                return lines.slice(range.from - 1, range.to);
            };
            self.printLinesInRange = function(gen7_options) {
                var self = this;
                var prefix, from, to, buffer;
                prefix = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "prefix") && gen7_options.prefix !== void 0 ? gen7_options.prefix : "";
                from = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "from") && gen7_options.from !== void 0 ? gen7_options.from : void 0;
                to = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "to") && gen7_options.to !== void 0 ? gen7_options.to : void 0;
                buffer = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "buffer") && gen7_options.buffer !== void 0 ? gen7_options.buffer : buffer;
                var gen8_items, gen9_i, line;
                gen8_items = self.linesInRange({
                    from: from,
                    to: to
                });
                for (gen9_i = 0; gen9_i < gen8_items.length; ++gen9_i) {
                    line = gen8_items[gen9_i];
                    buffer.write(prefix + line + "\n");
                }
                return void 0;
            };
            self.printLocation = function(location, buffer) {
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
            };
            return self.times = function(s, n) {
                var self = this;
                var strings, i;
                strings = [];
                for (i = 0; i < n; ++i) {
                    strings.push(s);
                }
                return strings.join("");
            };
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/parser/complexExpression.js", function(exports, require, module){
var _ = require('underscore');

module.exports = function (listOfTerminals) {
  var cg = this;
  return cg.oldTerm(function () {
    this.isComplexExpression = true;
    this.basicExpressions = _(listOfTerminals).map(function (terminals) {
      return cg.basicExpression(terminals);
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
    
    this.optionalArguments = function () {
      if (this._optionalArguments) {
        return this._optionalArguments;
      } else {
        var tail = this.tail();
        var tailLength = tail.length;
        var n = 0;
        
        return this._optionalArguments = _(tail).map(function (e) {
          n++;
          return e.hashEntry({withoutBlock: n === tailLength});
        }).concat(_(this.head().arguments()).filter(function (a) {
          return a.isHashEntry;
        }));
      }
    };

    this.hasAsyncArgument = function () {
      return this.head().hasAsyncArgument();
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
        var args = _(this.head().arguments()).filter(function (a) {
          return !a.isHashEntry;
        });
        
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
        this.head().hasArguments() || (this.optionalArguments().length > 0) || this.tailBlock()
      );
    };
    
    this.expression = function () {
      var head = this.head();

      if (head.hasName()) {
        if (this.hasArguments()) {
          return cg.functionCall(cg.variable(head.name(), {couldBeMacro: false, location: this.location()}), this.arguments(), {optionalArguments: this.optionalArguments(), async: this.hasAsyncArgument()});
        } else {
          return cg.variable(head.name(), {location: this.location()});
        }
      } else {
        if (!this.hasTail() && this.arguments().length === 1 && !this.hasAsyncArgument()) {
          return this.arguments()[0];
        } else {
          return cg.functionCall(this.arguments()[0], this.arguments().slice(1), {async: this.hasAsyncArgument()});
        }
      }
    };
    
    this.objectOperationExpression = function (object) {
      var head = this.head();

      if (head.hasName()) {
        if (this.hasArguments()) {
          return cg.methodCall(object, head.name(), this.arguments(), {optionalArguments: this.optionalArguments(), async: this.hasAsyncArgument()});
        } else {
          return cg.fieldReference(object, head.name());
        }
      } else {
        if (!this.hasTail() && !head.isCall() && !this.hasAsyncArgument()) {
          return cg.indexer(object, this.arguments()[0]);
        } else {
          return cg.functionCall(cg.indexer(object, this.arguments()[0]), this.arguments().slice(1), {async: this.hasAsyncArgument()});
        }
      }
    };
    
    this.parameters = function (options) {
      return this.head().parameters(options);
    };
    
    this.optionalParameters = function () {
      return this.optionalArguments();
    };
    
    this.hasParameters = function () {
      return this._hasParameters || (this._hasParameters =
        this.head().hasParameters() || this.optionalParameters().length > 0
      );
    };
    
    this.hashEntry = function () {
      if (this.hasTail()) {
        return cg.errors.addTermsWithMessage(this.tail(), 'cannot be used in hash entry');
      }
      return this.head().hashEntry();
    };
    
    this.objectOperationDefinition = function (object, source) {
      var self = this;
      
      return {
        expression: function () {
          if (self.head().hasName()) {
            if (self.hasParameters()) {
              var block = source.blockify(self.parameters(), {optionalParameters: self.optionalParameters(), async: self.hasAsyncArgument()});
              block.redefinesSelf = true;
              return cg.definition(cg.fieldReference(object, self.head().name()), block, {assignment: true});
            } else {
              return cg.definition(cg.fieldReference(object, self.head().name()), source.scopify(), {assignment: true});
            }
          } else {
            if (!self.hasTail() && self.arguments().length === 1 && !self.hasAsyncArgument()) {
              return cg.definition(cg.indexer(object, self.arguments()[0]), source.scopify(), {assignment: true});
            } else {
              var block = source.blockify(self.parameters({skipFirstParameter: true}), {optionalParameters: self.optionalParameters(), async: self.hasAsyncArgument()});
              block.redefinesSelf = true;
              return cg.definition(cg.indexer(object, self.arguments()[0]), block, {assignment: true});
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
      };
    };
    
    this.definition = function (source, options) {
      var self = this;
      var assignment = options && Object.hasOwnProperty.call(options, 'assignment') && options.assignment;
      
      if (self.head().hasName()) {
        if (self.hasParameters()) {
          return {
            expression: function () {
              return cg.definition(cg.variable(self.head().name(), {location: self.location()}), source.blockify(self.parameters(), {optionalParameters: self.optionalParameters(), async: self.hasAsyncArgument()}), {assignment: assignment});
            },
            hashEntry: function (isOptionalArgument) {
              var block = source.blockify(self.parameters(), {optionalParameters: self.optionalParameters(), async: self.hasAsyncArgument()});
              block.redefinesSelf = !isOptionalArgument;

              return cg.hashEntry(self.head().name(), block);
            }
          };
        } else {
          return {
            expression: function () {
              return cg.definition(cg.variable(self.head().name(), {location: self.location()}), source.scopify(), {assignment: assignment});
            },
            hashEntry: function () {
              return cg.hashEntry(self.head().hashKey(), source.scopify());
            }
          };
        }
      } else {
        return {
          hashEntry: function () {
            var head = self.head();
            return cg.hashEntry(head.hashKey(), source);
          }
        };
      }
    };
  });
};

});
require.register("pogoscript-tests/lib/parser/dynamicLexer.js", function(exports, require, module){
(function() {
    var self = this;
    var object, createDynamicLexer;
    object = require("./runtime").object;
    exports.createDynamicLexer = createDynamicLexer = function(gen1_options) {
        var nextLexer, source;
        nextLexer = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "nextLexer") && gen1_options.nextLexer !== void 0 ? gen1_options.nextLexer : void 0;
        source = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "source") && gen1_options.source !== void 0 ? gen1_options.source : void 0;
        return object(function() {
            var self = this;
            self.tokens = [];
            self.nextLexer = nextLexer;
            self.lex = function() {
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
            };
            self.showPosition = function() {
                var self = this;
                return self.nextLexer.showPosition();
            };
            self.setInput = function(input) {
                var self = this;
                return self.nextLexer.setInput(input);
            };
            if (source) {
                return self.setInput(source);
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/parser/errors.js", function(exports, require, module){
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

});
require.register("pogoscript-tests/lib/parser/grammar.js", function(exports, require, module){
(function() {
    var self = this;
    var comments;
    comments = "\\s*((\\/\\*([^*](\\*[^\\/]|))*(\\*\\/|$)|\\/\\/[^\\n]*)\\s*)+";
    exports.grammar = {
        lex: {
            startConditions: {
                interpolated_string: true,
                interpolated_string_terminal: true
            },
            rules: [ [ "^#![^\\n]*", "/* ignore hashbang */" ], [ " +", "/* ignore whitespace */" ], [ "\\s*$", "return yy.eof();" ], [ comments + "$", "return yy.eof();" ], [ comments, "var indentation = yy.indentation(yytext); if (indentation) { return indentation; }" ], [ "\\(\\s*", 'yy.setIndentation(yytext); if (yy.interpolation.interpolating()) {yy.interpolation.openBracket()} return "(";' ], [ "\\s*\\)", "if (yy.interpolation.interpolating()) {yy.interpolation.closeBracket(); if (yy.interpolation.finishedInterpolation()) {this.popState(); yy.interpolation.stopInterpolation()}} return yy.unsetIndentation(')');" ], [ "{\\s*", "yy.setIndentation(yytext); return '{';" ], [ "\\s*}", "return yy.unsetIndentation('}');" ], [ "\\[\\s*", "yy.setIndentation(yytext); return '[';" ], [ "\\s*\\]", "return yy.unsetIndentation(']')" ], [ "(\\r?\\n *)*\\r?\\n *", "return yy.indentation(yytext);" ], [ "[0-9]+\\.[0-9]+", "return 'float';" ], [ "[0-9]+", "return 'integer';" ], [ "@[a-zA-Z_$][a-zA-Z_$0-9]*", 'return "operator";' ], [ "\\.\\.\\.", 'return "...";' ], [ "([:;=?!.@~#%^&*+<>\\/?\\\\|-])+", "return yy.lexOperator(yy, yytext);" ], [ ",", 'return ",";' ], [ "r\\/([^\\\\\\/]*\\\\.)*[^\\/]*\\/(img|mgi|gim|igm|gmi|mig|im|ig|gm|mg|mi|gi|i|m|g|)", "return 'reg_exp';" ], [ "[a-zA-Z_$][a-zA-Z_$0-9]*", "return 'identifier';" ], [ "$", "return 'eof';" ], [ "'([^']*'')*[^']*'", "return 'string';" ], [ '"', "this.begin('interpolated_string'); return 'start_interpolated_string';" ], [ [ "interpolated_string" ], "\\\\#", "return 'escaped_interpolated_string_terminal_start';" ], [ [ "interpolated_string" ], "#\\(", "yy.setIndentation('('); yy.interpolation.startInterpolation(); this.begin('INITIAL'); return '(';" ], [ [ "interpolated_string" ], "#", "return 'interpolated_string_body';" ], [ [ "interpolated_string" ], '"', "this.popState(); return 'end_interpolated_string';" ], [ [ "interpolated_string" ], "\\\\.", "return 'escape_sequence';" ], [ [ "interpolated_string" ], '[^"#\\\\]*', "return 'interpolated_string_body';" ], [ ".", "return 'non_token';" ] ]
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
            parameter_list: [ [ "parameter_list , statement", "$1.push($3); $$ = $1;" ], [ "statement", "$$ = [$1];" ] ],
            statement: [ [ "expression", "$$ = $1.expression();" ] ],
            expression: [ [ "expression = expression", "$$ = $1.definition($3.expression());" ], [ "expression := expression", "$$ = $1.definition($3.expression(), {assignment: true});" ], [ "operator_expression", "$$ = $1;" ] ],
            operator_with_newline: [ [ "operator ,", "$$ = $1" ], [ "operator", "$$ = $1" ] ],
            operator_expression: [ [ "operator_expression operator_with_newline unary_operator_expression", "$1.addOperatorExpression($2, $3); $$ = $1;" ], [ "unary_operator_expression", "$$ = yy.terms.operatorExpression($1);" ] ],
            unary_operator_expression: [ [ "object_operation", "$$ = $1;" ], [ "unary_operator unary_operator_expression", "$$ = yy.terms.unaryOperatorExpression($1, $2.expression());" ] ],
            object_reference_with_newline: [ [ ". ,", "$$ = $1" ], [ ".", "$$ = $1" ] ],
            object_operation: [ [ "object_operation object_reference_with_newline complex_expression", "$$ = $3.objectOperation($1.expression());" ], [ "complex_expression", "$$ = $1;" ] ],
            complex_expression: [ [ "basic_expression_list", "$$ = yy.terms.complexExpression($1);" ] ],
            basic_expression_list: [ [ "terminal_list", "$$ = [$1];" ] ],
            terminal_list: [ [ "terminal_list terminal", "$1.push($2); $$ = $1;" ], [ "terminal_list async_operator", "$1.push($2); $$ = $1;" ], [ "terminal", "$$ = [$1];" ] ],
            async_operator: [ [ "!", "$$ = yy.loc(yy.terms.asyncArgument(), @$);" ] ],
            terminal: [ [ "( arguments )", "$$ = yy.loc(yy.terms.argumentList($arguments), @$);" ], [ "@ ( parameters )", "$$ = yy.loc(yy.terms.parameters($3), @$);" ], [ "block_start statements }", "$$ = yy.loc(yy.terms.block([], $2), @$);" ], [ "=> block_start statements }", "$$ = yy.loc(yy.terms.block([], $3, {redefinesSelf: true}), @$);" ], [ "[ arguments ]", "$$ = yy.loc(yy.terms.list($2), @$);" ], [ "{ hash_entries }", "$$ = yy.loc(yy.terms.hash($2), @$);" ], [ "float", "$$ = yy.loc(yy.terms.float(parseFloat(yytext)), @$);" ], [ "integer", "$$ = yy.loc(yy.terms.integer(parseInt(yytext, 10)), @$);" ], [ "identifier", "$$ = yy.loc(yy.terms.identifier(yytext), @$);" ], [ "string", "$$ = yy.loc(yy.terms.string(yy.unindentBy(yy.normaliseString(yytext), @$.first_column + 1)), @$);" ], [ "reg_exp", "$$ = yy.loc(yy.terms.regExp(yy.parseRegExp(yy.unindentBy(yytext, @$.first_column + 2))), @$);" ], [ "interpolated_string", "$$ = yy.loc($1, @$);" ], [ "...", "$$ = yy.loc(yy.terms.splat(), @$);" ] ],
            block_start: [ [ "@ {", "$$ = '@{'" ], [ "@{", "$$ = '@{'" ] ],
            unary_operator: [ [ "operator", "$$ = $1;" ], [ "!", "$$ = $1;" ] ],
            interpolated_terminal: [ [ "( statement )", "$$ = $2;" ] ],
            interpolated_string: [ [ "start_interpolated_string interpolated_string_components end_interpolated_string", "$$ = yy.terms.interpolatedString(yy.normaliseStringComponentsUnindentingBy($2, @$.first_column + 1));" ], [ "start_interpolated_string end_interpolated_string", "$$ = yy.terms.interpolatedString([]);" ] ],
            interpolated_string_components: [ [ "interpolated_string_components interpolated_string_component", "$1.push($2); $$ = $1;" ], [ "interpolated_string_component", "$$ = [$1];" ] ],
            interpolated_string_component: [ [ "interpolated_terminal", "$$ = $1;" ], [ "interpolated_string_body", "$$ = yy.terms.string($1);" ], [ "escaped_interpolated_string_terminal_start", '$$ = yy.terms.string("#");' ], [ "escape_sequence", "$$ = yy.terms.string(yy.normaliseInterpolatedString($1));" ] ]
        }
    };
}).call(this);
});
require.register("pogoscript-tests/lib/parser/indentStack.js", function(exports, require, module){
(function() {
    var self = this;
    var object, createIndentStack;
    object = require("./runtime").object;
    exports.createIndentStack = createIndentStack = function() {
        return object(function() {
            var self = this;
            self.indents = [ 0 ];
            self.indentationRegex = /\r?\n( *)$/;
            self.multiNewLineRegex = /\r?\n *\r?\n/;
            self.isMultiNewLine = function(text) {
                var self = this;
                return self.multiNewLineRegex.test(text);
            };
            self.hasNewLine = function(text) {
                var self = this;
                return self.indentationRegex.test(text);
            };
            self.indentation = function(newLine) {
                var self = this;
                return self.indentationRegex.exec(newLine)[1].length;
            };
            self.currentIndentation = function() {
                var self = this;
                return self.indents[0];
            };
            self.setIndentation = function(text) {
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
            };
            self.unsetIndentation = function() {
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
            };
            self.tokensForEof = function() {
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
            };
            return self.tokensForNewLine = function(text) {
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
            };
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/parser/interpolation.js", function(exports, require, module){
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
});
require.register("pogoscript-tests/lib/parser/jisonParser.js", function(exports, require, module){
/* Jison generated parser */
var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"module_statements":3,"statements":4,"eof":5,"statements_list":6,"hash_entries":7,",":8,"expression":9,"statement":10,"arguments":11,"arguments_list":12,"argument":13,":":14,"parameters":15,"parameter_list":16,"=":17,":=":18,"operator_expression":19,"operator_with_newline":20,"operator":21,"unary_operator_expression":22,"object_operation":23,"unary_operator":24,"object_reference_with_newline":25,".":26,"complex_expression":27,"basic_expression_list":28,"terminal_list":29,"terminal":30,"async_operator":31,"!":32,"(":33,")":34,"@":35,"block_start":36,"}":37,"=>":38,"[":39,"]":40,"{":41,"float":42,"integer":43,"identifier":44,"string":45,"reg_exp":46,"interpolated_string":47,"...":48,"@{":49,"interpolated_terminal":50,"start_interpolated_string":51,"interpolated_string_components":52,"end_interpolated_string":53,"interpolated_string_component":54,"interpolated_string_body":55,"escaped_interpolated_string_terminal_start":56,"escape_sequence":57,"$accept":0,"$end":1},
terminals_: {2:"error",5:"eof",8:",",14:":",17:"=",18:":=",21:"operator",26:".",32:"!",33:"(",34:")",35:"@",37:"}",38:"=>",39:"[",40:"]",41:"{",42:"float",43:"integer",44:"identifier",45:"string",46:"reg_exp",48:"...",49:"@{",51:"start_interpolated_string",53:"end_interpolated_string",55:"interpolated_string_body",56:"escaped_interpolated_string_terminal_start",57:"escape_sequence"},
productions_: [0,[3,2],[4,1],[7,3],[7,1],[7,0],[6,3],[6,1],[6,0],[11,1],[11,0],[12,3],[12,1],[13,3],[13,1],[15,1],[15,0],[16,3],[16,1],[10,1],[9,3],[9,3],[9,1],[20,2],[20,1],[19,3],[19,1],[22,1],[22,2],[25,2],[25,1],[23,3],[23,1],[27,1],[28,1],[29,2],[29,2],[29,1],[31,1],[30,3],[30,4],[30,3],[30,4],[30,3],[30,3],[30,1],[30,1],[30,1],[30,1],[30,1],[30,1],[30,1],[36,2],[36,1],[24,1],[24,1],[50,3],[47,3],[47,2],[52,2],[52,1],[54,1],[54,1],[54,1],[54,1]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

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
case 19:this.$ = $$[$0].expression();
break;
case 20:this.$ = $$[$0-2].definition($$[$0].expression());
break;
case 21:this.$ = $$[$0-2].definition($$[$0].expression(), {assignment: true});
break;
case 22:this.$ = $$[$0];
break;
case 23:this.$ = $$[$0-1]
break;
case 24:this.$ = $$[$0]
break;
case 25:$$[$0-2].addOperatorExpression($$[$0-1], $$[$0]); this.$ = $$[$0-2];
break;
case 26:this.$ = yy.terms.operatorExpression($$[$0]);
break;
case 27:this.$ = $$[$0];
break;
case 28:this.$ = yy.terms.unaryOperatorExpression($$[$0-1], $$[$0].expression());
break;
case 29:this.$ = $$[$0-1]
break;
case 30:this.$ = $$[$0]
break;
case 31:this.$ = $$[$0].objectOperation($$[$0-2].expression());
break;
case 32:this.$ = $$[$0];
break;
case 33:this.$ = yy.terms.complexExpression($$[$0]);
break;
case 34:this.$ = [$$[$0]];
break;
case 35:$$[$0-1].push($$[$0]); this.$ = $$[$0-1];
break;
case 36:$$[$0-1].push($$[$0]); this.$ = $$[$0-1];
break;
case 37:this.$ = [$$[$0]];
break;
case 38:this.$ = yy.loc(yy.terms.asyncArgument(), this._$);
break;
case 39:this.$ = yy.loc(yy.terms.argumentList($$[$0-1]), this._$);
break;
case 40:this.$ = yy.loc(yy.terms.parameters($$[$0-1]), this._$);
break;
case 41:this.$ = yy.loc(yy.terms.block([], $$[$0-1]), this._$);
break;
case 42:this.$ = yy.loc(yy.terms.block([], $$[$0-1], {redefinesSelf: true}), this._$);
break;
case 43:this.$ = yy.loc(yy.terms.list($$[$0-1]), this._$);
break;
case 44:this.$ = yy.loc(yy.terms.hash($$[$0-1]), this._$);
break;
case 45:this.$ = yy.loc(yy.terms.float(parseFloat(yytext)), this._$);
break;
case 46:this.$ = yy.loc(yy.terms.integer(parseInt(yytext, 10)), this._$);
break;
case 47:this.$ = yy.loc(yy.terms.identifier(yytext), this._$);
break;
case 48:this.$ = yy.loc(yy.terms.string(yy.unindentBy(yy.normaliseString(yytext), this._$.first_column + 1)), this._$);
break;
case 49:this.$ = yy.loc(yy.terms.regExp(yy.parseRegExp(yy.unindentBy(yytext, this._$.first_column + 2))), this._$);
break;
case 50:this.$ = yy.loc($$[$0], this._$);
break;
case 51:this.$ = yy.loc(yy.terms.splat(), this._$);
break;
case 52:this.$ = '@{'
break;
case 53:this.$ = '@{'
break;
case 54:this.$ = $$[$0];
break;
case 55:this.$ = $$[$0];
break;
case 56:this.$ = $$[$0-1];
break;
case 57:this.$ = yy.terms.interpolatedString(yy.normaliseStringComponentsUnindentingBy($$[$0-1], this._$.first_column + 1));
break;
case 58:this.$ = yy.terms.interpolatedString([]);
break;
case 59:$$[$0-1].push($$[$0]); this.$ = $$[$0-1];
break;
case 60:this.$ = [$$[$0]];
break;
case 61:this.$ = $$[$0];
break;
case 62:this.$ = yy.terms.string($$[$0]);
break;
case 63:this.$ = yy.terms.string("#");
break;
case 64:this.$ = yy.terms.string(yy.normaliseInterpolatedString($$[$0]));
break;
}
},
table: [{3:1,4:2,5:[2,8],6:3,8:[2,8],9:5,10:4,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{1:[3]},{5:[1,31]},{5:[2,2],8:[1,32],37:[2,2]},{5:[2,7],8:[2,7],37:[2,7]},{5:[2,19],8:[2,19],17:[1,33],18:[1,34],34:[2,19],37:[2,19]},{5:[2,22],8:[2,22],14:[2,22],17:[2,22],18:[2,22],20:35,21:[1,36],34:[2,22],37:[2,22],40:[2,22]},{5:[2,26],8:[2,26],14:[2,26],17:[2,26],18:[2,26],21:[2,26],34:[2,26],37:[2,26],40:[2,26]},{5:[2,27],8:[2,27],14:[2,27],17:[2,27],18:[2,27],21:[2,27],25:37,26:[1,38],34:[2,27],37:[2,27],40:[2,27]},{21:[1,11],22:39,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{5:[2,32],8:[2,32],14:[2,32],17:[2,32],18:[2,32],21:[2,32],26:[2,32],34:[2,32],37:[2,32],40:[2,32]},{21:[2,54],32:[2,54],33:[2,54],35:[2,54],38:[2,54],39:[2,54],41:[2,54],42:[2,54],43:[2,54],44:[2,54],45:[2,54],46:[2,54],48:[2,54],49:[2,54],51:[2,54]},{21:[2,55],32:[2,55],33:[2,55],35:[2,55],38:[2,55],39:[2,55],41:[2,55],42:[2,55],43:[2,55],44:[2,55],45:[2,55],46:[2,55],48:[2,55],49:[2,55],51:[2,55]},{5:[2,33],8:[2,33],14:[2,33],17:[2,33],18:[2,33],21:[2,33],26:[2,33],34:[2,33],37:[2,33],40:[2,33]},{5:[2,34],8:[2,34],14:[2,34],17:[2,34],18:[2,34],21:[2,34],26:[2,34],30:40,31:41,32:[1,42],33:[1,16],34:[2,34],35:[1,17],36:18,37:[2,34],38:[1,19],39:[1,20],40:[2,34],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{5:[2,37],8:[2,37],14:[2,37],17:[2,37],18:[2,37],21:[2,37],26:[2,37],32:[2,37],33:[2,37],34:[2,37],35:[2,37],37:[2,37],38:[2,37],39:[2,37],40:[2,37],41:[2,37],42:[2,37],43:[2,37],44:[2,37],45:[2,37],46:[2,37],48:[2,37],49:[2,37],51:[2,37]},{9:46,10:47,11:43,12:44,13:45,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],34:[2,10],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{33:[1,48],41:[1,49]},{4:50,6:3,8:[2,8],9:5,10:4,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,37:[2,8],38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{35:[1,52],36:51,49:[1,29]},{9:46,10:47,11:53,12:44,13:45,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],40:[2,10],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{7:54,8:[2,5],9:55,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,37:[2,5],38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{5:[2,45],8:[2,45],14:[2,45],17:[2,45],18:[2,45],21:[2,45],26:[2,45],32:[2,45],33:[2,45],34:[2,45],35:[2,45],37:[2,45],38:[2,45],39:[2,45],40:[2,45],41:[2,45],42:[2,45],43:[2,45],44:[2,45],45:[2,45],46:[2,45],48:[2,45],49:[2,45],51:[2,45]},{5:[2,46],8:[2,46],14:[2,46],17:[2,46],18:[2,46],21:[2,46],26:[2,46],32:[2,46],33:[2,46],34:[2,46],35:[2,46],37:[2,46],38:[2,46],39:[2,46],40:[2,46],41:[2,46],42:[2,46],43:[2,46],44:[2,46],45:[2,46],46:[2,46],48:[2,46],49:[2,46],51:[2,46]},{5:[2,47],8:[2,47],14:[2,47],17:[2,47],18:[2,47],21:[2,47],26:[2,47],32:[2,47],33:[2,47],34:[2,47],35:[2,47],37:[2,47],38:[2,47],39:[2,47],40:[2,47],41:[2,47],42:[2,47],43:[2,47],44:[2,47],45:[2,47],46:[2,47],48:[2,47],49:[2,47],51:[2,47]},{5:[2,48],8:[2,48],14:[2,48],17:[2,48],18:[2,48],21:[2,48],26:[2,48],32:[2,48],33:[2,48],34:[2,48],35:[2,48],37:[2,48],38:[2,48],39:[2,48],40:[2,48],41:[2,48],42:[2,48],43:[2,48],44:[2,48],45:[2,48],46:[2,48],48:[2,48],49:[2,48],51:[2,48]},{5:[2,49],8:[2,49],14:[2,49],17:[2,49],18:[2,49],21:[2,49],26:[2,49],32:[2,49],33:[2,49],34:[2,49],35:[2,49],37:[2,49],38:[2,49],39:[2,49],40:[2,49],41:[2,49],42:[2,49],43:[2,49],44:[2,49],45:[2,49],46:[2,49],48:[2,49],49:[2,49],51:[2,49]},{5:[2,50],8:[2,50],14:[2,50],17:[2,50],18:[2,50],21:[2,50],26:[2,50],32:[2,50],33:[2,50],34:[2,50],35:[2,50],37:[2,50],38:[2,50],39:[2,50],40:[2,50],41:[2,50],42:[2,50],43:[2,50],44:[2,50],45:[2,50],46:[2,50],48:[2,50],49:[2,50],51:[2,50]},{5:[2,51],8:[2,51],14:[2,51],17:[2,51],18:[2,51],21:[2,51],26:[2,51],32:[2,51],33:[2,51],34:[2,51],35:[2,51],37:[2,51],38:[2,51],39:[2,51],40:[2,51],41:[2,51],42:[2,51],43:[2,51],44:[2,51],45:[2,51],46:[2,51],48:[2,51],49:[2,51],51:[2,51]},{8:[2,53],21:[2,53],32:[2,53],33:[2,53],35:[2,53],37:[2,53],38:[2,53],39:[2,53],41:[2,53],42:[2,53],43:[2,53],44:[2,53],45:[2,53],46:[2,53],48:[2,53],49:[2,53],51:[2,53]},{33:[1,63],50:59,52:56,53:[1,57],54:58,55:[1,60],56:[1,61],57:[1,62]},{1:[2,1]},{9:5,10:64,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{9:65,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{9:66,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{21:[1,11],22:67,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{8:[1,68],21:[2,24],32:[2,24],33:[2,24],35:[2,24],38:[2,24],39:[2,24],41:[2,24],42:[2,24],43:[2,24],44:[2,24],45:[2,24],46:[2,24],48:[2,24],49:[2,24],51:[2,24]},{27:69,28:13,29:14,30:15,33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{8:[1,70],33:[2,30],35:[2,30],38:[2,30],39:[2,30],41:[2,30],42:[2,30],43:[2,30],44:[2,30],45:[2,30],46:[2,30],48:[2,30],49:[2,30],51:[2,30]},{5:[2,28],8:[2,28],14:[2,28],17:[2,28],18:[2,28],21:[2,28],34:[2,28],37:[2,28],40:[2,28]},{5:[2,35],8:[2,35],14:[2,35],17:[2,35],18:[2,35],21:[2,35],26:[2,35],32:[2,35],33:[2,35],34:[2,35],35:[2,35],37:[2,35],38:[2,35],39:[2,35],40:[2,35],41:[2,35],42:[2,35],43:[2,35],44:[2,35],45:[2,35],46:[2,35],48:[2,35],49:[2,35],51:[2,35]},{5:[2,36],8:[2,36],14:[2,36],17:[2,36],18:[2,36],21:[2,36],26:[2,36],32:[2,36],33:[2,36],34:[2,36],35:[2,36],37:[2,36],38:[2,36],39:[2,36],40:[2,36],41:[2,36],42:[2,36],43:[2,36],44:[2,36],45:[2,36],46:[2,36],48:[2,36],49:[2,36],51:[2,36]},{5:[2,38],8:[2,38],14:[2,38],17:[2,38],18:[2,38],21:[2,38],26:[2,38],32:[2,38],33:[2,38],34:[2,38],35:[2,38],37:[2,38],38:[2,38],39:[2,38],40:[2,38],41:[2,38],42:[2,38],43:[2,38],44:[2,38],45:[2,38],46:[2,38],48:[2,38],49:[2,38],51:[2,38]},{34:[1,71]},{8:[1,72],34:[2,9],40:[2,9]},{8:[2,12],34:[2,12],40:[2,12]},{8:[2,19],14:[1,73],17:[1,33],18:[1,34],34:[2,19],40:[2,19]},{8:[2,14],34:[2,14],40:[2,14]},{9:5,10:76,15:74,16:75,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],34:[2,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{8:[2,52],21:[2,52],32:[2,52],33:[2,52],35:[2,52],37:[2,52],38:[2,52],39:[2,52],41:[2,52],42:[2,52],43:[2,52],44:[2,52],45:[2,52],46:[2,52],48:[2,52],49:[2,52],51:[2,52]},{37:[1,77]},{4:78,6:3,8:[2,8],9:5,10:4,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,37:[2,8],38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{41:[1,49]},{40:[1,79]},{8:[1,81],37:[1,80]},{8:[2,4],17:[1,33],18:[1,34],37:[2,4]},{33:[1,63],50:59,53:[1,82],54:83,55:[1,60],56:[1,61],57:[1,62]},{5:[2,58],8:[2,58],14:[2,58],17:[2,58],18:[2,58],21:[2,58],26:[2,58],32:[2,58],33:[2,58],34:[2,58],35:[2,58],37:[2,58],38:[2,58],39:[2,58],40:[2,58],41:[2,58],42:[2,58],43:[2,58],44:[2,58],45:[2,58],46:[2,58],48:[2,58],49:[2,58],51:[2,58]},{33:[2,60],53:[2,60],55:[2,60],56:[2,60],57:[2,60]},{33:[2,61],53:[2,61],55:[2,61],56:[2,61],57:[2,61]},{33:[2,62],53:[2,62],55:[2,62],56:[2,62],57:[2,62]},{33:[2,63],53:[2,63],55:[2,63],56:[2,63],57:[2,63]},{33:[2,64],53:[2,64],55:[2,64],56:[2,64],57:[2,64]},{9:5,10:84,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{5:[2,6],8:[2,6],37:[2,6]},{5:[2,20],8:[2,20],14:[2,20],17:[1,33],18:[1,34],34:[2,20],37:[2,20],40:[2,20]},{5:[2,21],8:[2,21],14:[2,21],17:[1,33],18:[1,34],34:[2,21],37:[2,21],40:[2,21]},{5:[2,25],8:[2,25],14:[2,25],17:[2,25],18:[2,25],21:[2,25],34:[2,25],37:[2,25],40:[2,25]},{21:[2,23],32:[2,23],33:[2,23],35:[2,23],38:[2,23],39:[2,23],41:[2,23],42:[2,23],43:[2,23],44:[2,23],45:[2,23],46:[2,23],48:[2,23],49:[2,23],51:[2,23]},{5:[2,31],8:[2,31],14:[2,31],17:[2,31],18:[2,31],21:[2,31],26:[2,31],34:[2,31],37:[2,31],40:[2,31]},{33:[2,29],35:[2,29],38:[2,29],39:[2,29],41:[2,29],42:[2,29],43:[2,29],44:[2,29],45:[2,29],46:[2,29],48:[2,29],49:[2,29],51:[2,29]},{5:[2,39],8:[2,39],14:[2,39],17:[2,39],18:[2,39],21:[2,39],26:[2,39],32:[2,39],33:[2,39],34:[2,39],35:[2,39],37:[2,39],38:[2,39],39:[2,39],40:[2,39],41:[2,39],42:[2,39],43:[2,39],44:[2,39],45:[2,39],46:[2,39],48:[2,39],49:[2,39],51:[2,39]},{9:46,10:47,13:85,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{9:86,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{34:[1,87]},{8:[1,88],34:[2,15]},{8:[2,18],34:[2,18]},{5:[2,41],8:[2,41],14:[2,41],17:[2,41],18:[2,41],21:[2,41],26:[2,41],32:[2,41],33:[2,41],34:[2,41],35:[2,41],37:[2,41],38:[2,41],39:[2,41],40:[2,41],41:[2,41],42:[2,41],43:[2,41],44:[2,41],45:[2,41],46:[2,41],48:[2,41],49:[2,41],51:[2,41]},{37:[1,89]},{5:[2,43],8:[2,43],14:[2,43],17:[2,43],18:[2,43],21:[2,43],26:[2,43],32:[2,43],33:[2,43],34:[2,43],35:[2,43],37:[2,43],38:[2,43],39:[2,43],40:[2,43],41:[2,43],42:[2,43],43:[2,43],44:[2,43],45:[2,43],46:[2,43],48:[2,43],49:[2,43],51:[2,43]},{5:[2,44],8:[2,44],14:[2,44],17:[2,44],18:[2,44],21:[2,44],26:[2,44],32:[2,44],33:[2,44],34:[2,44],35:[2,44],37:[2,44],38:[2,44],39:[2,44],40:[2,44],41:[2,44],42:[2,44],43:[2,44],44:[2,44],45:[2,44],46:[2,44],48:[2,44],49:[2,44],51:[2,44]},{9:90,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{5:[2,57],8:[2,57],14:[2,57],17:[2,57],18:[2,57],21:[2,57],26:[2,57],32:[2,57],33:[2,57],34:[2,57],35:[2,57],37:[2,57],38:[2,57],39:[2,57],40:[2,57],41:[2,57],42:[2,57],43:[2,57],44:[2,57],45:[2,57],46:[2,57],48:[2,57],49:[2,57],51:[2,57]},{33:[2,59],53:[2,59],55:[2,59],56:[2,59],57:[2,59]},{34:[1,91]},{8:[2,11],34:[2,11],40:[2,11]},{8:[2,13],17:[1,33],18:[1,34],34:[2,13],40:[2,13]},{5:[2,40],8:[2,40],14:[2,40],17:[2,40],18:[2,40],21:[2,40],26:[2,40],32:[2,40],33:[2,40],34:[2,40],35:[2,40],37:[2,40],38:[2,40],39:[2,40],40:[2,40],41:[2,40],42:[2,40],43:[2,40],44:[2,40],45:[2,40],46:[2,40],48:[2,40],49:[2,40],51:[2,40]},{9:5,10:92,19:6,21:[1,11],22:7,23:8,24:9,27:10,28:13,29:14,30:15,32:[1,12],33:[1,16],35:[1,17],36:18,38:[1,19],39:[1,20],41:[1,21],42:[1,22],43:[1,23],44:[1,24],45:[1,25],46:[1,26],47:27,48:[1,28],49:[1,29],51:[1,30]},{5:[2,42],8:[2,42],14:[2,42],17:[2,42],18:[2,42],21:[2,42],26:[2,42],32:[2,42],33:[2,42],34:[2,42],35:[2,42],37:[2,42],38:[2,42],39:[2,42],40:[2,42],41:[2,42],42:[2,42],43:[2,42],44:[2,42],45:[2,42],46:[2,42],48:[2,42],49:[2,42],51:[2,42]},{8:[2,3],17:[1,33],18:[1,34],37:[2,3]},{33:[2,56],53:[2,56],55:[2,56],56:[2,56],57:[2,56]},{8:[2,17],34:[2,17]}],
defaultActions: {31:[2,1]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == "undefined")
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === "function")
        this.parseError = this.yy.parseError;
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || 1;
        if (typeof token !== "number") {
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
            if (symbol === null || typeof symbol == "undefined") {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
        if (typeof action === "undefined" || !action.length || !action[0]) {
            var errStr = "";
            if (!recovering) {
                expected = [];
                for (p in table[state])
                    if (this.terminals_[p] && p > 2) {
                        expected.push("'" + this.terminals_[p] + "'");
                    }
                if (this.lexer.showPosition) {
                    errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                } else {
                    errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
                }
                this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }
        }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
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
                if (recovering > 0)
                    recovering--;
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
            if (ranges) {
                yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
            }
            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
            if (typeof r !== "undefined") {
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
}
};
undefined/* Jison generated lexer */
var lexer = (function(){
var lexer = ({EOF:1,
parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },
setInput:function (input) {
        this._input = input;
        this._more = this._less = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
        if (this.options.ranges) this.yylloc.range = [0,0];
        this.offset = 0;
        return this;
    },
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
        if (this.options.ranges) this.yylloc.range[1]++;

        this._input = this._input.slice(1);
        return ch;
    },
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length-len-1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length-1);
        this.matched = this.matched.substr(0, this.matched.length-1);

        if (lines.length-1) this.yylineno -= lines.length-1;
        var r = this.yylloc.range;

        this.yylloc = {first_line: this.yylloc.first_line,
          last_line: this.yylineno+1,
          first_column: this.yylloc.first_column,
          last_column: lines ?
              (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length:
              this.yylloc.first_column - len
          };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        return this;
    },
more:function () {
        this._more = true;
        return this;
    },
less:function (n) {
        this.unput(this.match.slice(n));
    },
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
    },
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c+"^";
    },
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) this.done = true;

        var token,
            match,
            tempMatch,
            index,
            col,
            lines;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i=0;i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (!this.options.flex) break;
            }
        }
        if (match) {
            lines = match[0].match(/(?:\r\n?|\n).*/g);
            if (lines) this.yylineno += lines.length;
            this.yylloc = {first_line: this.yylloc.last_line,
                           last_line: this.yylineno+1,
                           first_column: this.yylloc.last_column,
                           last_column: lines ? lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
            this.yytext += match[0];
            this.match += match[0];
            this.matches = match;
            this.yyleng = this.yytext.length;
            if (this.options.ranges) {
                this.yylloc.range = [this.offset, this.offset += this.yyleng];
            }
            this._more = false;
            this._input = this._input.slice(match[0].length);
            this.matched += match[0];
            token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
            if (this.done && this._input) this.done = false;
            if (token) return token;
            else return;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
                    {text: "", token: null, line: this.yylineno});
        }
    },
lex:function lex() {
        var r = this.next();
        if (typeof r !== 'undefined') {
            return r;
        } else {
            return this.lex();
        }
    },
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },
popState:function popState() {
        return this.conditionStack.pop();
    },
_currentRules:function _currentRules() {
        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
    },
topState:function () {
        return this.conditionStack[this.conditionStack.length-2];
    },
pushState:function begin(condition) {
        this.begin(condition);
    }});
lexer.options = {};
lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START
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
case 7:yy.setIndentation(yy_.yytext); return 41;
break;
case 8:return yy.unsetIndentation('}');
break;
case 9:yy.setIndentation(yy_.yytext); return 39;
break;
case 10:return yy.unsetIndentation(']')
break;
case 11:return yy.indentation(yy_.yytext);
break;
case 12:return 42;
break;
case 13:return 43;
break;
case 14:return "operator";
break;
case 15:return "...";
break;
case 16:return yy.lexOperator(yy, yy_.yytext);
break;
case 17:return ",";
break;
case 18:return 46;
break;
case 19:return 44;
break;
case 20:return 5;
break;
case 21:return 45;
break;
case 22:this.begin('interpolated_string'); return 51;
break;
case 23:return 56;
break;
case 24:yy.setIndentation('('); yy.interpolation.startInterpolation(); this.begin('INITIAL'); return 33;
break;
case 25:return 55;
break;
case 26:this.popState(); return 53;
break;
case 27:return 57;
break;
case 28:return 55;
break;
case 29:return 'non_token';
break;
}
};
lexer.rules = [/^(?:^#![^\n]*)/,/^(?: +)/,/^(?:\s*$)/,/^(?:\s*((\/\*([^*](\*[^\/]|))*(\*\/|$)|\/\/[^\n]*)\s*)+$)/,/^(?:\s*((\/\*([^*](\*[^\/]|))*(\*\/|$)|\/\/[^\n]*)\s*)+)/,/^(?:\(\s*)/,/^(?:\s*\))/,/^(?:{\s*)/,/^(?:\s*})/,/^(?:\[\s*)/,/^(?:\s*\])/,/^(?:(\r?\n *)*\r?\n *)/,/^(?:[0-9]+\.[0-9]+)/,/^(?:[0-9]+)/,/^(?:@[a-zA-Z_$][a-zA-Z_$0-9]*)/,/^(?:\.\.\.)/,/^(?:([:;=?!.@~#%^&*+<>\/?\\|-])+)/,/^(?:,)/,/^(?:r\/([^\\\/]*\\.)*[^\/]*\/(img|mgi|gim|igm|gmi|mig|im|ig|gm|mg|mi|gi|i|m|g|))/,/^(?:[a-zA-Z_$][a-zA-Z_$0-9]*)/,/^(?:$)/,/^(?:'([^']*'')*[^']*')/,/^(?:")/,/^(?:\\#)/,/^(?:#\()/,/^(?:#)/,/^(?:")/,/^(?:\\.)/,/^(?:[^"#\\]*)/,/^(?:.)/];
lexer.conditions = {"interpolated_string":{"rules":[23,24,25,26,27,28],"inclusive":false},"interpolated_string_terminal":{"rules":[],"inclusive":false},"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,29],"inclusive":true}};
return lexer;})()
parser.lexer = lexer;
function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); }
}

});
require.register("pogoscript-tests/lib/parser/listMacros.js", function(exports, require, module){
(function() {
    var self = this;
    var _;
    _ = require("underscore");
    module.exports = function(terms) {
        var self = this;
        var macros, isValidComprehension, comprehensionExpressionFor, comprehensionExpressionsFrom, iterator, map, definition, filter, expressions, isIterator, isDefinition;
        macros = terms.macroDirectory();
        isValidComprehension = function(term) {
            var firstItemIsNotHashEntry, secondItemIsWhereHashEntry, secondItemIsIterator, theRestOfTheItemsAreNotHashEntries;
            if (term.items.length < 2) {
                return false;
            }
            firstItemIsNotHashEntry = function() {
                return !term.items[0].isHashEntry;
            };
            secondItemIsWhereHashEntry = function() {
                return term.items[1].isHashEntry && term.items[1].field.length === 1 && term.items[1].field[0] === "where";
            };
            secondItemIsIterator = function() {
                return isIterator(term.items[1].value);
            };
            theRestOfTheItemsAreNotHashEntries = function() {
                return !_.any(term.items.slice(2), function(item) {
                    return item.isHashEntry;
                });
            };
            return firstItemIsNotHashEntry() && secondItemIsWhereHashEntry() && secondItemIsIterator() && theRestOfTheItemsAreNotHashEntries();
        };
        comprehensionExpressionFor = function(expr) {
            if (isIterator(expr)) {
                return iterator(expr);
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
        iterator = function(expression) {
            return {
                isIterator: true,
                iterator: expression.functionArguments[0],
                collection: expression.functionArguments[1],
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
        isIterator = function(expression) {
            var $function;
            if (expression.isFunctionCall) {
                $function = expression.function;
                if ($function.isVariable) {
                    if ($function.variable.length === 1 && $function.variable[0] === "<-") {
                        return true;
                    }
                }
            }
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
});
require.register("pogoscript-tests/lib/parser/macros.js", function(exports, require, module){
var _ = require('underscore');
var errors = require('./errors');
var codegenUtils = require('../terms/codegenUtils');

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
    var errorMsg = 'arguments to if else in are incorrect, try:\n\nif (condition)\n    then ()\nelse if (another condition)\n    do this ()\nelse\n    otherwise ()';

    if (args.length < 2) {
        return cg.errors.addTermWithMessage(term, errorMsg);
    }

    if ((name[name.length - 1] === 'else') !== (args.length % 2 === 1)) {
        return cg.errors.addTermWithMessage(term, errorMsg);
    }

    for (var n = 0; n + 1 < args.length; n += 2) {
      if (!isAny(args[n]) || !isClosureWithParameters(0)(args[n + 1])) {
        return cg.errors.addTermWithMessage(term, errorMsg);
      }

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

      return cg.forEach(collection, itemVariable, block.body);
    } else {
      return cg.errors.addTermWithMessage(term, 'arguments to for each in are incorrect, try:\n\nfor each @(item) in (items)\n    do something with (item)');
    }
  };

  macros.addMacro(['for', 'each', 'in'], createForEach);

  macros.addMacro(['for', 'in'], function (term, name, args) {
    if (areValidArguments(args, isAny, isClosureWithParameters(1))) {
      var collection = args[0];
      var block = args[1];
      var iterator = block.parameters[0];
      var body = block.body;

      return cg.forIn(iterator, collection, block.body);
    } else {
      return cg.errors.addTermWithMessage(term, 'arguments to for in are incorrect, try:\n\nfor @(field) in (object)\n    do something with (field)');
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

      return cg.forStatement(init, test, incr, args[3].body);
    } else {
      return cg.errors.addTermWithMessage(term, 'arguments to for are incorrect, try:\n\nfor (n = 0, n < 10, ++n)\n    do something with (n)');
    }
  });

  macros.addMacro(['while'], function(term, name, args) {
    if (areValidArguments(args, isAny, isClosureWithParameters(0))) {
      var test = args[0];
      var statements = args[1].body;

      return cg.whileStatement(test, statements);
    } else {
      return cg.errors.addTermWithMessage(term, 'arguments to while are incorrect, try:\n\nwhile (condition)\n    do something ()');
    }
  });
  
  macros.addMacro(['with'], function(term, name, args) {
    if (areValidArguments(args, isAny, isClosureWithParameters(0))) {
      return cg.withStatement(args[0], args[1].body);
    } else {
      return cg.errors.addTermWithMessage(term, 'arguments to with are incorrect, try:\n\nwith (object)\n    do something with (field)');
    }
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

  macros.addMacro(['continuation'], function(term, name, args) {
    if (args) {
      return cg.functionCall(cg.callbackFunction, args, {couldBeMacro: false});
    } else {
      return cg.callbackFunction;
    }
  });

  macros.addMacro(['throw'], function(term, name, args) {
    if (areValidArguments(args, isAny)) {
      return cg.throwStatement(args[0]);
    } else {
      return cg.errors.addTermWithMessage(term, 'arguments to throw are incorrect, try: @throw error');
    }
  });

  macros.addMacro(['break'], function(term, name, args) {
    return cg.breakStatement();
  });

  macros.addMacro(['continue'], function(term, name, args) {
    return cg.continueStatement();
  });

  macros.addMacro(['try', 'catch'], function (term, name, args) {
    if (areValidArguments(args, isClosureWithParameters(0), isAny, isClosureWithParameters(0))) {
      var body = args[0].body;
      var catchParameter = args[1];
      var catchBody = args[2].body;

      return cg.tryExpression(body, {catchBody: catchBody, catchParameter: catchParameter});
    } else {
      return cg.errors.addTermWithMessage(term, 'arguments to try catch are incorrect, try:\n\ntry\n    something dangerous ()\ncatch (error)\n    handle (error)');
    }
  });

  macros.addMacro(['try', 'catch', 'finally'], function (term, name, args) {
    if (areValidArguments(args, isClosureWithParameters(0), isAny, isClosureWithParameters(0), isClosureWithParameters(0))) {
      var body = args[0].body;
      var catchParameter = args[1];
      var catchBody = args[2].body;
      var finallyBody = args[3].body;

      return cg.tryExpression(body, {catchBody: catchBody, catchParameter: catchParameter, finallyBody: finallyBody});
    } else {
      return cg.errors.addTermWithMessage(term, 'arguments to try catch finally are incorrect, try:\n\ntry\n    something dangerous ()\ncatch (error)\n    handle (error)\nfinally\n    always do this ()');
    }
  });

  macros.addMacro(['try', 'finally'], function (term, name, args) {
    if (areValidArguments(args, isClosureWithParameters(0), isClosureWithParameters(0))) {
      var body = args[0].body;
      var finallyBody = args[1].body;

      return cg.tryExpression(body, {finallyBody: finallyBody});
    } else {
      return cg.errors.addTermWithMessage(term, 'arguments to try finally are incorrect, try:\n\ntry\n    something dangerous ()\nfinally\n    always do this ()');
    }
  });

  macros.addMacro(['nil'], function (term) {
    return cg.nil();
  });
  
  return macros;
};

});
require.register("pogoscript-tests/lib/parser/operatorExpression.js", function(exports, require, module){
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
            table = operatorsInDecreasingPrecedenceOrder("\n            / * % left\n            - + left\n            << >> >>> left\n            > >= < <= left\n            == != left\n            & left\n            ^ left\n            | left\n            && @and left\n            || @or left\n        ");
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
                    return this.arguments[0].expression();
                }
            },
            hashEntry: function() {
                var self = this;
                if (this.arguments.length === 1) {
                    return this.arguments[0].hashEntry();
                } else {
                    return terms.errors.addTermWithMessage(self, "cannot be used as a hash entry");
                }
            },
            definition: function(source, gen7_options) {
                var self = this;
                var assignment;
                assignment = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "assignment") && gen7_options.assignment !== void 0 ? gen7_options.assignment : false;
                var object, parms;
                if (this.arguments.length > 1) {
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
                    return this.arguments[0].definition(source, {
                        assignment: assignment
                    });
                }
            }
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/parser/parser.js", function(exports, require, module){
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
        var terms;
        terms = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "terms") && gen1_options.terms !== void 0 ? gen1_options.terms : terms;
        return {
            parse: function(source) {
                var self = this;
                var dynamicLexer, parserContext;
                dynamicLexer = createDynamicLexer({
                    nextLexer: jisonLexer
                });
                parserContext = createParserContext({
                    terms: terms
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
});
require.register("pogoscript-tests/lib/parser/parserContext.js", function(exports, require, module){
(function() {
    var self = this;
    var object, _, createIndentStack, createInterpolation, createParserContext;
    object = require("./runtime").object;
    _ = require("underscore");
    createIndentStack = require("./indentStack").createIndentStack;
    createInterpolation = require("./interpolation").createInterpolation;
    exports.createParserContext = createParserContext = function(gen1_options) {
        var terms;
        terms = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "terms") && gen1_options.terms !== void 0 ? gen1_options.terms : void 0;
        return object(function() {
            var self = this;
            self.terms = terms;
            self.indentStack = createIndentStack();
            self.tokens = function(tokens) {
                var self = this;
                self.lexer.tokens = tokens;
                return tokens.shift();
            };
            self.setIndentation = function(text) {
                var self = this;
                return self.indentStack.setIndentation(text);
            };
            self.unsetIndentation = function(token) {
                var self = this;
                var tokens;
                tokens = self.indentStack.unsetIndentation();
                tokens.push(token);
                return self.tokens(tokens);
            };
            self.indentation = function(text) {
                var self = this;
                var tokens;
                tokens = self.indentStack.tokensForNewLine(text);
                return self.tokens(tokens);
            };
            self.eof = function() {
                var self = this;
                return self.tokens(self.indentStack.tokensForEof());
            };
            self.interpolation = createInterpolation();
            self.lexOperator = function(parserContext, op) {
                var self = this;
                if (/[?!][.;]/.test(op)) {
                    return parserContext.tokens([ op[0], op[1] ]);
                } else if (/^(=>|\.\.\.|@:|[#@:!?,.=;]|:=)$/.test(op)) {
                    return op;
                } else {
                    return "operator";
                }
            };
            self.loc = function(term, location) {
                var self = this;
                var loc;
                loc = {
                    firstLine: location.first_line,
                    lastLine: location.last_line,
                    firstColumn: location.first_column,
                    lastColumn: location.last_column
                };
                term.location = function() {
                    var self = this;
                    return loc;
                };
                return term;
            };
            self.unindentBy = function(string, columns) {
                var self = this;
                var r;
                r = new RegExp("\\n {" + columns + "}", "g");
                return string.replace(r, "\n");
            };
            self.normaliseString = function(s) {
                var self = this;
                return s.substring(1, s.length - 1).replace(/''/g, "'");
            };
            self.parseRegExp = function(s) {
                var self = this;
                var match;
                match = /^r\/((\n|.)*)\/([^\/]*)$/.exec(s);
                return {
                    pattern: match[1].replace(/\\\//g, "/").replace(/\n/, "\\n"),
                    options: match[3]
                };
            };
            self.actualCharacters = [ [ /\\\\/g, "\\" ], [ /\\b/g, "\b" ], [ /\\f/g, "\f" ], [ /\\n/g, "\n" ], [ /\\0/g, "\0" ], [ /\\r/g, "\r" ], [ /\\t/g, "	" ], [ /\\v/g, "" ], [ /\\'/g, "'" ], [ /\\"/g, '"' ] ];
            self.normaliseInterpolatedString = function(s) {
                var self = this;
                var gen2_items, gen3_i, mapping;
                gen2_items = self.actualCharacters;
                for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
                    mapping = gen2_items[gen3_i];
                    s = s.replace(mapping[0], mapping[1]);
                }
                return s;
            };
            self.compressInterpolatedStringComponents = function(components) {
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
            };
            self.unindentStringComponentsBy = function(components, columns) {
                var self = this;
                return _.map(components, function(component) {
                    if (component.isString) {
                        return self.terms.string(self.unindentBy(component.string, columns));
                    } else {
                        return component;
                    }
                });
            };
            self.separateExpressionComponentsWithStrings = function(components) {
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
            };
            return self.normaliseStringComponentsUnindentingBy = function(components, indentColumns) {
                var self = this;
                return self.separateExpressionComponentsWithStrings(self.compressInterpolatedStringComponents(self.unindentStringComponentsBy(components, indentColumns)));
            };
        });
    };
}).call(this);
});
require.register("pogoscript-tests/lib/parser/runtime.js", function(exports, require, module){
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
});
require.register("pogoscript-tests/lib/parser/unaryOperatorExpression.js", function(exports, require, module){
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
});
require.register("pogoscript-tests/deps/underscore.js", function(exports, require, module){
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

});
require.register("pogoscript-tests/deps/should.js", function(exports, require, module){
module.exports = chai.should();
});
require.register("pogoscript-tests/deps/util.js", function(exports, require, module){
exports.inspect = function(o){JSON.stringify(o, null, 2);};
});
require.register("pogoscript-tests/test/closureTermSpec.js", function(exports, require, module){
var cg = require('../lib/parser/codeGenerator').codeGenerator();
var closure = require('../lib/terms/closure');
var shouldContainFields = require('./containsFields.js').containsFields;

describe('closure term', function () {
  describe('parseSplatParameters', function () {
    it('no splat', function () {
      var splat = closure.parseSplatParameters(cg, [cg.variable(['a'])]);
      shouldContainFields(splat, {
        firstParameters: [{variable: ['a']}],
        splatParameter: undefined,
        lastParameters: []
      });
    });
    
    it('only splat', function () {
      var splat = closure.parseSplatParameters(cg, [
        cg.variable(['a']),
        cg.splat()
      ]);
      
      shouldContainFields(splat, {
        firstParameters: [],
        splatParameter: {variable: ['a']},
        lastParameters: []
      });
    });
    
    it('splat start', function () {
      var splat = closure.parseSplatParameters(cg, [
        cg.variable(['a']),
        cg.splat(),
        cg.variable(['b'])
      ]);
      
      shouldContainFields(splat, {
        firstParameters: [],
        splatParameter: {variable: ['a']},
        lastParameters: [{variable: ['b']}]
      });
    });
    
    it('splat end', function () {
      var splat = closure.parseSplatParameters(cg, [
        cg.variable(['a']),
        cg.variable(['b']),
        cg.splat()
      ]);
      
      shouldContainFields(splat, {
        firstParameters: [{variable: ['a']}],
        splatParameter: {variable: ['b']},
        lastParameters: []
      });
    });
    
    it('splat middle', function () {
      var splat = closure.parseSplatParameters(cg, [
        cg.variable(['a']),
        cg.variable(['b']),
        cg.splat(),
        cg.variable(['c'])
      ]);
      
      shouldContainFields(splat, {
        firstParameters: [{variable: ['a']}],
        splatParameter: {variable: ['b']},
        lastParameters: [{variable: ['c']}]
      });
    });
    
    it('two splats', function () {
      var secondSplat = cg.splat();
      secondSplat.secondSplat = true;
      
      var splat = closure.parseSplatParameters(cg, [
        cg.variable(['a']),
        cg.variable(['b']),
        cg.splat(),
        cg.variable(['c']),
        secondSplat,
        cg.variable(['d'])
      ]);
      
      shouldContainFields(splat, {
        firstParameters: [{variable: ['a']}],
        splatParameter: {variable: ['b']},
        lastParameters: [
          {variable: ['c']},
          {variable: ['d']}
        ]
      });
    });
  });
});

});
require.register("pogoscript-tests/test/codeGeneratorSpec.js", function(exports, require, module){
var cg = require('../lib/parser/codeGenerator').codeGenerator();
var MemoryStream = require('../lib/memorystream').MemoryStream;
var should = require('should');
var _ = require('underscore');

var shouldContainFields = require('./containsFields.js').containsFields;

describe('code generator', function () {
  var generatesExpression = function (term, expectedGeneratedCode, print) {
    var stream = new MemoryStream();
    term.generateJavaScript(stream, new cg.SymbolScope());
    var code = stream.toString();
    if (print) {
      console.log(code);
    }
    should.equal(code, expectedGeneratedCode);
  };
  
  var generatesStatement = function(term, expectedGeneratedCode) {
    var stream = new MemoryStream();
    term.generateJavaScriptStatement(stream, new cg.SymbolScope());
    should.equal(stream.toString(), expectedGeneratedCode);
  };
  
  var generatesStatements = function(term, expectedGeneratedCode, global, print) {
    var stream = new MemoryStream();
    term.generateJavaScriptStatements(stream, new cg.SymbolScope(), {inClosure: true, global: global});
    if (print)
        console.log(stream.toString())
    should.equal(stream.toString(), expectedGeneratedCode);
  };
  
  describe('variable', function () {
    it('with one identifier', function () {
      generatesExpression(cg.variable(['one']), 'one');
    });
    
    it('with two identifiers', function () {
      generatesExpression(cg.variable(['one', 'two']), 'oneTwo');
    });
    
    it('with capitalised word', function () {
      generatesExpression(cg.variable(['Stack']), 'Stack');
    });
    
    it('escapes reserved word', function () {
      generatesExpression(cg.variable(['class']), '$class');
    });
    
    it("doesn't escape already escaped reserved word", function () {
      generatesExpression(cg.variable(['$class']), '$class');
    });
    
    it("generates a semi-colon when as a statement", function () {
      generatesStatement(cg.variable(['asdf']), 'asdf;');
    });
  });
  
  describe('function call', function () {
    it('with no arguments', function () {
      var f = cg.functionCall(cg.variable(['f']), []);
      
      generatesExpression(f, 'f()');
    });
    
    it('with two arguments', function () {
      var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a']), cg.variable(['b'])]);
      
      generatesExpression(f, 'f(a,b)');
    });
    
    describe('splats', function () {
      it('just splat', function () {
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['b']), cg.splat()]);
      
        generatesExpression(f, 'f.apply(null,b)');
      });
      
      it('splat with field reference method call', function () {
        var f = cg.functionCall(cg.indexer(cg.variable(['f']), cg.variable(['g'])), [cg.variable(['b']), cg.splat()]);
      
        generatesExpression(f, 'f[g].apply(f,b)');
      });
      
      it('args before', function () {
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a']), cg.variable(['b']), cg.splat()]);
      
        generatesExpression(f, 'f.apply(null,[a].concat(b))');
      });
      
      it('args after', function () {
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a']), cg.splat(), cg.variable(['b'])]);
      
        generatesExpression(f, 'f.apply(null,a.concat([b]))');
      });
      
      it('two splats', function () {
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a']), cg.variable(['b']), cg.splat(), cg.variable(['c']), cg.variable(['d']), cg.splat(), cg.variable(['e'])]);
      
        generatesExpression(f, 'f.apply(null,[a].concat(b).concat([c]).concat(d).concat([e]))');
      });

      it('splat with optional args', function () {
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['b']), cg.splat()], {optionalArguments: [cg.hashEntry(['port'], cg.variable(['p']))]});
      
        generatesExpression(f, 'f.apply(null,b.concat([{port:p}]))');
      });
    
      it('adds async callback argument last', function () {
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a']), cg.splat()]);
        f.makeAsyncCallWithCallback(cg.variable(['callback']));

        generatesExpression(f, 'f.apply(null,a.concat([callback]))');
      });
    });

    describe('optional arguments', function () {
      it('with no arguments and an optional argument', function () {
        var f = cg.functionCall(cg.variable(['f']), [], {optionalArguments: [cg.hashEntry(['port'], cg.variable(['p']))]});

        generatesExpression(f, 'f({port:p})');
      });

      it('with an argument and two optional arguments', function () {
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a'])],
          {optionalArguments: [
            cg.hashEntry(['port'], cg.variable(['p'])),
            cg.hashEntry(['server'], cg.variable(['s'])),
            cg.hashEntry(['start'])
          ]});

        generatesExpression(f, 'f(a,{port:p,server:s,start:true})');
      });
    
      it('adds async callback argument last', function () {
        var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a'])],
          {optionalArguments: [
            cg.hashEntry(['port'], cg.variable(['p']))
          ]});
          
        f.makeAsyncCallWithCallback(cg.variable(['callback']));

        generatesExpression(f, 'f(a,{port:p},callback)');
      });
    });
    
    it('adds async callback argument last', function () {
      var f = cg.functionCall(cg.variable(['f']), [cg.variable(['a'])]);
      f.makeAsyncCallWithCallback(cg.variable(['callback']));

      generatesExpression(f, 'f(a,callback)');
    });
  });
  
  describe('string', function() {
    it('normal', function() {
      var s = cg.string("a string");
      
      generatesExpression(s, "'a string'");
    });
    
    it('with newline', function() {
      var s = cg.string("one\ntwo");
      
      generatesExpression(s, "'one\\ntwo'");
    });
    
    it('with escaped single quote', function() {
      var s = cg.string("his name was 'Sue'. weird");
      
      generatesExpression(s, "'his name was \\'Sue\\'. weird'");
    });
  });
  
  describe('regexps', function () {
    it('simple', function () {
      var r = cg.regExp({pattern: 'abc'});
    
      generatesExpression(r, "/abc/");
    });
    
    it('with options', function () {
      var r = cg.regExp({pattern: 'abc', options: 'gim'});
    
      generatesExpression(r, "/abc/gim");
    });
    
    it('containing /', function () {
      var r = cg.regExp({pattern: 'https://', options: 'gim'});
    
      generatesExpression(r, "/https:\\/\\//gim");
    });
  });

  describe('interpolated strings', function () {
    it('one string', function () {
      var s = cg.interpolatedString([cg.string("a string")]);

      generatesExpression(s, "'a string'");
    });

    it('expression in string', function () {
      var s = cg.interpolatedString([cg.string("before "), cg.variable(['x']), cg.string(' after')]);

      generatesExpression(s, "('before '+x+' after')");
    });
  });
  
  describe('operators', function () {
    it('two argument operator', function() {
      var s = cg.operator('*', [cg.variable(['a']), cg.integer(8)]);
      generatesExpression(s, "(a*8)");
    });

    it('multiple argument operator', function() {
      var s = cg.operator('*', [cg.variable(['a']), cg.integer(8), cg.variable(['b'])]);
      generatesExpression(s, "(a*8*b)");
    });

    it('unary operator', function() {
      var s = cg.operator('-', [cg.variable(['a'])]);
      generatesExpression(s, "(-a)");
    });

    it('unary alpha operator generates spaces around operator', function() {
      var s = cg.operator('instanceof', [cg.variable(['a'])]);
      generatesExpression(s, "(instanceof a)");
    });

    it('alpha operator generates spaces around operator', function() {
      var s = cg.operator('instanceof', [cg.variable(['a']), cg.variable(['b'])]);
      generatesExpression(s, "(a instanceof b)");
    });
  })
  
  describe('block', function () {
    describe('scopify', function () {
      it('without parameters', function () {
        var b = cg.block([], cg.statements([cg.variable(['a'])]));
        
        var scopifiedBlock = b.scopify();
        shouldContainFields(scopifiedBlock, {
          isVariable: true,
          variable: ['a']
        });
      });
      
      it('with parameters', function () {
        var b = cg.block([cg.parameters([cg.variable(['a'])])], cg.statements([cg.variable(['a'])]));
        should.equal(b.scopify(), b);
      });
    });
    
    it('with no parameters', function () {
      var b = cg.block([], cg.statements([cg.variable(['x'])]));
      
      generatesExpression(b, 'function(){return x;}');
    });
    
    it('with no statements', function () {
      var b = cg.block([], cg.statements([]));
      
      generatesExpression(b, 'function(){}');
    });
    
    it('declares its parameters', function () {
      var b = cg.block([cg.variable(['x'])], cg.statements([cg.definition(cg.variable(['x']), cg.integer(8))]));
      
      generatesExpression(b, 'function(x){return x=8;}');
    });
    
    it('with two parameters', function () {
      var b = cg.block([cg.variable(['x']), cg.variable(['y'])], cg.statements([cg.variable(['x'])]));
      
      generatesExpression(b, 'function(x,y){return x;}');
    });
    
    it('with two parameters and two statements', function () {
      var b = cg.block([cg.variable(['x']), cg.variable(['y'])], cg.statements([cg.functionCall(cg.variable(['y']), [cg.variable(['x'])]), cg.variable(['x'])]));
      
      generatesExpression(b, 'function(x,y){y(x);return x;}');
    });
    
    it('block with new context', function () {
      var b = cg.block(
        [
          cg.variable(['x']),
          cg.variable(['y'])
        ],
        cg.statements([
          cg.functionCall(cg.variable(['y']), [cg.variable(['x'])]),
          cg.variable(['x'])
        ])
      );
      
      b.redefinesSelf = true;
      
      generatesExpression(b, 'function(x,y){var self=this;y(x);return x;}');
    });
    
    it('with a parameter and two optional parameters', function () {
      var b;
      var s = cg.statements([
        cg.definition(cg.variable(['port']), cg.integer(1)),
        b = cg.block(
          [
            cg.variable(['x']),
            cg.variable(['y'])
          ],
          cg.statements([
            cg.functionCall(cg.variable(['y']), [cg.variable(['x'])]),
            cg.variable(['x'])
          ])
        )
      ]);

      b.optionalParameters = [
        cg.hashEntry(['port'], cg.integer(80)),
        cg.hashEntry(['start'], cg.boolean(true))
      ];
      
      generatesStatements(s, "var port;port=1;function(x,y,gen1_options){var port,start;port=gen1_options!==void 0&&Object.prototype.hasOwnProperty.call(gen1_options,'port')&&gen1_options.port!==void 0?gen1_options.port:80;start=gen1_options!==void 0&&Object.prototype.hasOwnProperty.call(gen1_options,'start')&&gen1_options.start!==void 0?gen1_options.start:true;y(x);return x;};");
    });
    
    it('with splat parameters', function () {
      var s = cg.statements([
        cg.definition(cg.variable(['y']), cg.integer(1)),
        cg.block(
          [
            cg.variable(['x']),
            cg.variable(['y']),
            cg.splat(),
            cg.variable(['z'])
          ],
          cg.statements([
            cg.functionCall(cg.variable(['y']), [cg.variable(['x'])]),
            cg.variable(['z'])
          ])
        )
      ]);

      generatesStatements(s, "var y;y=1;function(x){var y=Array.prototype.slice.call(arguments,1,arguments.length-1);if(arguments.length>1){var z=arguments[arguments.length-1];}y(x);return z;};");
    });
  });
  
  describe('statements', function () {
    it('with no statements', function () {
      var st = cg.statements([]);
      
      generatesStatements(st, '');
    });
    
    it('with two statements', function () {
      var st = cg.statements([cg.variable(['one']), cg.functionCall(cg.variable(['two']), [])]);
      
      generatesStatements(st, 'one;two();');
    });
    
    it('with two statements and a definition', function () {
      var st = cg.statements([cg.definition(cg.variable(['one']), cg.integer(9)), cg.functionCall(cg.variable(['two']), [])]);
      
      generatesStatements(st, 'var one;one=9;two();');
    });
    
    it('chained definitions', function () {
      var st = cg.statements([cg.definition(cg.variable(['one']), cg.definition(cg.variable(['two']), cg.integer(9)))]);
      
      generatesStatements(st, 'var one,two;one=two=9;');
    });
    
    it('with two definitions of the same variable', function () {
      var st = cg.statements([
        cg.definition(cg.variable(['x']), cg.integer(1)),
        cg.definition(cg.variable(['x']), cg.integer(2)),
        cg.functionCall(cg.variable(['f']), [cg.variable(['x'])])
      ]);
      
      generatesStatements(st, 'var x;x=1;x=2;f(x);');
    });
  });
  
  describe('definition', function () {
    it('as expression', function () {
      var d = cg.definition(cg.variable(['one']), cg.integer(9));
      
      generatesExpression(d, 'one=9');
    });
    
    it('as hash entry', function () {
      var d = cg.hash([cg.definition(cg.variable(['one']), cg.integer(9)).hashEntry()]);
      
      generatesExpression(d, '{one:9}');
    });
    
    it('of field', function () {
      var d = cg.definition(cg.fieldReference(cg.variable(['object']), ['field']), cg.integer(9));
      
      generatesExpression(d, 'object.field=9');
    });
    
    it('of reserved word field', function () {
      var d = cg.definition(cg.fieldReference(cg.variable(['object']), ['class']), cg.integer(9));
      
      generatesExpression(d, 'object.class=9');
    });
    
    it('of index', function () {
      var d = cg.definition(cg.indexer(cg.variable(['array']), cg.integer(1)), cg.integer(9));
      
      generatesExpression(d, 'array[1]=9');
    });
  });
  
  describe('new operator', function() {
    it('gnerates js new for function call', function() {
      var n = cg.newOperator(cg.functionCall(cg.variable(['Stack']), [cg.integer(8)]));
    
      generatesExpression(n, 'new Stack(8)');
    });
    
    it('new variable becomes new function call', function() {
      var n = cg.newOperator(cg.variable(['Stack']));
    
      generatesExpression(n, 'new Stack()');
    });
  });
  
  it('for in', function() {
    var f = cg.statements([cg.forIn(
      cg.variable(['item']),
      cg.variable(['items']),
      cg.statements([cg.variable(['item'])])
    )]);
    
    generatesStatements(f, 'var item;for(item in items){(function(item){item;}(item));}');
  });
  
  describe('for', function() {
    it('for', function() {
      var f = cg.forStatement(
        cg.definition(cg.variable(['i']), cg.integer(0)),
        cg.operator('<', [cg.variable(['i']), cg.integer(10)]),
        cg.definition(cg.variable(['i']), cg.operator('+', [cg.variable(['i']), cg.integer(1)])),
        cg.statements([cg.variable(['i'])])
      );
      
      generatesExpression(f, 'for(i=0;(i<10);i=(i+1)){i;}');
    });
  });
  
  it('while', function() {
    var w = cg.whileStatement(cg.variable(['c']), cg.statements([cg.variable(['s'])]));
    
    generatesStatement(w, 'while(c){s;}');
  });
  
  describe('method call', function () {
    it('method call', function () {
      var m = cg.methodCall(cg.variable(['console']), ['log'], [cg.variable(['stuff'])]);
      
      generatesExpression(m, 'console.log(stuff)');
    });

    it('methods allow reserved words as names', function () {
      var m = cg.methodCall(cg.variable(['console']), ['class'], [cg.variable(['stuff'])]);
      
      generatesExpression(m, 'console.class(stuff)');
    });

    describe('optional arguments', function () {
      it('method call with optional argument', function () {
        var m = cg.methodCall(cg.variable(['console']), ['log'], [cg.variable(['stuff'])], {optionalArguments: [cg.hashEntry(['port'], cg.integer(45))]});

        generatesExpression(m, 'console.log(stuff,{port:45})');
      });
      
      it('method call with optional argument and async callback argument', function () {
        var m = cg.methodCall(cg.variable(['console']), ['log'], [cg.variable(['stuff'])],
          {
            optionalArguments: [cg.hashEntry(['port'], cg.integer(45))],
          }
        );
        
        m.makeAsyncCallWithCallback(cg.variable(['callback']));

        generatesExpression(m, 'console.log(stuff,{port:45},callback)');
      });
    });
  });
  
  it('indexer', function () {
    var m = cg.indexer(cg.variable(['array']), cg.variable(['stuff']));
    
    generatesExpression(m, 'array[stuff]');
  });
  
  describe('field reference', function () {
    it('normal', function () {
      var m = cg.fieldReference(cg.variable(['obj']), ['field', 'name']);
    
      generatesExpression(m, 'obj.fieldName');
    });
    
    it('reserved words are allowed', function () {
      var m = cg.fieldReference(cg.variable(['obj']), ['class']);
    
      generatesExpression(m, 'obj.class');
    });
  });
  
  describe('if', function () {
    it('if statement', function () {
      var m = cg.statements([cg.ifExpression([{
        condition: cg.variable(['obj']),
        body: cg.statements([cg.variable(['stuff'])])
      }])]);
    
      generatesStatements(m, 'if(obj){stuff;}');
    });
  
    it('if else if else statement', function () {
      var m = cg.statements([cg.ifExpression([{
          condition: cg.variable(['x', 'ok']),
          body: cg.statements([cg.variable(['x'])])
        },
        {
          condition: cg.variable(['y', 'ok']),
          body: cg.statements([cg.variable(['y'])])
        }],
        cg.statements([cg.variable(['other', 'stuff'])])
      )]);
    
      generatesStatements(m, 'if(xOk){x;}else if(yOk){y;}else{otherStuff;}');
    });
  
    it('if else statement', function () {
      var m = cg.statements([cg.ifExpression([{
          condition: cg.variable(['obj']),
          body: cg.statements([cg.variable(['stuff'])])
        }],
        cg.statements([cg.variable(['other', 'stuff'])])
      )]);
    
      generatesStatements(m, 'if(obj){stuff;}else{otherStuff;}');
    });
  });

  describe('try', function () {
    it('try catch', function () {
      var t = cg.tryExpression(
        cg.statements([cg.variable(['a'])]),
        {
          catchBody: cg.statements([cg.variable(['b'])]),
          catchParameter: cg.variable(['ex'])
        }
      );

      generatesStatement(t, 'try{a;}catch(ex){b;}');
    });

    it('try catch finally', function () {
      var t = cg.tryExpression(
        cg.statements([cg.variable(['a'])]),
        {
          catchBody: cg.statements([cg.variable(['b'])]),
          catchParameter: cg.variable(['ex']),
          finallyBody: cg.statements([cg.variable(['c'])])
        }
      );

      generatesStatement(t, 'try{a;}catch(ex){b;}finally{c;}');
    });

    it('try finally', function () {
      var t = cg.tryExpression(
        cg.statements([cg.variable(['a'])]),
        {
          finallyBody: cg.statements([cg.variable(['b'])])
        }
      );

      generatesStatement(t, 'try{a;}finally{b;}');
    });
  });
  
  describe('list', function() {
    it('with one element', function() {
      var l = cg.list([cg.variable(['stuff'])]);
      generatesExpression(l, '[stuff]');
    });
    
    it('with two elements', function() {
      var l = cg.list([cg.variable(['stuff']), cg.variable(['more', 'stuff'])]);
      generatesExpression(l, '[stuff,moreStuff]');
    });
    
    it('with no elements', function() {
      var l = cg.list([]);
      generatesExpression(l, '[]');
    });
  });
  
  describe('hash', function() {
    it('with one item', function() {
      var h = cg.hash([cg.hashEntry(['street', 'address'], cg.variable(['address']))]);
      generatesExpression(h, '{streetAddress:address}');
    });
    
    it('with two items, one with string field', function() {
      var h = cg.hash([
        cg.hashEntry(['street', 'address'], cg.variable(['address'])),
        cg.hashEntry(cg.string('Content-Type'), cg.string('text/plain'))
      ]);
      generatesExpression(h, "{streetAddress:address,'Content-Type':'text/plain'}");
    });
    
    it('with true item', function() {
      var h = cg.hash([
        cg.hashEntry(['street', 'address'], cg.boolean(true))
      ]);
      generatesExpression(h, "{streetAddress:true}");
    });
  });
  
  describe('symbol scope', function () {
    it('variable defined in outer scope, assigned to in inner scope', function () {
      var s = cg.statements([
        cg.definition(cg.variable(['x']), cg.integer(1)),
        cg.functionCall(cg.variable(['f']), [cg.block([], cg.statements([
          cg.definition(cg.variable(['x']), cg.integer(2)),
          cg.variable(['x'])
        ]))])
      ]);
      
      generatesStatements(s, 'var x;x=1;f(function(){x=2;return x;});');
    });
  });
  
  describe('scope', function () {
    it('places scope contents inside a function which is called immediately', function () {
      var s = cg.scope([cg.definition(cg.variable(['a']), cg.integer(8)), cg.variable(['a'])]);
      
      generatesExpression(s, '(function(){var a;a=8;return a;})()');
    });

    it('if there is only one statement, it just generates that statement', function () {
      var s = cg.scope([cg.variable(['a'])]);
      
      generatesExpression(s, 'a');
    });
  });
});

});
require.register("pogoscript-tests/test/codegenUtilsSpec.js", function(exports, require, module){
var codegenUtils = require('../lib/terms/codegenUtils');
var should = require('should');

describe('codegen utils', function () {
  describe('concatName', function () {
    it('one identifier', function () {
      should.equal(codegenUtils.concatName(['one']), 'one');
    });
    
    it('two identifiers', function () {
      should.equal(codegenUtils.concatName(['one', 'two']), 'oneTwo');
    });
    
    it('explicit case', function () {
      should.equal(codegenUtils.concatName(['One', 'Two']), 'OneTwo');
    });
    
    it('underscores', function () {
      should.equal(codegenUtils.concatName(['_one', '_two']), '_one_two');
    });
    
    it('operators', function () {
      should.equal(codegenUtils.concatName(['+*']), '$2b$2a');
    });
    
    it('escapes reserved words when escape is true', function () {
      should.equal(codegenUtils.concatName(['class'], {escape: true}), '$class');
    });
    
    it("doesn't escape reserved words when escape isn't true", function () {
      should.equal(codegenUtils.concatName(['class']), 'class');
    });
  });
});

});
require.register("pogoscript-tests/test/containsFields.js", function(exports, require, module){
var util = require('util');
var should = require('should');
var _ = require('underscore');

var inspect = function (o) {
  return util.inspect(o, false, 10, true);
};

var containsFields = exports.containsFields = function (actual, expected, key, originalActual) {
  var index = function (i) {
    return key + '[' + i + ']';
  };

  var field = function (f) {
    if (key) {
      return key + '.' + f;
    } else {
      return f;
    }
  };

  var originalActual = (originalActual || actual);
  var message = function () {
    var inspectedOriginalActual = inspect(originalActual);
    var inspectedActual = inspect(actual);
    var inspectedExpected = inspect(expected);
    return 'in ' + inspectedOriginalActual + ', ' + key + ' ' + inspectedActual + ' should be equal to ' + inspectedExpected;
  };

  if (_.isArray(expected)) {
    should.exist(actual, message());

    containsFields(actual.length, expected.length, field('length'), originalActual);
    for (var n = 0; n < expected.length; n++) {
      containsFields(actual[n], expected[n], index(n), originalActual);
    }
  } else if (_.isObject(expected)) {
    should.exist(actual, message());

    for (var n in expected) {
      if (expected.hasOwnProperty(n)) {
        containsFields(actual[n], expected[n], field(n), originalActual);
      }
    }
  } else {
    should.deepEqual(actual, expected, message());
  }
};

});
require.register("pogoscript-tests/test/pogo.js", function(exports, require, module){

});
require.register("pogoscript-tests/test/assertions.js", function(exports, require, module){
(function() {
    var self = this;
    var should;
    should = require("should");
    global.shouldContainFields = require("./containsFields").containsFields;
    global.shouldEqual = function(x, y) {
        var self = this;
        return should.equal(x, y);
    };
    global.shouldBeTruthy = function(x) {
        var self = this;
        return should.exist(x);
    };
    global.shouldBeFalsy = function(x) {
        var self = this;
        return should.not.exist(x);
    };
}).call(this);
});
require.register("pogoscript-tests/test/asyncForSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var async, should;
    async = require("../lib/asyncControl");
    should = require("should");
    require("./assertions");
    describe("for", function() {
        it("executes each loop sequentially", function(done) {
            var n, loops;
            n = 0;
            loops = [];
            return async.for(function(cb) {
                return cb(void 0, n < 3);
            }, function(cb) {
                ++n;
                return cb();
            }, function(cb) {
                loops.push(n);
                return cb();
            }, function() {
                try {
                    shouldContainFields(loops, [ 0, 1, 2 ]);
                    return done();
                } catch (error) {
                    return done(error);
                }
            });
        });
        context("when test returns error", function() {
            return it("returns error", function(done) {
                var n, loops;
                n = 0;
                loops = [];
                return async.for(function(cb) {
                    return cb("test error");
                }, function(cb) {
                    ++n;
                    return cb();
                }, function(cb) {
                    loops.push(n);
                    return cb();
                }, function(error) {
                    try {
                        shouldContainFields(loops, []);
                        should.equal(error, "test error");
                        return done();
                    } catch (error) {
                        return done(error);
                    }
                });
            });
        });
        context("when test throws error", function() {
            return it("returns error", function(done) {
                var n, loops;
                n = 0;
                loops = [];
                return async.for(function(cb) {
                    throw "test error";
                }, function(cb) {
                    ++n;
                    return cb();
                }, function(cb) {
                    loops.push(n);
                    return cb();
                }, function(error) {
                    try {
                        shouldContainFields(loops, []);
                        should.equal(error, "test error");
                        return done();
                    } catch (error) {
                        return done(error);
                    }
                });
            });
        });
        context("when incr returns error", function() {
            return it("returns error", function(done) {
                var n, loops;
                n = 0;
                loops = [];
                return async.for(function(cb) {
                    return cb(void 0, n < 3);
                }, function(cb) {
                    return cb("incr error");
                }, function(cb) {
                    loops.push(n);
                    return cb();
                }, function(error) {
                    try {
                        shouldContainFields(loops, [ 0 ]);
                        should.equal(error, "incr error");
                        return done();
                    } catch (error) {
                        return done(error);
                    }
                });
            });
        });
        context("when incr throws error", function() {
            return it("returns error", function(done) {
                var n, loops;
                n = 0;
                loops = [];
                return async.for(function(cb) {
                    return cb(void 0, n < 3);
                }, function(cb) {
                    throw "incr error";
                }, function(cb) {
                    loops.push(n);
                    return cb();
                }, function(error) {
                    try {
                        shouldContainFields(loops, [ 0 ]);
                        should.equal(error, "incr error");
                        return done();
                    } catch (error) {
                        return done(error);
                    }
                });
            });
        });
        context("when loop returns error", function() {
            return it("returns error", function(done) {
                var n, loops;
                n = 0;
                loops = [];
                return async.for(function(cb) {
                    return cb(void 0, n < 3);
                }, function(cb) {
                    ++n;
                    return cb();
                }, function(cb) {
                    loops.push(n);
                    return cb("loop error");
                }, function(error) {
                    try {
                        shouldContainFields(loops, [ 0 ]);
                        should.equal(error, "loop error");
                        return done();
                    } catch (error) {
                        return done(error);
                    }
                });
            });
        });
        return context("when loop throws error", function() {
            return it("returns error", function(done) {
                var n, loops;
                n = 0;
                loops = [];
                return async.for(function(cb) {
                    return cb(void 0, n < 3);
                }, function(cb) {
                    ++n;
                    return cb();
                }, function(cb) {
                    loops.push(n);
                    throw "loop error";
                }, function(error) {
                    try {
                        shouldContainFields(loops, [ 0 ]);
                        should.equal(error, "loop error");
                        return done();
                    } catch (error) {
                        return done(error);
                    }
                });
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/asyncFunctionSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var should, script, asyncShouldOutput;
    should = require("should");
    script = require("./scriptAssertions");
    asyncShouldOutput = script.asyncShouldOutput;
    describe("asynchronous functions", function() {
        describe("function with one argument", function() {
            return it("takes that argument when passed, and as nil when not", function(continuation) {
                var gen1_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                continuation = arguments[arguments.length - 1];
                if (!(continuation instanceof Function)) {
                    throw new Error("asynchronous function called synchronously");
                }
                asyncShouldOutput('f!(url) = url\n\nprint (f!("url"))\nprint (f!())\n\ndone ()', "'url'\nundefined", continuation);
            });
        });
        describe("function with an optional argument", function() {
            return it("takes the optional argument when specified, or the default when not", function(continuation) {
                var gen2_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                continuation = arguments[arguments.length - 1];
                if (!(continuation instanceof Function)) {
                    throw new Error("asynchronous function called synchronously");
                }
                asyncShouldOutput('f!(name: "jack default") = name\n\nprint (f!(name: "jill specified"))\nprint (f!())\n\ndone ()', "'jill specified'\n'jack default'", continuation);
            });
        });
        describe("function with a normal and an optional argument", function() {
            return it("takes both arguments when specified, or nil for the normal, and the default for the optional", function(continuation) {
                var gen3_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                continuation = arguments[arguments.length - 1];
                if (!(continuation instanceof Function)) {
                    throw new Error("asynchronous function called synchronously");
                }
                asyncShouldOutput('f!(a, name: "jack default") = [a, name]\n\nprint (f!("a", name: "jill specified"))\nprint (f!("a"))\nprint (f!())\n\ndone ()', "[ 'a', 'jill specified' ]\n[ 'a', 'jack default' ]\n[ undefined, 'jack default' ]", continuation);
            });
        });
        describe("function with two arguments", function() {
            return it("takes arguments when passed starting with the first one, or nil when not passed", function(continuation) {
                var gen4_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                continuation = arguments[arguments.length - 1];
                if (!(continuation instanceof Function)) {
                    throw new Error("asynchronous function called synchronously");
                }
                asyncShouldOutput('f!(a, b) = [a, b]\n\nprint (f!("a", "b"))\nprint (f!("a"))\nprint (f!())\n\ndone ()', "[ 'a', 'b' ]\n[ 'a', undefined ]\n[ undefined, undefined ]", continuation);
            });
        });
        describe("function with a splat argument", function() {
            return it("takes splat argument as a list", function(continuation) {
                var gen5_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                continuation = arguments[arguments.length - 1];
                if (!(continuation instanceof Function)) {
                    throw new Error("asynchronous function called synchronously");
                }
                asyncShouldOutput('f!(a, ...) = a\n\nprint (f!("a", "b"))\nprint (f!("a"))\nprint (f!())\n\ndone ()', "[ 'a', 'b' ]\n[ 'a' ]\n[]", continuation);
            });
        });
        describe("function with a normal argument and a splat argument", function() {
            return it("takes the first argument if present, then the remaining arguments in a list", function(continuation) {
                var gen6_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                continuation = arguments[arguments.length - 1];
                if (!(continuation instanceof Function)) {
                    throw new Error("asynchronous function called synchronously");
                }
                asyncShouldOutput('f!(a, b, ...) = [a, b]\n\nprint (f!("a", "b", "c"))\nprint (f!("a", "b"))\nprint (f!("a"))\nprint (f!())\n\ndone ()', "[ 'a', [ 'b', 'c' ] ]\n[ 'a', [ 'b' ] ]\n[ 'a', [] ]\n[ undefined, [] ]", continuation);
            });
        });
        return describe("function with a normal argument and a splat argument, followed by another argument", function() {
            return it("takes the first argument if present, then the remaining arguments in a list", function(continuation) {
                var gen7_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                continuation = arguments[arguments.length - 1];
                if (!(continuation instanceof Function)) {
                    throw new Error("asynchronous function called synchronously");
                }
                asyncShouldOutput('f!(a, b, ... , c) = [a, b, c]\n\nprint (f!("a", "b", "c", "d"))\nprint (f!("a", "b", "c"))\nprint (f!("a", "b"))\nprint (f!("a"))\nprint (f!())\n\ndone ()', "[ 'a', [ 'b', 'c' ], 'd' ]\n[ 'a', [ 'b' ], 'c' ]\n[ 'a', [], 'b' ]\n[ 'a', [], undefined ]\n[ undefined, [], undefined ]", continuation);
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/asyncIfSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var async, should;
    async = require("../lib/asyncControl");
    should = require("should");
    describe("if", function() {
        it("calls the callback with the result of the then", function(done) {
            return async.if(true, function(callback) {
                return callback(void 0, "result");
            }, function(error, result) {
                if (error) {
                    return done(error);
                } else {
                    result.should.equal("result");
                    return done();
                }
            });
        });
        it("calls the callback with the error of the then", function(done) {
            return async.if(true, function(callback) {
                return callback("error");
            }, function(error, result) {
                try {
                    error.should.equal("error");
                    should.not.exist(result);
                    return done();
                } catch (ex) {
                    return done(ex);
                }
            });
        });
        return it("calls the callback with the error when the then throws", function(done) {
            return async.if(true, function(callback) {
                throw "error";
            }, function(error, result) {
                try {
                    error.should.equal("error");
                    should.not.exist(result);
                    return done();
                } catch (ex) {
                    return done(ex);
                }
            });
        });
    });
    describe("if else", function() {
        it("calls the callback with the result of the then", function(done) {
            return async.ifElse(true, function(callback) {
                return callback(void 0, "then result");
            }, function(callback) {
                return callback(void 0, "else result");
            }, function(error, result) {
                if (error) {
                    return done(error);
                } else {
                    result.should.equal("then result");
                    return done();
                }
            });
        });
        it("calls the callback with the error of the then", function(done) {
            return async.ifElse(true, function(callback) {
                return callback("then error");
            }, function(callback) {
                return callback(void 0, "else result");
            }, function(error, result) {
                try {
                    error.should.equal("then error");
                    should.not.exist(result);
                    return done();
                } catch (ex) {
                    return done(ex);
                }
            });
        });
        it("calls the callback with the error when the then throws", function(done) {
            return async.ifElse(true, function(callback) {
                throw "then error";
            }, function(callback) {
                return callback(void 0, "else result");
            }, function(error, result) {
                try {
                    error.should.equal("then error");
                    should.not.exist(result);
                    return done();
                } catch (ex) {
                    return done(ex);
                }
            });
        });
        it("calls the callback with the result of the else", function(done) {
            return async.ifElse(false, function(callback) {
                return callback(void 0, "then result");
            }, function(callback) {
                return callback(void 0, "else result");
            }, function(error, result) {
                if (error) {
                    return done(error);
                } else {
                    result.should.equal("else result");
                    return done();
                }
            });
        });
        it("calls the callback with the error of the else", function(done) {
            return async.ifElse(false, function(callback) {
                return callback(void 0, "then result");
            }, function(callback) {
                return callback("else error");
            }, function(error, result) {
                error.should.equal("else error");
                should.not.exist(result);
                return done();
            });
        });
        return it("calls the callback with the error when the else throws", function(done) {
            return async.ifElse(false, function(callback) {
                return callback(void 0, "then result");
            }, function(callback) {
                throw "else error";
            }, function(error, result) {
                error.should.equal("else error");
                should.not.exist(result);
                return done();
            });
        });
    });
    describe("if else if else", function() {
        it("executes the first body when only the first condition is true", function(done) {
            return async.ifElseIfElse([ {
                condition: true,
                body: function(callback) {
                    return callback(void 0, "first result");
                }
            }, {
                condition: false,
                body: function(callback) {
                    return callback(void 0, "second result");
                }
            } ], function(error, result) {
                result.should.equal("first result");
                should.not.exist(error);
                return done();
            });
        });
        it("executes the second body when only the second condition is true", function(done) {
            return async.ifElseIfElse([ {
                condition: false,
                body: function(callback) {
                    return callback(void 0, "first result");
                }
            }, {
                condition: true,
                body: function(callback) {
                    return callback(void 0, "second result");
                }
            } ], function(error, result) {
                result.should.equal("second result");
                should.not.exist(error);
                return done();
            });
        });
        it("returns an error if the body throws", function(done) {
            return async.ifElseIfElse([ {
                condition: true,
                body: function(callback) {
                    throw "error";
                }
            } ], function(error, result) {
                error.should.equal("error");
                should.not.exist(result);
                return done();
            });
        });
        return it("returns nil if no conditions are true", function(done) {
            return async.ifElseIfElse([ {
                condition: false,
                body: function(callback) {
                    throw "error";
                }
            } ], function(error, result) {
                should.not.exist(result);
                should.not.exist(error);
                return done();
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/asyncMethodsSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var should, script, asyncShouldOutput;
    should = require("should");
    script = require("./scriptAssertions");
    asyncShouldOutput = script.asyncShouldOutput;
    describe("asynchronous methods", function() {
        return describe("methods that don't have async bodies, but are defined with the async operator", function() {
            context("when the method is defined on an existing object", function() {
                return it("makes the method asynchronous anyway", function(continuation) {
                    var gen1_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                    continuation = arguments[arguments.length - 1];
                    if (!(continuation instanceof Function)) {
                        throw new Error("asynchronous function called synchronously");
                    }
                    asyncShouldOutput('o = {}\no.f!() = "result"\n\nprint (o.f!())\n\ndone ()', "'result'", continuation);
                });
            });
            context("when the method is defined on an exiting object, but with an indexer", function() {
                return it("makes the method asynchronous anyway", function(continuation) {
                    var gen2_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                    continuation = arguments[arguments.length - 1];
                    if (!(continuation instanceof Function)) {
                        throw new Error("asynchronous function called synchronously");
                    }
                    asyncShouldOutput('o = {}\no."f"!() = "result"\n\nprint (o.f!())\n\ndone ()', "'result'", continuation);
                });
            });
            return context("when the method is defined as part of the object expression", function() {
                return it("makes the method asynchronous anyway", function(continuation) {
                    var gen3_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
                    continuation = arguments[arguments.length - 1];
                    if (!(continuation instanceof Function)) {
                        throw new Error("asynchronous function called synchronously");
                    }
                    asyncShouldOutput('o = {\n    f!() = "result"\n}\n\nprint (o.f!())\n\ndone ()', "'result'", continuation);
                });
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/asyncSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var script, asyncShouldOutput, shouldOutput;
    script = require("./scriptAssertions");
    asyncShouldOutput = script.asyncShouldOutput;
    shouldOutput = script.shouldOutput;
    describe("async", function() {
        it("can make one async call in statements", function(done) {
            return asyncShouldOutput('f (callback) =\n    process.next tick\n        callback (nil, "result")\n       \nx = f ()!\nprint (x)\ndone ()', "'result'", done);
        });
        it("can make two async calls in a row", function(done) {
            return asyncShouldOutput('aprint! (msg) =\n    async!\n    print (msg)\n\naprint! "one"\naprint! "two"\nprint "finished"\ndone ()', "'one'\n'two'\n'finished'", done);
        });
        it("can make one async call as argument to another function", function(done) {
            return asyncShouldOutput('f (callback) =\n    process.next tick\n        callback (nil, "result")\n       \nprint (f ()!)\ndone ()', "'result'", done);
        });
        it("it only exits once", function(done) {
            return asyncShouldOutput("do stuff! =\n    async!\n    process.next tick!\n    async!\n\ndo stuff!\n\nprint 'finished'\ndone ()", "'finished'", done);
        });
        it("single async call can be made in scopified assignment", function(done) {
            return asyncShouldOutput("f!() = 8\n\nx =\n    f!()\n\nprint (x)\n\ndone ()", "8", done);
        });
        it("async call expression can be made in scopified assignment", function(done) {
            return asyncShouldOutput("f!() = 8\n\nx =\n    f!() * 2\n\nprint (x)\n\ndone ()", "16", done);
        });
        it("statements including async call can be made in scopified assignment", function(done) {
            return asyncShouldOutput("f!() = 8\n\nx =\n    n = f!()\n    n * 2\n\nprint (x)\n\ndone ()", "16", done);
        });
        it("it can chain async methods", function(done) {
            return asyncShouldOutput("one!() =\n    async!()\n    {\n        two!() =\n            async!()\n            'finished'\n    }\n\nprint (one!().two!())\ndone ()", "'finished'", done);
        });
        it("throws if async function is not called asynchronously", function() {
            return function() {
                return shouldOutput("f!() = 12\n\nprint (f ())", "'finished'");
            }.should.throw("asynchronous function called synchronously");
        });
        it("an async function returns its result in a callback", function(done) {
            return asyncShouldOutput("as (f) =\n    process.next tick\n        f (nil, 4)\n\nfn () =\n    as ()!\n\nprint (fn ()!)\ndone ()", "4", done);
        });
        it("an async function can be passed an async block, which in turn returns its result in a callback", function(done) {
            return asyncShouldOutput('tick (callback) =\n    process.next tick\n        callback ()\n\nasync fun (block, callback) =\n    block (callback)\n\nresult = async fun!\n    tick!\n    "result"\n\nprint (result)\ndone ()', "'result'", done);
        });
        it("an async method call works in the same way as an async function call", function(done) {
            return asyncShouldOutput('async!\nprint "finished"\ndone ()', "'finished'", done);
        });
        it("makes a block asynchronous if it contains async statements", function(done) {
            return asyncShouldOutput('print result (block) =\n    block @(error, result)\n        print (result)\n        done ()\n\nprint result\n    async!\n    "finished"', "'finished'", done);
        });
        context("when an async function is called with a block", function() {
            return it("asyncifies the block", function(done) {
                return asyncShouldOutput('func! (block) = block!\n\nf = func!\n    "asdf"\n\nprint (f)\ndone ()', "'asdf'", done);
            });
        });
        it("thrown exceptions are passed to the error argument of the callback", function(done) {
            return asyncShouldOutput('f () =\n    async!\n    throw (new (Error "thing"))\n\nf(done)', "", function(error) {
                error.message.should.equal("thing");
                return done();
            });
        });
        describe("if statements", function() {
            it("if statements with async bodies wait until the body has finished", function(done) {
                return asyncShouldOutput('if (true)\n    async!\n    print "one"\n\nprint "two"\ndone ()', "'one'\n'two'", done);
            });
            it("if statements with async bodies and an else body wait until the body has finished", function(done) {
                return asyncShouldOutput('if (false)\n    async!\n    print "one"\nelse\n    print "two"\n\nprint "three"\ndone ()', "'two'\n'three'", done);
            });
            it("if else if else statements with async bodies wait until the body has finished", function(done) {
                return asyncShouldOutput('if (false)\n    async!\n    print "one"\nelse if (false)\n    async!\n    print "two"\nelse\n    async!\n    print "three"\n\nprint "four"\ndone ()', "'three'\n'four'", done);
            });
            return context("without else clause inside async function", function() {
                return it("returns via callback when condition is false", function(done) {
                    return asyncShouldOutput('f! =\n    if (false)\n        "result"\n\nf!\ndone ()', "", done);
                });
            });
        });
        describe("try statements", function() {
            return it("waits for the body to finish", function(done) {
                return asyncShouldOutput('try\n    async!\n    print "one"\ncatch (error)\n    async!\n    print (error)\nfinally\n    async!\n    print "finally"\n\nprint "finished"\ndone ()', "'one'\n'finally'\n'finished'", done);
            });
        });
        describe("while expression", function() {
            it("executes each loop one after the other", function(done) {
                return asyncShouldOutput("condition = true\nget condition! = condition\n\nwhile (get condition!)\n    print 'loop'\n    async!\n    condition := false\n\ndone ()", "'loop'", done);
            });
            return it("completes the function as the last statement", function(done) {
                return asyncShouldOutput("f! () =\n    while (false)\n        never here ()\n\nf! ()\ndone ()", "", done);
            });
        });
        describe("for expression", function() {
            it("executes each loop one after the other", function(done) {
                return asyncShouldOutput("for (n = 0, n < 3, ++n)\n    print ('before: ' + n)\n    async!\n    print ('after: ' + n)\n\ndone ()", "'before: 0'\n'after: 0'\n'before: 1'\n'after: 1'\n'before: 2'\n'after: 2'", done);
            });
            it("completes the function as the last statement", function(done) {
                return asyncShouldOutput("f! () =\n    for (n = 0, n < 3, ++n)\n        print 'loop'\n\nf! ()\ndone ()", "'loop'\n'loop'\n'loop'", done);
            });
            return it("doesn't return as last statement if body contains continuation", function(done) {
                return asyncShouldOutput("repeat! (times) times =\n    for (n = 0, n < times, ++n)\n        continuation (nil, n)\n\nn = repeat! 1 times\n\nprint (n)\ndone ()", "0", done);
            });
        });
        describe("for each expression", function() {
            it("executes each loop one after the other", function(done) {
                return asyncShouldOutput("for each @(n) in [0, 1, 2]\n    print ('before: ' + n)\n    async!\n    print ('after: ' + n)\n\ndone ()", "'before: 0'\n'after: 0'\n'before: 1'\n'after: 1'\n'before: 2'\n'after: 2'", done);
            });
            it("completes the function as the last statement", function(done) {
                return asyncShouldOutput("f! () =\n    for each @(n) in [0, 1, 2]\n        print ('before: ' + n)\n        async!\n        print ('after: ' + n)\n\nf! ()\ndone ()", "'before: 0'\n'after: 0'\n'before: 1'\n'after: 1'\n'before: 2'\n'after: 2'", done);
            });
            return it("doesn't return as last statement if body contains continuation", function(done) {
                return asyncShouldOutput("repeat! (times) times =\n    for each @(n) in [0]\n        continuation (nil, n)\n\nn = repeat! 1 times\n\nprint (n)\ndone ()", "0", done);
            });
        });
        describe("for in expression", function() {
            it("completes the function as the last statement", function(done) {
                return asyncShouldOutput("f! () =\n    for @(n) in {a = 1, b = 2}\n        print (n)\n\nf! ()\ndone ()", "'a'\n'b'", done);
            });
            return it("doesn't return as last statement if body contains continuation", function(done) {
                return asyncShouldOutput("repeat! (times) times =\n    for @(n) in {a = 1}\n        continuation (nil, n)\n\nn = repeat! 1 times\n\nprint (n)\ndone ()", "'a'", done);
            });
        });
        describe("splat arguments", function() {
            return it("can handle splat arguments in an async function", function(done) {
                return asyncShouldOutput("f! (a, ...) =\n    a\n\nprint (f! (1, 2, 3))\ndone ()", "[ 1, 2, 3 ]", done);
            });
        });
        describe("return", function() {
            return context("when in an async function", function() {
                return it("is rewritten to call the callback", function(done) {
                    return asyncShouldOutput('f! =\n    return "result"\n\nprint (f!)\ndone ()', "'result'", done);
                });
            });
        });
        return describe("continuation", function() {
            it("can be called in an async function as the callback", function(done) {
                return asyncShouldOutput('f! =\n    continuation (nil, "result")\n\nprint (f!)\ndone ()', "'result'", done);
            });
            it("can be passed to another function as the callback", function(done) {
                return asyncShouldOutput('g! = "result"\n\nf! = g (continuation)\n\nprint (f!)\ndone ()', "'result'", done);
            });
            it("can be called within another closure", function(done) {
                return asyncShouldOutput('g (block) = block ("result")\n\nf! = g @(result)\n    continuation (nil, result)\n\nprint (f!)\ndone ()', "'result'", done);
            });
            it("but can't be called within another async closure", function(done) {
                return asyncShouldOutput('g! (block) = "g #(block!)"\n\nf! = g!\n    continuation (nil, "result")\n\nprint (f!)\ndone ()', "'g result'", done);
            });
            context("when not the last statement", function() {
                return it("the callback isn't called on the last statement", function(done) {
                    return asyncShouldOutput('f! =\n    continuation (nil, "result")\n    "non result"\n\nprint (f!)\ndone ()', "'result'", done);
                });
            });
            context("when continuation is after async call", function() {
                it("doesn't call the callback on the last statement", function(done) {
                    return asyncShouldOutput('g! = "result"\n                \nf! =\n    g!\n    continuation (nil, "result")\n    "non result"\n\nprint (f!)\ndone ()', "'result'", done);
                });
                return context("and the async call raises an error", function() {
                    return it("raises an error on the callback", function(done) {
                        return asyncShouldOutput('g (callback) = callback (@new Error "argh!")\n                    \nf! =\n    g!\n    continuation (nil, "result")\n    "non result"\n\ntry\n    f!\ncatch (e)\n    print (e.message)\n\ndone ()', "'argh!'", done);
                    });
                });
            });
            context("when continuation is in the body and an exception is thrown", function() {
                return it("raises the exception", function(done) {
                    return asyncShouldOutput('f! =\n    @throw @new Error "argh!"\n    continuation (nil, "result")\n    "non result"\n\ntry\n    f!\ncatch (e)\n    print (e.message)\n\ndone ()', "'argh!'", done);
                });
            });
            return context("when continuation is in the body, and async call is last", function() {
                it("doesn't return on the last statement", function(done) {
                    return asyncShouldOutput('g! = "non result"\n                \nf! =\n    continuation (nil, "result")\n    g!\n\nprint (f!)\ndone ()', "'result'", done);
                });
                return it("raises error if async call raises error", function(done) {
                    return asyncShouldOutput('e (callback) = callback (@new Error "argh!")\n                \nf! =\n    continuation (nil, "result")\n    e!\n\nf @(error, result)\n    if (result)\n        print (result)\n\n    if (error)\n        print (error.message)\n        done ()', "'result'\n'argh!'", done);
                });
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/asyncStatementsSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var terms, shouldContainFields;
    terms = require("../lib/parser/codeGenerator").codeGenerator();
    shouldContainFields = require("./containsFields").containsFields;
    describe("async statements", function() {
        describe("serialising sub statements", function() {
            it("serialises sub statements", function() {
                var statements;
                statements = terms.asyncStatements([ terms.subStatements([ terms.variable([ "a" ]), terms.variable([ "b" ]) ]) ]);
                return shouldContainFields(statements, terms.statements([ terms.variable([ "a" ]), terms.variable([ "b" ]) ]));
            });
            it("serialises sub statements inside sub statements", function() {
                var statements;
                statements = terms.asyncStatements([ terms.subStatements([ terms.subStatements([ terms.variable([ "a" ]), terms.variable([ "b" ]) ]), terms.variable([ "c" ]) ]) ]);
                return shouldContainFields(statements, terms.statements([ terms.variable([ "a" ]), terms.variable([ "b" ]), terms.variable([ "c" ]) ]));
            });
            it("serialises sub statements inside sub statements, even if they are the last statement", function() {
                var statements;
                statements = terms.asyncStatements([ terms.subStatements([ terms.variable([ "a" ]), terms.subStatements([ terms.variable([ "b" ]), terms.variable([ "c" ]) ]) ]) ]);
                return shouldContainFields(statements, terms.statements([ terms.variable([ "a" ]), terms.variable([ "b" ]), terms.variable([ "c" ]) ]));
            });
            return it("doesn't serialise sub statements in inner blocks", function() {
                var statements;
                statements = terms.asyncStatements([ terms.statements([ terms.subStatements([ terms.variable([ "a" ]), terms.variable([ "b" ]) ]) ]) ]);
                return shouldContainFields(statements, terms.statements([ terms.statements([ terms.subStatements([ terms.variable([ "a" ]), terms.variable([ "b" ]) ]) ]) ]));
            });
        });
        return describe("rewriting async calls into calls with callbacks", function() {
            describe("when there are no async calls", function() {
                return it("doesn't do anything", function() {
                    var statements;
                    statements = terms.asyncStatements([ terms.variable([ "a" ]), terms.variable([ "b" ]) ]);
                    return shouldContainFields(statements, terms.statements([ terms.variable([ "a" ]), terms.variable([ "b" ]) ]));
                });
            });
            describe("when there is one async call, with no statements after it", function() {
                return it("passes the outer callback function as the last argument", function() {
                    var statements;
                    statements = terms.asyncStatements([ terms.functionCall(terms.variable([ "async", "func" ]), [ terms.variable([ "arg" ]) ], {
                        async: true
                    }) ]);
                    return shouldContainFields(statements, terms.statements([ terms.functionCall(terms.variable([ "async", "func" ]), [ terms.variable([ "arg" ]) ], {
                        originallyAsync: true,
                        asyncCallbackArgument: terms.callbackFunction
                    }) ], {
                        async: true
                    }));
                });
            });
            return describe("when there are statements after the async call", function() {
                return it("puts them into a callback and passes the callback as the last argument", function() {
                    var statements;
                    statements = terms.asyncStatements([ terms.functionCall(terms.variable([ "async", "func" ]), [ terms.variable([ "arg" ]) ], {
                        async: true
                    }), terms.functionCall(terms.variable([ "another", "func" ]), []) ]);
                    return shouldContainFields(statements, terms.statements([ terms.functionCall(terms.variable([ "async", "func" ]), [ terms.variable([ "arg" ]) ], {
                        originallyAsync: true,
                        asyncCallbackArgument: terms.asyncCallback(terms.statements([ terms.asyncResult(), terms.functionCall(terms.variable([ "another", "func" ]), []) ]), {
                            resultVariable: terms.asyncResult()
                        })
                    }) ], {
                        async: true
                    }));
                });
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/asyncTrySpec.js", function(exports, require, module){
(function() {
    var self = this;
    var async, should;
    async = require("../lib/asyncControl");
    should = require("should");
    describe("try statement", function() {
        var throws, returnsError, returns, doesNothing, whenTheThenAndWhenFinished;
        throws = function(error) {
            var withCallback;
            return withCallback = function(callback) {
                throw error;
            };
        };
        returnsError = function(error) {
            var withCallback;
            return withCallback = function(callback) {
                return callback(error);
            };
        };
        returns = function(result) {
            var withCallback;
            return withCallback = function(callback) {
                return callback(void 0, result);
            };
        };
        doesNothing = function(callback) {
            return callback();
        };
        whenTheThenAndWhenFinished = function(assertions, done, gen1_options) {
            var body, catchBody, finallyBody;
            body = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "body") && gen1_options.body !== void 0 ? gen1_options.body : void 0;
            catchBody = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "catchBody") && gen1_options.catchBody !== void 0 ? gen1_options.catchBody : void 0;
            finallyBody = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "finallyBody") && gen1_options.finallyBody !== void 0 ? gen1_options.finallyBody : void 0;
            var catchBodyExecuted, caughtError, finallyBodyExecuted, catchClause, finallyClause;
            catchBodyExecuted = false;
            caughtError = void 0;
            finallyBodyExecuted = false;
            catchClause = function() {
                if (catchBody) {
                    return function(error, callback) {
                        should.equal(catchBodyExecuted, false);
                        catchBodyExecuted = true;
                        caughtError = error;
                        return catchBody(callback);
                    };
                }
            }();
            finallyClause = function() {
                if (finallyBody) {
                    return function(callback) {
                        should.equal(finallyBodyExecuted, false);
                        finallyBodyExecuted = true;
                        return finallyBody(callback);
                    };
                }
            }();
            return async.try(function(callback) {
                return body(callback);
            }, catchClause, finallyClause, function(error, result) {
                try {
                    should.equal(catchBodyExecuted, assertions.catchBodyExecuted || false);
                    should.equal(finallyBodyExecuted, assertions.finallyBodyExecuted || false);
                    should.equal(caughtError, assertions.caughtError);
                    should.equal(result, assertions.result);
                    should.equal(error, assertions.error);
                    return done();
                } catch (error) {
                    return done(error);
                }
            });
        };
        context("with only a catch clause", function() {
            context("body returns", function() {
                return it("doesn't execute the catch body", function(done) {
                    return whenTheThenAndWhenFinished({
                        result: "result"
                    }, done, {
                        body: returns("result"),
                        catchBody: doesNothing
                    });
                });
            });
            context("body throws", function() {
                context("catch returns", function() {
                    return it("returns the catch result", function(done) {
                        return whenTheThenAndWhenFinished({
                            catchBodyExecuted: true,
                            caughtError: "error",
                            result: "catch result"
                        }, done, {
                            body: throws("error"),
                            catchBody: returns("catch result")
                        });
                    });
                });
                context("catch throws", function() {
                    return it("returns the catch error", function(done) {
                        return whenTheThenAndWhenFinished({
                            catchBodyExecuted: true,
                            caughtError: "error",
                            error: "catch error"
                        }, done, {
                            body: throws("error"),
                            catchBody: throws("catch error")
                        });
                    });
                });
                return context("catch returns error", function() {
                    return it("returns the catch error", function(done) {
                        return whenTheThenAndWhenFinished({
                            catchBodyExecuted: true,
                            caughtError: "error",
                            error: "catch error"
                        }, done, {
                            body: throws("error"),
                            catchBody: returnsError("catch error")
                        });
                    });
                });
            });
            return context("body returns error", function() {
                context("catch returns", function() {
                    return it("returns the catch result", function(done) {
                        return whenTheThenAndWhenFinished({
                            catchBodyExecuted: true,
                            caughtError: "error",
                            result: "catch result"
                        }, done, {
                            body: returnsError("error"),
                            catchBody: returns("catch result")
                        });
                    });
                });
                context("catch throws", function() {
                    return it("returns the catch error", function(done) {
                        return whenTheThenAndWhenFinished({
                            catchBodyExecuted: true,
                            caughtError: "error",
                            error: "catch error"
                        }, done, {
                            body: returnsError("error"),
                            catchBody: throws("catch error")
                        });
                    });
                });
                return context("catch returns error", function() {
                    return it("returns the catch error", function(done) {
                        return whenTheThenAndWhenFinished({
                            catchBodyExecuted: true,
                            caughtError: "error",
                            error: "catch error"
                        }, done, {
                            body: returnsError("error"),
                            catchBody: returnsError("catch error")
                        });
                    });
                });
            });
        });
        context("with only a finally clause", function() {
            context("body returns", function() {
                context("finally returns", function() {
                    return it("executes the finally body and returns body result", function(done) {
                        return whenTheThenAndWhenFinished({
                            finallyBodyExecuted: true,
                            result: "result"
                        }, done, {
                            body: returns("result"),
                            finallyBody: returns("finally result")
                        });
                    });
                });
                context("finally throws", function() {
                    return it("executes the finally body and returns finally thrown error", function(done) {
                        return whenTheThenAndWhenFinished({
                            finallyBodyExecuted: true,
                            error: "finally error"
                        }, done, {
                            body: returns("result"),
                            finallyBody: throws("finally error")
                        });
                    });
                });
                return context("finally returns error", function() {
                    return it("executes the finally body and returns finally returned error", function(done) {
                        return whenTheThenAndWhenFinished({
                            finallyBodyExecuted: true,
                            error: "finally error"
                        }, done, {
                            body: returns("result"),
                            finallyBody: returnsError("finally error")
                        });
                    });
                });
            });
            context("body throws", function() {
                context("finally returns", function() {
                    return it("executes the finally body and returns body error", function(done) {
                        return whenTheThenAndWhenFinished({
                            finallyBodyExecuted: true,
                            error: "error"
                        }, done, {
                            body: throws("error"),
                            finallyBody: returns("finally result")
                        });
                    });
                });
                context("finally throws", function() {
                    return it("executes the finally body and returns finally thrown error", function(done) {
                        return whenTheThenAndWhenFinished({
                            finallyBodyExecuted: true,
                            error: "finally error"
                        }, done, {
                            body: throws("error"),
                            finallyBody: throws("finally error")
                        });
                    });
                });
                return context("finally returns error", function() {
                    return it("executes the finally body and returns finally returned error", function(done) {
                        return whenTheThenAndWhenFinished({
                            finallyBodyExecuted: true,
                            error: "finally error"
                        }, done, {
                            body: throws("error"),
                            finallyBody: returnsError("finally error")
                        });
                    });
                });
            });
            return context("body returns error", function() {
                context("finally returns", function() {
                    return it("executes the finally body and returns body returned error", function(done) {
                        return whenTheThenAndWhenFinished({
                            finallyBodyExecuted: true,
                            error: "error"
                        }, done, {
                            body: returnsError("error"),
                            finallyBody: returns("finally result")
                        });
                    });
                });
                context("finally throws", function() {
                    return it("executes the finally body and returns finally thrown error", function(done) {
                        return whenTheThenAndWhenFinished({
                            finallyBodyExecuted: true,
                            error: "finally error"
                        }, done, {
                            body: returnsError("error"),
                            finallyBody: throws("finally error")
                        });
                    });
                });
                return context("finally returns error", function() {
                    return it("executes the finally body and returns finally returned error", function(done) {
                        return whenTheThenAndWhenFinished({
                            finallyBodyExecuted: true,
                            error: "finally error"
                        }, done, {
                            body: returnsError("error"),
                            finallyBody: returnsError("finally error")
                        });
                    });
                });
            });
        });
        return context("with catch and finally clauses", function() {
            context("body returns", function() {
                context("finally returns", function() {
                    return it("executes the finally body and returns body result", function(done) {
                        return whenTheThenAndWhenFinished({
                            finallyBodyExecuted: true,
                            result: "result"
                        }, done, {
                            body: returns("result"),
                            catchBody: doesNothing,
                            finallyBody: returns("finally result")
                        });
                    });
                });
                context("finally throws", function() {
                    return it("executes the finally body and returns finally thrown error", function(done) {
                        return whenTheThenAndWhenFinished({
                            finallyBodyExecuted: true,
                            error: "finally error"
                        }, done, {
                            body: returns("result"),
                            catchBody: doesNothing,
                            finallyBody: throws("finally error")
                        });
                    });
                });
                return context("finally returns error", function() {
                    return it("executes the finally body and returns finally returned error", function(done) {
                        return whenTheThenAndWhenFinished({
                            finallyBodyExecuted: true,
                            error: "finally error"
                        }, done, {
                            body: returns("result"),
                            catchBody: doesNothing,
                            finallyBody: returnsError("finally error")
                        });
                    });
                });
            });
            context("body throws", function() {
                context("catch returns", function() {
                    context("finally returns", function() {
                        return it("executes the finally body and returns catch result", function(done) {
                            return whenTheThenAndWhenFinished({
                                catchBodyExecuted: true,
                                caughtError: "error",
                                finallyBodyExecuted: true,
                                result: "catch result"
                            }, done, {
                                body: throws("error"),
                                catchBody: returns("catch result"),
                                finallyBody: returns("finally result")
                            });
                        });
                    });
                    context("finally throws", function() {
                        return it("executes the finally body and returns finally thrown error", function(done) {
                            return whenTheThenAndWhenFinished({
                                catchBodyExecuted: true,
                                caughtError: "error",
                                finallyBodyExecuted: true,
                                error: "finally error"
                            }, done, {
                                body: throws("error"),
                                catchBody: returns("catch result"),
                                finallyBody: throws("finally error")
                            });
                        });
                    });
                    return context("finally returns error", function() {
                        return it("executes the finally body and returns finally returned error", function(done) {
                            return whenTheThenAndWhenFinished({
                                catchBodyExecuted: true,
                                caughtError: "error",
                                finallyBodyExecuted: true,
                                error: "finally error"
                            }, done, {
                                body: throws("error"),
                                catchBody: returns("catch result"),
                                finallyBody: returnsError("finally error")
                            });
                        });
                    });
                });
                context("catch throws", function() {
                    context("finally returns", function() {
                        return it("executes the finally body and returns catch result", function(done) {
                            return whenTheThenAndWhenFinished({
                                catchBodyExecuted: true,
                                caughtError: "error",
                                finallyBodyExecuted: true,
                                error: "catch error"
                            }, done, {
                                body: throws("error"),
                                catchBody: throws("catch error"),
                                finallyBody: returns("finally result")
                            });
                        });
                    });
                    context("finally throws", function() {
                        return it("executes the finally body and returns finally thrown error", function(done) {
                            return whenTheThenAndWhenFinished({
                                catchBodyExecuted: true,
                                caughtError: "error",
                                finallyBodyExecuted: true,
                                error: "finally error"
                            }, done, {
                                body: throws("error"),
                                catchBody: throws("catch error"),
                                finallyBody: throws("finally error")
                            });
                        });
                    });
                    return context("finally returns error", function() {
                        return it("executes the finally body and returns finally returned error", function(done) {
                            return whenTheThenAndWhenFinished({
                                catchBodyExecuted: true,
                                caughtError: "error",
                                finallyBodyExecuted: true,
                                error: "finally error"
                            }, done, {
                                body: throws("error"),
                                catchBody: throws("catch error"),
                                finallyBody: returnsError("finally error")
                            });
                        });
                    });
                });
                return context("catch returns error", function() {
                    context("finally returns", function() {
                        return it("executes the finally body and returns catch result", function(done) {
                            return whenTheThenAndWhenFinished({
                                catchBodyExecuted: true,
                                caughtError: "error",
                                finallyBodyExecuted: true,
                                error: "catch error"
                            }, done, {
                                body: throws("error"),
                                catchBody: returnsError("catch error"),
                                finallyBody: returns("finally result")
                            });
                        });
                    });
                    context("finally throws", function() {
                        return it("executes the finally body and returns finally thrown error", function(done) {
                            return whenTheThenAndWhenFinished({
                                catchBodyExecuted: true,
                                caughtError: "error",
                                finallyBodyExecuted: true,
                                error: "finally error"
                            }, done, {
                                body: throws("error"),
                                catchBody: returnsError("catch error"),
                                finallyBody: throws("finally error")
                            });
                        });
                    });
                    return context("finally returns error", function() {
                        return it("executes the finally body and returns finally returned error", function(done) {
                            return whenTheThenAndWhenFinished({
                                catchBodyExecuted: true,
                                caughtError: "error",
                                finallyBodyExecuted: true,
                                error: "finally error"
                            }, done, {
                                body: throws("error"),
                                catchBody: returnsError("catch error"),
                                finallyBody: returnsError("finally error")
                            });
                        });
                    });
                });
            });
            return context("body returns error", function() {
                context("catch returns", function() {
                    context("finally returns", function() {
                        return it("executes the finally body and returns catch result", function(done) {
                            return whenTheThenAndWhenFinished({
                                catchBodyExecuted: true,
                                caughtError: "error",
                                finallyBodyExecuted: true,
                                result: "catch result"
                            }, done, {
                                body: returnsError("error"),
                                catchBody: returns("catch result"),
                                finallyBody: returns("finally result")
                            });
                        });
                    });
                    context("finally throws", function() {
                        return it("executes the finally body and returns finally thrown error", function(done) {
                            return whenTheThenAndWhenFinished({
                                catchBodyExecuted: true,
                                caughtError: "error",
                                finallyBodyExecuted: true,
                                error: "finally error"
                            }, done, {
                                body: returnsError("error"),
                                catchBody: returns("catch result"),
                                finallyBody: throws("finally error")
                            });
                        });
                    });
                    return context("finally returns error", function() {
                        return it("executes the finally body and returns finally returned error", function(done) {
                            return whenTheThenAndWhenFinished({
                                catchBodyExecuted: true,
                                caughtError: "error",
                                finallyBodyExecuted: true,
                                error: "finally error"
                            }, done, {
                                body: returnsError("error"),
                                catchBody: returns("catch result"),
                                finallyBody: returnsError("finally error")
                            });
                        });
                    });
                });
                context("catch throws", function() {
                    context("finally returns", function() {
                        return it("executes the finally body and returns catch result", function(done) {
                            return whenTheThenAndWhenFinished({
                                catchBodyExecuted: true,
                                caughtError: "error",
                                finallyBodyExecuted: true,
                                error: "catch error"
                            }, done, {
                                body: returnsError("error"),
                                catchBody: throws("catch error"),
                                finallyBody: returns("finally result")
                            });
                        });
                    });
                    context("finally throws", function() {
                        return it("executes the finally body and returns finally thrown error", function(done) {
                            return whenTheThenAndWhenFinished({
                                catchBodyExecuted: true,
                                caughtError: "error",
                                finallyBodyExecuted: true,
                                error: "finally error"
                            }, done, {
                                body: returnsError("error"),
                                catchBody: throws("catch error"),
                                finallyBody: throws("finally error")
                            });
                        });
                    });
                    return context("finally returns error", function() {
                        return it("executes the finally body and returns finally returned error", function(done) {
                            return whenTheThenAndWhenFinished({
                                catchBodyExecuted: true,
                                caughtError: "error",
                                finallyBodyExecuted: true,
                                error: "finally error"
                            }, done, {
                                body: returnsError("error"),
                                catchBody: throws("catch error"),
                                finallyBody: returnsError("finally error")
                            });
                        });
                    });
                });
                return context("catch returns error", function() {
                    context("finally returns", function() {
                        return it("executes the finally body and returns catch result", function(done) {
                            return whenTheThenAndWhenFinished({
                                catchBodyExecuted: true,
                                caughtError: "error",
                                finallyBodyExecuted: true,
                                error: "catch error"
                            }, done, {
                                body: returnsError("error"),
                                catchBody: returnsError("catch error"),
                                finallyBody: returns("finally result")
                            });
                        });
                    });
                    context("finally throws", function() {
                        return it("executes the finally body and returns finally thrown error", function(done) {
                            return whenTheThenAndWhenFinished({
                                catchBodyExecuted: true,
                                caughtError: "error",
                                finallyBodyExecuted: true,
                                error: "finally error"
                            }, done, {
                                body: returnsError("error"),
                                catchBody: returnsError("catch error"),
                                finallyBody: throws("finally error")
                            });
                        });
                    });
                    return context("finally returns error", function() {
                        return it("executes the finally body and returns finally returned error", function(done) {
                            return whenTheThenAndWhenFinished({
                                catchBodyExecuted: true,
                                caughtError: "error",
                                finallyBodyExecuted: true,
                                error: "finally error"
                            }, done, {
                                body: returnsError("error"),
                                catchBody: returnsError("catch error"),
                                finallyBody: returnsError("finally error")
                            });
                        });
                    });
                });
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/asyncWhileSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var async, should;
    async = require("../lib/asyncControl");
    should = require("should");
    describe("while statement", function() {
        var throws, returnsError, returns, returnsTrue, returnsFalse, doesNothing, whenWhileHasTheFollowingLoopsThenAndDone;
        throws = function(error) {
            var withCallback;
            return withCallback = function(callback) {
                throw error;
            };
        };
        returnsError = function(error) {
            var withCallback;
            return withCallback = function(callback) {
                return callback(error);
            };
        };
        returns = function(result) {
            var withCallback;
            return withCallback = function(callback) {
                return callback(void 0, result);
            };
        };
        returnsTrue = returns(true);
        returnsFalse = returns(false);
        doesNothing = function(callback) {
            return callback();
        };
        whenWhileHasTheFollowingLoopsThenAndDone = function(loops, assertions, done) {
            var currentLoopIndex, loopsExecuted, currentLoop, condition, loop;
            currentLoopIndex = 0;
            loopsExecuted = 0;
            currentLoop = void 0;
            condition = function(callback) {
                currentLoop = loops[currentLoopIndex];
                ++currentLoopIndex;
                return currentLoop.condition(callback);
            };
            loop = function(callback) {
                ++loopsExecuted;
                return currentLoop.loop(callback);
            };
            return async.while(condition, loop, function(error, result) {
                try {
                    should.equal(error, assertions.error);
                    should.equal(result, void 0);
                    should.equal(loopsExecuted, assertions.loopsExecuted);
                    return done();
                } catch (error) {
                    return done(error);
                }
            });
        };
        context("condition starts false", function() {
            return it("skips the while statement", function(done) {
                return whenWhileHasTheFollowingLoopsThenAndDone([ {
                    condition: returnsFalse,
                    loop: doesNothing
                } ], {
                    loopsExecuted: 0
                }, done);
            });
        });
        context("when the condition is true for the first 5 times", function() {
            return it("executes the loop once", function(done) {
                return whenWhileHasTheFollowingLoopsThenAndDone([ {
                    condition: returnsTrue,
                    loop: doesNothing
                }, {
                    condition: returnsTrue,
                    loop: doesNothing
                }, {
                    condition: returnsTrue,
                    loop: doesNothing
                }, {
                    condition: returnsTrue,
                    loop: doesNothing
                }, {
                    condition: returnsTrue,
                    loop: doesNothing
                }, {
                    condition: returnsFalse,
                    loop: doesNothing
                } ], {
                    loopsExecuted: 5
                }, done);
            });
        });
        context("condition returns true", function() {
            context("loop returns", function() {
                return it("ignores the loop result", function(done) {
                    return whenWhileHasTheFollowingLoopsThenAndDone([ {
                        condition: returnsTrue,
                        loop: returns("result 1")
                    }, {
                        condition: returnsTrue,
                        loop: returns("result 2")
                    }, {
                        condition: returnsFalse,
                        loop: returns("result 3")
                    } ], {
                        loopsExecuted: 2
                    }, done);
                });
            });
            context("loop throws", function() {
                return it("returns the loop error", function(done) {
                    return whenWhileHasTheFollowingLoopsThenAndDone([ {
                        condition: returnsTrue,
                        loop: throws("error")
                    }, {
                        condition: returnsTrue,
                        loop: returns("result 2")
                    }, {
                        condition: returnsFalse,
                        loop: returns("result 3")
                    } ], {
                        loopsExecuted: 1,
                        error: "error"
                    }, done);
                });
            });
            return context("loop returns error", function() {
                return it("returns the loop error", function(done) {
                    return whenWhileHasTheFollowingLoopsThenAndDone([ {
                        condition: returnsTrue,
                        loop: returnsError("error")
                    }, {
                        condition: returnsTrue,
                        loop: returns("result 2")
                    }, {
                        condition: returnsFalse,
                        loop: returns("result 3")
                    } ], {
                        loopsExecuted: 1,
                        error: "error"
                    }, done);
                });
            });
        });
        context("condition throws", function() {
            return it("ignores the loop result", function(done) {
                return whenWhileHasTheFollowingLoopsThenAndDone([ {
                    condition: throws("condition error"),
                    loop: doesNothing
                } ], {
                    loopsExecuted: 0,
                    error: "condition error"
                }, done);
            });
        });
        return context("condition returns error", function() {
            return it("ignores the loop result", function(done) {
                return whenWhileHasTheFollowingLoopsThenAndDone([ {
                    condition: returnsError("condition error"),
                    loop: doesNothing
                } ], {
                    loopsExecuted: 0,
                    error: "condition error"
                }, done);
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/basicExpressionSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var cg, should;
    cg = require("../lib/parser/codeGenerator").codeGenerator();
    require("./assertions");
    should = require("should");
    describe("basic expression", function() {
        var withTerminalsShouldNotHaveArguments, withTerminalsShouldHaveArguments, variable, block, id, int, string, asyncArgument;
        withTerminalsShouldNotHaveArguments = function(terminals) {
            var ex;
            ex = cg.basicExpression(terminals);
            return shouldBeFalsy(ex.hasArguments());
        };
        withTerminalsShouldHaveArguments = function(terminals) {
            var ex;
            ex = cg.basicExpression(terminals);
            return shouldBeTruthy(ex.hasArguments());
        };
        variable = cg.variable([ "a" ]);
        block = cg.block([], cg.statements([ variable ]));
        id = function(name) {
            return cg.identifier(name);
        };
        int = function(n) {
            return cg.integer(n);
        };
        string = function(n) {
            return cg.string(n);
        };
        asyncArgument = cg.asyncArgument();
        describe("has arguments", function() {
            it("with one variable", function() {
                return withTerminalsShouldHaveArguments([ variable ]);
            });
            it("with a block", function() {
                return withTerminalsShouldHaveArguments([ block ]);
            });
            it("with name and a block", function() {
                return withTerminalsShouldHaveArguments([ id("c"), block ]);
            });
            it("with name, no arguments but an async argument", function() {
                return withTerminalsShouldHaveArguments([ id("c"), asyncArgument ]);
            });
            return it("with name and empty argument list", function() {
                return withTerminalsShouldHaveArguments([ id("c"), cg.argumentList([]) ]);
            });
        });
        describe("doesnt have arguments", function() {
            it("with just an identifier", function() {
                return withTerminalsShouldNotHaveArguments([ id("a") ]);
            });
            return it("with two identifiers", function() {
                return withTerminalsShouldNotHaveArguments([ id("a"), id("b") ]);
            });
        });
        describe("arguments", function() {
            var terminalsShouldHaveArguments;
            terminalsShouldHaveArguments = function(terminals, arguments) {
                return shouldContainFields(cg.basicExpression(terminals).arguments(), arguments);
            };
            it("single variable", function() {
                return terminalsShouldHaveArguments([ variable ], [ variable ]);
            });
            it("variable with name", function() {
                return terminalsShouldHaveArguments([ id("move"), variable ], [ variable ]);
            });
            it("with name and empty argument list", function() {
                return terminalsShouldHaveArguments([ id("c"), cg.argumentList([]) ], []);
            });
            it("block", function() {
                return terminalsShouldHaveArguments([ block ], [ {
                    isBlock: true,
                    body: {
                        statements: [ {
                            isVariable: true,
                            variable: [ "a" ]
                        } ]
                    }
                } ]);
            });
            it("block with a parameter", function() {
                return terminalsShouldHaveArguments([ cg.parameters([ cg.variable([ "x" ]) ]), block ], [ {
                    isBlock: true,
                    parameters: [ {
                        variable: [ "x" ]
                    } ],
                    body: {
                        statements: [ {
                            isVariable: true,
                            variable: [ "a" ]
                        } ]
                    }
                } ]);
            });
            return describe("having async argument", function() {
                it("has async argument when at end", function() {
                    return shouldBeTruthy(cg.basicExpression([ id("stuff"), asyncArgument ]).hasAsyncArgument());
                });
                return it("has async argument when in middle", function() {
                    return shouldBeTruthy(cg.basicExpression([ id("stuff"), asyncArgument, id("ok") ]).hasAsyncArgument());
                });
            });
        });
        describe("parameters", function() {
            var targetHasSomeParameters, targetDoesntHaveSomeParameters, targetHasParameters, targetHasOptionalParameters;
            targetHasSomeParameters = function(expression) {
                return shouldBeTruthy(cg.basicExpression(expression).hasParameters());
            };
            targetDoesntHaveSomeParameters = function(expression) {
                return shouldBeFalsy(cg.basicExpression(expression).hasParameters());
            };
            targetHasParameters = function(expression, parameters) {
                return shouldContainFields(cg.basicExpression(expression).parameters(), parameters);
            };
            targetHasOptionalParameters = function(expression, parameters) {
                return shouldContainFields(cg.basicExpression(expression).optionalParameters(), parameters);
            };
            it("single name", function() {
                return targetDoesntHaveSomeParameters([ id("car") ]);
            });
            describe("name and variable", function() {
                it("has parameters", function() {
                    return targetHasSomeParameters([ id("car"), variable ]);
                });
                return it("parameters", function() {
                    return targetHasParameters([ id("car"), variable ], [ {
                        variable: [ "a" ]
                    } ]);
                });
            });
            describe("name and optional", function() {
                it("has parameters", function() {
                    return targetHasSomeParameters([ id("car"), cg.hashEntry([ "colour" ], cg.variable([ "red" ])) ]);
                });
                it("parameters", function() {
                    return targetHasParameters([ id("car"), cg.hashEntry([ "colour" ], cg.variable([ "red" ])) ], []);
                });
                return it("optional parameters", function() {
                    return targetHasOptionalParameters([ id("car"), cg.hashEntry([ "colour" ], cg.variable([ "red" ])) ], [ {
                        field: [ "colour" ],
                        value: {
                            variable: [ "red" ]
                        }
                    } ]);
                });
            });
            describe("async argument", function() {
                it("has parameters", function() {
                    return targetHasSomeParameters([ id("car"), asyncArgument ]);
                });
                return it("parameters", function() {
                    return targetHasParameters([ id("car"), asyncArgument ], []);
                });
            });
            return describe("empty argument list", function() {
                it("has parameters", function() {
                    return targetHasSomeParameters([ id("car"), cg.argumentList([]) ]);
                });
                return it("parameters", function() {
                    return targetHasParameters([ id("car"), cg.argumentList([]) ], []);
                });
            });
        });
        describe("has name", function() {
            var terminalsShouldHaveAName;
            terminalsShouldHaveAName = function(terminals) {
                return shouldBeTruthy(cg.basicExpression(terminals).hasName());
            };
            return it("with two identifiers", function() {
                return terminalsShouldHaveAName([ id("car"), id("idle") ]);
            });
        });
        describe("name", function() {
            var terminalsShouldHaveName;
            terminalsShouldHaveName = function(terminals, name) {
                return shouldContainFields(cg.basicExpression(terminals).name(), name);
            };
            it("with two identifiers", function() {
                return terminalsShouldHaveName([ id("car"), id("idle") ], [ "car", "idle" ]);
            });
            return it("with two identifiers and arg", function() {
                return terminalsShouldHaveName([ id("car"), cg.variable([ "car" ]), id("idle") ], [ "car", "idle" ]);
            });
        });
        describe("hash entry", function() {
            var hashEntryShouldContainFields;
            hashEntryShouldContainFields = function(terminals, f) {
                return shouldContainFields(cg.basicExpression(terminals).hashEntry(), f);
            };
            it("with an argument", function() {
                return hashEntryShouldContainFields([ id("port"), int(10) ], {
                    isHashEntry: true,
                    field: [ "port" ],
                    value: {
                        integer: 10
                    }
                });
            });
            it("without an argument", function() {
                return hashEntryShouldContainFields([ id("port") ], {
                    isHashEntry: true,
                    field: [ "port" ],
                    value: undefined
                });
            });
            return it("with a string name", function() {
                return hashEntryShouldContainFields([ string("the port"), int(8) ], {
                    isHashEntry: true,
                    field: {
                        string: "the port"
                    },
                    value: {
                        integer: 8
                    }
                });
            });
        });
        describe("hash entry, without block", function() {
            var hashEntryShouldContainFields;
            hashEntryShouldContainFields = function(terminals, f) {
                return shouldContainFields(cg.basicExpression(terminals).hashEntry({
                    withoutBlock: true
                }), f);
            };
            it("with block", function() {
                return hashEntryShouldContainFields([ id("port"), int(10), block ], {
                    isHashEntry: true,
                    field: [ "port" ],
                    value: {
                        integer: 10
                    }
                });
            });
            return it("without arguments", function() {
                return hashEntryShouldContainFields([ id("port") ], {
                    isHashEntry: true,
                    field: [ "port" ],
                    value: undefined
                });
            });
        });
        describe("hash entry block", function() {
            var hashEntryBlockShouldContainFields;
            hashEntryBlockShouldContainFields = function(terminals, f) {
                return shouldContainFields(cg.basicExpression(terminals).hashEntryBlock(), f);
            };
            it("with block", function() {
                return hashEntryBlockShouldContainFields([ id("port"), int(10), block ], {
                    isBlock: true,
                    body: {
                        statements: [ {
                            variable: [ "a" ]
                        } ]
                    }
                });
            });
            it("without block", function() {
                return should.equal(cg.basicExpression([ id("port"), int(10) ]).hashEntryBlock(), undefined);
            });
            return it("without hash", function() {
                return should.equal(cg.basicExpression([ id("port") ]).hashEntryBlock(), undefined);
            });
        });
        return describe("hash key", function() {
            it("if string then should return string", function() {
                var key;
                key = cg.basicExpression([ string("port") ]).hashKey();
                return shouldContainFields(key, {
                    string: "port"
                });
            });
            return it("if variable then should return array containing string", function() {
                var key;
                key = cg.basicExpression([ id("port") ]).hashKey();
                return shouldContainFields(key, [ "port" ]);
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/classSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var cls, $class, classExtending;
    cls = require("../lib/class");
    $class = cls.class;
    classExtending = cls.classExtending;
    describe("class", function() {
        it("can create constructors that can be used in new", function() {
            var something, s;
            something = $class({
                constructor: function(thing) {
                    var self = this;
                    return self.thing = thing;
                }
            });
            s = new something("thing");
            return s.thing.should.equal("thing");
        });
        it("can create constructor, even if the class doesn't define one", function() {
            var something, s;
            something = $class({
                thing: "thing"
            });
            s = new something();
            return s.thing.should.equal("thing");
        });
        it("allows methods to be inherited", function() {
            var base, derived, d;
            base = $class({
                aMethod: function() {
                    var self = this;
                    return "method result";
                }
            });
            derived = classExtending(base, {
                constructor: function() {
                    var self = this;
                }
            });
            d = new derived();
            return d.aMethod().should.equal("method result");
        });
        it("a derived class can be derived again", function() {
            var base, derived, derivedDerived, d;
            base = $class({
                aMethod: function() {
                    var self = this;
                    return "method result";
                }
            });
            derived = classExtending(base, {
                constructor: function() {
                    var self = this;
                    return void 0;
                }
            });
            derivedDerived = classExtending(derived, {
                constructor: function() {
                    var self = this;
                    return void 0;
                }
            });
            d = new derivedDerived();
            return d.aMethod().should.equal("method result");
        });
        it("allows derived class to override method", function() {
            var base, derived, d;
            base = $class({
                aMethod: function() {
                    var self = this;
                    return "base result";
                }
            });
            derived = classExtending(base, {
                aMethod: function() {
                    var self = this;
                    return "derived result";
                }
            });
            d = new derived();
            return d.aMethod().should.equal("derived result");
        });
        return it("allows constructors to be inherited", function() {
            var base, derived, d;
            base = $class({
                constructor: function(value) {
                    var self = this;
                    return self.value = value;
                }
            });
            derived = classExtending(base, {});
            d = new derived("value");
            return d.value.should.equal("value");
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/closureParameterStrategiesSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var terms, strategies, MemoryStream, should;
    terms = require("../lib/parser/codeGenerator").codeGenerator();
    strategies = require("../lib/terms/closureParameterStrategies")(terms);
    MemoryStream = require("../lib/memorystream").MemoryStream;
    should = require("should");
    describe("closure parameter strategies", function() {
        var generateWithBufferAndScope, generateParametersFrom, generateStatementsFrom;
        generateWithBufferAndScope = function(block) {
            var scope, buffer;
            scope = new terms.SymbolScope();
            buffer = new MemoryStream();
            block(buffer, scope);
            return buffer.toString();
        };
        generateParametersFrom = function(strategy) {
            return generateWithBufferAndScope(function(buffer, scope) {
                return strategy.generateJavaScriptParameters(buffer, scope);
            });
        };
        generateStatementsFrom = function(strategy) {
            return generateWithBufferAndScope(function(buffer, scope) {
                return strategy.generateJavaScriptParameterStatements(buffer, scope, terms.variable([ "args" ]));
            });
        };
        describe("function strategy", function() {
            return context("when there are two arguments", function() {
                var fs;
                fs = void 0;
                beforeEach(function() {
                    return fs = strategies.functionStrategy({
                        namedParameters: function() {
                            var self = this;
                            return [ terms.variable([ "a" ]), terms.variable([ "b" ]) ];
                        },
                        generateJavaScriptParameterStatements: function(buffer, scope, arguments) {
                            var self = this;
                            arguments.generateJavaScript(buffer, scope);
                            return buffer.write(";");
                        }
                    });
                });
                it("generates a function parameter for each required parameter", function() {
                    return generateParametersFrom(fs).should.equal("a,b");
                });
                it("generates statements of underlying strategy", function() {
                    return generateStatementsFrom(fs).should.equal("args;");
                });
                return it("requires underlying named parameters", function() {
                    return should.deepEqual(fs.namedParameters(), [ terms.variable([ "a" ]), terms.variable([ "b" ]) ]);
                });
            });
        });
        describe("normal strategy", function() {
            return context("when there are two parameters", function() {
                var n;
                n = void 0;
                beforeEach(function() {
                    return n = strategies.normalStrategy([ terms.variable([ "a" ]), terms.variable([ "b" ]) ]);
                });
                it("requires those parameters", function() {
                    return should.deepEqual(n.namedParameters(), [ terms.variable([ "a" ]), terms.variable([ "b" ]) ]);
                });
                return it("doesn't generate any statements", function() {
                    return generateStatementsFrom(n).should.equal("");
                });
            });
        });
        describe("splat strategy", function() {
            context("when there is only one splat parameter", function() {
                var splat;
                splat = void 0;
                beforeEach(function() {
                    return splat = strategies.splatStrategy({
                        before: [],
                        splat: terms.variable([ "a" ]),
                        after: []
                    });
                });
                it("doesn't require any parameters", function() {
                    return should.deepEqual(splat.namedParameters(), []);
                });
                return it("generates full slice of arguments", function() {
                    return generateStatementsFrom(splat).should.equal("var a=Array.prototype.slice.call(args,0,args.length);");
                });
            });
            context("when there is one argument before the splat parameter", function() {
                var splat;
                splat = void 0;
                beforeEach(function() {
                    return splat = strategies.splatStrategy({
                        before: [ terms.variable([ "a" ]) ],
                        splat: terms.variable([ "b" ]),
                        after: []
                    });
                });
                it("doesn't require any parameters", function() {
                    return should.deepEqual(splat.namedParameters(), [ terms.variable([ "a" ]) ]);
                });
                return it("generates full slice of arguments", function() {
                    return generateStatementsFrom(splat).should.equal("var b=Array.prototype.slice.call(args,1,args.length);");
                });
            });
            context("when there is one argument after the splat parameter", function() {
                var splat;
                splat = void 0;
                beforeEach(function() {
                    return splat = strategies.splatStrategy({
                        before: [],
                        splat: terms.variable([ "a" ]),
                        after: [ terms.variable([ "b" ]) ]
                    });
                });
                it("doesn't require any parameters", function() {
                    return should.deepEqual(splat.namedParameters(), []);
                });
                return it("generates full slice of arguments", function() {
                    return generateStatementsFrom(splat).should.equal("var a=Array.prototype.slice.call(args,0,args.length-1);var b=args[args.length-1];");
                });
            });
            return context("when there is one argument, a splat argument, then another argument", function() {
                var splat;
                splat = void 0;
                beforeEach(function() {
                    return splat = strategies.splatStrategy({
                        before: [ terms.variable([ "a" ]) ],
                        splat: terms.variable([ "b" ]),
                        after: [ terms.variable([ "c" ]) ]
                    });
                });
                it("doesn't require any parameters", function() {
                    return should.deepEqual(splat.namedParameters(), [ terms.variable([ "a" ]) ]);
                });
                return it("generates full slice of arguments", function() {
                    return generateStatementsFrom(splat).should.equal("var b=Array.prototype.slice.call(args,1,args.length-1);if(args.length>1){var c=args[args.length-1];}");
                });
            });
        });
        describe("optional strategy", function() {
            context("when there are no other arguments", function() {
                var opts;
                opts = void 0;
                beforeEach(function() {
                    return opts = strategies.optionalStrategy({
                        before: [],
                        options: [ terms.hashEntry([ "a" ], terms.integer(10)), terms.hashEntry([ "b" ], terms.string("asdf")) ]
                    });
                });
                it("requires only an options parameter", function() {
                    return should.deepEqual(opts.namedParameters(), [ terms.generatedVariable([ "options" ]) ]);
                });
                return it("generates code to extract each named option from the options variable", function() {
                    return generateStatementsFrom(opts).should.equal("var a,b;a=gen1_options!==void 0&&Object.prototype.hasOwnProperty.call(gen1_options,'a')&&gen1_options.a!==void 0?gen1_options.a:10;b=gen1_options!==void 0&&Object.prototype.hasOwnProperty.call(gen1_options,'b')&&gen1_options.b!==void 0?gen1_options.b:'asdf';");
                });
            });
            return context("when there are two other parameters", function() {
                var opts;
                opts = void 0;
                beforeEach(function() {
                    return opts = strategies.optionalStrategy({
                        before: [ terms.variable([ "a" ]), terms.variable([ "b" ]) ],
                        options: [ terms.hashEntry([ "c" ], terms.integer(10)), terms.hashEntry([ "d" ], terms.string("asdf")) ]
                    });
                });
                it("requires the normal parameters and the options parameter", function() {
                    return should.deepEqual(opts.namedParameters(), [ terms.variable([ "a" ]), terms.variable([ "b" ]), terms.generatedVariable([ "options" ]) ]);
                });
                return it("generates code to extract each named option from the options variable", function() {
                    return generateStatementsFrom(opts).should.equal("var c,d;c=gen1_options!==void 0&&Object.prototype.hasOwnProperty.call(gen1_options,'c')&&gen1_options.c!==void 0?gen1_options.c:10;d=gen1_options!==void 0&&Object.prototype.hasOwnProperty.call(gen1_options,'d')&&gen1_options.d!==void 0?gen1_options.d:'asdf';");
                });
            });
        });
        return describe("callback strategy", function() {
            return context("with two other parameters", function() {
                var cb;
                cb = void 0;
                beforeEach(function() {
                    return cb = strategies.callbackStrategy({
                        namedParameters: function() {
                            var self = this;
                            return [ terms.variable([ "a" ]), terms.variable([ "b" ]) ];
                        },
                        generateJavaScriptParameterStatements: function(buffer, scope, args) {
                            var self = this;
                            args.generateJavaScript(buffer, scope);
                            return buffer.write(";");
                        }
                    });
                });
                it("requires the inner parameters and the callback", function() {
                    return should.deepEqual(cb.namedParameters(), [ terms.variable([ "a" ]), terms.variable([ "b" ]), terms.callbackFunction ]);
                });
                return it("generates code to extract the callback and the other parameters", function() {
                    return generateStatementsFrom(cb).should.equal("var gen1_arguments=Array.prototype.slice.call(args,0,args.length-1);continuation=args[args.length-1];if(!(continuation instanceof Function)){throw new Error('asynchronous function called synchronously');}a=gen1_arguments[0];b=gen1_arguments[1];gen1_arguments;");
                });
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/closureSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var terms, shouldContainFields;
    terms = require("../lib/parser/codeGenerator").codeGenerator();
    shouldContainFields = require("./containsFields").containsFields;
    describe("closure", function() {
        describe("asyncify", function() {
            context("when the body is not asynchronous", function() {
                return it("makes sure that the result is passed to a callback", function() {
                    var closure;
                    closure = terms.closure([], terms.statements([ terms.variable([ "asdf" ]) ]));
                    closure.asyncify();
                    return shouldContainFields(closure, terms.closure([], terms.statements([ terms.functionCall(terms.callbackFunction, [ terms.nil(), terms.variable([ "asdf" ]) ]) ], {
                        async: true
                    }), {
                        async: true
                    }));
                });
            });
            return context("when the body is asynchronous", function() {
                return it("does nothing", function() {
                    var closure;
                    closure = terms.closure([], terms.statements([ terms.variable([ "asdf" ]) ], {
                        async: true
                    }));
                    closure.asyncify();
                    return shouldContainFields(closure, terms.closure([], terms.statements([ terms.variable([ "asdf" ]) ], {
                        async: true
                    }), {
                        async: true
                    }));
                });
            });
        });
        return describe("parameter strategy selection", function() {
            var strats, statements;
            strats = terms.closureParameterStrategies;
            statements = void 0;
            beforeEach(function() {
                return statements = terms.statements([ terms.variable([ "a" ]) ]);
            });
            context("when there are only normal parameters", function() {
                return it("selects the normal strategy", function() {
                    var closure;
                    closure = terms.closure([ terms.variable([ "a" ]) ], statements);
                    return shouldContainFields(closure.parametersStrategy(), strats.functionStrategy(strats.normalStrategy([ terms.variable([ "a" ]) ])));
                });
            });
            describe("splat parameters", function() {
                context("when there is a splat parameter and no others", function() {
                    return it("selects the splat strategy", function() {
                        var closure;
                        closure = terms.closure([ terms.variable([ "a" ]), terms.splat() ], statements);
                        return shouldContainFields(closure.parametersStrategy(), strats.functionStrategy(strats.splatStrategy({
                            before: [],
                            splat: terms.variable([ "a" ]),
                            after: []
                        })));
                    });
                });
                context("when there is a parameter, then a splat parameter and no others", function() {
                    return it("selects the splat strategy", function() {
                        var closure;
                        closure = terms.closure([ terms.variable([ "a" ]), terms.variable([ "b" ]), terms.splat() ], statements);
                        return shouldContainFields(closure.parametersStrategy(), strats.functionStrategy(strats.splatStrategy({
                            before: [ terms.variable([ "a" ]) ],
                            splat: terms.variable([ "b" ]),
                            after: []
                        })));
                    });
                });
                context("when there is a splat parameter and then a normal parameter", function() {
                    return it("selects the splat strategy", function() {
                        var closure;
                        closure = terms.closure([ terms.variable([ "a" ]), terms.splat(), terms.variable([ "b" ]) ], statements);
                        return shouldContainFields(closure.parametersStrategy(), strats.functionStrategy(strats.splatStrategy({
                            before: [],
                            splat: terms.variable([ "a" ]),
                            after: [ terms.variable([ "b" ]) ]
                        })));
                    });
                });
                return context("when there is a normal parameter, then a splat parameter and then a normal parameter", function() {
                    return it("selects the splat strategy", function() {
                        var closure;
                        closure = terms.closure([ terms.variable([ "a" ]), terms.variable([ "b" ]), terms.splat(), terms.variable([ "c" ]) ], statements);
                        return shouldContainFields(closure.parametersStrategy(), strats.functionStrategy(strats.splatStrategy({
                            before: [ terms.variable([ "a" ]) ],
                            splat: terms.variable([ "b" ]),
                            after: [ terms.variable([ "c" ]) ]
                        })));
                    });
                });
            });
            describe("optional parameters", function() {
                context("when there are only optional parameters", function() {
                    return it("uses the optional strategy", function() {
                        var closure;
                        closure = terms.closure([], statements, {
                            optionalParameters: [ terms.hashEntry([ "a" ], terms.integer(90)), terms.hashEntry([ "b" ], terms.string("hi")) ]
                        });
                        return shouldContainFields(closure.parametersStrategy(), strats.functionStrategy(strats.optionalStrategy({
                            before: [],
                            options: [ terms.hashEntry([ "a" ], terms.integer(90)), terms.hashEntry([ "b" ], terms.string("hi")) ]
                        })));
                    });
                });
                return context("when there is one normal parameter and two optional parameters", function() {
                    return it("uses the optional strategy", function() {
                        var closure;
                        closure = terms.closure([ terms.variable([ "x" ]) ], statements, {
                            optionalParameters: [ terms.hashEntry([ "a" ], terms.integer(90)), terms.hashEntry([ "b" ], terms.string("hi")) ]
                        });
                        return shouldContainFields(closure.parametersStrategy(), strats.functionStrategy(strats.optionalStrategy({
                            before: [ terms.variable([ "x" ]) ],
                            options: [ terms.hashEntry([ "a" ], terms.integer(90)), terms.hashEntry([ "b" ], terms.string("hi")) ]
                        })));
                    });
                });
            });
            return describe("functions that take an async callback parameter", function() {
                context("when there are just normal parameters", function() {
                    return it("chooses the callback strategy containing a normal strategy", function() {
                        var closure;
                        closure = terms.closure([ terms.variable([ "a" ]) ], statements, {
                            async: true
                        });
                        return shouldContainFields(closure.parametersStrategy(), strats.functionStrategy(strats.callbackStrategy(strats.normalStrategy([ terms.variable([ "a" ]) ]))));
                    });
                });
                context("when there is one normal parameter and two optional parameters", function() {
                    return it("uses the optional strategy", function() {
                        var closure;
                        closure = terms.closure([ terms.variable([ "x" ]) ], statements, {
                            optionalParameters: [ terms.hashEntry([ "a" ], terms.integer(90)), terms.hashEntry([ "b" ], terms.string("hi")) ],
                            async: true
                        });
                        return shouldContainFields(closure.parametersStrategy(), strats.functionStrategy(strats.callbackStrategy(strats.optionalStrategy({
                            before: [ terms.variable([ "x" ]) ],
                            options: [ terms.hashEntry([ "a" ], terms.integer(90)), terms.hashEntry([ "b" ], terms.string("hi")) ]
                        }))));
                    });
                });
                return context("when there is a normal parameter, then a splat parameter and then a normal parameter", function() {
                    return it("selects the splat strategy", function() {
                        var closure;
                        closure = terms.closure([ terms.variable([ "a" ]), terms.variable([ "b" ]), terms.splat(), terms.variable([ "c" ]) ], statements, {
                            async: true
                        });
                        return shouldContainFields(closure.parametersStrategy(), strats.functionStrategy(strats.callbackStrategy(strats.splatStrategy({
                            before: [ terms.variable([ "a" ]) ],
                            splat: terms.variable([ "b" ]),
                            after: [ terms.variable([ "c" ]) ]
                        }))));
                    });
                });
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/codeGeneratorAssertions.js", function(exports, require, module){
(function() {
    var self = this;
    var MemoryStream, terms, should, shouldGenerateGeneratedBy;
    MemoryStream = require("../lib/memorystream").MemoryStream;
    terms = require("../lib/parser/codeGenerator").codeGenerator();
    should = require("should");
    shouldGenerateGeneratedBy = function(term, source, generate, gen1_options) {
        var print;
        print = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "print") && gen1_options.print !== void 0 ? gen1_options.print : false;
        var stream, code;
        stream = new MemoryStream();
        generate(term, stream, new terms.SymbolScope());
        code = stream.toString();
        if (print) {
            console.log(code);
        }
        return should.equal(code, source);
    };
    global.shouldGenerateExpression = function(term, source, options) {
        var self = this;
        return shouldGenerateGeneratedBy(term, source, function(term, stream, scope) {
            return term.generateJavaScript(stream, scope);
        }, options);
    };
    global.shouldGenerateStatement = function(term, source, options) {
        var self = this;
        return shouldGenerateGeneratedBy(term, source, function(term, stream, scope) {
            return term.generateJavaScriptStatement(stream, scope);
        }, options);
    };
    global.shouldGenerateStatements = function(term, source, options) {
        var self = this;
        return shouldGenerateGeneratedBy(term, source, function(term, stream, scope) {
            return term.generateJavaScriptStatements(stream, scope, {
                inClosure: true
            });
        }, options);
    };
    global.shouldGenerateGlobalStatements = function(term, source, options) {
        var self = this;
        return shouldGenerateGeneratedBy(term, source, function(term, stream, scope) {
            return term.generateJavaScriptStatements(stream, scope, {
                global: true
            });
        }, options);
    };
    global.shouldGenerateModule = function(term, source, options) {
        var self = this;
        return shouldGenerateGeneratedBy(term, source, function(term, stream) {
            return term.generateJavaScriptModule(stream);
        }, options);
    };
}).call(this);
});
require.register("pogoscript-tests/test/complexExpressionSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var cg, int, loc, id, variable, parameter, block, string, asyncArgument;
    cg = require("../lib/parser/codeGenerator").codeGenerator();
    require("./assertions");
    int = function(n) {
        return cg.integer(n);
    };
    loc = {
        firstLine: 1,
        lastLine: 1,
        firstColumn: 7,
        lastColumn: 13
    };
    id = function(name) {
        return cg.loc(cg.identifier(name), loc);
    };
    variable = function(name) {
        return cg.variable([ name ]);
    };
    parameter = function(name) {
        return cg.parameter([ name ]);
    };
    block = cg.block([], cg.statements([ variable("x") ]));
    string = function(value) {
        return cg.string(value);
    };
    asyncArgument = cg.asyncArgument();
    describe("complex expression", function() {
        describe("has arguments", function() {
            var expressionShouldHaveArguments;
            expressionShouldHaveArguments = function(e) {
                return shouldBeTruthy(cg.complexExpression(e).hasArguments());
            };
            it("with arguments in head", function() {
                return expressionShouldHaveArguments([ [ id("a"), int(10) ] ]);
            });
            it("with async argument", function() {
                return expressionShouldHaveArguments([ [ id("a"), asyncArgument ] ]);
            });
            return it("with tail block", function() {
                return expressionShouldHaveArguments([ [ id("a") ], [ id("readonly"), block ] ]);
            });
        });
        describe("arguments", function() {
            var expressionShouldHaveArguments;
            expressionShouldHaveArguments = function(e, a) {
                return shouldContainFields(cg.complexExpression(e).arguments(), a);
            };
            it("with arguments in head", function() {
                return expressionShouldHaveArguments([ [ id("a"), int(10) ] ], [ {
                    integer: 10
                } ]);
            });
            return it("with tail block", function() {
                return expressionShouldHaveArguments([ [ id("a") ], [ id("readonly"), block ] ], [ {
                    isBlock: true
                } ]);
            });
        });
        describe("expression", function() {
            var expressionShouldContainFields;
            expressionShouldContainFields = function(e, f) {
                return shouldContainFields(cg.complexExpression(e).expression(), f);
            };
            it("with just one argument is that argument", function() {
                return expressionShouldContainFields([ [ int(9) ] ], {
                    isInteger: true,
                    integer: 9
                });
            });
            it("all arguments is function call, first argument is function", function() {
                return expressionShouldContainFields([ [ variable("z"), int(9) ] ], {
                    isFunctionCall: true,
                    isAsync: false,
                    "function": {
                        variable: [ "z" ]
                    },
                    functionArguments: [ {
                        integer: 9
                    } ]
                });
            });
            describe("async functions", function() {
                it("one argument and async argument is async function call", function() {
                    return expressionShouldContainFields([ [ variable("z"), asyncArgument ] ], {
                        isSubStatements: true,
                        statements: [ {
                            isDefinition: true,
                            isAsync: true,
                            target: {
                                isVariable: true,
                                name: [ "async", "result" ]
                            },
                            source: {
                                isFunctionCall: true,
                                "function": {
                                    variable: [ "z" ]
                                },
                                functionArguments: []
                            }
                        }, {
                            isVariable: true,
                            name: [ "async", "result" ]
                        } ]
                    });
                });
                return it("name and async argument is function call", function() {
                    return expressionShouldContainFields([ [ id("z"), asyncArgument ] ], {
                        isSubStatements: true,
                        statements: [ {
                            isDefinition: true,
                            isAsync: true,
                            target: {
                                isVariable: true,
                                name: [ "async", "result" ]
                            },
                            source: {
                                isFunctionCall: true,
                                "function": {
                                    variable: [ "z" ]
                                },
                                functionArguments: []
                            }
                        }, {
                            isVariable: true,
                            name: [ "async", "result" ]
                        } ]
                    });
                });
            });
            it("with name is variable", function() {
                return expressionShouldContainFields([ [ id("a"), id("variable") ] ], {
                    isVariable: true,
                    variable: [ "a", "variable" ]
                });
            });
            it("with name and argument is function call", function() {
                return expressionShouldContainFields([ [ id("a"), id("variable"), int(10) ] ], {
                    isFunctionCall: true,
                    isAsync: false,
                    "function": {
                        isVariable: true,
                        variable: [ "a", "variable" ]
                    },
                    functionArguments: [ {
                        integer: 10
                    } ]
                });
            });
            it("hash entries as arguments are optional", function() {
                return expressionShouldContainFields([ [ id("a"), int(10), cg.hashEntry([ "port" ], int(80)) ] ], {
                    isFunctionCall: true,
                    isAsync: false,
                    "function": {
                        isVariable: true,
                        variable: [ "a" ]
                    },
                    functionArguments: [ {
                        integer: 10
                    } ],
                    optionalArguments: [ {
                        field: [ "port" ],
                        value: {
                            integer: 80
                        }
                    } ]
                });
            });
            it("with name and optional args is function call with optional args", function() {
                return expressionShouldContainFields([ [ id("a"), id("variable") ], [ id("port"), int(80) ] ], {
                    isFunctionCall: true,
                    isAsync: false,
                    "function": {
                        isVariable: true,
                        variable: [ "a", "variable" ]
                    },
                    functionArguments: [],
                    optionalArguments: [ {
                        field: [ "port" ],
                        value: {
                            integer: 80
                        }
                    } ]
                });
            });
            return it("with block after optional arguments", function() {
                return expressionShouldContainFields([ [ id("a"), id("variable") ], [ id("port"), int(80), block ] ], {
                    isFunctionCall: true,
                    isAsync: false,
                    "function": {
                        isVariable: true,
                        variable: [ "a", "variable" ]
                    },
                    functionArguments: [ {
                        isBlock: true,
                        body: {
                            statements: [ {
                                variable: [ "x" ]
                            } ]
                        }
                    } ],
                    optionalArguments: [ {
                        field: [ "port" ],
                        value: {
                            integer: 80
                        }
                    } ]
                });
            });
        });
        describe("object operation -> expression", function() {
            var expressionShouldContainFields;
            expressionShouldContainFields = function(object, operation, fields) {
                return shouldContainFields(cg.complexExpression(operation).objectOperation(object).expression(), fields);
            };
            it("method call", function() {
                return expressionShouldContainFields(variable("a"), [ [ id("method"), int(10) ] ], {
                    isMethodCall: true,
                    object: {
                        variable: [ "a" ]
                    },
                    name: [ "method" ],
                    methodArguments: [ {
                        integer: 10
                    } ],
                    isAsync: false
                });
            });
            it("async method call", function() {
                return expressionShouldContainFields(variable("a"), [ [ id("method"), int(10), asyncArgument ] ], {
                    isSubStatements: true,
                    statements: [ {
                        isDefinition: true,
                        isAsync: true,
                        target: {
                            isVariable: true,
                            name: [ "async", "result" ]
                        },
                        source: {
                            isMethodCall: true,
                            object: {
                                variable: [ "a" ]
                            },
                            name: [ "method" ],
                            methodArguments: [ {
                                integer: 10
                            } ]
                        }
                    }, {
                        isVariable: true,
                        name: [ "async", "result" ]
                    } ]
                });
            });
            it("method call with optional arguments", function() {
                return expressionShouldContainFields(variable("a"), [ [ id("method"), int(10) ], [ id("port"), int(80) ] ], {
                    isMethodCall: true,
                    object: {
                        variable: [ "a" ]
                    },
                    name: [ "method" ],
                    methodArguments: [ {
                        integer: 10
                    } ],
                    optionalArguments: [ {
                        field: [ "port" ],
                        value: {
                            integer: 80
                        }
                    } ],
                    isAsync: false
                });
            });
            it("index", function() {
                return expressionShouldContainFields(variable("a"), [ [ int(10) ] ], {
                    isIndexer: true,
                    object: {
                        variable: [ "a" ]
                    },
                    indexer: {
                        integer: 10
                    }
                });
            });
            it("index call with arguments", function() {
                return expressionShouldContainFields(variable("a"), [ [ variable("z"), int(10) ] ], {
                    isFunctionCall: true,
                    isAsync: false,
                    "function": {
                        isIndexer: true,
                        object: {
                            variable: [ "a" ]
                        },
                        indexer: {
                            variable: [ "z" ]
                        }
                    },
                    functionArguments: [ {
                        integer: 10
                    } ]
                });
            });
            it("async index call with arguments", function() {
                return expressionShouldContainFields(variable("a"), [ [ variable("z"), int(10), asyncArgument ] ], {
                    isSubStatements: true,
                    statements: [ {
                        isDefinition: true,
                        isAsync: true,
                        target: {
                            isVariable: true,
                            name: [ "async", "result" ]
                        },
                        source: {
                            isFunctionCall: true,
                            "function": {
                                isIndexer: true,
                                object: {
                                    variable: [ "a" ]
                                },
                                indexer: {
                                    variable: [ "z" ]
                                }
                            },
                            functionArguments: [ {
                                integer: 10
                            } ]
                        }
                    }, {
                        isVariable: true,
                        name: [ "async", "result" ]
                    } ]
                });
            });
            it("async index call with no arguments", function() {
                return expressionShouldContainFields(variable("a"), [ [ variable("z"), asyncArgument ] ], {
                    isSubStatements: true,
                    statements: [ {
                        isDefinition: true,
                        isAsync: true,
                        target: {
                            isVariable: true,
                            name: [ "async", "result" ]
                        },
                        source: {
                            isFunctionCall: true,
                            "function": {
                                isIndexer: true,
                                object: {
                                    variable: [ "a" ]
                                },
                                indexer: {
                                    variable: [ "z" ]
                                }
                            },
                            functionArguments: []
                        }
                    }, {
                        isVariable: true,
                        name: [ "async", "result" ]
                    } ]
                });
            });
            it("index call with no arguments", function() {
                return expressionShouldContainFields(variable("a"), [ [ variable("z"), cg.argumentList([]) ] ], {
                    isFunctionCall: true,
                    isAsync: false,
                    "function": {
                        isIndexer: true,
                        object: {
                            variable: [ "a" ]
                        },
                        indexer: {
                            variable: [ "z" ]
                        }
                    },
                    functionArguments: []
                });
            });
            return it("field reference", function() {
                return expressionShouldContainFields(variable("a"), [ [ id("field") ] ], {
                    isFieldReference: true,
                    object: {
                        variable: [ "a" ]
                    },
                    name: [ "field" ]
                });
            });
        });
        describe("hash entry", function() {
            var hashEntryShouldContainFields;
            hashEntryShouldContainFields = function(expression, fields) {
                return shouldContainFields(cg.complexExpression(expression).hashEntry(), fields);
            };
            it("if contains one component that is the hash entry", function() {
                return hashEntryShouldContainFields([ [ id("field") ] ], {
                    isHashEntry: true,
                    field: [ "field" ],
                    value: undefined
                });
            });
            return it("if contains more than component then semantic error", function() {
                return hashEntryShouldContainFields([ [ id("field") ], [ id("secondField") ] ], {
                    isSemanticError: true
                });
            });
        });
        describe("definition -> hash entry", function() {
            it("string key", function() {
                var hashEntry;
                hashEntry = cg.complexExpression([ [ string("port") ] ]).definition(cg.variable([ "a" ])).hashEntry();
                return shouldContainFields(hashEntry, {
                    isHashEntry: true,
                    field: {
                        string: "port"
                    },
                    value: {
                        variable: [ "a" ]
                    }
                });
            });
            it("identifier key", function() {
                var hashEntry;
                hashEntry = cg.complexExpression([ [ id("port") ] ]).definition(cg.variable([ "a" ])).hashEntry();
                return shouldContainFields(hashEntry, {
                    isHashEntry: true,
                    field: [ "port" ],
                    value: {
                        variable: [ "a" ]
                    }
                });
            });
            it("field's value can be on a new indented line", function() {
                var hashEntry;
                hashEntry = cg.complexExpression([ [ id("port") ] ]).definition(cg.block([], cg.statements([ cg.variable([ "a" ]) ]))).hashEntry();
                return shouldContainFields(hashEntry, {
                    isHashEntry: true,
                    field: [ "port" ],
                    value: {
                        variable: [ "a" ]
                    }
                });
            });
            return it("can define a method as a hash key", function() {
                var hashEntry;
                hashEntry = cg.complexExpression([ [ id("name"), variable("name") ] ]).definition(cg.variable([ "name" ])).hashEntry(true);
                return shouldContainFields(hashEntry, {
                    isHashEntry: true,
                    field: [ "name" ],
                    value: {
                        isBlock: true,
                        body: {
                            statements: [ {
                                variable: [ "name" ]
                            } ]
                        },
                        parameters: [ {
                            variable: [ "name" ]
                        } ],
                        redefinesSelf: false
                    }
                });
            });
        });
        describe("object operation -> definition", function() {
            var definitionShouldContainFields;
            definitionShouldContainFields = function(object, operation, source, fields) {
                return shouldContainFields(cg.complexExpression(operation).objectOperation(object).definition(source).expression(), fields);
            };
            it("method definition", function() {
                return definitionShouldContainFields(variable("object"), [ [ id("method"), variable("x") ] ], block, {
                    isDefinition: true,
                    isAssignment: true,
                    target: {
                        isFieldReference: true,
                        name: [ "method" ],
                        object: {
                            variable: [ "object" ]
                        }
                    },
                    source: {
                        isBlock: true,
                        parameters: [ {
                            variable: [ "x" ]
                        } ]
                    }
                });
            });
            it("method definition without block", function() {
                return definitionShouldContainFields(variable("object"), [ [ id("method"), variable("x") ] ], variable("y"), {
                    isDefinition: true,
                    isAssignment: true,
                    target: {
                        isFieldReference: true,
                        name: [ "method" ],
                        object: {
                            variable: [ "object" ]
                        }
                    },
                    source: {
                        isBlock: true,
                        redefinesSelf: true,
                        parameters: [ {
                            variable: [ "x" ]
                        } ],
                        body: {
                            statements: [ {
                                variable: [ "y" ]
                            } ]
                        }
                    }
                });
            });
            it("field definition", function() {
                return definitionShouldContainFields(variable("object"), [ [ id("x") ] ], variable("y"), {
                    isDefinition: true,
                    isAssignment: true,
                    target: {
                        isFieldReference: true,
                        name: [ "x" ],
                        object: {
                            variable: [ "object" ]
                        }
                    },
                    source: {
                        isVariable: true,
                        variable: [ "y" ]
                    }
                });
            });
            it("index definition", function() {
                return definitionShouldContainFields(variable("object"), [ [ variable("x") ] ], variable("y"), {
                    isDefinition: true,
                    isAssignment: true,
                    target: {
                        isIndexer: true,
                        indexer: {
                            variable: [ "x" ]
                        },
                        object: {
                            variable: [ "object" ]
                        }
                    },
                    source: {
                        isVariable: true,
                        variable: [ "y" ]
                    }
                });
            });
            it("index method definition", function() {
                return definitionShouldContainFields(variable("object"), [ [ cg.string("xyz"), variable("p") ] ], variable("y"), {
                    isDefinition: true,
                    isAssignment: true,
                    target: {
                        isIndexer: true,
                        indexer: {
                            string: "xyz"
                        },
                        object: {
                            variable: [ "object" ]
                        }
                    },
                    source: {
                        isBlock: true,
                        body: {
                            statements: [ {
                                isVariable: true,
                                variable: [ "y" ]
                            } ]
                        },
                        parameters: [ {
                            variable: [ "p" ]
                        } ]
                    }
                });
            });
            return it("async index method definition with no args", function() {
                return definitionShouldContainFields(variable("object"), [ [ cg.string("xyz"), asyncArgument ] ], variable("y"), {
                    isDefinition: true,
                    isAssignment: true,
                    target: {
                        isIndexer: true,
                        indexer: {
                            string: "xyz"
                        },
                        object: {
                            variable: [ "object" ]
                        }
                    },
                    source: {
                        isBlock: true,
                        body: {
                            statements: [ {
                                isVariable: true,
                                variable: [ "y" ]
                            } ]
                        },
                        parameters: []
                    }
                });
            });
        });
        return describe("definition", function() {
            var definitionShouldContainFields, assignmentShouldContainFields;
            definitionShouldContainFields = function(target, source, fields) {
                return shouldContainFields(cg.complexExpression(target).definition(source).expression(), fields);
            };
            assignmentShouldContainFields = function(target, source, fields) {
                return shouldContainFields(cg.complexExpression(target).definition(source, {
                    assignment: true
                }).expression(), fields);
            };
            it("function definition", function() {
                return definitionShouldContainFields([ [ id("function"), variable("x") ] ], block, {
                    isDefinition: true,
                    target: {
                        isVariable: true,
                        variable: [ "function" ]
                    },
                    source: {
                        isBlock: true,
                        parameters: [ {
                            variable: [ "x" ]
                        } ],
                        body: {
                            statements: [ {
                                variable: [ "x" ]
                            } ]
                        }
                    }
                });
            });
            it("function assignment", function() {
                return assignmentShouldContainFields([ [ id("function"), variable("x") ] ], block, {
                    isDefinition: true,
                    isAssignment: true,
                    target: {
                        isVariable: true,
                        variable: [ "function" ]
                    },
                    source: {
                        isBlock: true,
                        parameters: [ {
                            variable: [ "x" ]
                        } ],
                        body: {
                            statements: [ {
                                variable: [ "x" ]
                            } ]
                        }
                    }
                });
            });
            it("function definition with optional parameter in tail", function() {
                return definitionShouldContainFields([ [ id("function"), variable("x") ], [ id("port"), int(80) ], [ id("name") ] ], variable("y"), {
                    isDefinition: true,
                    target: {
                        isVariable: true,
                        variable: [ "function" ]
                    },
                    source: {
                        isBlock: true,
                        parameters: [ {
                            variable: [ "x" ]
                        } ],
                        optionalParameters: [ {
                            field: [ "port" ],
                            value: {
                                integer: 80
                            }
                        }, {
                            field: [ "name" ],
                            value: undefined
                        } ],
                        body: {
                            statements: [ {
                                variable: [ "y" ]
                            } ]
                        }
                    }
                });
            });
            it("function definition with optional parameter", function() {
                return definitionShouldContainFields([ [ id("function"), variable("x"), cg.hashEntry([ "port" ], int(80)), cg.hashEntry([ "name" ], variable("nil")) ] ], variable("y"), {
                    isDefinition: true,
                    target: {
                        isVariable: true,
                        variable: [ "function" ]
                    },
                    source: {
                        isBlock: true,
                        parameters: [ {
                            variable: [ "x" ]
                        } ],
                        optionalParameters: [ {
                            field: [ "port" ],
                            value: {
                                integer: 80
                            }
                        }, {
                            field: [ "name" ],
                            value: {
                                isNil: true
                            }
                        } ],
                        body: {
                            statements: [ {
                                variable: [ "y" ]
                            } ]
                        }
                    }
                });
            });
            it("function definition without block", function() {
                return definitionShouldContainFields([ [ id("function"), variable("x") ] ], variable("y"), {
                    isDefinition: true,
                    target: {
                        isVariable: true,
                        variable: [ "function" ]
                    },
                    source: {
                        isBlock: true,
                        parameters: [ {
                            variable: [ "x" ]
                        } ],
                        body: {
                            statements: [ {
                                variable: [ "y" ]
                            } ]
                        }
                    }
                });
            });
            it("async function definition", function() {
                return definitionShouldContainFields([ [ id("function"), asyncArgument ] ], variable("y"), {
                    isDefinition: true,
                    target: {
                        isVariable: true,
                        variable: [ "function" ]
                    },
                    source: {
                        isBlock: true,
                        parameters: [],
                        body: {
                            statements: [ {
                                variable: [ "y" ]
                            } ]
                        },
                        isAsync: true
                    }
                });
            });
            it("function definition with empty param list", function() {
                return definitionShouldContainFields([ [ id("function"), cg.argumentList([]) ] ], variable("y"), {
                    isDefinition: true,
                    target: {
                        isVariable: true,
                        variable: [ "function" ]
                    },
                    source: {
                        isBlock: true,
                        parameters: [],
                        body: {
                            statements: [ {
                                variable: [ "y" ]
                            } ]
                        }
                    }
                });
            });
            it("variable definition", function() {
                return definitionShouldContainFields([ [ id("function") ] ], variable("y"), {
                    isDefinition: true,
                    target: {
                        isVariable: true,
                        variable: [ "function" ]
                    },
                    source: {
                        isVariable: true,
                        variable: [ "y" ]
                    }
                });
            });
            it("variable assignment", function() {
                return assignmentShouldContainFields([ [ id("function") ] ], variable("y"), {
                    isDefinition: true,
                    isAssignment: true,
                    target: {
                        isVariable: true,
                        variable: [ "function" ]
                    },
                    source: {
                        isVariable: true,
                        variable: [ "y" ]
                    }
                });
            });
            it("variable definition with scope", function() {
                return definitionShouldContainFields([ [ id("function") ] ], cg.block([], cg.statements([ variable("y") ])), {
                    isDefinition: true,
                    target: {
                        isVariable: true,
                        variable: [ "function" ]
                    },
                    source: {
                        variable: [ "y" ]
                    }
                });
            });
            return describe("parameter", function() {
                var parameterShouldContainFields;
                parameterShouldContainFields = function(p, fields) {
                    return shouldContainFields(cg.complexExpression(p).expression().parameter(), fields);
                };
                return it("variable", function() {
                    return parameterShouldContainFields([ [ id("a") ] ], {
                        variable: [ "a" ]
                    });
                });
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/definitionsSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var script, shouldOutput, evaluateScript;
    script = require("./scriptAssertions");
    shouldOutput = script.shouldOutput;
    evaluateScript = script.evaluateScript;
    describe("definitions", function() {
        return describe("definitions cannot shadow other definitions", function() {
            it("throws when an inner scope defines a variable of the same name as defined in outer scope", function() {
                return function() {
                    return evaluateScript("a = 1\n                      \nf () =\n    a = 3");
                }.should.throw(/variable a is already defined/);
            });
            it("can assign to a variable after it has been defined", function() {
                return shouldOutput("a = 1\nprint (a)\n\na := 2\nprint (a)", "1\n2");
            });
            it("can define variable inside if expression", function() {
                return shouldOutput("print (\n    if (true)\n        b = 1\n        b + 1\n)", "2");
            });
            return it("throws when an assignment is made to a variable that hasn't been defined yet", function() {
                return function() {
                    return evaluateScript("a := 1");
                }.should.throw(/variable a is not defined/);
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/forSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var script;
    script = require("./scriptAssertions");
    describe("for", function() {
        it("can be returned from", function() {
            return script.shouldOutput('count to three () =\n    for (n = 0, n < 10, ++n)\n        if (n > 2)\n            return "three"\n\nprint (count to three ())', "'three'");
        });
        it("returns in functions within for don't return from for", function() {
            return script.shouldOutput("items = [[1, 2, 3], [1, 2], [1]]\n\nfor each @(item) in (items)\n  item count () = return (item.length)\n\n  print (item count ())", "3\n2\n1");
        });
        it("can loop", function() {
            return script.shouldOutput("count to three () =\n    for (n = 0, n < 10, ++n)\n        print (n)\n\ncount to three ()", "0\n1\n2\n3\n4\n5\n6\n7\n8\n9");
        });
        return describe("for in", function() {
            return it("iterates over object's fields", function() {
                return script.shouldOutput("object = {a = 1, b = 2}\n\nfor @(field) in (object)\n    print (field)", "'a'\n'b'");
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/functionSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var script, shouldOutput;
    script = require("./scriptAssertions");
    shouldOutput = script.shouldOutput;
    describe("functions", function() {
        describe("definitions", function() {
            it('functions can be defined by placing the arguments to the left of the equals sign "="', function() {
                return shouldOutput("succ (n) =\n   n + 1\n            \nprint (succ (1))", "2");
            });
            return describe("functions with no arguments", function() {
                it('a function can be defined to have no parameters with empty parens "()"', function() {
                    return shouldOutput('say hi () =\n   print "hi"\n            \nsay hi ()', "'hi'");
                });
                return it("a function's parameters shadow variables in outer scope", function() {
                    return shouldOutput('foo (a) =\n    print (a)\n                \na = "outer a"\nfoo "inner a"\nprint (a)', "'inner a'\n'outer a'");
                });
            });
        });
        describe("splats", function() {
            it("a function can be defined with a single splat parameter", function() {
                return shouldOutput("foo (args, ...) =\n    print (args)\n\nfoo 1 2", "[ 1, 2 ]");
            });
            it("a function can be called with more than one splat argument", function() {
                return shouldOutput("foo (args, ...) =\n    print (args)\n         \nfoo 1 [2, 3] ... [4, 5] ... 6", "[ 1, 2, 3, 4, 5, 6 ]");
            });
            return it("a function's splat parameter shadows variables in outer scope", function() {
                return shouldOutput('foo (a, ...) =\n    print (a.0)\n\na = "outer a"\n\nfoo "inner a"\nprint (a)', "'inner a'\n'outer a'");
            });
        });
        describe("optional arguments", function() {
            it("functions can take optional arguments", function() {
                return shouldOutput("print (size: 10)", "{ size: 10 }");
            });
            it("a function can be defined to take an optional argument", function() {
                return shouldOutput('open tcp connection (host: nil, port: nil) =\n    print (host)\n    print (port)\n\nopen tcp connection (host: "pogoscript.org", port: 80)', "'pogoscript.org'\n80");
            });
            it("if the optional parameter has a default value\nand no optional arguments are passed by the caller,\nthen that default value is used", function() {
                return shouldOutput("open tcp connection (port: 80) =\n    print (port)\n\nopen tcp connection ()", "80");
            });
            it("if the optional parameter has a default value\nand other optional arguments are passed by the caller\nbut not that one, then that default value is used", function() {
                return shouldOutput('open tcp connection (port: 80) =\n    print (port)\n\nopen tcp connection (host: "pogoscript.org")', "80");
            });
            it("a function's optional parameter shadows variables in outer scope", function() {
                return shouldOutput('foo (bar: nil) =\n    print (bar)\n\nbar = "outer bar"\nfoo (bar: "inner bar")\nprint (bar)', "'inner bar'\n'outer bar'");
            });
            it("a function's optional parameter shadows variables in outer scope,\neven if it has a default value", function() {
                return shouldOutput('foo (bar: 80) =\n    print (bar)\n\nbar = "outer bar"\nfoo (bar: "inner bar")\nprint (bar)', "'inner bar'\n'outer bar'");
            });
            return it("when a block is passed as an optional argument, it does not redefine self", function() {
                return shouldOutput('foo (bar: nil) =\n    bar ()\n\nobj = {\n    field = "field value"\n    method () =\n        foo (bar (): print (self.field))\n}\n\nobj.method ()', "'field value'");
            });
        });
        return describe("redefining self", function() {
            return it("redefines self with the => operator", function() {
                return shouldOutput('print self () = =>\n    print (self.x)\n\nprint self.call ({x = "self"})', "'self'");
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/hashSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var script, shouldOutput, shouldThrow;
    script = require("./scriptAssertions");
    shouldOutput = script.shouldOutput;
    shouldThrow = script.shouldThrow;
    describe("hashes", function() {
        return describe("evaluation", function() {
            it("a `true` hash entry does not need it's value specified", function() {
                return shouldOutput("print {one}", "{ one: true }");
            });
            it("a hash can have multiple entries, delimited by commas", function() {
                return shouldOutput("print {color 'red', size 'large'}", "{ color: 'red', size: 'large' }");
            });
            it("a hash can have multiple entries, delimited by new lines", function() {
                return shouldOutput("print {\n    color 'red'\n    size 'large'\n}", "{ color: 'red', size: 'large' }");
            });
            return it('hash entries can be written with an equals "=" operator', function() {
                return shouldOutput("print {color = 'red', size = 'large'}", "{ color: 'red', size: 'large' }");
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/ifSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var script, shouldOutput;
    script = require("./scriptAssertions");
    shouldOutput = script.shouldOutput;
    describe("if", function() {
        return describe("evaluation", function() {
            return it("a `true` hash entry does not need it's value specified", function() {
                return shouldOutput('print (\n    if (true)\n        "true"\n    else\n        "false"\n)', "'true'");
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/instanceof.js", function(exports, require, module){
(function() {
    var self = this;
    var script;
    script = require("./scriptAssertions");
    describe("instanceof operator (::)", function() {
        describe("Array", function() {
            it("an array is an instance of Array", function() {
                return script.shouldOutput("print ([] :: Array)", "true");
            });
            return it("a string is not an instance of Array", function() {
                return script.shouldOutput('print ("string" :: Array)', "false");
            });
        });
        describe("Object", function() {
            it("an object is an instance of Object", function() {
                return script.shouldOutput("print ({} :: Object)", "true");
            });
            it("an array is an instance of Object", function() {
                return script.shouldOutput("print ([] :: Object)", "true");
            });
            it("a function is an instance of Object", function() {
                return script.shouldOutput("print (@{} :: Object)", "true");
            });
            return it("a string is not an instance of Object", function() {
                return script.shouldOutput('print ("string" :: Object)', "false");
            });
        });
        describe("String", function() {
            it("a string is an instance of String", function() {
                return script.shouldOutput('print ("thing" :: String)', "true");
            });
            return it("a number is not an instance of String", function() {
                return script.shouldOutput("print (3 :: String)", "false");
            });
        });
        describe("Number", function() {
            it("a number is an instance of Number", function() {
                return script.shouldOutput("print (9 :: Number)", "true");
            });
            return it("a string is not an instance of Number", function() {
                return script.shouldOutput('print ("string" :: Number)', "false");
            });
        });
        describe("Boolean", function() {
            it("a boolean is an instance of Boolean", function() {
                return script.shouldOutput("print (true :: Boolean)", "true");
            });
            return it("a string is not an instance of Boolean", function() {
                return script.shouldOutput('print ("string" :: Boolean)', "false");
            });
        });
        return describe("Function", function() {
            it("a function is an instance of Function", function() {
                return script.shouldOutput("print (@{} :: Function)", "true");
            });
            return it("a string is not an instance of Function", function() {
                return script.shouldOutput('print ("string" :: Function)', "false");
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/interpolationSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var interpolation, shouldBeFalse, shouldBeTrue;
    interpolation = require("../lib/parser/interpolation");
    shouldBeFalse = function(x) {
        return x.should.not.be.ok;
    };
    shouldBeTrue = function(x) {
        return x.should.be.ok;
    };
    describe("interpolation", function() {
        var interpolationState;
        interpolationState = undefined;
        beforeEach(function() {
            return interpolationState = interpolation.createInterpolation();
        });
        describe("the number of starts should be matched by the same number of stops", function() {
            it("should not be interpolating if it interpolation hasn't been started", function() {
                return shouldBeFalse(interpolationState.interpolating());
            });
            it("should be interpolating if it interpolation has been started", function() {
                interpolationState.startInterpolation();
                return shouldBeTrue(interpolationState.interpolating());
            });
            it("should not be interpolating if interpolation has been started, then stopped", function() {
                interpolationState.startInterpolation();
                interpolationState.stopInterpolation();
                return shouldBeFalse(interpolationState.interpolating());
            });
            it("should not be interpolating if started twice and stopped twice", function() {
                interpolationState.startInterpolation();
                interpolationState.startInterpolation();
                interpolationState.stopInterpolation();
                interpolationState.stopInterpolation();
                return shouldBeFalse(interpolationState.interpolating());
            });
            return it("should be interpolating if started twice and stopped once", function() {
                interpolationState.startInterpolation();
                interpolationState.startInterpolation();
                interpolationState.stopInterpolation();
                return shouldBeTrue(interpolationState.interpolating());
            });
        });
        describe("when there are more close brackets than open brackets, then interpolation is finished", function() {
            beforeEach(function() {
                return interpolationState.startInterpolation();
            });
            it("should be finished interpolation after a close bracket", function() {
                interpolationState.closeBracket();
                return shouldBeTrue(interpolationState.finishedInterpolation());
            });
            it("should not be finished interpolation after an open, then close bracket", function() {
                interpolationState.openBracket();
                interpolationState.closeBracket();
                return shouldBeFalse(interpolationState.finishedInterpolation());
            });
            it("should not be finished interpolation after a two opens, and two close brackets", function() {
                interpolationState.openBracket();
                interpolationState.openBracket();
                interpolationState.closeBracket();
                interpolationState.closeBracket();
                return shouldBeFalse(interpolationState.finishedInterpolation());
            });
            return it("should be finished interpolation after a two opens, and three close brackets", function() {
                interpolationState.openBracket();
                interpolationState.openBracket();
                interpolationState.closeBracket();
                interpolationState.closeBracket();
                interpolationState.closeBracket();
                return shouldBeTrue(interpolationState.finishedInterpolation());
            });
        });
        return describe('multiple interpolations.\ngiven the following scenario:\n\n"foo #(func ("bar #(x)"))"\n    \nstart interpolation, open bracket\nstart inner interpolation\nclose bracket, stop interpolation\nclose bracket, close bracket\nstop interpolation', function() {
            return it("should have stopped interpolation", function() {
                interpolationState.startInterpolation();
                interpolationState.openBracket();
                interpolationState.startInterpolation();
                interpolationState.closeBracket();
                shouldBeTrue(interpolationState.finishedInterpolation());
                interpolationState.stopInterpolation();
                shouldBeTrue(interpolationState.interpolating());
                interpolationState.closeBracket();
                interpolationState.closeBracket();
                shouldBeTrue(interpolationState.finishedInterpolation());
                interpolationState.stopInterpolation();
                return shouldBeFalse(interpolationState.interpolating());
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/listComprehensions.js", function(exports, require, module){
(function() {
    var self = this;
    var script, shouldOutput, asyncShouldOutput;
    script = require("./scriptAssertions");
    shouldOutput = script.shouldOutput;
    asyncShouldOutput = script.asyncShouldOutput;
    describe("list comprehensions", function() {
        describe("map", function() {
            it("can do the identity map", function() {
                return shouldOutput("print [x, where: x <- [1, 2, 3]]", "[ 1, 2, 3 ]");
            });
            it("can map items to new values", function() {
                return shouldOutput("print [x + 1, where: x <- [1, 2, 3]]", "[ 2, 3, 4 ]");
            });
            return it("can map items to new values with async function", function() {
                return asyncShouldOutput("f! (x) =\n    async!()\n    x + 1\n\nprint [f!(x), where: x <- [1, 2, 3]]", "[ 2, 3, 4 ]");
            });
        });
        describe("filter", function() {
            it("can filter out items before mapping", function() {
                return shouldOutput("print [x, where: x <- [1, 2, 3], x > 1]", "[ 2, 3 ]");
            });
            return it("can filter out items before mapping with async filter", function() {
                return asyncShouldOutput("f! (x) =\n    async!()\n    x > 1\n\nprint [x, where: x <- [1, 2, 3], f! (x)]", "[ 2, 3 ]");
            });
        });
        describe("definitions", function() {
            it("can map a new definition", function() {
                return shouldOutput("print [y, where: x <- [1, 2, 3], y = x + 1]", "[ 2, 3, 4 ]");
            });
            return it("can map a new definition with async function", function() {
                return asyncShouldOutput("f! (x) =\n    async!()\n    x + 1\n\nprint [y, where: x <- [1, 2, 3], y = f! (x)]", "[ 2, 3, 4 ]");
            });
        });
        describe("iteration within iteration", function() {
            it("can iterate within an iterator", function() {
                return shouldOutput("print [[x, y], where: x <- [1, 2], y <- [-1, -2]]", "[ [ 1, -1 ], [ 1, -2 ], [ 2, -1 ], [ 2, -2 ] ]");
            });
            return it("can map a new definition with async function", function() {
                return asyncShouldOutput("f! (x) =\n    async!()\n    [x, -x]\n\nprint [[x, y], where: x <- [1, 2], y <- f! (x)]", "[ [ 1, 1 ], [ 1, -1 ], [ 2, 2 ], [ 2, -2 ] ]");
            });
        });
        return describe("combinations", function() {
            return it("iterate, then filter, then map, then iterate, then map", function() {
                return shouldOutput("print [z, where: x <- [1, 2, 3, 4], @not (x % 2), y = x * x, z <- [1, y]]", "[ 1, 4, 1, 16 ]");
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/macroDirectorySpec.js", function(exports, require, module){
(function() {
    var self = this;
    var cg, should;
    cg = require("../lib/parser/codeGenerator").codeGenerator();
    require("./assertions");
    should = require("should");
    describe("macro directory", function() {
        it("one macro", function() {
            var md;
            md = cg.macroDirectory();
            md.addMacro([ "one" ], 1);
            return should.equal(md.findMacro([ "one" ]), 1);
        });
        it("longer name doesn't find macro with shorter name", function() {
            var md;
            md = cg.macroDirectory();
            md.addMacro([ "one" ], 1);
            return should.equal(md.findMacro([ "one", "two" ]), void 0);
        });
        it("finds correct macro among two", function() {
            var md;
            md = cg.macroDirectory();
            md.addMacro([ "one" ], 1);
            md.addMacro([ "one", "two" ], 2);
            return should.equal(md.findMacro([ "one", "two" ]), 2);
        });
        it("adding same macro overwrites previous", function() {
            var md;
            md = cg.macroDirectory();
            md.addMacro([ "one", "two" ], 2);
            md.addMacro([ "one", "two" ], 3);
            return should.equal(md.findMacro([ "one", "two" ]), 3);
        });
        return describe("wild card macros", function() {
            it("wild card macro with further name requirement", function() {
                var md, macro, wild;
                md = cg.macroDirectory();
                macro = {};
                wild = function(name) {
                    if (name.length === 3 && name[2] === "three") {
                        return macro;
                    }
                };
                md.addWildCardMacro([ "one", "two" ], wild);
                should.equal(md.findMacro([ "one", "two" ]), void 0);
                should.equal(md.findMacro([ "one", "two", "three" ]), macro);
                return should.equal(md.findMacro([ "one", "two", "four" ]), void 0);
            });
            it("wild card macro with exact name", function() {
                var md, macro, wild;
                md = cg.macroDirectory();
                macro = {};
                wild = function(name) {
                    return macro;
                };
                md.addWildCardMacro([ "one", "two" ], wild);
                return should.equal(md.findMacro([ "one", "two" ]), macro);
            });
            return it("normal macros have priority over wild card macros", function() {
                var md, macro, wild;
                md = cg.macroDirectory();
                macro = {};
                wild = function(name) {
                    if (name.length === 3 && name[2] === "three") {
                        return macro;
                    }
                };
                md.addWildCardMacro([ "one", "two" ], wild);
                md.addMacro([ "one", "two", "three" ], 3);
                should.equal(md.findMacro([ "one", "two" ]), void 0);
                should.equal(md.findMacro([ "one", "two", "three" ]), 3);
                return should.equal(md.findMacro([ "one", "two", "four" ]), void 0);
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/macrosSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var terms, loc;
    require("./assertions");
    require("./parserAssertions");
    terms = require("../lib/parser/codeGenerator").codeGenerator();
    loc = {
        firstLine: 1,
        lastLine: 1,
        firstColumn: 3,
        lastColumn: 8
    };
    describe("macros", function() {
        describe("if", function() {
            it("if", function() {
                return shouldContainFields(macroExpression("if (true) @{a}"), {
                    isIfExpression: true,
                    cases: [ {
                        condition: {
                            variable: [ "true" ]
                        },
                        body: {
                            statements: [ {
                                variable: [ "a" ]
                            } ]
                        }
                    } ]
                });
            });
            it("if else", function() {
                return shouldContainFields(macroExpression("if (true) @{a} else @{b}"), {
                    isIfExpression: true,
                    elseBody: {
                        statements: [ {
                            variable: [ "b" ]
                        } ]
                    },
                    cases: [ {
                        condition: {
                            variable: [ "true" ]
                        },
                        body: {
                            statements: [ {
                                variable: [ "a" ]
                            } ]
                        }
                    } ]
                });
            });
            it("if else if", function() {
                return shouldContainFields(macroExpression("if (true) @{a} else if (false) @{b}"), {
                    isIfExpression: true,
                    elseBody: undefined,
                    cases: [ {
                        condition: {
                            variable: [ "true" ]
                        },
                        body: {
                            statements: [ {
                                variable: [ "a" ]
                            } ]
                        }
                    }, {
                        condition: {
                            variable: [ "false" ]
                        },
                        body: {
                            statements: [ {
                                variable: [ "b" ]
                            } ]
                        }
                    } ]
                });
            });
            return it("if else if else", function() {
                return shouldContainFields(macroExpression("if (true) @{a} else if (false) @{b} else @{c}"), {
                    isIfExpression: true,
                    elseBody: {
                        statements: [ {
                            variable: [ "c" ]
                        } ]
                    },
                    cases: [ {
                        condition: {
                            variable: [ "true" ]
                        },
                        body: {
                            statements: [ {
                                variable: [ "a" ]
                            } ]
                        }
                    }, {
                        condition: {
                            variable: [ "false" ]
                        },
                        body: {
                            statements: [ {
                                variable: [ "b" ]
                            } ]
                        }
                    } ]
                });
            });
        });
        it("for", function() {
            return shouldContainFields(macroExpression("for (n = 0, n < 10, n = n + 1) @{a}"), {
                isFor: true,
                initialization: {
                    isDefinition: true,
                    source: {
                        integer: 0
                    },
                    target: {
                        variable: [ "n" ]
                    }
                },
                test: {
                    isOperator: true,
                    operator: "<",
                    operatorArguments: [ {
                        variable: [ "n" ]
                    }, {
                        integer: 10
                    } ]
                },
                increment: {
                    isDefinition: true,
                    target: {
                        variable: [ "n" ]
                    },
                    source: {
                        isOperator: true,
                        operator: "+",
                        operatorArguments: [ {
                            variable: [ "n" ]
                        }, {
                            integer: 1
                        } ]
                    }
                },
                statements: {
                    isStatements: true,
                    statements: [ {
                        variable: [ "a" ]
                    } ]
                }
            });
        });
        it("for with return in body", function() {
            return shouldContainFields(macroExpression("for (n = 0, n < 10, n = n + 1) @{return (a)}"), {
                isFor: true,
                initialization: {
                    isDefinition: true,
                    source: {
                        integer: 0
                    },
                    target: {
                        variable: [ "n" ]
                    }
                },
                test: {
                    isOperator: true,
                    operator: "<",
                    operatorArguments: [ {
                        variable: [ "n" ]
                    }, {
                        integer: 10
                    } ]
                },
                increment: {
                    isDefinition: true,
                    target: {
                        variable: [ "n" ]
                    },
                    source: {
                        isOperator: true,
                        operator: "+",
                        operatorArguments: [ {
                            variable: [ "n" ]
                        }, {
                            integer: 1
                        } ]
                    }
                },
                statements: {
                    isStatements: true,
                    statements: [ {
                        isDefinition: true,
                        source: {},
                        target: {
                            isVariable: true,
                            name: [ "for", "result" ]
                        }
                    }, {
                        isIfExpression: true,
                        cases: [ {
                            condition: {
                                isSubExpression: true,
                                expression: {
                                    isFunctionCall: true,
                                    "function": {
                                        isClosure: true,
                                        parameters: [ {
                                            variable: [ "n" ]
                                        } ],
                                        body: {
                                            isStatements: true,
                                            statements: [ {
                                                isDefinition: true,
                                                target: {
                                                    isVariable: true,
                                                    name: [ "for", "result" ]
                                                },
                                                source: {
                                                    variable: [ "a" ]
                                                }
                                            }, {
                                                isReturn: true,
                                                expression: {
                                                    "boolean": true
                                                }
                                            } ]
                                        }
                                    },
                                    functionArguments: [ {
                                        variable: [ "n" ]
                                    } ]
                                }
                            },
                            body: {
                                isStatements: true,
                                statements: [ {
                                    isReturn: true,
                                    expression: {
                                        isVariable: true,
                                        name: [ "for", "result" ]
                                    }
                                } ]
                            }
                        } ]
                    } ]
                }
            });
        });
        describe("for each", function() {
            return it("generates for", function() {
                return shouldContainFields(macroStatements("for each @(item) in (items) @{item}"), {
                    statements: [ terms.definition(terms.generatedVariable([ "items" ]), terms.variable([ "items" ])), terms.forExpression(terms.definition(terms.generatedVariable([ "i" ]), terms.integer(0)), terms.operator("<", [ terms.generatedVariable([ "i" ]), terms.fieldReference(terms.generatedVariable([ "items" ]), [ "length" ]) ]), terms.increment(terms.generatedVariable([ "i" ])), terms.statements([ terms.definition(terms.variable([ "item" ]), terms.indexer(terms.generatedVariable([ "items" ]), terms.generatedVariable([ "i" ]))), terms.variable([ "item" ]) ])) ]
                });
            });
        });
        describe("for @(item) in (items) @{}", function() {
            return it("generates for (var item in items) {}", function() {
                return shouldContainFields(macroExpression("for @(item) in (items) @{item}"), {
                    isForIn: true,
                    iterator: {
                        isDefinition: true,
                        target: {
                            variable: [ "item" ]
                        }
                    },
                    collection: {
                        variable: [ "items" ]
                    },
                    statements: {
                        isSubExpression: true,
                        expression: {
                            isFunctionCall: true,
                            "function": {
                                isClosure: true,
                                parameters: [ {
                                    variable: [ "item" ]
                                } ],
                                body: {
                                    isStatements: true,
                                    statements: [ {
                                        variable: [ "item" ]
                                    } ]
                                }
                            },
                            functionArguments: [ {
                                variable: [ "item" ]
                            } ]
                        }
                    }
                });
            });
        });
        it("while", function() {
            return shouldContainFields(macroExpression("while (n < 10) @{n}"), {
                isWhile: true,
                condition: {
                    isOperator: true,
                    operator: "<",
                    operatorArguments: [ {
                        variable: [ "n" ]
                    }, {
                        integer: 10
                    } ]
                },
                statements: {
                    statements: [ {
                        variable: [ "n" ]
                    } ]
                }
            });
        });
        describe("try", function() {
            it("try catch", function() {
                return shouldContainFields(macroExpression("try @{a} catch (ex) @{b}"), {
                    isTryExpression: true,
                    body: {
                        statements: [ {
                            variable: [ "a" ]
                        } ]
                    },
                    catchBody: {
                        statements: [ {
                            variable: [ "b" ]
                        } ]
                    },
                    catchParameter: {
                        variable: [ "ex" ]
                    },
                    finallyBody: void 0
                });
            });
            it("try finally", function() {
                return shouldContainFields(macroExpression("try @{a} finally @{b}"), {
                    isTryExpression: true,
                    body: {
                        statements: [ {
                            variable: [ "a" ]
                        } ]
                    },
                    catchBody: undefined,
                    finallyBody: {
                        statements: [ {
                            variable: [ "b" ]
                        } ]
                    }
                });
            });
            return it("try catch finally", function() {
                return shouldContainFields(macroExpression("try @{a} catch (ex) @{b} finally @{c}"), {
                    isTryExpression: true,
                    body: {
                        statements: [ {
                            variable: [ "a" ]
                        } ]
                    },
                    catchBody: {
                        statements: [ {
                            variable: [ "b" ]
                        } ]
                    },
                    catchParameter: {
                        variable: [ "ex" ]
                    },
                    finallyBody: {
                        statements: [ {
                            variable: [ "c" ]
                        } ]
                    }
                });
            });
        });
        describe("new", function() {
            it("constructor with arguments", function() {
                return shouldContainFields(macroExpression("new (Date 2011 2 21)"), {
                    isNewOperator: true,
                    functionCall: {
                        isFunctionCall: true,
                        "function": {
                            variable: [ "Date" ]
                        },
                        functionArguments: [ {
                            integer: 2011
                        }, {
                            integer: 2
                        }, {
                            integer: 21
                        } ]
                    }
                });
            });
            it("constructor without arguments, just variable", function() {
                return shouldContainFields(macroExpression("new (Date)"), {
                    isNewOperator: true,
                    functionCall: {
                        variable: [ "Date" ]
                    }
                });
            });
            return it("with splat arguments", function() {
                return shouldContainFields(macroStatements("new (Stack (args, ...))"), terms.statements([ terms.definition(terms.generatedVariable([ "c" ]), terms.closure([], terms.statements([ terms.functionCall(terms.variable([ "Stack" ]), [ terms.variable([ "args" ]), terms.splat() ], {
                    passThisToApply: true
                }) ]), {
                    returnLastStatement: false
                })), terms.definition(terms.fieldReference(terms.generatedVariable([ "c" ]), [ "prototype" ]), terms.fieldReference(terms.variable([ "Stack" ]), [ "prototype" ])), terms.newOperator(terms.generatedVariable([ "c" ])) ]));
            });
        });
        describe("==", function() {
            return it("generates ===", function() {
                return shouldContainFields(macroExpression("a == b"), {
                    isOperator: true,
                    operator: "===",
                    operatorArguments: [ {
                        variable: [ "a" ]
                    }, {
                        variable: [ "b" ]
                    } ]
                });
            });
        });
        describe("!=", function() {
            return it("generates !==", function() {
                return shouldContainFields(macroExpression("a != b"), {
                    isOperator: true,
                    operator: "!==",
                    operatorArguments: [ {
                        variable: [ "a" ]
                    }, {
                        variable: [ "b" ]
                    } ]
                });
            });
        });
        describe("::", function() {
            return it("generates instanceof", function() {
                return shouldContainFields(macroExpression("a :: b"), {
                    isOperator: true,
                    operator: "instanceof",
                    operatorArguments: [ {
                        variable: [ "a" ]
                    }, {
                        variable: [ "b" ]
                    } ]
                });
            });
        });
        describe("in", function() {
            return it("generates in", function() {
                return shouldContainFields(macroExpression("(a) in (b)"), {
                    isOperator: true,
                    operator: "in",
                    operatorArguments: [ {
                        variable: [ "a" ]
                    }, {
                        variable: [ "b" ]
                    } ]
                });
            });
        });
        describe("break", function() {
            return it("generates break statement", function() {
                return shouldContainFields(macroExpression("break"), {
                    isBreak: true
                });
            });
        });
        describe("return", function() {
            return it("generates void return statement", function() {
                return shouldContainFields(macroExpression("return"), {
                    isReturn: true,
                    expression: undefined
                });
            });
        });
        describe("nil", function() {
            return it("generates void 0", function() {
                return shouldContainFields(macroExpression("nil"), {
                    isNil: true
                });
            });
        });
        describe("continuation", function() {
            context("when called as a function", function() {
                return shouldContainFields(macroExpression("continuation (x, y)"), {
                    isFunctionCall: true,
                    "function": {
                        isContinuation: true
                    },
                    functionArguments: [ {
                        variable: [ "x" ]
                    }, {
                        variable: [ "y" ]
                    } ]
                });
            });
            return context("when as a variable", function() {
                return shouldContainFields(macroExpression("continuation"), {
                    isContinuation: true
                });
            });
        });
        return describe("JavaScript operators", function() {
            var itGeneratesUnary, itGeneratesBinary;
            itGeneratesUnary = function(op) {
                return it("generates unary " + op, function() {
                    return shouldContainFields(macroExpression(op + " a"), {
                        isOperator: true,
                        operator: op,
                        operatorArguments: [ {
                            variable: [ "a" ]
                        } ]
                    });
                });
            };
            itGeneratesBinary = function(op) {
                return it("generates binary " + op, function() {
                    return shouldContainFields(macroExpression("a " + op + " b"), {
                        isOperator: true,
                        operator: op,
                        operatorArguments: [ {
                            variable: [ "a" ]
                        }, {
                            variable: [ "b" ]
                        } ]
                    });
                });
            };
            itGeneratesUnary("!");
            itGeneratesUnary("~");
            itGeneratesUnary("+");
            itGeneratesUnary("-");
            itGeneratesUnary("--");
            itGeneratesUnary("++");
            itGeneratesBinary("+");
            itGeneratesBinary("*");
            itGeneratesBinary("/");
            itGeneratesBinary("-");
            itGeneratesBinary("%");
            itGeneratesBinary("<<");
            itGeneratesBinary(">>");
            itGeneratesBinary(">>>");
            itGeneratesBinary(">");
            itGeneratesBinary(">=");
            itGeneratesBinary("<");
            itGeneratesBinary("<=");
            itGeneratesBinary("&");
            itGeneratesBinary("^");
            itGeneratesBinary("|");
            itGeneratesBinary("&&");
            return itGeneratesBinary("||");
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/methodSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var script, shouldOutput;
    script = require("./scriptAssertions");
    shouldOutput = script.shouldOutput;
    describe("methods", function() {
        return describe("preserving self", function() {
            return context("when a block is called within a method", function() {
                return it("uses the same self as the method", function() {
                    return shouldOutput('block (b) = b ()\n\no = {\n    name = "name"\n\n    my method () =\n        block\n            print (self.name)\n}\n\no.my method ()', "'name'");
                });
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/moduleConstantsSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var terms;
    terms = require("../lib/parser/codeGenerator").codeGenerator();
    require("./assertions");
    describe("module constants", function() {
        it("ignores the second definition of a constant", function() {
            var module, piVariable;
            module = terms.module(terms.statements([ terms.variable([ "a" ]) ]), {
                inScope: false
            });
            piVariable = terms.moduleConstants.defineAs([ "pi" ], terms.float(3.142));
            terms.moduleConstants.defineAs([ "pi" ], terms.float(3));
            return shouldContainFields(terms.moduleConstants.definitions(), [ terms.definition(piVariable, terms.float(3.142)) ]);
        });
        return it("all definitions of the same constant return the same variable", function() {
            var firstPi, secondPi;
            firstPi = terms.moduleConstants.defineAs([ "pi" ], terms.float(3.142));
            secondPi = terms.moduleConstants.defineAs([ "pi" ], terms.float(3));
            return firstPi.should.equal(secondPi);
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/newSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var script;
    script = require("./scriptAssertions");
    describe("new", function() {
        it("can construct with arguments", function() {
            return script.shouldOutput("c (n) = =>\n    this.n = n\n    nil\n\nprint (new (c 7))", "{ n: 7 }");
        });
        it("can construct without arguments", function() {
            return script.shouldOutput('c () = =>\n    this.n = "n"\n    nil\n\nprint (new (c))', "{ n: 'n' }");
        });
        it("can construct without arguments and get field reference", function() {
            return script.shouldOutput('c () = =>\n    this.n = "n"\n    nil\n\nprint ((new (c)).n)', "'n'");
        });
        return it("can construct with splat arguments", function() {
            return script.shouldOutput("c (n) = =>\n    this.n = n\n    nil\n\nargs = [7]\n\nprint (new (c (args, ...)))", "{ n: 7 }");
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/operatorExpressionSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var cg, expression, complexExpression, variable, loc, id;
    cg = require("../lib/parser/codeGenerator").codeGenerator();
    require("./assertions");
    expression = function(expression) {
        return cg.operatorExpression(complexExpression(expression));
    };
    complexExpression = function(expression) {
        return cg.complexExpression([ expression ]);
    };
    variable = function(name) {
        return cg.variable([ name ]);
    };
    loc = {
        firstLine: 1,
        lastLine: 1,
        firstColumn: 3,
        lastColumn: 8
    };
    id = function(name) {
        return cg.loc(cg.identifier(name), loc);
    };
    describe("operator expression", function() {
        it("a", function() {
            var e;
            e = expression([ id("a") ]);
            return shouldContainFields(e.expression(), {
                isVariable: true,
                variable: [ "a" ]
            });
        });
        it("looks up macro", function() {
            var e;
            e = expression([ id("a") ]);
            e.addOperatorExpression("+", complexExpression([ id("b") ]));
            return shouldContainFields(e.expression(), {
                operator: "+",
                operatorArguments: [ {
                    variable: [ "a" ]
                }, {
                    variable: [ "b" ]
                } ]
            });
        });
        describe("hash entry", function() {
            it("a", function() {
                var e;
                e = expression([ id("a") ]);
                return shouldContainFields(e.hashEntry(), {
                    isHashEntry: true,
                    field: [ "a" ],
                    value: undefined
                });
            });
            return it("a */ b", function() {
                var e;
                e = expression([ id("a") ]);
                e.addOperatorExpression("*/", complexExpression([ id("b") ]));
                return shouldContainFields(e.hashEntry(), {
                    isSemanticError: true
                });
            });
        });
        return describe("definition", function() {
            it("a = b", function() {
                var e;
                e = expression([ id("a") ]);
                return shouldContainFields(e.definition(variable("b")).expression(), {
                    isDefinition: true,
                    target: {
                        variable: [ "a" ]
                    },
                    source: {
                        variable: [ "b" ]
                    }
                });
            });
            return it("a */ b = c", function() {
                var e;
                e = expression([ id("a") ]);
                e.addOperatorExpression("*/", complexExpression([ id("b") ]));
                return shouldContainFields(e.definition(variable("c")), {
                    isDefinition: true,
                    target: {
                        isFieldReference: true,
                        object: {
                            variable: [ "a" ]
                        },
                        name: [ "*/" ]
                    },
                    source: {
                        isBlock: true,
                        parameters: [ {
                            variable: [ "b" ]
                        } ],
                        optionalParameters: [],
                        body: {
                            statements: [ {
                                variable: [ "c" ]
                            } ]
                        }
                    }
                });
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/parserAssertions.js", function(exports, require, module){
(function() {
    var self = this;
    var createParser, createTerms, parser, parse, assumeIsModuleWithStatements, assumeHasJustOneStatement;
    createParser = require("../lib/parser/parser").createParser;
    createTerms = function() {
        return require("../lib/parser/codeGenerator").codeGenerator();
    };
    parser = createParser({
        terms: createTerms()
    });
    parse = parser.parse;
    assumeIsModuleWithStatements = function(term, action) {
        if (term.isModule) {
            return action(term.statements);
        } else {
            throw new Error("expected module, but found " + term.inspectTerm());
        }
    };
    assumeHasJustOneStatement = function(statements, action) {
        if (statements.statements.length === 1) {
            return statements.statements[0];
        } else {
            throw new Error("expected statements to have just one statement, found " + statements.statements.length);
        }
    };
    global.expression = function(source) {
        var self = this;
        return assumeHasJustOneStatement(statements(source), function(statement) {
            return statement;
        });
    };
    global.macroExpression = function(source) {
        var self = this;
        return assumeHasJustOneStatement(statements(source, {
            expandMacros: true
        }), function(statement) {
            return statement;
        });
    };
    global.macroStatements = function(source, gen1_options) {
        var self = this;
        var print;
        print = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "print") && gen1_options.print !== void 0 ? gen1_options.print : false;
        var stmts;
        stmts = statements(source, {
            expandMacros: true
        });
        if (print) {
            stmts.show();
        }
        return stmts;
    };
    global.statements = function(source, gen2_options) {
        var self = this;
        var expandMacros;
        expandMacros = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "expandMacros") && gen2_options.expandMacros !== void 0 ? gen2_options.expandMacros : false;
        return parse(source);
    };
}).call(this);
});
require.register("pogoscript-tests/test/parserContextSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var parserContext, cg, shouldContainFields;
    parserContext = require("../lib/parser/parserContext");
    cg = require("../lib/parser/codeGenerator").codeGenerator();
    shouldContainFields = require("./containsFields").containsFields;
    describe("parser context", function() {
        var context;
        context = parserContext.createParserContext({
            terms: cg
        });
        describe("compress interpolated string components", function() {
            it("joins contiguous string components together", function() {
                var components;
                components = context.compressInterpolatedStringComponents([ cg.string("one"), cg.string("two") ]);
                return shouldContainFields(components, [ {
                    isString: true,
                    string: "onetwo"
                } ]);
            });
            return it("joins two groups of contiguous string components together, separated by an expression", function() {
                var components;
                components = context.compressInterpolatedStringComponents([ cg.string("one"), cg.string("two"), cg.variable([ "value" ]), cg.string("three"), cg.string("four") ]);
                return shouldContainFields(components, [ {
                    isString: true,
                    string: "onetwo"
                }, {
                    variable: [ "value" ]
                }, {
                    isString: true,
                    string: "threefour"
                } ]);
            });
        });
        describe("unindent string components", function() {
            return it("removes indentation from each string component", function() {
                var components;
                components = context.unindentStringComponentsBy([ cg.string("one"), cg.string("\n      two"), cg.string("\n        three") ], 6);
                return shouldContainFields(components, [ {
                    isString: true,
                    string: "one"
                }, {
                    isString: true,
                    string: "\ntwo"
                }, {
                    isString: true,
                    string: "\n  three"
                } ]);
            });
        });
        return describe("separate expression components with strings", function() {
            return it("puts string components between contiguous expression components", function() {
                var components;
                components = context.separateExpressionComponentsWithStrings([ cg.variable([ "one" ]), cg.variable([ "two" ]) ]);
                return shouldContainFields(components, [ {
                    variable: [ "one" ]
                }, {
                    isString: true,
                    string: ""
                }, {
                    variable: [ "two" ]
                } ]);
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/parserSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var parser, createTerms;
    require("./assertions");
    parser = require("../lib/parser/parser");
    require("./parserAssertions");
    createTerms = function() {
        return require("../lib/parser/codeGenerator").codeGenerator();
    };
    describe("parser", function() {
        var terms;
        terms = void 0;
        before(function() {
            return terms = createTerms();
        });
        describe("terminals", function() {
            describe("integers", function() {
                it("can parse 5", function() {
                    return shouldContainFields(expression("5"), {
                        integer: 5
                    });
                });
                return it("can parse 09", function() {
                    return shouldContainFields(expression("09"), {
                        integer: 9
                    });
                });
            });
            it("float", function() {
                return shouldContainFields(expression("5.6"), {
                    "float": 5.6
                });
            });
            describe("variables", function() {
                it("simple", function() {
                    return shouldContainFields(expression("total weight"), {
                        variable: [ "total", "weight" ]
                    });
                });
                return it("can use $ as a variable", function() {
                    return shouldContainFields(expression("$"), {
                        variable: [ "$" ]
                    });
                });
            });
            describe("strings", function() {
                it("simple string", function() {
                    return shouldContainFields(expression("'a string'"), {
                        isString: true,
                        string: "a string"
                    });
                });
                it("string with single quotes", function() {
                    return shouldContainFields(expression("'''alright!'' he said'"), {
                        isString: true,
                        string: "'alright!' he said"
                    });
                });
                it("string with backslash", function() {
                    return shouldContainFields(expression("'one \\ two'"), {
                        isString: true,
                        string: "one \\ two"
                    });
                });
                it("multiline string", function() {
                    return shouldContainFields(expression("  'one\n   two'"), {
                        isString: true,
                        string: "one\ntwo"
                    });
                });
                it("multiline string with empty lines", function() {
                    return shouldContainFields(expression("  'one\n\n   two\n\n   three'"), {
                        isString: true,
                        string: "one\n\ntwo\n\nthree"
                    });
                });
                it("multiline double-quote string", function() {
                    return shouldContainFields(expression('  "one\n   two"'), {
                        isString: true,
                        string: "one\ntwo"
                    });
                });
                return it("two multiline string in function", function() {
                    return shouldContainFields(expression("x 'one\n   two' y \"three\n           four\""), {
                        isFunctionCall: true,
                        "function": {
                            variable: [ "x", "y" ]
                        },
                        functionArguments: [ {
                            string: "one\ntwo"
                        }, {
                            string: "three\nfour"
                        } ]
                    });
                });
            });
            describe("interpolated strings", function() {
                it("simple", function() {
                    return shouldContainFields(expression('"a string"'), {
                        isString: true,
                        string: "a string"
                    });
                });
                it("empty", function() {
                    return shouldContainFields(expression('""'), {
                        isString: true,
                        string: ""
                    });
                });
                it("with newline", function() {
                    return shouldContainFields(expression('"one\\ntwo"'), {
                        string: "one\ntwo"
                    });
                });
                it("with newline escape and indentation should not remove indentation", function() {
                    return shouldContainFields(expression('  "one\\n    two"'), {
                        string: "one\n    two"
                    });
                });
                it("with indentation", function() {
                    return shouldContainFields(expression('  "one\n   two"'), {
                        string: "one\ntwo"
                    });
                });
                it("with single variable expression", function() {
                    return shouldContainFields(expression('"a boat #(boat length) meters in length"'), {
                        isInterpolatedString: true,
                        components: [ {
                            string: "a boat "
                        }, {
                            variable: [ "boat", "length" ]
                        }, {
                            string: " meters in length"
                        } ]
                    });
                });
                it("with hash # character at end", function() {
                    return shouldContainFields(expression('"this is a hash: #"'), {
                        isString: true,
                        string: "this is a hash: #"
                    });
                });
                it("with hash # character in middle", function() {
                    return shouldContainFields(expression('"this is a hash: #, ok?"'), {
                        isString: true,
                        string: "this is a hash: #, ok?"
                    });
                });
                it("with escaped #", function() {
                    return shouldContainFields(expression('"a boat \\#(boat length) meters in length"'), {
                        isString: true,
                        string: "a boat #(boat length) meters in length"
                    });
                });
                it("with complex expression", function() {
                    return shouldContainFields(expression('"a boat #(lookup boat length from (boat database)) meters in length"'), {
                        isInterpolatedString: true,
                        components: [ {
                            string: "a boat "
                        }, {
                            "function": {
                                variable: [ "lookup", "boat", "length", "from" ]
                            },
                            functionArguments: [ {
                                variable: [ "boat", "database" ]
                            } ]
                        }, {
                            string: " meters in length"
                        } ]
                    });
                });
                it("in block", function() {
                    return shouldContainFields(expression('abc =\n    "#(stuff)"'), {
                        isDefinition: true,
                        target: {
                            isVariable: true,
                            variable: [ "abc" ]
                        },
                        source: {
                            isVariable: true,
                            variable: [ "stuff" ]
                        }
                    });
                });
                return it("with inner interpolation", function() {
                    return shouldContainFields(expression('"a boat #("#(boat length) meters") in length"'), {
                        isInterpolatedString: true,
                        components: [ {
                            string: "a boat "
                        }, {
                            isInterpolatedString: true,
                            components: [ {
                                variable: [ "boat", "length" ]
                            }, {
                                string: " meters"
                            } ]
                        }, {
                            string: " in length"
                        } ]
                    });
                });
            });
            describe("sub expressions", function() {
                return it("single expression", function() {
                    return shouldContainFields(expression("(x)"), {
                        variable: [ "x" ]
                    });
                });
            });
            describe("lists", function() {
                it("empty", function() {
                    return shouldContainFields(expression("[]"), {
                        isList: true,
                        items: []
                    });
                });
                it("one item", function() {
                    return shouldContainFields(expression("[1]"), {
                        isList: true,
                        items: [ {
                            integer: 1
                        } ]
                    });
                });
                it("two items", function() {
                    return shouldContainFields(expression("[1, 2]"), {
                        isList: true,
                        items: [ {
                            integer: 1
                        }, {
                            integer: 2
                        } ]
                    });
                });
                return it("two items separated by newlines", function() {
                    return shouldContainFields(expression("[\n  1\n  2\n]"), {
                        isList: true,
                        items: [ {
                            integer: 1
                        }, {
                            integer: 2
                        } ]
                    });
                });
            });
            return describe("hashes", function() {
                it("empty hash", function() {
                    return shouldContainFields(expression("{}"), {
                        isHash: true,
                        entries: []
                    });
                });
                it("hash with one entry", function() {
                    return shouldContainFields(expression("{port 1234}"), {
                        isHash: true,
                        entries: [ {
                            field: [ "port" ],
                            value: {
                                integer: 1234
                            }
                        } ]
                    });
                });
                it("hash with two entries", function() {
                    return shouldContainFields(expression("{port 1234, ip address '1.1.1.1'}"), {
                        isHash: true,
                        entries: [ {
                            field: [ "port" ],
                            value: {
                                integer: 1234
                            }
                        }, {
                            field: [ "ip", "address" ],
                            value: {
                                string: "1.1.1.1"
                            }
                        } ]
                    });
                });
                it("hash with two entries on different lines", function() {
                    return shouldContainFields(expression("{port = 1234\nip address = '1.1.1.1'}"), {
                        isHash: true,
                        entries: [ {
                            field: [ "port" ],
                            value: {
                                integer: 1234
                            }
                        }, {
                            field: [ "ip", "address" ],
                            value: {
                                string: "1.1.1.1"
                            }
                        } ]
                    });
                });
                it("hash with string with assignment", function() {
                    return shouldContainFields(expression("{'port' = 1234}"), {
                        isHash: true,
                        entries: [ {
                            field: {
                                string: "port"
                            },
                            value: {
                                integer: 1234
                            }
                        } ]
                    });
                });
                it("values can be specified on a new line", function() {
                    return shouldContainFields(expression("{\n    height =\n        80\n}"), {
                        isHash: true,
                        entries: [ {
                            field: [ "height" ],
                            value: {
                                integer: 80
                            }
                        } ]
                    });
                });
                it("should allow methods to be defined, redefining self", function() {
                    return shouldContainFields(expression("{say hi to (name, greeting: nil) = print (name)}"), {
                        isHash: true,
                        entries: [ {
                            field: [ "say", "hi", "to" ],
                            value: {
                                isBlock: true,
                                redefinesSelf: true,
                                body: {
                                    statements: [ {
                                        isFunctionCall: true,
                                        "function": {
                                            variable: [ "print" ]
                                        }
                                    } ]
                                },
                                parameters: [ {
                                    variable: [ "name" ]
                                } ],
                                optionalParameters: [ {
                                    isHashEntry: true,
                                    field: [ "greeting" ]
                                } ]
                            }
                        } ]
                    });
                });
                return it("hash with true entry", function() {
                    return shouldContainFields(expression("{port 1234, readonly}"), {
                        isHash: true,
                        entries: [ {
                            field: [ "port" ],
                            value: {
                                integer: 1234
                            }
                        }, {
                            field: [ "readonly" ],
                            value: undefined
                        } ]
                    });
                });
            });
        });
        describe("function calls", function() {
            it("function call", function() {
                return shouldContainFields(expression("touch (file)"), {
                    "function": {
                        variable: [ "touch" ]
                    },
                    functionArguments: [ {
                        variable: [ "file" ]
                    } ]
                });
            });
            it("function call with two arguments in parens", function() {
                return shouldContainFields(expression("f (a, b)"), {
                    "function": {
                        variable: [ "f" ]
                    },
                    functionArguments: [ {
                        variable: [ "a" ]
                    }, {
                        variable: [ "b" ]
                    } ]
                });
            });
            it("two expressions", function() {
                return shouldContainFields(expression("(x, y)"), {
                    isFunctionCall: true,
                    "function": {
                        variable: [ "x" ]
                    },
                    functionArguments: [ {
                        variable: [ "y" ]
                    } ]
                });
            });
            it("function call with splat argument", function() {
                return shouldContainFields(expression("touch (files) ..."), {
                    "function": {
                        variable: [ "touch" ]
                    },
                    functionArguments: [ {
                        variable: [ "files" ]
                    }, {
                        isSplat: true
                    } ]
                });
            });
            it("function call with splat argument", function() {
                return shouldContainFields(expression("copy (files, ..., dir)"), {
                    "function": {
                        variable: [ "copy" ]
                    },
                    functionArguments: [ {
                        variable: [ "files" ]
                    }, {
                        isSplat: true
                    }, {
                        variable: [ "dir" ]
                    } ]
                });
            });
            it("async operator and comma are separate operators", function() {
                return shouldContainFields(statements("f!,a"), terms.asyncStatements([ terms.functionCall(terms.variable([ "f" ]), [], {
                    async: true
                }), terms.variable([ "a" ]) ]));
            });
            it("function call with no argument", function() {
                return shouldContainFields(expression("delete everything ()"), {
                    "function": {
                        variable: [ "delete", "everything" ]
                    },
                    functionArguments: []
                });
            });
            it("async function call with no arguments", function() {
                return shouldContainFields(expression("delete everything!"), terms.asyncStatements([ terms.functionCall(terms.variable([ "delete", "everything" ]), [], {
                    async: true
                }) ]).statements[0]);
            });
            it("function call with block with parameters", function() {
                return shouldContainFields(expression("with file (file) @(stream)\n  stream"), {
                    "function": {
                        variable: [ "with", "file" ]
                    },
                    functionArguments: [ {
                        variable: [ "file" ]
                    }, {
                        body: {
                            statements: [ {
                                variable: [ "stream" ]
                            } ]
                        },
                        parameters: [ {
                            variable: [ "stream" ]
                        } ]
                    } ]
                });
            });
            it("function call with block with long parameters", function() {
                return shouldContainFields(expression("open database @(database connection)\n  database connection"), {
                    "function": {
                        variable: [ "open", "database" ]
                    },
                    functionArguments: [ {
                        parameters: [ {
                            variable: [ "database", "connection" ]
                        } ],
                        body: {
                            statements: [ {
                                variable: [ "database", "connection" ]
                            } ]
                        }
                    } ]
                });
            });
            it("function call with two blocks with parameters", function() {
                return shouldContainFields(expression("name @(x) @{x} @ (y) @ {y}"), {
                    "function": {
                        variable: [ "name" ]
                    },
                    functionArguments: [ {
                        body: {
                            statements: [ {
                                variable: [ "x" ]
                            } ]
                        },
                        parameters: [ {
                            variable: [ "x" ]
                        } ]
                    }, {
                        body: {
                            statements: [ {
                                variable: [ "y" ]
                            } ]
                        },
                        parameters: [ {
                            variable: [ "y" ]
                        } ]
                    } ]
                });
            });
            return it("function call with two optional arguments", function() {
                return shouldContainFields(expression("name (a, port: 34, server: s)"), {
                    "function": {
                        variable: [ "name" ]
                    },
                    functionArguments: [ {
                        variable: [ "a" ]
                    } ],
                    optionalArguments: [ {
                        field: [ "port" ],
                        value: {
                            integer: 34
                        }
                    }, {
                        field: [ "server" ],
                        value: {
                            variable: [ "s" ]
                        }
                    } ]
                });
            });
        });
        describe("object operations", function() {
            it("method call", function() {
                return shouldContainFields(expression("object.method (argument)"), {
                    isMethodCall: true,
                    object: {
                        variable: [ "object" ]
                    },
                    name: [ "method" ],
                    methodArguments: [ {
                        variable: [ "argument" ]
                    } ]
                });
            });
            it("method call with optional arguments", function() {
                return shouldContainFields(expression("object.method (argument, view: view)"), {
                    isMethodCall: true,
                    object: {
                        variable: [ "object" ]
                    },
                    name: [ "method" ],
                    methodArguments: [ {
                        variable: [ "argument" ]
                    } ],
                    optionalArguments: [ {
                        field: [ "view" ],
                        value: {
                            variable: [ "view" ]
                        }
                    } ]
                });
            });
            it("field reference", function() {
                return shouldContainFields(expression("object.field"), {
                    isFieldReference: true,
                    object: {
                        variable: [ "object" ]
                    },
                    name: [ "field" ]
                });
            });
            it("field reference with newline", function() {
                return shouldContainFields(expression("object.\nfield"), {
                    isFieldReference: true,
                    object: {
                        variable: [ "object" ]
                    },
                    name: [ "field" ]
                });
            });
            it("indexer", function() {
                return shouldContainFields(expression("object.(x)"), {
                    isIndexer: true,
                    object: {
                        variable: [ "object" ]
                    },
                    indexer: {
                        variable: [ "x" ]
                    }
                });
            });
            it("parses no argument method with ()", function() {
                return shouldContainFields(expression("object.method()"), {
                    isMethodCall: true,
                    object: {
                        variable: [ "object" ]
                    },
                    name: [ "method" ],
                    methodArguments: []
                });
            });
            it("parses no argument method with () and field", function() {
                return shouldContainFields(expression("object.method().field"), {
                    isFieldReference: true,
                    object: {
                        isMethodCall: true,
                        object: {
                            variable: [ "object" ]
                        },
                        name: [ "method" ],
                        methodArguments: []
                    },
                    name: [ "field" ]
                });
            });
            it("parses no argument method with ! and field", function() {
                return shouldContainFields(expression("object.method! . field"), terms.asyncStatements([ terms.fieldReference(terms.methodCall(terms.variable([ "object" ]), [ "method" ], [], {
                    async: true
                }), [ "field" ]) ]).statements[0]);
            });
            return it("parses no argument method with ! and field", function() {
                return shouldContainFields(expression("object.method!.field"), terms.asyncStatements([ terms.fieldReference(terms.methodCall(terms.variable([ "object" ]), [ "method" ], [], {
                    async: true
                }), [ "field" ]) ]).statements[0]);
            });
        });
        describe("blocks", function() {
            it("empty block", function() {
                return shouldContainFields(expression("@{}"), {
                    isBlock: true,
                    parameters: [],
                    redefinesSelf: false,
                    body: {
                        statements: []
                    }
                });
            });
            it("block", function() {
                return shouldContainFields(expression("@{x, y}"), {
                    isBlock: true,
                    parameters: [],
                    redefinesSelf: false,
                    body: {
                        statements: [ {
                            variable: [ "x" ]
                        }, {
                            variable: [ "y" ]
                        } ]
                    }
                });
            });
            it("block with no parameters", function() {
                return shouldContainFields(expression("@() @{x}"), {
                    isBlock: true,
                    parameters: [],
                    redefinesSelf: false,
                    body: {
                        statements: [ {
                            variable: [ "x" ]
                        } ]
                    }
                });
            });
            it("block with parameter", function() {
                return shouldContainFields(expression("@(x)\n  x, y"), {
                    isBlock: true,
                    parameters: [ {
                        variable: [ "x" ]
                    } ],
                    redefinesSelf: false,
                    body: {
                        statements: [ {
                            variable: [ "x" ]
                        }, {
                            variable: [ "y" ]
                        } ]
                    }
                });
            });
            it("block in parens", function() {
                return shouldContainFields(expression("(one\n  two\n)"), {
                    isFunctionCall: true,
                    "function": {
                        variable: [ "one" ]
                    },
                    functionArguments: [ {
                        isBlock: true,
                        body: {
                            statements: [ {
                                variable: [ "two" ]
                            } ]
                        }
                    } ]
                });
            });
            return it("block with parameter, redefining self", function() {
                return shouldContainFields(expression("@(x) => @{x, y}"), {
                    isBlock: true,
                    parameters: [ {
                        variable: [ "x" ]
                    } ],
                    redefinesSelf: true,
                    body: {
                        statements: [ {
                            variable: [ "x" ]
                        }, {
                            variable: [ "y" ]
                        } ]
                    }
                });
            });
        });
        describe("statements", function() {
            it("can be separated by commas (,)", function() {
                return shouldContainFields(statements("a, b"), {
                    statements: [ {
                        variable: [ "a" ]
                    }, {
                        variable: [ "b" ]
                    } ]
                });
            });
            it("can be separated by unix new lines", function() {
                return shouldContainFields(statements("a\nb"), {
                    statements: [ {
                        variable: [ "a" ]
                    }, {
                        variable: [ "b" ]
                    } ]
                });
            });
            it("can be separated by windows new lines", function() {
                return shouldContainFields(statements("a\r\nb"), {
                    statements: [ {
                        variable: [ "a" ]
                    }, {
                        variable: [ "b" ]
                    } ]
                });
            });
            return it("windows indentation", function() {
                return shouldContainFields(statements("app (stuff) =\r\n  ok\r\n\r\nurl (path) =\r\n  ok"), {
                    statements: [ {
                        isDefinition: true
                    }, {
                        isDefinition: true
                    } ]
                });
            });
        });
        describe("operators", function() {
            it("should be lower precedence than object operation", function() {
                return shouldContainFields(expression("o.m 2 * o.x"), {
                    isOperator: true,
                    operator: "*",
                    operatorArguments: [ {
                        isMethodCall: true,
                        object: {
                            variable: [ "o" ]
                        },
                        name: [ "m" ],
                        methodArguments: [ {
                            integer: 2
                        } ]
                    }, {
                        isFieldReference: true,
                        object: {
                            variable: [ "o" ]
                        },
                        name: [ "x" ]
                    } ]
                });
            });
            it("unary operators should be higher precedence than binary operators", function() {
                return shouldContainFields(expression("a && ! b"), {
                    isOperator: true,
                    operator: "&&",
                    operatorArguments: [ {
                        variable: [ "a" ]
                    }, {
                        isOperator: true,
                        operator: "!",
                        operatorArguments: [ {
                            variable: [ "b" ]
                        } ]
                    } ]
                });
            });
            return it("can have newlines immediately after operator", function() {
                return shouldContainFields(expression("a &&\nb"), {
                    isOperator: true,
                    operator: "&&",
                    operatorArguments: [ {
                        variable: [ "a" ]
                    }, {
                        variable: [ "b" ]
                    } ]
                });
            });
        });
        describe("definition and assignment", function() {
            it("definition", function() {
                return shouldContainFields(expression("x = y"), {
                    isDefinition: true,
                    target: {
                        variable: [ "x" ]
                    },
                    source: {
                        variable: [ "y" ]
                    }
                });
            });
            it("assignment", function() {
                return shouldContainFields(expression("x := y"), {
                    isDefinition: true,
                    isAssignment: true,
                    target: {
                        variable: [ "x" ]
                    },
                    source: {
                        variable: [ "y" ]
                    }
                });
            });
            it("assignment on next line", function() {
                return shouldContainFields(expression("x =\n  y"), {
                    isDefinition: true,
                    target: {
                        variable: [ "x" ]
                    },
                    source: {
                        variable: [ "y" ]
                    }
                });
            });
            describe("function definition", function() {
                it("function with one parameter", function() {
                    return shouldContainFields(expression("func (x) = x"), {
                        isDefinition: true,
                        target: {
                            variable: [ "func" ]
                        },
                        source: {
                            parameters: [ {
                                variable: [ "x" ]
                            } ],
                            body: {
                                statements: [ {
                                    variable: [ "x" ]
                                } ]
                            }
                        }
                    });
                });
                return it("function with one parameter, and one optional parameter", function() {
                    return shouldContainFields(expression("func (x, port: 80) = x"), {
                        isDefinition: true,
                        target: {
                            variable: [ "func" ]
                        },
                        source: {
                            parameters: [ {
                                variable: [ "x" ]
                            } ],
                            optionalParameters: [ {
                                field: [ "port" ],
                                value: {
                                    integer: 80
                                }
                            } ],
                            body: {
                                statements: [ {
                                    variable: [ "x" ]
                                } ]
                            }
                        }
                    });
                });
            });
            it("field assignment", function() {
                return shouldContainFields(expression("o.x = y"), {
                    isDefinition: true,
                    target: {
                        isFieldReference: true,
                        object: {
                            variable: [ "o" ]
                        },
                        name: [ "x" ]
                    },
                    source: {
                        variable: [ "y" ]
                    }
                });
            });
            it("index assignment", function() {
                return shouldContainFields(expression("o.(x) = y"), {
                    isDefinition: true,
                    target: {
                        isIndexer: true,
                        object: {
                            variable: [ "o" ]
                        },
                        indexer: {
                            variable: [ "x" ]
                        }
                    },
                    source: {
                        variable: [ "y" ]
                    }
                });
            });
            it("assignment from field", function() {
                return shouldContainFields(expression("x = y.z"), {
                    isDefinition: true,
                    target: {
                        variable: [ "x" ]
                    },
                    source: {
                        isFieldReference: true,
                        object: {
                            variable: [ "y" ]
                        },
                        name: [ "z" ]
                    }
                });
            });
            it("assignment of async function", function() {
                return shouldContainFields(expression("x! = 8"), {
                    isDefinition: true,
                    target: {
                        variable: [ "x" ]
                    },
                    source: {
                        isBlock: true,
                        parameters: [],
                        body: {
                            statements: [ {
                                integer: 8
                            } ]
                        }
                    }
                });
            });
            it('definition of function with no arguments, using empty parens "()"', function() {
                return shouldContainFields(expression("x () = 8"), {
                    isDefinition: true,
                    target: {
                        variable: [ "x" ]
                    },
                    source: {
                        isBlock: true,
                        parameters: [],
                        body: {
                            statements: [ {
                                integer: 8
                            } ]
                        }
                    }
                });
            });
            it("assignment from method call", function() {
                return shouldContainFields(expression("x = y.z (a)"), {
                    isDefinition: true,
                    target: {
                        variable: [ "x" ]
                    },
                    source: {
                        isMethodCall: true,
                        object: {
                            variable: [ "y" ]
                        },
                        name: [ "z" ],
                        methodArguments: [ {
                            variable: [ "a" ]
                        } ]
                    }
                });
            });
            return it("field assignment from method call", function() {
                return shouldContainFields(expression("i.x = y.z (a)"), {
                    isDefinition: true,
                    target: {
                        isFieldReference: true,
                        object: {
                            variable: [ "i" ]
                        },
                        name: [ "x" ]
                    },
                    source: {
                        isMethodCall: true,
                        object: {
                            variable: [ "y" ]
                        },
                        name: [ "z" ],
                        methodArguments: [ {
                            variable: [ "a" ]
                        } ]
                    }
                });
            });
        });
        describe("regexps", function() {
            it("simple", function() {
                return shouldContainFields(expression("r/abc/"), {
                    isRegExp: true,
                    pattern: "abc"
                });
            });
            it("with options", function() {
                return shouldContainFields(expression("r/abc/img"), {
                    isRegExp: true,
                    pattern: "abc",
                    options: "img"
                });
            });
            it("with escaped back ticks", function() {
                return shouldContainFields(expression("r/abc\\/def\\/ghi/"), {
                    isRegExp: true,
                    pattern: "abc/def/ghi"
                });
            });
            it("with various escapes", function() {
                return shouldContainFields(expression("r/abc\\/def\\nghi\\/jkl/"), {
                    isRegExp: true,
                    pattern: "abc/def\\nghi/jkl"
                });
            });
            return it("with newline", function() {
                return shouldContainFields(expression("a = r/abc\n      def/"), {
                    isDefinition: true,
                    target: {
                        isVariable: true,
                        variable: [ "a" ]
                    },
                    source: {
                        isRegExp: true,
                        pattern: "abc\\ndef"
                    }
                });
            });
        });
        describe("comments", function() {
            it("should not treat comment-like syntax as comments in strings", function() {
                return shouldContainFields(statements("get 'http://pogoscript.org/'"), {
                    isStatements: true,
                    statements: [ {
                        isFunctionCall: true,
                        "function": {
                            variable: [ "get" ]
                        },
                        functionArguments: [ {
                            string: "http://pogoscript.org/"
                        } ]
                    } ]
                });
            });
            describe("should allow one-line C++ style comments, as in: // this is a comment", function() {
                it("when at the end of a line", function() {
                    return shouldContainFields(statements("a // this is a comment\nb"), {
                        isStatements: true,
                        statements: [ {
                            variable: [ "a" ]
                        }, {
                            variable: [ "b" ]
                        } ]
                    });
                });
                it("before an indented block", function() {
                    return shouldContainFields(statements("a // this is a comment\n  b"), {
                        isStatements: true,
                        statements: [ {
                            isFunctionCall: true,
                            "function": {
                                variable: [ "a" ]
                            },
                            functionArguments: [ {
                                isBlock: true,
                                body: {
                                    statements: [ {
                                        variable: [ "b" ]
                                    } ]
                                }
                            } ]
                        } ]
                    });
                });
                it("when at end of file", function() {
                    return shouldContainFields(statements("a // this is a comment"), {
                        isStatements: true,
                        statements: [ {
                            variable: [ "a" ]
                        } ]
                    });
                });
                return it("when between lines", function() {
                    return shouldContainFields(statements("a\n// this is a comment\nb"), {
                        isStatements: true,
                        statements: [ {
                            variable: [ "a" ]
                        }, {
                            variable: [ "b" ]
                        } ]
                    });
                });
            });
            return describe("should allow multi-line C style comments, as in: /* this is a comment */", function() {
                it("when on one line", function() {
                    return shouldContainFields(statements("a /* comment */ b"), {
                        statements: [ {
                            variable: [ "a", "b" ]
                        } ]
                    });
                });
                it("when there are two", function() {
                    return shouldContainFields(statements("a /* comment */ b /* another comment */ c"), {
                        statements: [ {
                            variable: [ "a", "b", "c" ]
                        } ]
                    });
                });
                it("when between lines", function() {
                    return shouldContainFields(statements("a\n/* comment */\nb\n/* another comment */\nc"), {
                        statements: [ {
                            variable: [ "a" ]
                        }, {
                            variable: [ "b" ]
                        }, {
                            variable: [ "c" ]
                        } ]
                    });
                });
                it("when it contains a * character", function() {
                    return shouldContainFields(statements("a /* sh*t */ b"), {
                        statements: [ {
                            variable: [ "a", "b" ]
                        } ]
                    });
                });
                it("when it covers two lines", function() {
                    return shouldContainFields(statements("a /* line one\nline two */ b"), {
                        statements: [ {
                            isVariable: true,
                            variable: [ "a", "b" ]
                        } ]
                    });
                });
                it("when it is terminated by the end of file", function() {
                    return shouldContainFields(statements("a /* comment to eof"), {
                        statements: [ {
                            variable: [ "a" ]
                        } ]
                    });
                });
                it("when it extends to the end of the file", function() {
                    return shouldContainFields(statements("a /* comment to end */"), {
                        statements: [ {
                            variable: [ "a" ]
                        } ]
                    });
                });
                return it("when it extends to the end of the file followed by newline", function() {
                    return shouldContainFields(statements("a /* comment to end */\n"), {
                        statements: [ {
                            variable: [ "a" ]
                        } ]
                    });
                });
            });
        });
        it("lexer", function() {
            var createParser, lexParser, tokens;
            createParser = require("../lib/parser/parser").createParser;
            lexParser = createParser({
                terms: terms
            });
            tokens = lexParser.lex("a (b)");
            return shouldContainFields(tokens, [ [ "identifier", "a" ], [ "(" ], [ "identifier", "b" ], [ ")" ], [ "eof" ] ]);
        });
        return it("ignores hash bang #!, at the beginning of the file", function() {
            return shouldContainFields(statements("#! /usr/bin/env pogo\na\nb"), terms.asyncStatements([ terms.variable([ "a" ]), terms.variable([ "b" ]) ]));
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/pogoSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var pogo, should;
    pogo = require("../lib/parser/compiler");
    should = require("should");
    describe("pogo", function() {
        it("can compile pogoscript", function() {
            return pogo.compile("x").should.equal("(function() {\n    var self = this;\n    x;\n}).call(this);");
        });
        return describe("evaluate", function() {
            it("can evaluate pogoscript", function() {
                return should.equal(pogo.evaluate("6"), 6);
            });
            it("can evaluate pogoscript without making globals", function() {
                pogo.evaluate("some pogo variable = 6");
                return global.hasOwnProperty("somePogoVariable").should.equal(false);
            });
            it("can evaluate pogoscript and make globals", function() {
                pogo.evaluate("some pogo variable = 6", {
                    global: true
                });
                global.hasOwnProperty("somePogoVariable").should.equal(true);
                return delete global.somePogoVariable;
            });
            it("can evaluate pogoscript and pass in a variable", function() {
                return pogo.evaluate("2 * x", {
                    definitions: {
                        x: 4
                    }
                }).should.equal(8);
            });
            return it("can evaluate async pogoscript", function(done) {
                return pogo.evaluate("process.next tick! (), done ()", {
                    definitions: {
                        done: done
                    }
                });
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/runtimeSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var runtime, object, objectExtending;
    runtime = require("../lib/parser/runtime");
    object = runtime.object;
    objectExtending = runtime.objectExtending;
    describe("runtime", function() {
        it("creates objects with constructor", function() {
            var obj;
            obj = object(function() {
                var self = this;
                return self.a = "a";
            });
            return obj.a.should.equal("a");
        });
        it("creates objects with hash", function() {
            var obj;
            obj = object({
                a: "a"
            });
            return obj.a.should.equal("a");
        });
        return describe("inheritance", function() {
            var prototype;
            prototype = void 0;
            beforeEach(function() {
                return prototype = object(function() {
                    var self = this;
                    self.a = "a";
                    return self.b = "b";
                });
            });
            it("allows objects to be extended", function() {
                var obj;
                obj = objectExtending(prototype, function() {
                    var self = this;
                    return self.b = "c";
                });
                obj.a.should.equal("a");
                return obj.b.should.equal("c");
            });
            return it("allows objects to be extended using hash", function() {
                var obj;
                obj = objectExtending(prototype, {
                    b: "c"
                });
                obj.a.should.equal("a");
                return obj.b.should.equal("c");
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/scriptAssertions.js", function(exports, require, module){
(function() {
    var self = this;
    var should, compiler, util, _, chomp;
    should = require("should");
    compiler = require("../lib/parser/compiler");
    util = require("util");
    _ = require("underscore");
    chomp = function(s) {
        return s.toString().replace(/\n$/, "");
    };
    exports.evaluateScript = function(script) {
        var self = this;
        var printedItems, print;
        printedItems = [];
        print = function(arg) {
            return printedItems.push(arg);
        };
        compiler.evaluate(script, {
            definitions: {
                print: print
            }
        });
        return _.map(printedItems, function(item) {
            return util.inspect(item);
        }).join("\n");
    };
    exports.shouldOutput = function(script, expectedOutput) {
        var self = this;
        return should.equal(chomp(exports.evaluateScript(script)), chomp(expectedOutput));
    };
    exports.evaluateAsyncScript = function(script, done) {
        var self = this;
        var printedItems, print, async, returnPrintedOutput;
        printedItems = [];
        print = function(arg) {
            return printedItems.push(arg);
        };
        async = function(callback) {
            return process.nextTick(callback);
        };
        returnPrintedOutput = function(error) {
            return done(error, _.map(printedItems, function(item) {
                return util.inspect(item);
            }).join("\n"));
        };
        return compiler.evaluate(script, {
            definitions: {
                print: print,
                done: returnPrintedOutput,
                async: async
            }
        });
    };
    exports.asyncShouldOutput = function(script, expectedOutput, done) {
        var self = this;
        return exports.evaluateAsyncScript(script, function(error, result) {
            if (error) {
                return done(error);
            } else {
                try {
                    should.equal(chomp(result), chomp(expectedOutput));
                    return done();
                } catch (ex) {
                    return done(ex);
                }
            }
        });
    };
    exports.shouldThrow = function(script, expectedError) {
        var self = this;
        var failed;
        failed = false;
        try {
            exports.evaluateScript(script);
            failed = true;
        } catch (ex) {
            should.equal(ex.toString(), expectedError);
        }
        if (failed) {
            return should.fail("expected " + expectedError);
        }
    };
}).call(this);
});
require.register("pogoscript-tests/test/scriptSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var script, shouldOutput;
    script = require("./scriptAssertions");
    shouldOutput = script.shouldOutput;
    describe("script", function() {
        describe("integers", function() {
            return it("can denote an integer literally", function() {
                return shouldOutput("print 1", "1");
            });
        });
        describe("new operator", function() {
            it("can be called with no arguments", function() {
                return shouldOutput("print (new (Array))", "[]");
            });
            return it("new operator can be called with 1 argument", function() {
                return shouldOutput("print (new (Date 2010 10 9).value of())", "1289260800000");
            });
        });
        describe("== has semantics equivalent to === in JS", function() {
            it('returns false for equality of "" with 0', function() {
                return shouldOutput('print ("" == 0)', "false");
            });
            return it("returns true for identical strings", function() {
                return shouldOutput('print ("something" == "something")', "true");
            });
        });
        return describe("lists", function() {
            it("an empty list is just []", function() {
                return shouldOutput("print []", "[]");
            });
            it('list entries can be delimited with a comma ","', function() {
                return shouldOutput("print [1, 2]", "[ 1, 2 ]");
            });
            return it("list entries can be delimited with a newline", function() {
                return shouldOutput("print [\n    1\n    2\n]", "[ 1, 2 ]");
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/termSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var cg, Term, _, should, shouldOnlyHave;
    cg = require("../lib/parser/codeGenerator").codeGenerator();
    require("./assertions");
    Term = require("../lib/terms/terms")({}).Term;
    _ = require("underscore");
    should = require("should");
    shouldOnlyHave = function(actualList, expectedList) {
        var gen1_items, gen2_i, item;
        actualList.length.should.equal(expectedList.length);
        gen1_items = expectedList;
        for (gen2_i = 0; gen2_i < gen1_items.length; ++gen2_i) {
            item = gen1_items[gen2_i];
            _.include(actualList, item).should.be;
        }
        return void 0;
    };
    describe("terms", function() {
        describe("cloning", function() {
            it("creates a new object", function() {
                var t, newTerm;
                t = new Term();
                newTerm = t.clone();
                return newTerm.should.not.equal(t);
            });
            it("copies all members when cloning", function() {
                var t, clone;
                t = new Term();
                t.a = 1;
                t.b = "b";
                clone = t.clone();
                return shouldContainFields(clone, {
                    a: 1,
                    b: "b"
                });
            });
            it("arrays are also cloned", function() {
                var t, clone;
                t = new Term();
                t.array = [ 1 ];
                clone = t.clone();
                clone.array.should.not.equal(t.array);
                return shouldContainFields(clone, {
                    array: [ 1 ]
                });
            });
            it("an object's prototype is also copied", function() {
                var t, clone;
                t = new Term();
                t.a = "a";
                clone = t.clone();
                return Object.getPrototypeOf(clone).should.equal(Object.getPrototypeOf(t));
            });
            it("clones sub-objects", function() {
                var t, clone;
                t = new Term();
                t.a = {
                    name: "jack"
                };
                clone = t.clone();
                return shouldContainFields(clone, {
                    a: {
                        name: "jack"
                    }
                });
            });
            it("doesn't clone objects that have 'dont clone' field", function() {
                var t, clone;
                t = new Term();
                t.a = {
                    name: "jack"
                };
                t.dontClone = true;
                clone = t.clone();
                return clone.should.equal(t);
            });
            it("can rewrite an object while being cloned", function() {
                var t, clone;
                t = new Term();
                t.a = new Term({
                    name: "jack"
                });
                clone = t.clone({
                    rewrite: function(oldTerm) {
                        var newTerm;
                        if (oldTerm.name) {
                            newTerm = new Term();
                            newTerm.name = "jill";
                            return newTerm;
                        }
                    }
                });
                return shouldContainFields(clone, {
                    a: {
                        name: "jill"
                    }
                });
            });
            it("rewrite is passed the clone function, which can be used to clone further members", function() {
                var t, clone;
                t = new Term();
                t.a = new Term({
                    name: "jack",
                    b: new Term({
                        name: "john"
                    })
                });
                clone = t.clone({
                    rewrite: function(oldTerm, gen3_options) {
                        var clone;
                        clone = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "clone") && gen3_options.clone !== void 0 ? gen3_options.clone : void 0;
                        var newTerm;
                        if (oldTerm.name) {
                            newTerm = new Term();
                            newTerm.name = "jill";
                            if (oldTerm.b) {
                                newTerm.b = clone(oldTerm.b);
                            }
                            return newTerm;
                        }
                    }
                });
                return shouldContainFields(clone, {
                    a: {
                        name: "jill",
                        b: {
                            name: "jill"
                        }
                    }
                });
            });
            it("rewrite is passed the clone function, which can be used to clone the original node", function() {
                var t, clone;
                t = new Term();
                t.a = new Term({
                    name: "jack",
                    b: new Term({
                        name: "john"
                    })
                });
                clone = t.clone({
                    rewrite: function(oldTerm, gen4_options) {
                        var clone;
                        clone = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "clone") && gen4_options.clone !== void 0 ? gen4_options.clone : void 0;
                        var newTerm;
                        if (oldTerm.name) {
                            newTerm = clone();
                            newTerm.name = "jill";
                            return newTerm;
                        }
                    }
                });
                return shouldContainFields(clone, {
                    a: {
                        name: "jill",
                        b: {
                            name: "jill"
                        }
                    }
                });
            });
            it("doesn't rewrite beyond rewrite limit", function() {
                var t, clone;
                t = new Term({
                    a: new Term({
                        name: "jack"
                    }),
                    b: new Term({
                        isLimit: true,
                        c: new Term({
                            name: "jack"
                        })
                    }),
                    d: new Term({
                        name: "jason"
                    })
                });
                clone = t.clone({
                    rewrite: function(oldTerm) {
                        if (oldTerm.name) {
                            return new Term({
                                name: "jill"
                            });
                        }
                    },
                    limit: function(t) {
                        return t.isLimit;
                    }
                });
                return shouldContainFields(clone, {
                    a: {
                        name: "jill"
                    },
                    b: {
                        c: {
                            name: "jack"
                        }
                    },
                    d: {
                        name: "jill"
                    }
                });
            });
            it("throws an exception when the new term is not an instance of 'term'", function() {
                var t;
                t = new Term();
                t.a = new Term({
                    name: "jack"
                });
                return function() {
                    return t.clone({
                        rewrite: function(oldTerm) {
                            if (oldTerm.name) {
                                return {
                                    name: "jill"
                                };
                            }
                        }
                    });
                }.should.throw("rewritten node not an instance of Node");
            });
            it("copies the location when a term is rewritten", function() {
                var t, clone;
                t = new Term();
                t.setLocation({
                    firstLine: 1,
                    lastLine: 1,
                    firstColumn: 20,
                    lastColumn: 30
                });
                clone = t.clone({
                    rewrite: function(oldTerm) {
                        var newTerm;
                        newTerm = new Term();
                        newTerm.rewritten = true;
                        return newTerm;
                    }
                });
                shouldContainFields(clone, {
                    rewritten: true
                });
                return shouldContainFields(clone.location(), {
                    firstLine: 1,
                    lastLine: 1,
                    firstColumn: 20,
                    lastColumn: 30
                });
            });
            it("passes path of terms to limit", function() {
                var c, b, a, y, x, t, paths, clone;
                c = new Term();
                b = new Term({
                    c: c
                });
                a = new Term({
                    b: b
                });
                y = new Term();
                x = new Term({
                    y: y
                });
                t = new Term({
                    a: a,
                    x: x
                });
                paths = [];
                clone = t.clone({
                    limit: function(oldTerm, gen5_options) {
                        var path;
                        path = gen5_options !== void 0 && Object.prototype.hasOwnProperty.call(gen5_options, "path") && gen5_options.path !== void 0 ? gen5_options.path : void 0;
                        paths.push(path.slice());
                        return false;
                    }
                });
                return shouldOnlyHave(paths, [ [], [ t ], [ t, a ], [ t, a, b ], [ t, x ], [ t, x, y ] ]);
            });
            return it("passes path of terms to rewrite", function() {
                var c, b, a, y, x, t, paths, clone;
                c = new Term();
                b = new Term({
                    c: c
                });
                a = new Term({
                    b: b
                });
                y = new Term();
                x = new Term({
                    y: y
                });
                t = new Term({
                    a: a,
                    x: x
                });
                paths = [];
                clone = t.clone({
                    rewrite: function(oldTerm, gen6_options) {
                        var path;
                        path = gen6_options !== void 0 && Object.prototype.hasOwnProperty.call(gen6_options, "path") && gen6_options.path !== void 0 ? gen6_options.path : void 0;
                        paths.push(path.slice());
                        return void 0;
                    }
                });
                return shouldOnlyHave(paths, [ [], [ t ], [ t, a ], [ t, a, b ], [ t, x ], [ t, x, y ] ]);
            });
        });
        describe("rewriting", function() {
            it("returns the same object", function() {
                var a;
                a = new Term({
                    b: new Term({
                        isCrazy: true
                    }),
                    c: new Term({
                        isCool: true
                    })
                });
                a.rewrite({
                    rewrite: function(term) {
                        if (term.isCool) {
                            return new Term({
                                isBad: true
                            });
                        }
                    }
                });
                return a.c.isBad.should.equal(true);
            });
            return it("limits the rewrite to a term", function() {
                var a;
                a = new Term({
                    b: new Term({
                        isCrazy: true,
                        d: new Term({
                            isCool: true
                        })
                    }),
                    c: new Term({
                        isCool: true
                    })
                });
                a.rewrite({
                    rewrite: function(term) {
                        if (term.isCool) {
                            return new Term({
                                isBad: true
                            });
                        }
                    },
                    limit: function(term) {
                        return term.isCrazy;
                    }
                });
                a.c.isBad.should.equal(true);
                return a.b.d.isCool.should.equal(true);
            });
        });
        describe("location", function() {
            it("can set location", function() {
                var t;
                t = new Term();
                t.setLocation({
                    firstLine: 1,
                    lastLine: 2,
                    firstColumn: 20,
                    lastColumn: 30
                });
                return shouldContainFields(t.location(), {
                    firstLine: 1,
                    lastLine: 2,
                    firstColumn: 20,
                    lastColumn: 30
                });
            });
            it("can compute location from children, first column is from first line, last column is from last line", function() {
                var left, right, t;
                left = new Term();
                left.setLocation({
                    firstLine: 1,
                    lastLine: 2,
                    firstColumn: 20,
                    lastColumn: 30
                });
                right = new Term();
                right.setLocation({
                    firstLine: 2,
                    lastLine: 4,
                    firstColumn: 30,
                    lastColumn: 10
                });
                t = new Term({
                    left: left,
                    right: right
                });
                return shouldContainFields(t.location(), {
                    firstLine: 1,
                    lastLine: 4,
                    firstColumn: 20,
                    lastColumn: 10
                });
            });
            it("if there are no children then the location is nil", function() {
                var t;
                t = new Term();
                return should.strictEqual(t.location(), void 0);
            });
            it("if there are no children with locations then the location is nil", function() {
                var left, right, t;
                left = new Term();
                right = new Term();
                t = new Term({
                    left: left,
                    right: right
                });
                return should.strictEqual(t.location(), void 0);
            });
            return it("can compute location from children, smallest first column, largest last column when on same line", function() {
                var left, right, t;
                left = new Term();
                left.setLocation({
                    firstLine: 1,
                    lastLine: 2,
                    firstColumn: 20,
                    lastColumn: 30
                });
                right = new Term();
                right.setLocation({
                    firstLine: 1,
                    lastLine: 2,
                    firstColumn: 10,
                    lastColumn: 40
                });
                t = new Term({
                    left: left,
                    right: right
                });
                return shouldContainFields(t.location(), {
                    firstLine: 1,
                    lastLine: 2,
                    firstColumn: 10,
                    lastColumn: 40
                });
            });
        });
        describe("children", function() {
            return it("returns immediate subterms", function() {
                var a, b, t;
                a = new Term();
                b = new Term();
                t = new Term({
                    a: a,
                    b: b
                });
                return shouldOnlyHave(t.children(), [ a, b ]);
            });
        });
        describe("children", function() {
            return it("returns terms in arrays", function() {
                var a, b, t;
                a = new Term();
                b = new Term();
                t = new Term({
                    array: [ a, b ]
                });
                return shouldOnlyHave(t.children(), [ a, b ]);
            });
        });
        describe("children", function() {
            return it("returns terms in objects", function() {
                var a, b, t;
                a = new Term();
                b = new Term();
                t = new Term({
                    array: {
                        a: a,
                        b: b
                    }
                });
                return shouldOnlyHave(t.children(), [ a, b ]);
            });
        });
        describe("walk descendants", function() {
            it("walks descendants, children, children's children, etc", function() {
                var b, c, d, a, t, descendants;
                b = new Term();
                c = new Term();
                d = new Term();
                a = new Term({
                    c: c,
                    d: [ d ]
                });
                t = new Term({
                    a: a,
                    b: b
                });
                descendants = [];
                t.walkDescendants(function(subterm) {
                    return descendants.push(subterm);
                });
                return shouldOnlyHave(descendants, [ a, b, c, d ]);
            });
            it("walks descendants, but not beyond the limit", function() {
                var b, c, d, a, t, descendants;
                b = new Term();
                c = new Term();
                d = new Term();
                a = new Term({
                    isA: true,
                    c: c,
                    d: [ d ]
                });
                t = new Term({
                    a: a,
                    b: b
                });
                descendants = [];
                t.walkDescendantsNotBelowIf(function(subterm) {
                    return descendants.push(subterm);
                }, function(subterm) {
                    return subterm.isA;
                });
                return shouldOnlyHave(descendants, [ a, b ]);
            });
            it("passes the path to the term to limit", function() {
                var b, c, d, a, t, descendants, paths;
                b = new Term({
                    isB: true
                });
                c = new Term({
                    isC: true
                });
                d = new Term({
                    isD: true
                });
                a = new Term({
                    isA: true,
                    c: c,
                    d: [ d ]
                });
                t = new Term({
                    a: a,
                    b: b
                });
                descendants = [];
                paths = [];
                t.walkDescendantsNotBelowIf(function(subterm) {
                    return void 0;
                }, function(subterm, path) {
                    paths.push(path.slice().concat([ subterm ]));
                    return false;
                });
                return shouldContainFields(paths, [ [ t, a ], [ t, a, c ], [ t, a, d ], [ t, b ] ]);
            });
            return it("passes the path to the term to the walker", function() {
                var b, c, d, a, t, descendants, paths;
                b = new Term({
                    isB: true
                });
                c = new Term({
                    isC: true
                });
                d = new Term({
                    isD: true
                });
                a = new Term({
                    isA: true,
                    c: c,
                    d: [ d ]
                });
                t = new Term({
                    a: a,
                    b: b
                });
                descendants = [];
                paths = [];
                t.walkDescendantsNotBelowIf(function(subterm, path) {
                    paths.push(path.slice().concat([ subterm ]));
                    return void 0;
                }, function(subterm, path) {
                    return false;
                });
                return shouldContainFields(paths, [ [ t, a ], [ t, a, c ], [ t, a, d ], [ t, b ] ]);
            });
        });
        return describe("reduce", function() {
            it("can be used to count total number of terms", function() {
                var t, sumOf, totalTermCount;
                t = new Term({
                    name: "t",
                    a: new Term({
                        name: "a",
                        b: new Term({
                            name: "b"
                        })
                    }),
                    x: [ new Term({
                        name: "u",
                        y: new Term({
                            name: "y"
                        })
                    }), new Term({
                        name: "z"
                    }) ]
                });
                sumOf = function(array) {
                    var sum;
                    return sum = _.reduce(array, function(sum, i) {
                        return sum + i;
                    }, 0);
                };
                totalTermCount = t.reduceWithReducedChildrenInto(function(term, terms) {
                    return 1 + sumOf(terms);
                });
                return totalTermCount.should.equal(6);
            });
            return it("reductions are cached, when given a cache name", function() {
                var t, sumOf, reductionCount, totalTermCount, firstReductionCount;
                t = new Term({
                    name: "t",
                    a: new Term({
                        name: "a",
                        b: new Term({
                            name: "b"
                        })
                    }),
                    x: [ new Term({
                        name: "u",
                        y: new Term({
                            name: "y"
                        })
                    }), new Term({
                        name: "z"
                    }) ]
                });
                sumOf = function(array) {
                    var sum;
                    return sum = _.reduce(array, function(sum, i) {
                        return sum + i;
                    }, 0);
                };
                reductionCount = 0;
                totalTermCount = t.reduceWithReducedChildrenInto(function(term, terms) {
                    ++reductionCount;
                    return 1 + sumOf(terms);
                }, {
                    cacheName: "term count"
                });
                firstReductionCount = reductionCount;
                t.reduceWithReducedChildrenInto(function(term, terms) {
                    ++reductionCount;
                    return 1 + sumOf(terms);
                }, {
                    cacheName: "term count"
                });
                return reductionCount.should.equal(firstReductionCount);
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/thingoSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var should;
    should = require("should");
    describe("thingo", function() {
        it("can call should as property", function() {
            return "asdf".should.equal("asdf");
        });
        return it("can call should as object", function() {
            return should.equal("asdf", "asdf");
        });
    });
}).call(this);
});
require.register("pogoscript-tests/test/unaryOperatorExpressionSpec.js", function(exports, require, module){
(function() {
    var self = this;
    var cg;
    cg = require("../lib/parser/codeGenerator").codeGenerator();
    require("./assertions");
    describe("unary operator expression", function() {
        it("as expression", function() {
            var opExpr;
            opExpr = cg.unaryOperatorExpression("@cat", {
                variable: [ "a" ]
            });
            return shouldContainFields(opExpr.expression(), {
                isFunctionCall: true,
                "function": {
                    variable: [ "cat" ]
                },
                functionArguments: [ {
                    variable: [ "a" ]
                } ]
            });
        });
        it("as expression with macro", function() {
            var opExpr;
            opExpr = cg.unaryOperatorExpression("!", {
                variable: [ "a" ]
            });
            return shouldContainFields(opExpr.expression(), {
                isOperator: true,
                operator: "!",
                operatorArguments: [ {
                    variable: [ "a" ]
                } ]
            });
        });
        return it("as hash entry will be semantic failure", function() {
            var opExpr;
            opExpr = cg.unaryOperatorExpression("%", {
                variable: [ "a" ]
            });
            return shouldContainFields(opExpr.hashEntry(), {
                isSemanticError: true
            });
        });
    });
}).call(this);
});
require.register("pogoscript-tests/index.js", function(exports, require, module){
require('./test/closureTermSpec');
require('./test/codeGeneratorSpec');
require('./test/codegenUtilsSpec');
require('./test/containsFields');
require('./test/pogo');
require('./test/assertions');
require('./test/asyncForSpec');
require('./test/asyncFunctionSpec');
require('./test/asyncIfSpec');
require('./test/asyncMethodsSpec');
require('./test/asyncSpec');
require('./test/asyncStatementsSpec');
require('./test/asyncTrySpec');
require('./test/asyncWhileSpec');
require('./test/basicExpressionSpec');
require('./test/classSpec');
require('./test/closureParameterStrategiesSpec');
require('./test/closureSpec');
require('./test/codeGeneratorAssertions');
require('./test/complexExpressionSpec');
require('./test/definitionsSpec');
require('./test/forSpec');
require('./test/functionSpec');
require('./test/hashSpec');
require('./test/ifSpec');
require('./test/instanceof');
require('./test/interpolationSpec');
require('./test/listComprehensions');
require('./test/macroDirectorySpec');
require('./test/macrosSpec');
require('./test/methodSpec');
require('./test/moduleConstantsSpec');
require('./test/newSpec');
require('./test/operatorExpressionSpec');
require('./test/parserAssertions');
require('./test/parserContextSpec');
require('./test/parserSpec');
require('./test/pogoSpec');
require('./test/runtimeSpec');
require('./test/scriptAssertions');
require('./test/scriptSpec');
require('./test/termSpec');
require('./test/thingoSpec');
require('./test/unaryOperatorExpressionSpec');
});


  if (typeof exports == 'object') {
    module.exports = require('pogoscript-tests');
  } else if (typeof define == 'function' && define.amd) {
    define(function(){ return require('pogoscript-tests'); });
  } else if (typeof window == 'undefined') {
    this['pogoscript-tests'] = require('pogoscript-tests');
  } else {
    window['pogoscript-tests'] = require('pogoscript-tests');
  }
})();