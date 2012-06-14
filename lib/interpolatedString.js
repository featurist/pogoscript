((function() {
    var self, codegenUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self, createInterpolatedString, interpolatedString;
        self = this;
        createInterpolatedString = terms.term({
            constructor: function(components) {
                var self;
                self = this;
                self.isInterpolatedString = true;
                return self.components = components;
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                return codegenUtils.writeToBufferWithDelimiter(this.components, "+", buffer, scope);
            }
        });
        return interpolatedString = function(components) {
            if (components.length === 1) {
                return components[0];
            } else if (components.length === 0) {
                return terms.string("");
            } else {
                return createInterpolatedString(components);
            }
        };
    };
})).call(this);