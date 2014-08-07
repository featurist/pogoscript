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
    exports.definitions = function(statements) {
        var self = this;
        return function() {
            var gen2_results, gen3_items, gen4_i, s;
            gen2_results = [];
            gen3_items = statements;
            for (gen4_i = 0; gen4_i < gen3_items.length; ++gen4_i) {
                s = gen3_items[gen4_i];
                (function(s) {
                    var gen5_items, gen6_i, d;
                    if (!s.isNewScope) {
                        gen5_items = s.definitions();
                        for (gen6_i = 0; gen6_i < gen5_items.length; ++gen6_i) {
                            d = gen5_items[gen6_i];
                            (function(d) {
                                return gen2_results.push(d);
                            })(d);
                        }
                        return void 0;
                    }
                })(s);
            }
            return gen2_results;
        }();
    };
}).call(this);