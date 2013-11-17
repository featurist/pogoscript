(function() {
    var self = this;
    var _, codegenUtils, blockParameters, selfParameter, splatParameters, parseSplatParameters, takeFromWhile;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        var optionalParameters, optional, asyncParameters, containsSplatParameter, createSplatParameterStrategyFor, createOptionalParameterStrategyFor;
        optionalParameters = function(optionalParameters, next) {
            if (optionalParameters.length > 0) {
                return {
                    options: terms.generatedVariable([ "options" ]),
                    parameters: function() {
                        var self = this;
                        return next.parameters().concat([ self.options ]);
                    },
                    statements: function() {
                        var self = this;
                        var optionalStatements;
                        optionalStatements = _.map(optionalParameters, function(parm) {
                            return terms.definition(terms.variable(parm.field), optional(self.options, parm.field, parm.value), {
                                shadow: true
                            });
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
                var self = this;
                self.options = options;
                self.name = name;
                return self.defaultValue = defaultValue;
            },
            properDefaultValue: function() {
                var self = this;
                if (self.defaultValue === void 0) {
                    return terms.variable([ "undefined" ]);
                } else {
                    return self.defaultValue;
                }
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
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
                    var self = this;
                    if (closure.isAsync) {
                        return next.parameters().concat([ terms.callbackFunction ]);
                    } else {
                        return next.parameters();
                    }
                },
                statements: function() {
                    var self = this;
                    return next.statements();
                }
            };
        };
        containsSplatParameter = function(closure) {
            return _.any(closure.parameters, function(parameter) {
                return parameter.isSplat;
            });
        };
        createSplatParameterStrategyFor = function(closure) {
            var nonSplatParams, before, splat, after;
            nonSplatParams = takeFromWhile(closure.parameters, function(parameter) {
                return !parameter.isSplat;
            });
            before = nonSplatParams.slice(0, nonSplatParams.length - 1);
            splat = nonSplatParams[nonSplatParams.length - 1];
            after = closure.parameters.slice(nonSplatParams.length + 1);
            return terms.closureParameterStrategies.splatStrategy({
                before: before,
                splat: splat,
                after: after
            });
        };
        createOptionalParameterStrategyFor = function(closure) {
            return terms.closureParameterStrategies.optionalStrategy({
                before: closure.parameters,
                options: closure.optionalParameters
            });
        };
        return terms.term({
            constructor: function(parameters, body, gen1_options) {
                var self = this;
                var optionalParameters, returnLastStatement, redefinesSelf, async, definesModuleConstants;
                optionalParameters = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "optionalParameters") && gen1_options.optionalParameters !== void 0 ? gen1_options.optionalParameters : [];
                returnLastStatement = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "returnLastStatement") && gen1_options.returnLastStatement !== void 0 ? gen1_options.returnLastStatement : true;
                redefinesSelf = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "redefinesSelf") && gen1_options.redefinesSelf !== void 0 ? gen1_options.redefinesSelf : false;
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                definesModuleConstants = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "definesModuleConstants") && gen1_options.definesModuleConstants !== void 0 ? gen1_options.definesModuleConstants : false;
                self.isBlock = true;
                self.isClosure = true;
                self.parameters = parameters;
                self.body = body;
                self.redefinesSelf = redefinesSelf;
                self.optionalParameters = optionalParameters;
                self.makeAsync(async || body.isAsync);
                self.returnLastStatement = returnLastStatement;
                return self.definesModuleConstants = definesModuleConstants;
            },
            blockify: function(parameters, gen2_options) {
                var self = this;
                var optionalParameters, async, redefinesSelf;
                optionalParameters = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "optionalParameters") && gen2_options.optionalParameters !== void 0 ? gen2_options.optionalParameters : [];
                async = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "async") && gen2_options.async !== void 0 ? gen2_options.async : false;
                redefinesSelf = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "redefinesSelf") && gen2_options.redefinesSelf !== void 0 ? gen2_options.redefinesSelf : void 0;
                self.parameters = parameters;
                self.optionalParameters = optionalParameters;
                self.makeAsync(self.isAsync || async);
                if (redefinesSelf !== void 0) {
                    self.redefinesSelf = redefinesSelf;
                }
                return self;
            },
            makeAsync: function(a) {
                var self = this;
                self.isAsync = a;
                if (a) {
                    return self.continuationOrDefault = terms.continuationOrDefault();
                }
            },
            scopify: function() {
                var self = this;
                if (self.parameters.length === 0 && self.optionalParameters.length === 0) {
                    if (self.isAsync) {
                        return terms.functionCall(terms.subExpression(self), [], {
                            async: true
                        });
                    } else {
                        return terms.scope(self.body.statements, {
                            async: self.isAsync
                        });
                    }
                } else {
                    return self;
                }
            },
            parameterTransforms: function() {
                var self = this;
                var optionals, async, splat;
                if (self._parameterTransforms) {
                    return self._parameterTransforms;
                }
                optionals = optionalParameters(self.optionalParameters, selfParameter(terms, self.redefinesSelf, blockParameters(self)));
                async = asyncParameters(self, optionals);
                splat = splatParameters(terms, async);
                if (optionals.hasOptionals && splat.hasSplat) {
                    terms.errors.addTermsWithMessage(self.optionalParameters, "cannot have splat parameters with optional parameters");
                }
                return self._parameterTransforms = splat;
            },
            transformedStatements: function() {
                var self = this;
                return terms.statements(self.parameterTransforms().statements());
            },
            transformedParameters: function() {
                var self = this;
                return self.parameterTransforms().parameters();
            },
            defineParameters: function(scope, parameters) {
                var self = this;
                var gen3_items, gen4_i, parameter;
                gen3_items = parameters;
                for (gen4_i = 0; gen4_i < gen3_items.length; ++gen4_i) {
                    parameter = gen3_items[gen4_i];
                    scope.define(parameter.canonicalName(scope));
                }
                return void 0;
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                var parametersStrategy, definedParameters, bodyScope;
                parametersStrategy = self.parametersStrategy();
                self.rewriteResultTermToReturn();
                buffer.write("function(");
                definedParameters = parametersStrategy.definedParameters();
                parametersStrategy.generateJavaScriptParameters(buffer, scope);
                buffer.write("){");
                bodyScope = scope.subScope();
                self.defineParameters(bodyScope, definedParameters);
                if (self.definesModuleConstants) {
                    terms.moduleConstants.generateJavaScript(buffer, scope);
                }
                self.generateSelfAssignment(buffer);
                parametersStrategy.generateJavaScriptParameterStatements(buffer, scope, terms.variable([ "arguments" ]));
                self.body.generateJavaScriptStatements(buffer, bodyScope, {
                    inClosure: true
                });
                return buffer.write("}");
            },
            generateSelfAssignment: function(buffer) {
                var self = this;
                if (self.redefinesSelf) {
                    return buffer.write("var self=this;");
                }
            },
            rewriteResultTermToReturn: function() {
                var self = this;
                if (self.returnLastStatement && !self.body.isAsync) {
                    return self.body.rewriteLastStatementToReturn({
                        async: self.isAsync
                    });
                }
            },
            asyncify: function() {
                var self = this;
                self.body.asyncify({
                    returnCallToContinuation: self.returnLastStatement
                });
                return self.makeAsync(true);
            },
            parametersStrategy: function() {
                var self = this;
                var innerStrategy, strategy;
                innerStrategy = function() {
                    if (containsSplatParameter(self)) {
                        return createSplatParameterStrategyFor(self);
                    } else if (self.optionalParameters.length > 0) {
                        return createOptionalParameterStrategyFor(self);
                    } else {
                        return terms.closureParameterStrategies.normalStrategy(self.parameters);
                    }
                }();
                strategy = function() {
                    if (self.isAsync) {
                        return terms.closureParameterStrategies.callbackStrategy(innerStrategy, {
                            continuationOrDefault: self.continuationOrDefault
                        });
                    } else {
                        return innerStrategy;
                    }
                }();
                return terms.closureParameterStrategies.functionStrategy(strategy);
            }
        });
    };
    blockParameters = function(block) {
        return {
            parameters: function() {
                var self = this;
                return block.parameters;
            },
            statements: function() {
                var self = this;
                return block.body.statements;
            }
        };
    };
    selfParameter = function(cg, redefinesSelf, next) {
        if (redefinesSelf) {
            return {
                parameters: function() {
                    var self = this;
                    return next.parameters();
                },
                statements: function() {
                    var self = this;
                    return [ cg.definition(cg.selfExpression(), cg.variable([ "this" ]), {
                        shadow: true
                    }) ].concat(next.statements());
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
                var self = this;
                return parsedSplatParameters.firstParameters;
            },
            statements: function() {
                var self = this;
                var splat, lastIndex, splatParameter, lastParameterStatements, n, param;
                splat = parsedSplatParameters;
                if (splat.splatParameter) {
                    lastIndex = "arguments.length";
                    if (splat.lastParameters.length > 0) {
                        lastIndex = lastIndex + " - " + splat.lastParameters.length;
                    }
                    splatParameter = cg.definition(splat.splatParameter, cg.javascript("Array.prototype.slice.call(arguments, " + splat.firstParameters.length + ", " + lastIndex + ")"), {
                        shadow: true
                    });
                    lastParameterStatements = [ splatParameter ];
                    for (n = 0; n < splat.lastParameters.length; ++n) {
                        param = splat.lastParameters[n];
                        lastParameterStatements.push(cg.definition(param, cg.javascript("arguments[arguments.length - " + (splat.lastParameters.length - n) + "]"), {
                            shadow: true
                        }));
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
        var self = this;
        var firstParameters, maybeSplat, splatParam, lastParameters;
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
}).call(this);