var basicExpression = require('./basicExpression');
var _ = require('underscore');
var cg = require('../../lib/codeGenerator');

module.exports = function (listOfTerminals) {
  return new function () {
    this.isComplexExpression = true;
    this.basicExpressions = _(listOfTerminals).map(function (terminals) {
      return basicExpression(terminals);
    });
    
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
        return this._optionalArguments = _(this.tail()).map(function (e) {
          return e.hashEntry();
        });
      }
    };
    
    this.hasArguments = function () {
      return this._hasArguments || (this._hasArguments = 
        (this.head().arguments().length > 0) || (this.optionalArguments().length > 0)
      );
    };
    
    this.expression = function () {
      if (this.head().hasName()) {
        if (this.hasArguments()) {
          return cg.functionCall(cg.variable(this.head().name()), this.head().arguments(), this.optionalArguments());
        } else {
          return cg.variable(this.head().name());
        }
      } else {
        if (!this.hasTail() && this.head().arguments().length == 1) {
          return this.head().arguments()[0];
        }
      }
    };
    
    this.objectOperationExpression = function (object) {
      if (this.head().hasName()) {
        if (this.hasArguments()) {
          return cg.methodCall(object, this.head().name(), this.head().arguments(), this.optionalArguments());
        } else {
          return cg.fieldReference(object, this.head().name());
        }
      } else {
        if (!this.hasTail() && this.head().arguments().length == 1) {
          return cg.indexer(object, this.head().arguments()[0]);
        }
      }
    };
    
    this.objectOperation = function (object) {
      var complexExpression = this;
      
      return new function () {
        this.operation = complexExpression;
        this.object = object;
        
        this.expression = function () {
          return this.operation.objectOperationExpression(this.object);
        };
      };
    };
  };
};