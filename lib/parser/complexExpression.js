var _ = require('underscore');

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

    this.isAsyncCall = function () {
      return this.head().hasAsyncArgument();
    };

    this.isFutureCall = function () {
      return this.head().hasFutureArgument();
    };
    
    this.isCall = function () {
      return this.isAsyncCall() || this.isFutureCall();
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
          return terms.functionCall(terms.variable(head.name(), {couldBeMacro: false, location: this.location()}), this.arguments(), {optionalArguments: this.optionalArguments(), async: this.isAsyncCall(), future: this.isFutureCall()});
        } else {
          return terms.variable(head.name(), {location: this.location()});
        }
      } else {
        if (!this.hasTail() && this.arguments().length === 1 && !this.isCall()) {
          return this.arguments()[0];
        } else {
          return terms.functionCall(this.arguments()[0], this.arguments().slice(1), {async: this.isAsyncCall(), future: this.isFutureCall()});
        }
      }
    };
    
    this.objectOperationExpression = function (object) {
      var head = this.head();

      if (head.hasName()) {
        if (this.hasArguments()) {
          return terms.methodCall(object, head.name(), this.arguments(), {optionalArguments: this.optionalArguments(), async: this.isAsyncCall(), future: this.isFutureCall()});
        } else {
          return terms.fieldReference(object, head.name());
        }
      } else {
        if (!this.hasTail() && !head.isCall() && !this.isAsyncCall()) {
          return terms.indexer(object, this.arguments()[0]);
        } else {
          return terms.functionCall(terms.indexer(object, this.arguments()[0]), this.arguments().slice(1), {async: this.isAsyncCall(), future: this.isFutureCall()});
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
              var block = source.blockify(self.parameters(), {optionalParameters: self.optionalParameters(), async: self.isAsyncCall(), redefinesSelf: true});
              return terms.definition(terms.fieldReference(object, self.head().name()), block, {assignment: true});
            } else {
              return terms.definition(terms.fieldReference(object, self.head().name()), source.scopify(), {assignment: true});
            }
          } else {
            if (!self.hasTail() && self.arguments().length === 1 && !self.isAsyncCall()) {
              return terms.definition(terms.indexer(object, self.arguments()[0]), source.scopify(), {assignment: true});
            } else {
              var block = source.blockify(self.parameters({skipFirstParameter: true}), {optionalParameters: self.optionalParameters(), async: self.isAsyncCall(), redefinesSelf: true});
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
              return terms.definition(terms.variable(self.head().name(), {location: self.location()}), source.blockify(self.parameters(), {optionalParameters: self.optionalParameters(), async: self.isAsyncCall()}), {assignment: assignment});
            },
            hashEntry: function (isOptionalArgument) {
              var block = source.blockify(self.parameters(), {optionalParameters: self.optionalParameters(), async: self.isAsyncCall(), redefinesSelf: !isOptionalArgument});

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
