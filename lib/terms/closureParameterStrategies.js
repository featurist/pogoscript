(function() {
    var self = this;
    var _, codegenUtils;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        return {
            functionStrategy: function(strategy) {
                var self = this;
                return {
                    strategy: strategy,
                    generateJavaScriptParameters: function(buffer, scope) {
                        var self = this;
                        return codegenUtils.writeToBufferWithDelimiter(self.strategy.functionParameters(), ",", buffer, scope);
                    },
                    generateJavaScriptParameterStatements: function(buffer, scope, args) {
                        var self = this;
                        return self.strategy.generateJavaScriptParameterStatements(buffer, scope, args);
                    },
                    functionParameters: function() {
                        var self = this;
                        return strategy.functionParameters();
                    },
                    definedParameters: function() {
                        var self = this;
                        return strategy.definedParameters();
                    }
                };
            },
            normalStrategy: function(parameters) {
                var self = this;
                return {
                    parameters: parameters,
                    functionParameters: function() {
                        var self = this;
                        return self.parameters;
                    },
                    generateJavaScriptParameterStatements: function(buffer, scope, args) {
                        var self = this;
                        return void 0;
                    },
                    definedParameters: function() {
                        var self = this;
                        return self.parameters;
                    }
                };
            },
            splatStrategy: function(gen1_options) {
                var self = this;
                var before, splat, after;
                before = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "before") && gen1_options.before !== void 0 ? gen1_options.before : void 0;
                splat = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "splat") && gen1_options.splat !== void 0 ? gen1_options.splat : void 0;
                after = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "after") && gen1_options.after !== void 0 ? gen1_options.after : void 0;
                return {
                    before: before,
                    splat: splat,
                    after: after,
                    functionParameters: function() {
                        var self = this;
                        return self.before;
                    },
                    definedParameters: function() {
                        var self = this;
                        return self.before.concat([ self.splat ]).concat(self.after);
                    },
                    generateJavaScriptParameterStatements: function(buffer, scope, args) {
                        var self = this;
                        var n, afterArg, argsIndex;
                        buffer.write("var ");
                        buffer.write(self.splat.generate(scope));
                        buffer.write("=Array.prototype.slice.call(");
                        buffer.write(args.generate(scope));
                        buffer.write("," + self.before.length + ",");
                        buffer.write(args.generate(scope));
                        buffer.write(".length");
                        if (self.after.length > 0) {
                            buffer.write("-" + self.after.length);
                        }
                        buffer.write(");");
                        if (before.length > 0 && after.length > 0) {
                            buffer.write("if(");
                            buffer.write(args.generate(scope));
                            buffer.write(".length>" + before.length + "){");
                        }
                        for (n = 0; n < self.after.length; ++n) {
                            afterArg = self.after[n];
                            argsIndex = self.after.length - n;
                            buffer.write("var ");
                            buffer.write(afterArg.generate(scope));
                            buffer.write("=");
                            buffer.write(args.generate(scope));
                            buffer.write("[");
                            buffer.write(args.generate(scope));
                            buffer.write(".length-" + argsIndex + "];");
                        }
                        if (before.length > 0 && after.length > 0) {
                            return buffer.write("}");
                        }
                    }
                };
            },
            optionalStrategy: function(gen2_options) {
                var self = this;
                var before, options;
                before = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "before") && gen2_options.before !== void 0 ? gen2_options.before : void 0;
                options = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "options") && gen2_options.options !== void 0 ? gen2_options.options : void 0;
                return {
                    before: before,
                    options: options,
                    optionsVariable: terms.generatedVariable([ "options" ]),
                    functionParameters: function() {
                        var self = this;
                        return self.before.concat([ self.optionsVariable ]);
                    },
                    definedParameters: function() {
                        var self = this;
                        return before.concat(function() {
                            var gen3_results, gen4_items, gen5_i, option, param;
                            gen3_results = [];
                            gen4_items = self.options;
                            for (gen5_i = 0; gen5_i < gen4_items.length; ++gen5_i) {
                                option = gen4_items[gen5_i];
                                param = terms.variable(option.field);
                                gen3_results.push(param);
                            }
                            return gen3_results;
                        }());
                    },
                    generateJavaScriptParameterStatements: function(buffer, scope, args) {
                        var self = this;
                        var optionNames, gen6_items, gen7_i, option, optionName;
                        optionNames = _.map(self.options, function(option) {
                            return codegenUtils.concatName(option.field);
                        });
                        buffer.write("var ");
                        buffer.write(optionNames.join(","));
                        buffer.write(";");
                        gen6_items = self.options;
                        for (gen7_i = 0; gen7_i < gen6_items.length; ++gen7_i) {
                            option = gen6_items[gen7_i];
                            optionName = codegenUtils.concatName(option.field);
                            buffer.write(optionName + "=");
                            buffer.write(self.optionsVariable.generate(scope));
                            buffer.write("!==void 0&&Object.prototype.hasOwnProperty.call(");
                            buffer.write(self.optionsVariable.generate(scope));
                            buffer.write(",'" + optionName + "')&&");
                            buffer.write(self.optionsVariable.generate(scope));
                            buffer.write("." + optionName + "!==void 0?");
                            buffer.write(self.optionsVariable.generate(scope));
                            buffer.write("." + optionName + ":");
                            buffer.write(option.value.generate(scope));
                            buffer.write(";");
                        }
                        return void 0;
                    }
                };
            }
        };
    };
}).call(this);