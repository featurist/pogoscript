(function() {
    var self = this;
    var _, asyncControl;
    _ = require("underscore");
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        var macros, comprehensionExpressionFor, comprehensionExpressionsFrom, generator, map, definition, filter, expressions, isDefinition, listComprehension;
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
        comprehensionExpressionsFrom = function(items, resultsVariable) {
            var exprs, comprehensionExprs;
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
            comprehensionExprs.push(map(items[items.length - 1], resultsVariable));
            return expressions(comprehensionExprs);
        };
        generator = function(expression) {
            return {
                isGenerator: true,
                iterator: expression.operatorArguments[0],
                collection: expression.operatorArguments[1],
                generate: function(rest) {
                    var self = this;
                    var statements, generate;
                    statements = terms.asyncStatements(rest.generate());
                    if (statements.isAsync) {
                        generate = terms.moduleConstants.defineAs([ "generate" ], terms.javascript(asyncControl.generate.toString()));
                        return [ terms.functionCall(generate, [ self.collection, terms.closure([ self.iterator ], statements) ], {
                            async: true
                        }) ];
                    } else {
                        return [ terms.forEach(self.collection, self.iterator, statements) ];
                    }
                }
            };
        };
        map = function(expression, resultsVariable) {
            return {
                isMap: true,
                generate: function() {
                    var self = this;
                    return [ terms.methodCall(resultsVariable, [ "push" ], [ expression ]) ];
                }
            };
        };
        definition = function(expression) {
            return {
                isDefinition: true,
                generate: function(rest) {
                    var self = this;
                    var statements, gen4_o;
                    statements = [ expression ];
                    gen4_o = statements;
                    gen4_o.push.apply(gen4_o, rest.generate());
                    return statements;
                }
            };
        };
        filter = function(expression) {
            return {
                isFilter: true,
                generate: function(rest) {
                    var self = this;
                    return [ terms.ifExpression([ {
                        condition: expression,
                        body: terms.asyncStatements(rest.generate())
                    } ]) ];
                }
            };
        };
        expressions = function(exprs) {
            return {
                expressions: exprs,
                generate: function() {
                    var self = this;
                    if (exprs.length > 0) {
                        return exprs[0].generate(expressions(exprs.slice(1)));
                    } else {
                        return [];
                    }
                }
            };
        };
        isDefinition = function(expression) {
            return expression.isDefinition;
        };
        return listComprehension = function(items) {
            var resultsVariable, exprs, statements, gen5_o;
            resultsVariable = terms.generatedVariable([ "results" ]);
            exprs = comprehensionExpressionsFrom(items, resultsVariable);
            statements = [ terms.definition(resultsVariable, terms.list([])) ];
            gen5_o = statements;
            gen5_o.push.apply(gen5_o, exprs.generate());
            statements.push(resultsVariable);
            return terms.scope(statements);
        };
    };
}).call(this);