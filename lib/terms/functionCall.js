(function() {
    var self = this;
    var codegenUtils, argumentUtils, _, asyncControl;
    codegenUtils = require("./codegenUtils");
    argumentUtils = require("./argumentUtils");
    _ = require("underscore");
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        var functionCallTerm, functionCall;
        functionCallTerm = terms.term({
            constructor: function(fun, args, gen1_options) {
                var self = this;
                var optionalArguments, async, passThisToApply, originallyAsync, asyncCallbackArgument;
                optionalArguments = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "optionalArguments") && gen1_options.optionalArguments !== void 0 ? gen1_options.optionalArguments : [];
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                passThisToApply = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "passThisToApply") && gen1_options.passThisToApply !== void 0 ? gen1_options.passThisToApply : false;
                originallyAsync = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "originallyAsync") && gen1_options.originallyAsync !== void 0 ? gen1_options.originallyAsync : false;
                asyncCallbackArgument = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "asyncCallbackArgument") && gen1_options.asyncCallbackArgument !== void 0 ? gen1_options.asyncCallbackArgument : void 0;
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
                var self = this;
                return _.any(self.functionArguments, function(arg) {
                    return arg.isSplat;
                });
            },
            generate: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    var args, splattedArguments;
                    buffer.write(self.function.generateFunction(scope));
                    args = codegenUtils.concatArgs(self.functionArguments, {
                        optionalArgs: self.optionalArguments,
                        asyncCallbackArg: self.asyncCallbackArgument,
                        terms: terms
                    });
                    splattedArguments = self.cg.splatArguments(args);
                    if (splattedArguments && self.function.isIndexer) {
                        buffer.write(".apply(");
                        buffer.write(self.function.object.generate(scope));
                        buffer.write(",");
                        buffer.write(splattedArguments.generate(scope));
                        return buffer.write(")");
                    } else if (splattedArguments) {
                        buffer.write(".apply(");
                        if (self.passThisToApply) {
                            buffer.write("this");
                        } else {
                            buffer.write("null");
                        }
                        buffer.write(",");
                        buffer.write(splattedArguments.generate(scope));
                        return buffer.write(")");
                    } else {
                        buffer.write("(");
                        codegenUtils.writeToBufferWithDelimiter(args, ",", buffer, scope);
                        return buffer.write(")");
                    }
                });
            }
        });
        return functionCall = function(fun, args, gen2_options) {
            var optionalArguments, async, passThisToApply, originallyAsync, asyncCallbackArgument, couldBeMacro, future, promisify;
            optionalArguments = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "optionalArguments") && gen2_options.optionalArguments !== void 0 ? gen2_options.optionalArguments : [];
            async = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "async") && gen2_options.async !== void 0 ? gen2_options.async : false;
            passThisToApply = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "passThisToApply") && gen2_options.passThisToApply !== void 0 ? gen2_options.passThisToApply : false;
            originallyAsync = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "originallyAsync") && gen2_options.originallyAsync !== void 0 ? gen2_options.originallyAsync : false;
            asyncCallbackArgument = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "asyncCallbackArgument") && gen2_options.asyncCallbackArgument !== void 0 ? gen2_options.asyncCallbackArgument : void 0;
            couldBeMacro = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "couldBeMacro") && gen2_options.couldBeMacro !== void 0 ? gen2_options.couldBeMacro : true;
            future = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "future") && gen2_options.future !== void 0 ? gen2_options.future : false;
            promisify = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "promisify") && gen2_options.promisify !== void 0 ? gen2_options.promisify : false;
            var asyncResult, futureFunction, callback, name, macro, funCall;
            if (async) {
                asyncResult = terms.asyncResult();
                return terms.subStatements([ terms.definition(asyncResult, functionCallTerm(fun, args, {
                    optionalArguments: optionalArguments,
                    passThisToApply: passThisToApply,
                    originallyAsync: true,
                    asyncCallbackArgument: asyncCallbackArgument
                }), {
                    async: true
                }), asyncResult ]);
            } else if (future) {
                futureFunction = terms.moduleConstants.defineAs([ "future" ], terms.javascript(asyncControl.future.toString()));
                callback = terms.generatedVariable([ "callback" ]);
                return terms.functionCall(futureFunction, [ terms.closure([ callback ], terms.statements([ terms.functionCall(fun, args, {
                    optionalArguments: optionalArguments,
                    passThisToApply: passThisToApply,
                    originallyAsync: true,
                    asyncCallbackArgument: callback,
                    couldBeMacro: couldBeMacro
                }) ])) ]);
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
                return terms.promisify(terms.functionCall(fun, args, {
                    optionalArguments: [],
                    async: false,
                    passThisToApply: false,
                    originallyAsync: false,
                    asyncCallbackArgument: void 0,
                    couldBeMacro: true,
                    future: false,
                    promisify: true
                }));
            } else if (fun.variable && couldBeMacro) {
                name = fun.variable;
                macro = terms.macros.findMacro(name);
                funCall = functionCallTerm(fun, args, {
                    optionalArguments: optionalArguments
                });
                if (macro) {
                    return macro(funCall, name, args, optionalArguments);
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
}).call(this);