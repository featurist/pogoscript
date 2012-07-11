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
            serialiseSubStatements: function(statements) {
                var self, firstStatements, gen1_o;
                self = this;
                firstStatements = self.statements.slice(0, self.statements.length - 1);
                gen1_o = statements;
                gen1_o.push.apply(gen1_o, firstStatements);
                return self.statements[self.statements.length - 1];
            }
        });
    };
})).call(this);