((function() {
    var self, codegenUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(entries) {
                var self;
                self = this;
                self.isHash = true;
                return self.entries = entries;
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                buffer.write("{");
                codegenUtils.writeToBufferWithDelimiter(self.entries, ",", buffer, function(item) {
                    return item.generateJavaScriptHashEntry(buffer, scope);
                });
                return buffer.write("}");
            }
        });
    };
})).call(this);