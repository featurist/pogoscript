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
            generate: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    var args, splattedArguments;
                    args = codegenUtils.concatArgs(self.methodArguments, {
                        optionalArgs: self.optionalArguments,
                        terms: terms,
                        asyncCallbackArg: self.asyncCallbackArgument
                    });
                    splattedArguments = terms.splatArguments(args);
                    if (splattedArguments) {
                        buffer.write(self.object.generate(scope));
                        buffer.write(".");
                        buffer.write(codegenUtils.concatName(self.name));
                        buffer.write(".apply(");
                        buffer.write(self.object.generate(scope));
                        buffer.write(",");
                        buffer.write(splattedArguments.generate(scope));
                        return buffer.write(")");
                    } else {
                        buffer.write(self.object.generate(scope));
                        buffer.write(".");
                        buffer.write(codegenUtils.concatName(self.name));
                        buffer.write("(");
                        codegenUtils.writeToBufferWithDelimiter(args, ",", buffer, scope);
                        return buffer.write(")");
                    }
                });
            },
            makeAsyncCallWithCallback: function(callback) {
                var self = this;
                self.asyncCallbackArgument = callback;
                return self;
            }
        });
        return methodCall = function(object, name, args, gen2_options) {
            var optionalArguments, async, future, originallyAsync, asyncCallbackArgument, containsSplatArguments, promisify;
            optionalArguments = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "optionalArguments") && gen2_options.optionalArguments !== void 0 ? gen2_options.optionalArguments : [];
            async = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "async") && gen2_options.async !== void 0 ? gen2_options.async : false;
            future = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "future") && gen2_options.future !== void 0 ? gen2_options.future : false;
            originallyAsync = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "originallyAsync") && gen2_options.originallyAsync !== void 0 ? gen2_options.originallyAsync : false;
            asyncCallbackArgument = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "asyncCallbackArgument") && gen2_options.asyncCallbackArgument !== void 0 ? gen2_options.asyncCallbackArgument : void 0;
            containsSplatArguments = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "containsSplatArguments") && gen2_options.containsSplatArguments !== void 0 ? gen2_options.containsSplatArguments : false;
            promisify = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "promisify") && gen2_options.promisify !== void 0 ? gen2_options.promisify : false;
            var splattedArgs, objectVar, asyncResult, futureFunction;
            splattedArgs = terms.splatArguments(args, optionalArguments);
            if (splattedArgs && !containsSplatArguments) {
                objectVar = terms.generatedVariable([ "o" ]);
                return terms.subStatements([ terms.definition(objectVar, object), methodCall(objectVar, name, args, {
                    async: async,
                    future: false,
                    asyncCallbackArgument: void 0,
                    containsSplatArguments: true
                }) ]);
            } else if (async) {
                asyncResult = terms.asyncResult();
                return terms.subStatements([ terms.definition(asyncResult, methodCallTerm(object, name, args, {
                    optionalArguments: optionalArguments,
                    async: async,
                    originallyAsync: true
                }), {
                    async: true
                }), asyncResult ]);
            } else if (!promisify && function() {
                var gen3_results, gen4_items, gen5_i, a;
                gen3_results = [];
                gen4_items = args;
                for (gen5_i = 0; gen5_i < gen4_items.length; ++gen5_i) {
                    a = gen4_items[gen5_i];
                    if (a.isCallback) {
                        gen3_results.push(a);
                    }
                }
                return gen3_results;
            }().length > 0) {
                return terms.promisify(methodCall(object, name, args, {
                    optionalArguments: [],
                    async: false,
                    future: false,
                    originallyAsync: false,
                    asyncCallbackArgument: void 0,
                    containsSplatArguments: false,
                    promisify: true
                }));
            } else if (future) {
                futureFunction = terms.moduleConstants.defineAs([ "future" ], terms.javascript(asyncControl.future.toString()));
                return terms.functionCall(futureFunction, [ terms.closure([ terms.continuationFunction ], terms.statements([ methodCallTerm(object, name, args, {
                    optionalArguments: optionalArguments,
                    originallyAsync: true,
                    asyncCallbackArgument: terms.continuationFunction
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