((function() {
    var self, codegenUtils, argumentUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    argumentUtils = require("./argumentUtils");
    module.exports = function(terms) {
        var self, methodCallTerm, methodCall;
        self = this;
        methodCallTerm = terms.term({
            constructor: function(object, name, args, gen1_options) {
                var optionalArguments, async, originallyAsync, asyncCallbackArgument, self;
                optionalArguments = gen1_options && gen1_options.hasOwnProperty("optionalArguments") && gen1_options.optionalArguments !== void 0 ? gen1_options.optionalArguments : [];
                async = gen1_options && gen1_options.hasOwnProperty("async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                originallyAsync = gen1_options && gen1_options.hasOwnProperty("originallyAsync") && gen1_options.originallyAsync !== void 0 ? gen1_options.originallyAsync : false;
                asyncCallbackArgument = gen1_options && gen1_options.hasOwnProperty("asyncCallbackArgument") && gen1_options.asyncCallbackArgument !== void 0 ? gen1_options.asyncCallbackArgument : void 0;
                self = this;
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
                var self, args;
                self = this;
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
                var self;
                self = this;
                self.asyncCallbackArgument = callback;
                return self;
            }
        });
        return methodCall = function(object, name, args, gen2_options) {
            var optionalArguments, async, splattedArgs, objectVar, asyncResult;
            optionalArguments = gen2_options && gen2_options.hasOwnProperty("optionalArguments") && gen2_options.optionalArguments !== void 0 ? gen2_options.optionalArguments : [];
            async = gen2_options && gen2_options.hasOwnProperty("async") && gen2_options.async !== void 0 ? gen2_options.async : false;
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
})).call(this);