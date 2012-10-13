((function() {
    var self, codegenUtils, argumentUtils, _;
    self = this;
    codegenUtils = require("./codegenUtils");
    argumentUtils = require("./argumentUtils");
    _ = require("underscore");
    module.exports = function(terms) {
        var self, functionCallTerm, functionCall;
        self = this;
        functionCallTerm = terms.term({
            constructor: function(fun, args, gen1_options) {
                var optionalArguments, async, passThisToApply, originallyAsync, asyncCallbackArgument, self;
                optionalArguments = gen1_options && gen1_options.hasOwnProperty("optionalArguments") && gen1_options.optionalArguments !== void 0 ? gen1_options.optionalArguments : [];
                async = gen1_options && gen1_options.hasOwnProperty("async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                passThisToApply = gen1_options && gen1_options.hasOwnProperty("passThisToApply") && gen1_options.passThisToApply !== void 0 ? gen1_options.passThisToApply : false;
                originallyAsync = gen1_options && gen1_options.hasOwnProperty("originallyAsync") && gen1_options.originallyAsync !== void 0 ? gen1_options.originallyAsync : false;
                asyncCallbackArgument = gen1_options && gen1_options.hasOwnProperty("asyncCallbackArgument") && gen1_options.asyncCallbackArgument !== void 0 ? gen1_options.asyncCallbackArgument : void 0;
                self = this;
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
                var self;
                self = this;
                return _.any(self.functionArguments, function(arg) {
                    return arg.isSplat;
                });
            },
            generateJavaScript: function(buffer, scope) {
                var self, args, splattedArguments;
                self = this;
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
                var self;
                self = this;
                self.asyncCallbackArgument = callback;
                return self;
            }
        });
        return functionCall = function(fun, args, gen2_options) {
            var optionalArguments, async, passThisToApply, originallyAsync, asyncCallbackArgument, asyncResult, name, macro;
            optionalArguments = gen2_options && gen2_options.hasOwnProperty("optionalArguments") && gen2_options.optionalArguments !== void 0 ? gen2_options.optionalArguments : [];
            async = gen2_options && gen2_options.hasOwnProperty("async") && gen2_options.async !== void 0 ? gen2_options.async : false;
            passThisToApply = gen2_options && gen2_options.hasOwnProperty("passThisToApply") && gen2_options.passThisToApply !== void 0 ? gen2_options.passThisToApply : false;
            originallyAsync = gen2_options && gen2_options.hasOwnProperty("originallyAsync") && gen2_options.originallyAsync !== void 0 ? gen2_options.originallyAsync : false;
            asyncCallbackArgument = gen2_options && gen2_options.hasOwnProperty("asyncCallbackArgument") && gen2_options.asyncCallbackArgument !== void 0 ? gen2_options.asyncCallbackArgument : void 0;
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
            } else if (fun.variable) {
                name = fun.variable;
                macro = terms.macros.findMacro(name);
                if (macro) {
                    return macro(name, args, optionalArguments);
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
})).call(this);