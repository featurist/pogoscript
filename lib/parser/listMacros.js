(function() {
    var self = this;
    var _;
    _ = require("underscore");
    module.exports = function(terms) {
        var self = this;
        var macros, isValidComprehension, comprehensionExpressionFor, comprehensionExpressionsFrom, iterator, map, definition, filter, expressions, isIterator, isDefinition;
        macros = terms.macroDirectory();
        isValidComprehension = function(term) {
            var firstItemIsNotHashEntry, secondItemIsWhereHashEntry, secondItemIsIterator, theRestOfTheItemsAreNotHashEntries;
            if (term.items.length < 2) {
                return false;
            }
            firstItemIsNotHashEntry = function() {
                return !term.items[0].isHashEntry;
            };
            secondItemIsWhereHashEntry = function() {
                return term.items[1].isHashEntry && term.items[1].field.length === 1 && term.items[1].field[0] === "where";
            };
            secondItemIsIterator = function() {
                return isIterator(term.items[1].value);
            };
            theRestOfTheItemsAreNotHashEntries = function() {
                return !_.any(term.items.slice(2), function(item) {
                    return item.isHashEntry;
                });
            };
            return firstItemIsNotHashEntry() && secondItemIsWhereHashEntry() && secondItemIsIterator() && theRestOfTheItemsAreNotHashEntries();
        };
        comprehensionExpressionFor = function(expr) {
            if (isIterator(expr)) {
                return iterator(expr);
            } else if (isDefinition(expr)) {
                return definition(expr);
            } else {
                return filter(expr);
            }
        };
        comprehensionExpressionsFrom = function(term, resultsVariable) {
            var exprs, comprehensionExprs;
            exprs = term.items.slice(2);
            exprs.unshift(term.items[1].value);
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
            comprehensionExprs.push(map(term.items[0], resultsVariable));
            return expressions(comprehensionExprs);
        };
        iterator = function(expression) {
            return {
                isIterator: true,
                iterator: expression.functionArguments[0],
                collection: expression.functionArguments[1],
                generate: function(rest) {
                    var self = this;
                    return [ terms.forEach(self.collection, self.iterator, terms.asyncStatements(rest.generate())) ];
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
        isIterator = function(expression) {
            var $function;
            if (expression.isFunctionCall) {
                $function = expression.function;
                if ($function.isVariable) {
                    if ($function.variable.length === 1 && $function.variable[0] === "<-") {
                        return true;
                    }
                }
            }
        };
        isDefinition = function(expression) {
            return expression.isDefinition;
        };
        macros.addMacro([ "where" ], function(term, name, args) {
            var badComprehension, resultsVariable, exprs, statements, gen5_o;
            badComprehension = function() {
                return terms.errors.addTermWithMessage(term, "not a list comprehension, try:\n\n    [y + 1, where: x <- [1..10], x % 2, y = x + 10]");
            };
            if (isValidComprehension(term)) {
                resultsVariable = terms.generatedVariable([ "results" ]);
                exprs = comprehensionExpressionsFrom(term, resultsVariable);
                statements = [ terms.definition(resultsVariable, terms.list([])) ];
                gen5_o = statements;
                gen5_o.push.apply(gen5_o, exprs.generate());
                statements.push(resultsVariable);
                return terms.scope(statements);
            } else {
                return badComprehension();
            }
        });
        return macros;
    };
}).call(this);