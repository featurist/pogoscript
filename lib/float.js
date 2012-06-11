((function() {
    var self, terms;
    self = this;
    terms = require("./terms");
    module.exports = terms.term({
        constructor: function(value) {
            var self;
            self = this;
            self.isFloat = true;
            return self.float = value;
        },
        generateJavaScript: function(buffer, scope) {
            var self;
            self = this;
            return buffer.write(self.float.toString());
        }
    });
})).call(this);