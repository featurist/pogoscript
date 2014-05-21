(function() {
    var self = this;
    var _, asyncControl;
    _ = require("underscore");
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        var macros, comprehensionExpressionFor, comprehensionExpressionFrom, generator, sortEach, map, definition, filter, isDefinition, listComprehension;
        macros = terms.macroDirectory();
        comprehensionExpressionFor = function(expr) {
            if (expr.isGenerator) {
                return generator(expr);
            } else if (isDefinition(expr)) {
                return definition(expr);
            } else {
                return filter(expr);
            }
        };
        comprehensionExpressionFrom = function(items) {
            var exprs, comprehensionExprs, n;
            exprs = items.slice(0, items.length - 1);
            comprehensionExprs = function() {
                var gen1_results, gen2_items, gen3_i, expr;
                gen1_results = [];
                gen2_items = exprs;
                for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
                    expr = gen2_items[gen3_i];
                    gen1_results.push(comprehensionExpressionFor(expr));
                }
                return gen1_results;
            }();
            comprehensionExprs.push(map(items[items.length - 1]));
            comprehensionExprs.unshift(sortEach());
            for (n = 0; n < comprehensionExprs.length - 1; ++n) {
                comprehensionExprs[n].next = comprehensionExprs[n + 1];
            }
            return comprehensionExprs[0];
        };
        generator = function(expression) {
            return {
                isGenerator: true,
                iterator: expression.operatorArguments[0],
                collection: expression.operatorArguments[1],
                hasGenerator: function() {
                    var self = this;
                    return true;
                },
                generate: function(isAsync, result, index) {
                    var self = this;
                    var listComprehension, innerResult, innerIndex, asyncStatements, call, scope;
                    if (isAsync) {
                        listComprehension = terms.moduleConstants.defineAs([ "list", "comprehension" ], terms.javascript(asyncControl.listComprehension.toString()));
                        innerResult = terms.generatedVariable([ "result" ]);
                        innerIndex = terms.generatedVariable([ "index" ]);
                        asyncStatements = terms.asyncStatements(self.next.generate(isAsync, innerResult, innerIndex));
                        call = terms.resolve(terms.functionCall(listComprehension, [ self.collection, terms.boolean(self.next.hasGenerator()), terms.closure([ innerIndex, self.iterator, innerResult ], asyncStatements) ]));
                        if (result) {
                            return [ terms.functionCall(result, [ call, index ]) ];
                        } else {
                            return [ call ];
                        }
                    } else {
                        scope = terms.scope(self.next.generate(isAsync, result, index), {
                            alwaysGenerateFunction: true,
                            variables: [ self.iterator ]
                        });
                        return [ terms.forEach(self.collection, self.iterator, terms.asyncStatements([ scope ])) ];
                    }
                }
            };
        };
        sortEach = function() {
            return {
                isSortEach: true,
                generateListComprehension: function(isAsync) {
                    var self = this;
                    var resultsVariable, statements, gen4_o;
                    if (isAsync) {
                        return self.next.generate(isAsync)[0];
                    } else {
                        resultsVariable = terms.generatedVariable([ "results" ]);
                        statements = [ terms.definition(resultsVariable, terms.list([])) ];
                        gen4_o = statements;
                        statements.push.apply(statements, self.next.generate(isAsync, resultsVariable));
                        statements.push(resultsVariable);
                        return terms.scope(statements);
                    }
                }
            };
        };
        map = function(expression) {
            return {
                isMap: true,
                hasGenerator: function() {
                    var self = this;
                    return false;
                },
                generate: function(isAsync, result, index) {
                    var self = this;
                    if (isAsync) {
                        return [ terms.functionCall(result, [ expression, index ]) ];
                    } else {
                        return [ terms.methodCall(result, [ "push" ], [ expression ]) ];
                    }
                }
            };
        };
        definition = function(expression) {
            return {
                isDefinition: true,
                hasGenerator: function() {
                    var self = this;
                    return self.next.hasGenerator();
                },
                generate: function(isAsync, result, index) {
                    var self = this;
                    var statements, gen5_o;
                    statements = [ expression ];
                    gen5_o = statements;
                    statements.push.apply(statements, self.next.generate(isAsync, result, index));
                    return statements;
                }
            };
        };
        filter = function(expression) {
            return {
                isFilter: true,
                hasGenerator: function() {
                    var self = this;
                    return self.next.hasGenerator();
                },
                generate: function(isAsync, result, index) {
                    var self = this;
                    return [ terms.ifExpression([ {
                        condition: expression,
                        body: terms.asyncStatements(self.next.generate(isAsync, result, index))
                    } ]) ];
                }
            };
        };
        isDefinition = function(expression) {
            return expression.isDefinition;
        };
        return listComprehension = function(items) {
            var isAsync, expr;
            isAsync = _.any(items, function(item) {
                return item.containsAsync();
            });
            expr = comprehensionExpressionFrom(items);
            return expr.generateListComprehension(isAsync);
        };
    };
}).call(this);