((function() {
    var self, codegenUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self, methodCallTerm, methodCall;
        self = this;
        methodCallTerm = terms.term({
            constructor: function(object, name, args, optionalArgs, gen1_options) {
                var async, self;
                async = gen1_options && gen1_options.hasOwnProperty("async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                self = this;
                self.isMethodCall = true;
                self.object = object;
                self.name = name;
                self.methodArguments = args;
                self.optionalArguments = optionalArgs;
                return self.isAsync = async;
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                self.object.generateJavaScript(buffer, scope);
                buffer.write(".");
                buffer.write(codegenUtils.concatName(self.name));
                buffer.write("(");
                codegenUtils.writeToBufferWithDelimiter(codegenUtils.argsAndOptionalArgs(self.cg, self.methodArguments, self.optionalArguments), ",", buffer, scope);
                return buffer.write(")");
            },
            expandMacro: function(clone) {
                var self, asyncResult;
                self = this;
                if (self.isAsync) {
                    asyncResult = terms.generatedVariable([ "async", "result" ]);
                    return terms.subStatements([ terms.definition(asyncResult, clone(), {
                        async: true
                    }), asyncResult ]);
                }
            },
            makeAsyncCallWithResult: function(variable, statements) {
                var self, mc;
                self = this;
                mc = self.clone();
                mc.methodArguments.push(terms.closure([ terms.generatedVariable([ "error" ]), variable ], terms.statements(statements)));
                return mc;
            }
        });
        return methodCall = function(object, name, args, optionalArgs, options) {
            var splattedArgs, objectVar;
            splattedArgs = terms.splatArguments(args, optionalArgs);
            if (splattedArgs) {
                objectVar = terms.generatedVariable([ "o" ]);
                return terms.subStatements([ terms.definition(objectVar, object), terms.methodCall(terms.fieldReference(objectVar, name), [ "apply" ], [ objectVar, splattedArgs ], options) ]);
            } else {
                return methodCallTerm(object, name, args, optionalArgs, options);
            }
        };
    };
})).call(this);