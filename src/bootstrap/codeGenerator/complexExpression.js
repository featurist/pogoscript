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
          return cg.functionCall(cg.variable(head.name(), {couldBeMacro: false}), this.arguments(), {optionalArguments: this.optionalArguments(), async: this.hasAsyncArgument()});
        } else {
          return cg.variable(head.name());
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
          return cg.methodCall(object, head.name(), this.arguments(), this.optionalArguments(), {async: this.hasAsyncArgument()});
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
    
    this.blockify = function (expression, parameters, optionalParameters) {
      if (expression.isBlock) {
        expression.parameters = parameters;
        expression.optionalParameters = optionalParameters;
        return expression;
      } else {
        var block = cg.block(parameters, cg.statements([expression]));
        block.optionalParameters = optionalParameters;
        return block;
      }
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
              var block = source.blockify(self.parameters(), self.optionalParameters());
              block.redefinesSelf = true;
              return cg.definition(cg.fieldReference(object, self.head().name()), block);
            } else {
              return cg.definition(cg.fieldReference(object, self.head().name()), source.scopify());
            }
          } else {
            if (!self.hasTail() && self.arguments().length === 1 && !self.hasAsyncArgument()) {
              return cg.definition(cg.indexer(object, self.arguments()[0]), source.scopify());
            } else {
              var block = source.blockify(self.parameters({skipFirstParameter: true}), self.optionalParameters());
              block.redefinesSelf = true;
              return cg.definition(cg.indexer(object, self.arguments()[0]), block);
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
    
    this.definition = function (source) {
      var self = this;
      
      if (self.head().hasName()) {
        if (self.hasParameters()) {
          return {
            expression: function () {
              return cg.definition(cg.variable(self.head().name()), source.blockify(self.parameters(), self.optionalParameters(), {async: self.hasAsyncArgument()}));
            },
            hashEntry: function (isOptionalArgument) {
              var block = source.blockify(self.parameters(), self.optionalParameters());
              block.redefinesSelf = !isOptionalArgument;

              return cg.hashEntry(self.head().name(), block);
            }
          };
        } else {
          return {
            expression: function () {
              return cg.definition(cg.variable(self.head().name()), source.scopify());
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
