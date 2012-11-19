(function() {
    var self = this;
    var codegenUtils;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self = this;
        var createInterpolatedString, interpolatedString;
        createInterpolatedString = terms.term({
            constructor: function(components) {
                var self = this;
                self.isInterpolatedString = true;
                return self.components = components;
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                buffer.write("(");
                codegenUtils.writeToBufferWithDelimiter(this.components, "+", buffer, scope);
                return buffer.write(")");
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
}).call(this);