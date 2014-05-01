(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(items) {
                var self = this;
                self.isRange = true;
                self.items = items;
                self.inList = false;
                return self.range = terms.moduleConstants.defineAs([ "range" ], terms.javascript("function (a, b) {\n   var items = [];\n   for (var n = a; n <= b; n++) {\n       items.push(n);\n   }\n   return items;\n                }"));
            },
            generate: function(scope) {
                var self = this;
                if (self.inList) {
                    return terms.functionCall(self.range, self.items).generate(scope);
                } else {
                    return terms.errors.addTermWithMessage(self, "range operator can only be used in a list, as in [1..3]").generate(scope);
                }
            }
        });
    };
}).call(this);