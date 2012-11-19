(function() {
    var self = this;
    var codegenUtils;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(value) {
                var self = this;
                self.isString = true;
                return self.string = value;
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return buffer.write(codegenUtils.formatJavaScriptString(this.string));
            }
        });
    };
}).call(this);