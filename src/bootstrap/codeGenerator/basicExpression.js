var cg = require('../../lib/codeGenerator');
var _ = require('underscore');
var semanticFailure = require('../../lib/semanticFailure');
var errors = require('./errors');

module.exports = function (terminals) {
  return cg.term(function () {
    this.terminals = terminals;
    this.subterms('terminals');
    
    this.hasName = function () {
      return this.name().length > 0;
    };
    
    this.name = function () {
      return this._name || (this._name = _(this.terminals).filter(function (terminal) {
        return terminal.identifier;
      }).map(function (identifier) {
        return identifier.identifier;
      }));
    };
    
    this.containsCallPunctuation = function () {
      return this._containsCallPunctuation || (this._containsCallPunctuation =
        this.terminals[this.terminals.length - 1].noArgumentFunctionCallSuffix
      );
    };
    
    this.hasArguments = function () {
      return this._hasArguments || (this._hasArguments =
        this.arguments().length > 0 || this.containsCallPunctuation()
      );
    };

    this.arguments = function() {
      if (this._arguments) {
        return this._arguments;
      } else {
        this._buildBlocks();
        return this._arguments = _(this.terminals).filter(function (terminal) {
          return !terminal.identifier && !terminal.noArgumentFunctionCallSuffix && !terminal.isParameter;
        });
      }
    };

    this.parameters = function (options) {
			var skipFirstParameter = options && options.skipFirstParameter;
	
      if (this._parameters) {
        return this._parameters;
      }
      
      var args = this.arguments();

			if (skipFirstParameter) {
				args = args.slice(1);
			}

      return this._parameters = _(args).map(function (arg) {
        return arg.parameter();
      });
    };
    
    this.hasParameters = function () {
      return this._hasParameters || (this._hasParameters =
        this.containsCallPunctuation() || this.arguments().length > 0
      );
    };
    
    this._buildBlocks = function () {
      var parameters = [];

      _(this.terminals).each(function (terminal) {
        if (terminal.isParameter) {
          parameters.push(terminal);
        } else if (terminal.isBlock) {
          terminal.parameters = parameters;
          parameters = [];
        }
      });
      
      _(parameters).each(function (parm) {
        errors.addTermWithMessage(parm, 'block parameter with no block');
      });
    };
    
    this.hashEntry = function (options) {
      var withoutBlock = options && options.withoutBlock;
      
      var args = this.arguments();
      var name = this.name();
      
      if (withoutBlock && args.length > 0 && args[args.length - 1].isBlock) {
        args = args.slice(0, args.length - 1);
      }

      if (name.length > 0 && args.length == 1) {
        return cg.hashEntry(name, args[0]);
      }

      if (name.length > 0 && args.length == 0) {
        return cg.hashEntry(name);
      }
      
      if (name.length == 0 && args.length == 2 && args[0].isString) {
        return cg.hashEntry([args[0].string], args[1])
      }
      
      return errors.addTermWithMessage(this, 'cannot be a hash entry');
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
      if (args.length == 1 && args[0].isString) {
        return [args[0].string];
      } else {
        return errors.addTermWithMessage(this, 'cannot be a hash key');
      }
    }
  });
};