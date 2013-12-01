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
                generate: function(isAsync, result, indexes) {
                    var self = this;
                    var generate, index, asyncStatements;
                    if (isAsync) {
                        generate = terms.moduleConstants.defineAs([ "generate" ], terms.javascript(asyncControl.generate.toString()));
                        index = terms.generatedVariable([ "index" ]);
                        indexes.push(index);
                        asyncStatements = terms.asyncStatements(self.next.generate(isAsync, result, indexes));
                        return [ terms.functionCall(generate, [ self.collection, terms.closure([ index, self.iterator ], asyncStatements) ], {
                            async: true
                        }) ];
                    } else {
                        return [ terms.forEach(self.collection, self.iterator, terms.asyncStatements(self.next.generate(isAsync, result, indexes))) ];
                    }
                }
            };
        };
        sortEach = function() {
            return {
                isSortEach: true,
                generateListComprehension: function(isAsync) {
                    var self = this;
                    var sortEach, result, asyncStatements, resultsVariable, statements, gen4_o;
                    if (isAsync) {
                        sortEach = terms.moduleConstants.defineAs([ "sort", "each" ], terms.javascript(asyncControl.sortEach.toString()));
                        result = terms.generatedVariable([ "result" ]);
                        asyncStatements = terms.asyncStatements(self.next.generate(isAsync, result, []));
                        return terms.functionCall(sortEach, [ terms.closure([ result ], asyncStatements) ], {
                            async: true
                        });
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
                indexString: function(indexes) {
                    var self = this;
                    var components, gen5_items, gen6_i, index;
                    components = [];
                    gen5_items = indexes;
                    for (gen6_i = 0; gen6_i < gen5_items.length; ++gen6_i) {
                        index = gen5_items[gen6_i];
                        if (components.length > 0) {
                            components.push(terms.string("."));
                        }
                        components.push(index);
                    }
                    return terms.interpolatedString(components);
                },
                generate: function(isAsync, result, indexes) {
                    var self = this;
                    if (isAsync) {
                        return [ terms.functionCall(result, [ self.indexString(indexes), expression ]) ];
                    } else {
                        return [ terms.methodCall(result, [ "push" ], [ expression ]) ];
                    }
                }
            };
        };
        definition = function(expression) {
            return {
                isDefinition: true,
                generate: function(isAsync, result, indexes) {
                    var self = this;
                    var statements, gen7_o;
                    statements = [ expression ];
                    gen7_o = statements;
                    statements.push.apply(statements, self.next.generate(isAsync, result, indexes));
                    return statements;
                }
            };
        };
        filter = function(expression) {
            return {
                isFilter: true,
                generate: function(isAsync, result, indexes) {
                    var self = this;
                    return [ terms.ifExpression([ {
                        condition: expression,
                        body: terms.asyncStatements(self.next.generate(isAsync, result, indexes))
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