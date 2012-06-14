((function() {
    var self, codegenUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(object, name) {
                var self;
                self = this;
                self.object = object;
                self.name = name;
                return self.isFieldReference = true;
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                self.object.generateJavaScript(buffer, scope);
                buffer.write(".");
                return buffer.write(codegenUtils.concatName(self.name));
            },
            generateJavaScriptTarget: function() {
                var args, self, gen1_o;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                self = this;
                gen1_o = self;
                return gen1_o.generateJavaScript.apply(gen1_o, args);
            }
        });
    };
})).call(this);