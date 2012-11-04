(function() {
    var self = this;
    var _, codegenUtils;
    _ = require("underscore");
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(statements) {
                var self = this;
                self.isSubStatements = true;
                return self.statements = statements;
            },
            serialiseSubStatements: function(statements, gen1_options) {
                var self = this;
                var rewrite;
                rewrite = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "rewrite") && gen1_options.rewrite !== void 0 ? gen1_options.rewrite : void 0;
                var firstStatements, rewrittenStatements, gen2_o, lastStatement;
                firstStatements = self.statements.slice(0, self.statements.length - 1);
                rewrittenStatements = _.map(firstStatements, function(statement) {
                    return rewrite(statement);
                });
                gen2_o = statements;
                gen2_o.push.apply(gen2_o, rewrittenStatements);
                lastStatement = self.statements[self.statements.length - 1];
                if (lastStatement.isSubStatements) {
                    return lastStatement.serialiseSubStatements(statements, {
                        rewrite: rewrite
                    });
                } else {
                    return lastStatement;
                }
            },
            generateJavaScript: function() {
                var self = this;
                self.show();
                throw new Error("sub statements does not generate java script");
            }
        });
    };
}).call(this);