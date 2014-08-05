(function() {
    var self = this;
    var codegenUtils, _, asyncControl;
    codegenUtils = require("./codegenUtils");
    _ = require("underscore");
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        var functionCallTerm, functionCall;
        functionCallTerm = terms.term({
            constructor: function(fun, args, gen1_options) {
                var self = this;
                var async, passThisToApply, options;
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                passThisToApply = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "passThisToApply") && gen1_options.passThisToApply !== void 0 ? gen1_options.passThisToApply : false;
                options = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "options") && gen1_options.options !== void 0 ? gen1_options.options : false;
                self.isFunctionCall = true;
                self.function = fun;
                if (options) {
                    self.functionArguments = terms.argumentUtils.positionalArguments(args);
                    self.optionalArguments = terms.argumentUtils.optionalArguments(args);
                } else {
                    self.functionArguments = args;
                }
                self.passThisToApply = passThisToApply;
                return self.isAsync = async;
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
            var passThisToApply, couldBeMacro, promisify, options;
            passThisToApply = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "passThisToApply") && gen2_options.passThisToApply !== void 0 ? gen2_options.passThisToApply : false;
            couldBeMacro = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "couldBeMacro") && gen2_options.couldBeMacro !== void 0 ? gen2_options.couldBeMacro : true;
            promisify = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "promisify") && gen2_options.promisify !== void 0 ? gen2_options.promisify : false;
            options = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "options") && gen2_options.options !== void 0 ? gen2_options.options : false;
            var name, macro, funCall;
            if (!promisify && function() {
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
                return terms.promisify(terms.functionCall(fun, args, {
                    passThisToApply: false,
                    couldBeMacro: true,
                    promisify: true,
                    options: options
                }));
            } else if (fun.variable && couldBeMacro) {
                name = fun.variable;
                macro = terms.macros.findMacro(name);
                funCall = functionCallTerm(fun, args, {
                    options: options
                });
                if (macro) {
                    return macro(funCall, name, args);
                }
            }
            return functionCallTerm(fun, args, {
                passThisToApply: passThisToApply,
                options: options
            });
        };
    };
}).call(this);