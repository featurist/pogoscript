(function() {
    var self = this;
    var codegenUtils, argumentUtils, asyncControl, _;
    codegenUtils = require("./codegenUtils");
    argumentUtils = require("./argumentUtils");
    asyncControl = require("../asyncControl");
    _ = require("underscore");
    module.exports = function(terms) {
        var self = this;
        var methodCallTerm, methodCall;
        methodCallTerm = terms.term({
            constructor: function(object, name, args, gen1_options) {
                var self = this;
                var async, asyncCallbackArgument, options;
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                asyncCallbackArgument = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "asyncCallbackArgument") && gen1_options.asyncCallbackArgument !== void 0 ? gen1_options.asyncCallbackArgument : void 0;
                options = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "options") && gen1_options.options !== void 0 ? gen1_options.options : false;
                self.isMethodCall = true;
                self.object = object;
                self.name = name;
                if (options) {
                    self.methodArguments = terms.argumentUtils.positionalArguments(args);
                    self.optionalArguments = terms.argumentUtils.optionalArguments(args);
                } else {
                    self.methodArguments = args;
                }
                self.isAsync = async;
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
            }
        });
        return methodCall = function(object, name, args, gen2_options) {
            var async, future, asyncCallbackArgument, containsSplatArguments, promisify, options;
            async = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "async") && gen2_options.async !== void 0 ? gen2_options.async : false;
            future = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "future") && gen2_options.future !== void 0 ? gen2_options.future : false;
            asyncCallbackArgument = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "asyncCallbackArgument") && gen2_options.asyncCallbackArgument !== void 0 ? gen2_options.asyncCallbackArgument : void 0;
            containsSplatArguments = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "containsSplatArguments") && gen2_options.containsSplatArguments !== void 0 ? gen2_options.containsSplatArguments : false;
            promisify = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "promisify") && gen2_options.promisify !== void 0 ? gen2_options.promisify : false;
            options = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "options") && gen2_options.options !== void 0 ? gen2_options.options : false;
            var objectVar, asyncResult;
            if (_.any(args, function(arg) {
                return arg.isSplat;
            }) && !containsSplatArguments) {
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
                    async: async,
                    options: options
                }), {
                    async: true
                }), asyncResult ]);
            } else if (!promisify && function() {
                var gen3_results, gen4_items, gen5_i, a;
                gen3_results = [];
                gen4_items = args;
                for (gen5_i = 0; gen5_i < gen4_items.length; ++gen5_i) {
                    a = gen4_items[gen5_i];
                    (function(a) {
                        if (a.isCallback) {
                            return gen3_results.push(a);
                        }
                    })(a);
                }
                return gen3_results;
            }().length > 0) {
                return terms.promisify(methodCall(object, name, args, {
                    async: false,
                    future: false,
                    asyncCallbackArgument: void 0,
                    containsSplatArguments: false,
                    promisify: true
                }));
            } else {
                return methodCallTerm(object, name, args, {
                    async: async,
                    asyncCallbackArgument: asyncCallbackArgument,
                    options: options
                });
            }
        };
    };
}).call(this);