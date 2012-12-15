(function() {
    var self = this;
    var asyncControl;
    asyncControl = require("../asyncControl");
    module.exports = function(terms) {
        var self = this;
        var forExpressionTerm, forExpression;
        forExpressionTerm = terms.term({
            constructor: function(init, test, incr, stmts) {
                var self = this;
                self.isFor = true;
                self.initialization = init;
                self.test = test;
                self.increment = incr;
                self.indexVariable = init.target;
                self.statements = stmts;
                return self.statements = self._scopedBody();
            },
            _scopedBody: function() {
                var self = this;
                var containsReturn, forResultVariable, rewrittenStatements, loopStatements;
                containsReturn = false;
                forResultVariable = self.cg.generatedVariable([ "for", "result" ]);
                rewrittenStatements = self.statements.rewrite({
                    rewrite: function(term) {
                        if (term.isReturn) {
                            containsReturn = true;
                            return terms.subStatements([ self.cg.definition(forResultVariable, term.expression, {
                                assignment: true
                            }), self.cg.returnStatement(self.cg.boolean(true)) ]);
                        }
                    },
                    limit: function(term, gen1_options) {
                        var path;
                        path = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "path") && gen1_options.path !== void 0 ? gen1_options.path : path;
                        return term.isClosure;
                    }
                }).serialiseAllStatements();
                if (containsReturn) {
                    loopStatements = [];
                    loopStatements.push(self.cg.definition(forResultVariable, self.cg.nil()));
                    loopStatements.push(self.cg.ifExpression([ {
                        condition: self.cg.subExpression(self.cg.functionCall(self.cg.block([ self.indexVariable ], rewrittenStatements, {
                            returnLastStatement: false
                        }), [ self.indexVariable ])),
                        body: self.cg.statements([ self.cg.returnStatement(forResultVariable) ])
                    } ]));
                    return self.cg.asyncStatements(loopStatements);
                } else {
                    return self.statements;
                }
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                buffer.write("for(");
                self.initialization.generateJavaScript(buffer, scope);
                buffer.write(";");
                self.test.generateJavaScript(buffer, scope);
                buffer.write(";");
                self.increment.generateJavaScript(buffer, scope);
                buffer.write("){");
                self.statements.generateJavaScriptStatements(buffer, scope);
                return buffer.write("}");
            },
            generateJavaScriptStatement: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen2_o;
                gen2_o = self;
                return gen2_o.generateJavaScript.apply(gen2_o, args);
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return void 0;
            }
        });
        return forExpression = function(init, test, incr, body) {
            var initStatements, testStatements, incrStatements, asyncForFunction;
            initStatements = terms.asyncStatements([ init ]);
            testStatements = terms.asyncStatements([ test ]);
            incrStatements = terms.asyncStatements([ incr ]);
            if (initStatements.isAsync || testStatements.isAsync || incrStatements.isAsync || body.isAsync) {
                asyncForFunction = terms.moduleConstants.defineAs([ "async", "for" ], terms.javascript(asyncControl.for.toString()));
                return terms.scope([ init, terms.functionCall(asyncForFunction, [ terms.argumentUtils.asyncifyBody(testStatements), terms.argumentUtils.asyncifyBody(incrStatements), terms.argumentUtils.asyncifyBody(body) ], {
                    async: true
                }) ]);
            } else {
                return forExpressionTerm(init, test, incr, body);
            }
        };
    };
}).call(this);