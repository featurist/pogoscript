(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(items) {
                var self = this;
                self.isRange = true;
                self.items = items;
                return self.range = terms.moduleConstants.defineAs([ "range" ], terms.javascript("function (a, b) {\n   var items = [];\n   for (var n = a; n <= b; n++) {\n       items.push(n);\n   }\n   return items;\n                }"));
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return terms.functionCall(self.range, self.items).generateJavaScript(buffer, scope);
            }
        });
    };
}).call(this);