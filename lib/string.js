((function() {
    var self, codegenUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(value) {
                var self;
                self = this;
                self.isString = true;
                return self.string = value;
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                return buffer.write(codegenUtils.formatJavaScriptString(this.string));
            }
        });
    };
})).call(this);