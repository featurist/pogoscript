(function() {
    var self = this;
    var codegenUtils, argumentUtils, asyncControl;
    codegenUtils = require("./codegenUtils");
    argumentUtils = require("./argumentUtils");
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        var methodCallTerm, methodCall;
        methodCallTerm = terms.term({
            constructor: function(object, name, args, gen1_options) {
                var self = this;
                var optionalArguments, async, originallyAsync, asyncCallbackArgument;
                optionalArguments = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "optionalArguments") && gen1_options.optionalArguments !== void 0 ? gen1_options.optionalArguments : [];
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                originallyAsync = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "originallyAsync") && gen1_options.originallyAsync !== void 0 ? gen1_options.originallyAsync : false;
                asyncCallbackArgument = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "asyncCallbackArgument") && gen1_options.asyncCallbackArgument !== void 0 ? gen1_options.asyncCallbackArgument : void 0;
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
                var self = this;
                var args, splattedArguments;
                args = codegenUtils.concatArgs(self.methodArguments, {
                    optionalArgs: self.optionalArguments,
                    terms: terms,
                    asyncCallbackArg: self.asyncCallbackArgument
                });
                splattedArguments = terms.splatArguments(args);
                if (splattedArguments) {
                    self.object.generateJavaScript(buffer, scope);
                    buffer.write("." + self.name + ".apply(");
                    self.object.generateJavaScript(buffer, scope);
                    buffer.write(",");
                    splattedArguments.generateJavaScript(buffer, scope);
                    return buffer.write(")");
                } else {
                    self.object.generateJavaScript(buffer, scope);
                    buffer.write(".");
                    buffer.write(codegenUtils.concatName(self.name));
                    buffer.write("(");
                    codegenUtils.writeToBufferWithDelimiter(args, ",", buffer, scope);
                    return buffer.write(")");
                }
            },
            makeAsyncCallWithCallback: function(callback) {
                var self = this;
                self.asyncCallbackArgument = callback;
                return terms.returnStatement(self, {
                    implicit: true
                });
            }
        });
        return methodCall = function(object, name, args, gen2_options) {
            var optionalArguments, async, future, originallyAsync, asyncCallbackArgument, containsSplatArguments;
            optionalArguments = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "optionalArguments") && gen2_options.optionalArguments !== void 0 ? gen2_options.optionalArguments : [];
            async = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "async") && gen2_options.async !== void 0 ? gen2_options.async : false;
            future = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "future") && gen2_options.future !== void 0 ? gen2_options.future : false;
            originallyAsync = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "originallyAsync") && gen2_options.originallyAsync !== void 0 ? gen2_options.originallyAsync : false;
            asyncCallbackArgument = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "asyncCallbackArgument") && gen2_options.asyncCallbackArgument !== void 0 ? gen2_options.asyncCallbackArgument : void 0;
            containsSplatArguments = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "containsSplatArguments") && gen2_options.containsSplatArguments !== void 0 ? gen2_options.containsSplatArguments : false;
            var splattedArgs, objectVar, asyncResult, futureFunction;
            splattedArgs = terms.splatArguments(args, optionalArguments);
            if (splattedArgs && !containsSplatArguments) {
                objectVar = terms.generatedVariable([ "o" ]);
                return terms.subStatements([ terms.definition(objectVar, object), methodCall(object, name, args, {
                    async: async,
                    future: false,
                    asyncCallbackArgument: void 0,
                    containsSplatArguments: true
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
            } else if (future) {
                futureFunction = terms.moduleConstants.defineAs([ "future" ], terms.javascript(asyncControl.future.toString()));
                return terms.functionCall(futureFunction, [ terms.closure([ terms.callbackFunction ], terms.statements([ methodCallTerm(object, name, args, {
                    optionalArguments: optionalArguments,
                    originallyAsync: true,
                    asyncCallbackArgument: terms.callbackFunction
                }) ])) ]);
            } else {
                return methodCallTerm(object, name, args, {
                    optionalArguments: optionalArguments,
                    async: async,
                    originallyAsync: originallyAsync,
                    asyncCallbackArgument: asyncCallbackArgument
                });
            }
        };
    };
}).call(this);