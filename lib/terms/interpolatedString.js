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
            generate: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    buffer.write("(");
                    codegenUtils.writeToBufferWithDelimiter(self.components, "+", buffer, scope);
                    return buffer.write(")");
                });
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