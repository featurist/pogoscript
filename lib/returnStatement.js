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
                    return self.expression.generateJavaScriptReturn(buffer, scope);
                } else {
                    return buffer.write("return;");
                }
            },
            generateJavaScriptReturn: function() {
                var args, self, gen2_o;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                self = this;
                gen2_o = self;
                return gen2_o.generateJavaScriptStatement.apply(gen2_o, args);
            }
        });
    };
})).call(this);