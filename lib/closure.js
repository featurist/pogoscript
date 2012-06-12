((function() {
    var self, _, codegenUtils, blockParameters, optionalParameters, selfParameter, splatParameters, parseSplatParameters, takeFromWhile;
    self = this;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    module.exports = function(cg) {
        var self;
        self = this;
        return cg.term({
            constructor: function(parameters, body, gen1_options) {
                var returnLastStatement, redefinesSelf, self;
                returnLastStatement = gen1_options && gen1_options.hasOwnProperty("returnLastStatement") && gen1_options.returnLastStatement !== void 0 ? gen1_options.returnLastStatement : true;
                redefinesSelf = gen1_options && gen1_options.hasOwnProperty("redefinesSelf") && gen1_options.redefinesSelf !== void 0 ? gen1_options.redefinesSelf : false;
                self = this;
                self.body = body;
                self.isBlock = true;
                self.returnLastStatement = returnLastStatement;
                self.parameters = parameters;
                self.optionalParameters = [];
                return self.redefinesSelf = redefinesSelf;
            },
            blockify: function(parameters, optionalParameters) {
                var self;
                self = this;
                self.parameters = parameters;
                self.optionalParameters = optionalParameters;
                return self;
            },
            scopify: function() {
                var self;
                self = this;
                if (self.parameters.length === 0 && self.optionalParameters.length === 0) {
                    return self.cg.scope(self.body.statements);
                } else {
                    return self;
                }
            },
            parameterTransforms: function() {
                var self, optionals, splat;
                self = this;
                if (self._parameterTransforms) {
                    return self._parameterTransforms;
                }
                optionals = optionalParameters(self.cg, self.optionalParameters, selfParameter(self.cg, self.redefinesSelf, blockParameters(self)));
                splat = splatParameters(self.cg, optionals);
                if (optionals.hasOptionals && splat.hasSplat) {
                    self.cg.errors.addTermsWithMessage(self.optionalParameters, "cannot have splat parameters with optional parameters");
                }
                return self._parameterTransforms = splat;
            },
            transformedStatements: function() {
                var self;
                self = this;
                return self.cg.statements(self.parameterTransforms().statements());
            },
            transformedParameters: function() {
                var self;
                self = this;
                return self.parameterTransforms().parameters();
            },
            declareParameters: function(scope, parameters) {
                var self, gen2_items, gen3_i;
                self = this;
                gen2_items = parameters;
                for (gen3_i = 0; gen3_i < gen2_items.length; gen3_i++) {
                    var gen4_forResult;
                    gen4_forResult = void 0;
                    if (function(gen3_i) {
                        var parameter;
                        parameter = gen2_items[gen3_i];
                        scope.define(parameter.variableName(scope));
                    }(gen3_i)) {
                        return gen4_forResult;
                    }
                }
            },
            generateJavaScript: function(buffer, scope) {
                var self, parameters, body, bodyScope;
                self = this;
                buffer.write("function(");
                parameters = self.transformedParameters();
                codegenUtils.writeToBufferWithDelimiter(parameters, ",", buffer, scope);
                buffer.write("){");
                body = self.transformedStatements();
                bodyScope = scope.subScope();
                self.declareParameters(bodyScope, parameters);
                if (self.returnLastStatement) {
                    body.generateJavaScriptStatementsReturn(buffer, bodyScope);
                } else {
                    body.generateJavaScriptStatements(buffer, bodyScope);
                }
                return buffer.write("}");
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
    optionalParameters = function(cg, optionalParameters, next) {
        if (optionalParameters.length > 0) {
            return {
                options: cg.generatedVariable([ "options" ]),
                parameters: function() {
                    var self;
                    self = this;
                    return next.parameters().concat([ self.options ]);
                },
                statements: function() {
                    var self, optionalStatements;
                    self = this;
                    optionalStatements = _.map(optionalParameters, function(parm) {
                        return cg.definition(cg.variable(parm.field, {
                            shadow: true
                        }), cg.optional(self.options, parm.field, parm.value));
                    });
                    return optionalStatements.concat(next.statements());
                },
                hasOptionals: true
            };
        } else {
            return next;
        }
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
                var self, splat;
                self = this;
                splat = parsedSplatParameters;
                if (splat.splatParameter) {
                    var lastIndex, splatParameter, lastParameterStatements, n;
                    lastIndex = "arguments.length";
                    if (splat.lastParameters.length > 0) {
                        lastIndex = lastIndex + " - " + splat.lastParameters.length;
                    }
                    splatParameter = cg.definition(splat.splatParameter, cg.javascript("Array.prototype.slice.call(arguments, " + splat.firstParameters.length + ", " + lastIndex + ")"));
                    lastParameterStatements = [ splatParameter ];
                    for (n = 0; n < splat.lastParameters.length; n = n + 1) {
                        var gen5_forResult;
                        gen5_forResult = void 0;
                        if (function(n) {
                            var param;
                            param = splat.lastParameters[n];
                            lastParameterStatements.push(cg.definition(param, cg.javascript("arguments[arguments.length - " + (splat.lastParameters.length - n) + "]")));
                        }(n)) {
                            return gen5_forResult;
                        }
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
        var takenList, gen6_items, gen7_i;
        takenList = [];
        gen6_items = list;
        for (gen7_i = 0; gen7_i < gen6_items.length; gen7_i++) {
            var gen8_forResult;
            gen8_forResult = void 0;
            if (function(gen7_i) {
                var item;
                item = gen6_items[gen7_i];
                if (canTake(item)) {
                    takenList.push(item);
                } else {
                    gen8_forResult = takenList;
                    return true;
                }
            }(gen7_i)) {
                return gen8_forResult;
            }
        }
        return takenList;
    };
})).call(this);