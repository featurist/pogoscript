(function() {
    var self = this;
    var codegenUtils;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(entries) {
                var self = this;
                self.isHash = true;
                return self.entries = entries;
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                buffer.write("{");
                codegenUtils.writeToBufferWithDelimiter(self.entries, ",", buffer, function(item) {
                    return item.generateJavaScriptHashEntry(buffer, scope);
                });
                return buffer.write("}");
            }
        });
    };
}).call(this);