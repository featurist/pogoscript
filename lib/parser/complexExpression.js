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
