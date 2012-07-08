((function() {
    var self, codegenUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(fun, args, optionalArgs, gen1_options) {
                var async, self;
                async = gen1_options && gen1_options.hasOwnProperty("async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                self = this;
                self.isFunctionCall = true;
                self.function = fun;
                self.functionArguments = args;
                self.optionalArguments = optionalArgs;
                self.splattedArguments = self.cg.splatArguments(args, optionalArgs);
                self.passThisToApply = false;
                return self.isAsync = async;
            },
            hasSplatArguments: function() {
                var self;
                self = this;
                return self.splattedArguments;
            },
            generateJavaScript: function(buffer, scope) {
                var self, args;
                self = this;
                self.function.generateJavaScript(buffer, scope);
                args = codegenUtils.argsAndOptionalArgs(self.cg, self.functionArguments, self.optionalArguments);
                if (self.splattedArguments && self.function.isIndexer) {
                    buffer.write(".apply(");
                    self.function.object.generateJavaScript(buffer, scope);
                    buffer.write(",");
                    self.splattedArguments.generateJavaScript(buffer, scope);
                    return buffer.write(")");
                } else if (self.splattedArguments) {
                    buffer.write(".apply(");
                    if (self.passThisToApply) {
                        buffer.write("this");
                    } else {
                        buffer.write("null");
                    }
                    buffer.write(",");
                    self.splattedArguments.generateJavaScript(buffer, scope);
                    return buffer.write(")");
                } else {
                    buffer.write("(");
                    codegenUtils.writeToBufferWithDelimiter(args, ",", buffer, scope);
                    return buffer.write(")");
                }
            },
            expandMacro: function(clone) {
                var self, statements, funCall, asyncResult, name, macro;
                self = this;
                if (self.isAsync) {
                    statements = [];
                    funCall = terms.functionCall(self.function, self.functionArguments, self.optionalArguments);
                    asyncResult = terms.generatedVariable([ "async", "result" ]);
                    statements.push(terms.definition(asyncResult, funCall, {
                        async: true
                    }));
                    statements.push(asyncResult);
                    return terms.statements(statements, {
                        expression: true
                    });
                } else if (self.function.isVariable) {
                    name = self.function.variable;
                    macro = self.cg.macros.findMacro(name);
                    if (macro) {
                        return macro(name, clone(self.functionArguments), clone(self.optionalArguments));
                    }
                }
            },
            makeAsyncCallWithResult: function(variable, statements) {
                var self, fc;
                self = this;
                fc = self.clone();
                fc.functionArguments.push(terms.closure([ terms.generatedVariable([ "error" ]), variable ], terms.statements(statements)));
                return fc;
            }
        });
    };
})).call(this);