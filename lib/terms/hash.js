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
            generate: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    buffer.write("{");
                    codegenUtils.writeToBufferWithDelimiter(self.entries, ",", buffer, function(item) {
                        return buffer.write(item.generateHashEntry(scope));
                    });
                    return buffer.write("}");
                });
            },
            generateStatement: function(scope) {
                var self = this;
                return terms.definition(terms.generatedVariable([ "o" ]), self).generateStatement(scope);
            }
        });
    };
}).call(this);