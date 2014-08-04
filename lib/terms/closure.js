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
            generate: function(scope) {
                var self = this;
                return self.code("(", self.options.generate(scope), "&&", self.options.generate(scope), ".hasOwnProperty('" + codegenUtils.concatName(self.name) + "')&&", self.options.generate(scope), "." + codegenUtils.concatName(self.name) + "!==void 0)?", self.options.generate(scope), "." + codegenUtils.concatName(self.name) + ":", self.properDefaultValue().generate(scope));
            }
        });
        asyncParameters = function(closure, next) {
            return {
                parameters: function() {
                    var self = this;
                    return next.parameters();
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
                var returnLastStatement, redefinesSelf, async, definesModuleConstants, returnPromise, callsFulfillOnReturn, isNewScope;
                returnLastStatement = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "returnLastStatement") && gen1_options.returnLastStatement !== void 0 ? gen1_options.returnLastStatement : true;
                redefinesSelf = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "redefinesSelf") && gen1_options.redefinesSelf !== void 0 ? gen1_options.redefinesSelf : false;
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                definesModuleConstants = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "definesModuleConstants") && gen1_options.definesModuleConstants !== void 0 ? gen1_options.definesModuleConstants : false;
                returnPromise = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "returnPromise") && gen1_options.returnPromise !== void 0 ? gen1_options.returnPromise : false;
                callsFulfillOnReturn = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "callsFulfillOnReturn") && gen1_options.callsFulfillOnReturn !== void 0 ? gen1_options.callsFulfillOnReturn : false;
                isNewScope = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "isNewScope") && gen1_options.isNewScope !== void 0 ? gen1_options.isNewScope : true;
                self.isBlock = true;
                self.isClosure = true;
                self.isNewScope = isNewScope;
                self.setParameters(parameters);
                self.body = function() {
                    if (returnPromise) {
                        return body.promisify({
                            statements: true
                        });
                    } else {
                        return body;
                    }
                }();
                self.redefinesSelf = redefinesSelf;
                self.makeAsync(async || self.body.isAsync);
                self.returnLastStatement = returnLastStatement;
                self.definesModuleConstants = definesModuleConstants;
                return self.callsFulfillOnReturn = callsFulfillOnReturn;
            },
            blockify: function(parameters, gen2_options) {
                var self = this;
                var returnPromise, redefinesSelf;
                returnPromise = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "returnPromise") && gen2_options.returnPromise !== void 0 ? gen2_options.returnPromise : false;
                redefinesSelf = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "redefinesSelf") && gen2_options.redefinesSelf !== void 0 ? gen2_options.redefinesSelf : void 0;
                self.setParameters(parameters);
                if (returnPromise) {
                    self.body = self.body.promisify({
                        statements: true
                    });
                }
                if (redefinesSelf !== void 0) {
                    self.redefinesSelf = redefinesSelf;
                }
                return self;
            },
            setParameters: function(parameters) {
                var self = this;
                self.parameters = terms.argumentUtils.positionalArguments(parameters);
                return self.optionalParameters = terms.argumentUtils.optionalArguments(parameters);
            },
            makeAsync: function(a) {
                var self = this;
                return self.isAsync = a;
            },
            scopify: function() {
                var self = this;
                if (self.parameters.length === 0 && self.optionalParameters.length === 0 && !self.notScope) {
                    if (self.body.returnsPromise) {
                        return terms.resolve(terms.functionCall(self, []));
                    } else {
                        return terms.scope(self.body.statements, {
                            async: false
                        });
                    }
                } else {
                    return self;
                }
            },
            parameterTransforms: function() {
                var self = this;
                var optionals, splat;
                if (self._parameterTransforms) {
                    return self._parameterTransforms;
                }
                optionals = optionalParameters(self.optionalParameters, selfParameter(terms, self.redefinesSelf, blockParameters(self)));
                splat = splatParameters(terms, optionals);
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
                    parameter.declare(scope);
                }
                return void 0;
            },
            generate: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
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
                        buffer.write(terms.moduleConstants.generate(scope));
                    }
                    buffer.write(self.generateSelfAssignment());
                    parametersStrategy.generateJavaScriptParameterStatements(buffer, scope, terms.variable([ "arguments" ]));
                    buffer.write(self.body.generateStatements(bodyScope, {
                        isScope: self.isNewScope
                    }));
                    return buffer.write("}");
                });
            },
            generateFunction: function(scope) {
                var self = this;
                return self.code("(", self.generate(scope), ")");
            },
            generateSelfAssignment: function() {
                var self = this;
                if (self.redefinesSelf) {
                    return "var self=this;";
                } else {
                    return "";
                }
            },
            rewriteResultTermToReturn: function() {
                var self = this;
                if (self.returnLastStatement) {
                    return self.body.rewriteLastStatementToReturn({
                        async: self.callsFulfillOnReturn
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
                var strategy;
                strategy = function() {
                    if (containsSplatParameter(self)) {
                        return createSplatParameterStrategyFor(self);
                    } else if (self.optionalParameters.length > 0) {
                        return createOptionalParameterStrategyFor(self);
                    } else {
                        return terms.closureParameterStrategies.normalStrategy(self.parameters);
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