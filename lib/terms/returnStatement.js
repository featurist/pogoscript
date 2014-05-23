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
            generateStatement: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    if (self.expression) {
                        buffer.write("return ");
                        buffer.write(self.expression.generate(scope));
                        return buffer.write(";");
                    } else {
                        return buffer.write("return;");
                    }
                });
            },
            rewriteResultTermInto: function(returnTerm, gen2_options) {
                var self = this;
                var async;
                async = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "async") && gen2_options.async !== void 0 ? gen2_options.async : false;
                var arguments;
                if (async) {
                    arguments = function() {
                        if (self.expression) {
                            return [ self.expression ];
                        } else {
                            return [];
                        }
                    }();
                    return terms.functionCall(terms.onRejectedFunction, arguments);
                } else {
                    return self;
                }
            }
        });
    };
}).call(this);