((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(init, test, incr, stmts) {
                var self;
                self = this;
                self.isFor = true;
                self.initialization = init;
                self.test = test;
                self.increment = incr;
                self.indexVariable = init.target;
                return self.statements = stmts;
            },
            expandMacro: function(clone) {
                var self, c;
                self = this;
                c = clone();
                c.statements = clone(c._scopedBody());
                return c;
            },
            _scopedBody: function() {
                var self, containsReturn, forResultVariable, rewrittenStatements, loopStatements;
                self = this;
                containsReturn = false;
                forResultVariable = self.cg.generatedVariable([ "for", "result" ]);
                rewrittenStatements = self.statements.clone({
                    rewrite: function(term) {
                        if (term.isReturn) {
                            containsReturn = true;
                            return terms.subStatements([ self.cg.definition(forResultVariable, term.expression), self.cg.returnStatement(self.cg.boolean(true)) ]);
                        }
                    },
                    limit: function(term, gen1_options) {
                        var path;
                        path = gen1_options && gen1_options.hasOwnProperty("path") && gen1_options.path !== void 0 ? gen1_options.path : path;
                        if (term.isStatements) {
                            if (path.length > 0) {
                                return path[path.length - 1].isClosure;
                            }
                        }
                    }
                });
                if (containsReturn) {
                    loopStatements = [];
                    loopStatements.push(self.cg.definition(forResultVariable, self.cg.nil()));
                    loopStatements.push(self.cg.ifExpression([ [ self.cg.subExpression(self.cg.functionCall(self.cg.block([ self.indexVariable ], rewrittenStatements, {
                        returnLastStatement: false
                    }), [ self.indexVariable ])), self.cg.statements([ self.cg.returnStatement(forResultVariable) ]) ] ]));
                    return self.cg.statements(loopStatements);
                } else {
                    return self.statements;
                }
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
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
                var args, self, gen2_o;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                self = this;
                gen2_o = self;
                return gen2_o.generateJavaScript.apply(gen2_o, args);
            },
            declareVariables: function(variables, scope) {
                var self;
                self = this;
                return self.indexVariable.declareVariable(variables, scope);
            },
            rewriteResultTermInto: function(returnTerm) {
                var self;
                self = this;
                return self;
            }
        });
    };
})).call(this);