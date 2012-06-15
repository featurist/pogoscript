((function() {
    var self, codegenUtils, isLegalJavaScriptIdentifier;
    self = this;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(field, value) {
                var self;
                self = this;
                self.isHashEntry = true;
                self.field = field;
                return self.value = value;
            },
            legalFieldName: function() {
                var self, f;
                self = this;
                if (self.field.isString) {
                    return codegenUtils.formatJavaScriptString(self.field.string);
                }
                f = codegenUtils.concatName(self.field);
                if (isLegalJavaScriptIdentifier(f)) {
                    return f;
                } else {
                    return codegenUtils.formatJavaScriptString(f);
                }
            },
            valueOrTrue: function() {
                var self;
                self = this;
                if (self.value === undefined) {
                    return self.cg.boolean(true);
                } else {
                    return self.value;
                }
            },
            generateJavaScriptHashEntry: function(buffer, scope) {
                var self, f;
                self = this;
                f = codegenUtils.concatName(self.field);
                buffer.write(self.legalFieldName());
                buffer.write(":");
                return self.valueOrTrue().generateJavaScript(buffer, scope);
            }
        });
    };
    isLegalJavaScriptIdentifier = function(id) {
        return /^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(id);
    };
})).call(this);