((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(expr, gen1_options) {
                var implicit, self;
                implicit = gen1_options && gen1_options.hasOwnProperty("implicit") && gen1_options.implicit !== void 0 ? gen1_options.implicit : false;
                self = this;
                self.isReturn = true;
                self.expression = expr;
                return self.isImplicit = implicit;
            },
            generateJavaScriptStatement: function(buffer, scope) {
                var self;
                self = this;
                if (self.expression) {
                    buffer.write("return ");
                    self.expression.generateJavaScript(buffer, scope);
                    return buffer.write(";");
                } else {
                    return buffer.write("return;");
                }
            },
            rewriteResultTermInto: function(returnTerm) {
                var self;
                self = this;
                if (self.isImplicit) {
                    return returnTerm(self);
                } else {
                    return self;
                }
            }
        });
    };
})).call(this);