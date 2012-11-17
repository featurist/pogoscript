(function() {
    var self = this;
    exports.serialiseStatements = function(statements) {
        var self = this;
        var serialisedStatements, n, statement;
        serialisedStatements = [];
        for (n = 0; n < statements.length; ++n) {
            statement = statements[n].rewrite({
                rewrite: function(term, gen1_options) {
                    var rewrite;
                    rewrite = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "rewrite") && gen1_options.rewrite !== void 0 ? gen1_options.rewrite : void 0;
                    return term.serialiseSubStatements(serialisedStatements, {
                        rewrite: rewrite
                    });
                },
                limit: function(term) {
                    return term.isStatements;
                }
            });
            serialisedStatements.push(statement);
        }
        return serialisedStatements;
    };
}).call(this);