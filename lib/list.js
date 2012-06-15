((function() {
    var self, codegenUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(items) {
                var self;
                self = this;
                self.isList = true;
                return self.items = items;
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                buffer.write("[");
                codegenUtils.writeToBufferWithDelimiter(self.items, ",", buffer, scope);
                return buffer.write("]");
            }
        });
    };
})).call(this);