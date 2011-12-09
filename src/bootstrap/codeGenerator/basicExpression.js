var _ = require('underscore');
var semanticFailure = require('../../lib/semanticFailure');

module.exports = function (terminals) {
  return new function () {
    this.terminals = terminals;
    
    this.hasName = function () {
      return this.name().length > 0;
    };
    
    this.name = function () {
      return this._name || this._name || _(this.terminals).filter(function (terminal) {
        return terminal.identifier;
      }).map(function (identifier) {
        return identifier.identifier;
      });
    };
    
    this.hasArguments = function () {
      return this.arguments().length > 0;
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
    };
  };
};