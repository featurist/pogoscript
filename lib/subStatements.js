((function() {
    var self, _, codegenUtils;
    self = this;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(statements) {
                var self;
                self = this;
                self.isSubStatements = true;
                return self.statements = statements;
            },
            serialiseSubStatements: function(statements, gen1_options) {
                var rewrite, self, firstStatements, rewrittenStatements, gen2_o;
                rewrite = gen1_options && gen1_options.hasOwnProperty("rewrite") && gen1_options.rewrite !== void 0 ? gen1_options.rewrite : void 0;
                self = this;
                firstStatements = self.statements.slice(0, self.statements.length - 1);
                rewrittenStatements = _.map(firstStatements, function(statement) {
                    return rewrite(statement);
                });
                gen2_o = statements;
                gen2_o.push.apply(gen2_o, rewrittenStatements);
                return self.statements[self.statements.length - 1];
            },
            generateJavaScript: function() {
                var self;
                self = this;
                self.show();
                throw new Error("sub statements does not generate java script");
            }
        });
    };
})).call(this);