(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(expr, gen1_options) {
                var self = this;
                var implicit;
                implicit = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "implicit") && gen1_options.implicit !== void 0 ? gen1_options.implicit : false;
                self.isReturn = true;
                self.expression = expr;
                return self.isImplicit = implicit;
            },
            generateJavaScriptStatement: function(buffer, scope) {
                var self = this;
                if (self.expression) {
                    buffer.write("return ");
                    self.expression.generateJavaScript(buffer, scope);
                    return buffer.write(";");
                } else {
                    return buffer.write("return;");
                }
            },
            rewriteResultTermInto: function(returnTerm) {
                var self = this;
                return self;
            }
        });
    };
}).call(this);