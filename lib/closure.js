((function() {
    var self, _, codegenUtils, blockParameters, selfParameter, splatParameters, parseSplatParameters, takeFromWhile;
    self = this;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self, optionalParameters, optional, asyncParameters;
        self = this;
        optionalParameters = function(optionalParameters, next) {
            if (optionalParameters.length > 0) {
                return {
                    options: terms.generatedVariable([ "options" ]),
                    parameters: function() {
                        var self;
                        self = this;
                        return next.parameters().concat([ self.options ]);
                    },
                    statements: function() {
                        var self, optionalStatements;
                        self = this;
                        optionalStatements = _.map(optionalParameters, function(parm) {
                            return terms.definition(terms.variable(parm.field, {
                                shadow: true
                            }), optional(self.options, parm.field, parm.value));
                        });
                        return optionalStatements.concat(next.statements());
                    },
                    hasOptionals: true
                };
            } else {
                return next;
            }
        };
        optional = terms.term({
            constructor: function(options, name, defaultValue) {
                var self;
                self = this;
                self.options = options;
                self.name = name;
                return self.defaultValue = defaultValue;
            },
            properDefaultValue: function() {
                var self;
                self = this;
                if (self.defaultValue === void 0) {
                    return terms.variable([ "undefined" ]);
                } else {
                    return self.defaultValue;
                }
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                buffer.write("(");
                self.options.generateJavaScript(buffer, scope);
                buffer.write("&&");
                self.options.generateJavaScript(buffer, scope);
                buffer.write(".hasOwnProperty('" + codegenUtils.concatName(self.name) + "')&&");
                self.options.generateJavaScript(buffer, scope);
                buffer.write("." + codegenUtils.concatName(self.name) + "!==void 0)?");
                self.options.generateJavaScript(buffer, scope);
                buffer.write("." + codegenUtils.concatName(self.name) + ":");
                return self.properDefaultValue().generateJavaScript(buffer, scope);
            }
        });
        asyncParameters = function(closure, next) {
            return {
                parameters: function() {
                    var self;
                    self = this;
                    if (closure.isAsync) {
                        return next.parameters().concat([ terms.callbackFunction ]);
                    } else {
                        return next.parameters();
                    }
                },
                statements: function() {
                    var self;
                    self = this;
                    return next.statements();
                }
            };
        };
        return terms.term({
            constructor: function(parameters, body, gen1_options) {
                var optionalParameters, returnLastStatement, redefinesSelf, async, self;
                optionalParameters = gen1_options && gen1_options.hasOwnProperty("optionalParameters") && gen1_options.optionalParameters !== void 0 ? gen1_options.optionalParameters : [];
                returnLastStatement = gen1_options && gen1_options.hasOwnProperty("returnLastStatement") && gen1_options.returnLastStatement !== void 0 ? gen1_options.returnLastStatement : true;
                redefinesSelf = gen1_options && gen1_options.hasOwnProperty("redefinesSelf") && gen1_options.redefinesSelf !== void 0 ? gen1_options.redefinesSelf : false;
                async = gen1_options && gen1_options.hasOwnProperty("async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                self = this;
                self.isBlock = true;
                self.isClosure = true;
                self.parameters = parameters;
                self.body = body;
                self.redefinesSelf = redefinesSelf;
                self.optionalParameters = optionalParameters;
                self.isAsync = async || body.isAsync;
                return self.returnLastStatement = returnLastStatement;
            },
            blockify: function(parameters, gen2_options) {
                var optionalParameters, async, self;
                optionalParameters = gen2_options && gen2_options.hasOwnProperty("optionalParameters") && gen2_options.optionalParameters !== void 0 ? gen2_options.optionalParameters : [];
                async = gen2_options && gen2_options.hasOwnProperty("async") && gen2_options.async !== void 0 ? gen2_options.async : false;
                self = this;
                self.parameters = parameters;
                self.optionalParameters = optionalParameters;
                self.isAsync = self.isAsync || async;
                return self;
            },
            scopify: function() {
                var self;
                self = this;
                if (self.parameters.length === 0 && self.optionalParameters.length === 0) {
                    return terms.scope(self.body.statements);
                } else {
                    return self;
                }
            },
            parameterTransforms: function() {
                var self, optionals, splat, async;
                self = this;
                if (self._parameterTransforms) {
                    return self._parameterTransforms;
                }
                optionals = optionalParameters(self.optionalParameters, selfParameter(terms, self.redefinesSelf, blockParameters(self)));
                splat = splatParameters(terms, optionals);
                async = asyncParameters(self, splat);
                if (optionals.hasOptionals && splat.hasSplat) {
                    terms.errors.addTermsWithMessage(self.optionalParameters, "cannot have splat parameters with optional parameters");
                }
                return self._parameterTransforms = async;
            },
            transformedStatements: function() {
                var self;
                self = this;
                return terms.statements(self.parameterTransforms().statements());
            },
            transformedParameters: function() {
                var self;
                self = this;
                return self.parameterTransforms().parameters();
            },
            declareParameters: function(scope, parameters) {
                var self, gen3_items, gen4_i, parameter;
                self = this;
                gen3_items = parameters;
                for (gen4_i = 0; gen4_i < gen3_items.length; ++gen4_i) {
                    parameter = gen3_items[gen4_i];
                    scope.define(parameter.variableName(scope));
                }
            },
            generateJavaScript: function(buffer, scope) {
                var self, parameters, body, bodyScope;
                self = this;
                self.rewriteResultTermToReturn();
                buffer.write("function(");
                parameters = self.transformedParameters();
                codegenUtils.writeToBufferWithDelimiter(parameters, ",", buffer, scope);
                buffer.write("){");
                body = self.transformedStatements();
                bodyScope = scope.subScope();
                self.declareParameters(bodyScope, parameters);
                body.generateJavaScriptStatements(buffer, bodyScope);
                return buffer.write("}");
            },
            rewriteResultTermToReturn: function() {
                var self;
                self = this;
                if (self.returnLastStatement && !self.body.isAsync) {
                    return self.body.rewriteLastStatementToReturn({
                        async: self.isAsync
                    });
                }
            },
            asyncify: function() {
                var self;
                self = this;
                self.body.asyncify();
                return self.isAsync = true;
            }
        });
    };
    blockParameters = function(block) {
        return {
            parameters: function() {
                var self;
                self = this;
                return block.parameters;
            },
            statements: function() {
                var self;
                self = this;
                return block.body.statements;
            }
        };
    };
    selfParameter = function(cg, redefinesSelf, next) {
        if (redefinesSelf) {
            return {
                parameters: function() {
                    var self;
                    self = this;
                    return next.parameters();
                },
                statements: function() {
                    var self;
                    self = this;
                    return [ cg.definition(cg.selfExpression(), cg.variable([ "this" ])) ].concat(next.statements());
                }
            };
        } else {
            return next;
        }
    };
    splatParameters = function(cg, next) {
        var parsedSplatParameters;
        parsedSplatParameters = parseSplatParameters(cg, next.parameters());
        return {
            parameters: function() {
                var self;
                self = this;
                return parsedSplatParameters.firstParameters;
            },
            statements: function() {
                var self, splat, lastIndex, splatParameter, lastParameterStatements, n, param;
                self = this;
                splat = parsedSplatParameters;
                if (splat.splatParameter) {
                    lastIndex = "arguments.length";
                    if (splat.lastParameters.length > 0) {
                        lastIndex = lastIndex + " - " + splat.lastParameters.length;
                    }
                    splatParameter = cg.definition(splat.splatParameter, cg.javascript("Array.prototype.slice.call(arguments, " + splat.firstParameters.length + ", " + lastIndex + ")"));
                    lastParameterStatements = [ splatParameter ];
                    for (n = 0; n < splat.lastParameters.length; n = n + 1) {
                        param = splat.lastParameters[n];
                        lastParameterStatements.push(cg.definition(param, cg.javascript("arguments[arguments.length - " + (splat.lastParameters.length - n) + "]")));
                    }
                    return lastParameterStatements.concat(next.statements());
                } else {
                    return next.statements();
                }
            },
            hasSplat: parsedSplatParameters.splatParameter
        };
    };
    parseSplatParameters = module.exports.parseSplatParameters = function(cg, parameters) {
        var self, firstParameters, maybeSplat, splatParam, lastParameters;
        self = this;
        firstParameters = takeFromWhile(parameters, function(param) {
            return !param.isSplat;
        });
        maybeSplat = parameters[firstParameters.length];
        splatParam = void 0;
        lastParameters = void 0;
        if (maybeSplat && maybeSplat.isSplat) {
            splatParam = firstParameters.pop();
            splatParam.shadow = true;
            lastParameters = parameters.slice(firstParameters.length + 2);
            lastParameters = _.filter(lastParameters, function(param) {
                if (param.isSplat) {
                    cg.errors.addTermWithMessage(param, "cannot have more than one splat parameter");
                    return false;
                } else {
                    return true;
                }
            });
        } else {
            lastParameters = [];
        }
        return {
            firstParameters: firstParameters,
            splatParameter: splatParam,
            lastParameters: lastParameters
        };
    };
    takeFromWhile = function(list, canTake) {
        var takenList, gen5_items, gen6_i, gen7_forResult;
        takenList = [];
        gen5_items = list;
        for (gen6_i = 0; gen6_i < gen5_items.length; ++gen6_i) {
            gen7_forResult = void 0;
            if (function(gen6_i) {
                var item;
                item = gen5_items[gen6_i];
                if (canTake(item)) {
                    takenList.push(item);
                } else {
                    gen7_forResult = takenList;
                    return true;
                }
            }(gen6_i)) {
                return gen7_forResult;
            }
        }
        return takenList;
    };
})).call(this);