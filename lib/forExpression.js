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
                self.statements = stmts;
                return self.indexVariable = init.target;
            },
            scopedBody: function() {
                var self, loopStatements, forResultVariable, statements;
                self = this;
                loopStatements = [];
                forResultVariable = self.cg.generatedVariable([ "for", "result" ]);
                statements = self.statements.clone({
                    rewrite: function(term) {
                        if (term.isReturn) {
                            return self.cg.statements([ self.cg.definition(forResultVariable, term.expression), self.cg.returnStatement(self.cg.boolean(true)) ], {
                                expression: true
                            });
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
                loopStatements.push(self.cg.definition(forResultVariable, self.cg.nil()));
                loopStatements.push(self.cg.ifExpression([ [ self.cg.subExpression(self.cg.functionCall(self.cg.block([ self.indexVariable ], statements, {
                    returnLastStatement: false
                }), [ self.indexVariable ])), self.cg.statements([ self.cg.returnStatement(forResultVariable) ]) ] ]));
                return self.cg.statements(loopStatements);
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
                self.scopedBody().generateJavaScriptStatements(buffer, scope);
                return buffer.write("}");
            },
            generateJavaScriptStatement: function() {
                var args, self, gen2_o;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                self = this;
                gen2_o = self;
                return gen2_o.generateJavaScript.apply(gen2_o, args);
            },
            generateJavaScriptReturn: function() {
                var args, self, gen3_o;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                self = this;
                gen3_o = self;
                return gen3_o.generateJavaScript.apply(gen3_o, args);
            },
            definitions: function(scope) {
                var self, defs, indexName;
                self = this;
                defs = [];
                indexName = self.indexVariable.definitionName(scope);
                if (indexName) {
                    defs.push(indexName);
                }
                return defs;
            }
        });
    };
})).call(this);