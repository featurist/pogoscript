((function() {
    var self, _, codegenUtils;
    self = this;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self;
        self = this;
        return {
            functionStrategy: function(strategy) {
                var self;
                self = this;
                return {
                    strategy: strategy,
                    generateJavaScriptParameters: function(buffer, scope) {
                        var self;
                        self = this;
                        return codegenUtils.writeToBufferWithDelimiter(self.strategy.namedParameters(), ",", buffer, scope);
                    },
                    generateJavaScriptParameterStatements: function(buffer, scope, args) {
                        var self;
                        self = this;
                        return self.strategy.generateJavaScriptParameterStatements(buffer, scope, args);
                    },
                    namedParameters: function() {
                        var self;
                        self = this;
                        return strategy.namedParameters();
                    }
                };
            },
            normalStrategy: function(parameters) {
                var self;
                self = this;
                return {
                    parameters: parameters,
                    namedParameters: function() {
                        var self;
                        self = this;
                        return self.parameters;
                    },
                    generateJavaScriptParameterStatements: function(buffer, scope, args) {
                        var self;
                        self = this;
                        return void 0;
                    }
                };
            },
            splatStrategy: function(gen1_options) {
                var before, splat, after, self;
                before = gen1_options && gen1_options.hasOwnProperty("before") && gen1_options.before !== void 0 ? gen1_options.before : void 0;
                splat = gen1_options && gen1_options.hasOwnProperty("splat") && gen1_options.splat !== void 0 ? gen1_options.splat : void 0;
                after = gen1_options && gen1_options.hasOwnProperty("after") && gen1_options.after !== void 0 ? gen1_options.after : void 0;
                self = this;
                return {
                    before: before,
                    splat: splat,
                    after: after,
                    namedParameters: function() {
                        var self;
                        self = this;
                        return self.before;
                    },
                    generateJavaScriptParameterStatements: function(buffer, scope, args) {
                        var self, n, afterArg, argsIndex;
                        self = this;
                        buffer.write("var ");
                        self.splat.generateJavaScript(buffer, scope);
                        buffer.write("=Array.prototype.slice.call(");
                        args.generateJavaScript(buffer, scope);
                        buffer.write("," + self.before.length + ",");
                        args.generateJavaScript(buffer, scope);
                        buffer.write(".length");
                        if (self.after.length > 0) {
                            buffer.write("-" + self.after.length);
                        }
                        buffer.write(");");
                        if (before.length > 0 && after.length > 0) {
                            buffer.write("if(");
                            args.generateJavaScript(buffer, scope);
                            buffer.write(".length>" + before.length + "){");
                        }
                        for (n = 0; n < self.after.length; n = n + 1) {
                            afterArg = self.after[n];
                            argsIndex = self.after.length - n;
                            buffer.write("var ");
                            afterArg.generateJavaScript(buffer, scope);
                            buffer.write("=");
                            args.generateJavaScript(buffer, scope);
                            buffer.write("[");
                            args.generateJavaScript(buffer, scope);
                            buffer.write(".length-" + argsIndex + "];");
                        }
                        if (before.length > 0 && after.length > 0) {
                            return buffer.write("}");
                        }
                    }
                };
            },
            optionalStrategy: function(gen2_options) {
                var before, options, self;
                before = gen2_options && gen2_options.hasOwnProperty("before") && gen2_options.before !== void 0 ? gen2_options.before : void 0;
                options = gen2_options && gen2_options.hasOwnProperty("options") && gen2_options.options !== void 0 ? gen2_options.options : void 0;
                self = this;
                return {
                    before: before,
                    options: options,
                    optionsVariable: terms.generatedVariable([ "options" ]),
                    namedParameters: function() {
                        var self;
                        self = this;
                        return self.before.concat([ self.optionsVariable ]);
                    },
                    generateJavaScriptParameterStatements: function(buffer, scope, args) {
                        var self, optionNames, gen3_items, gen4_i, option, optionName;
                        self = this;
                        optionNames = _.map(self.options, function(option) {
                            return codegenUtils.concatName(option.field);
                        });
                        buffer.write("var ");
                        buffer.write(optionNames.join(","));
                        buffer.write(";");
                        gen3_items = self.options;
                        for (gen4_i = 0; gen4_i < gen3_items.length; ++gen4_i) {
                            option = gen3_items[gen4_i];
                            optionName = codegenUtils.concatName(option.field);
                            buffer.write(optionName + "=");
                            self.optionsVariable.generateJavaScript(buffer, scope);
                            buffer.write("!==void 0&&Object.prototype.hasOwnProperty.call(");
                            self.optionsVariable.generateJavaScript(buffer, scope);
                            buffer.write(",'" + optionName + "')&&");
                            self.optionsVariable.generateJavaScript(buffer, scope);
                            buffer.write("." + optionName + "!==void 0?");
                            self.optionsVariable.generateJavaScript(buffer, scope);
                            buffer.write("." + optionName + ":");
                            option.value.generateJavaScript(buffer, scope);
                            buffer.write(";");
                        }
                    }
                };
            },
            callbackStrategy: function(strategy) {
                var self;
                self = this;
                return {
                    strategy: strategy,
                    namedParameters: function() {
                        var self;
                        self = this;
                        return self.strategy.namedParameters().concat(terms.callbackFunction);
                    },
                    generateJavaScriptParameterStatements: function(buffer, scope, args) {
                        var self, innerArgs, namedParameters, n, namedParam;
                        self = this;
                        innerArgs = terms.generatedVariable([ "arguments" ]);
                        buffer.write("var ");
                        innerArgs.generateJavaScript(buffer, scope);
                        buffer.write("=Array.prototype.slice.call(");
                        args.generateJavaScript(buffer, scope);
                        buffer.write(",0,");
                        args.generateJavaScript(buffer, scope);
                        buffer.write(".length-1);");
                        terms.callbackFunction.generateJavaScript(buffer, scope);
                        buffer.write("=");
                        args.generateJavaScript(buffer, scope);
                        buffer.write("[");
                        args.generateJavaScript(buffer, scope);
                        buffer.write(".length-1];");
                        namedParameters = self.strategy.namedParameters();
                        for (n = 0; n < namedParameters.length; n = n + 1) {
                            namedParam = self.strategy.namedParameters()[n];
                            namedParam.generateJavaScript(buffer, scope);
                            buffer.write("=");
                            innerArgs.generateJavaScript(buffer, scope);
                            buffer.write("[" + n + "];");
                        }
                        return self.strategy.generateJavaScriptParameterStatements(buffer, scope, innerArgs);
                    }
                };
            }
        };
    };
})).call(this);