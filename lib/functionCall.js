((function() {
    var self, codegenUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(fun, args, optionalArgs) {
                var self;
                self = this;
                self.isFunctionCall = true;
                self.function = fun;
                self.functionArguments = args;
                self.optionalArguments = optionalArgs;
                self.splattedArguments = self.cg.splatArguments(args, optionalArgs);
                return self.passThisToApply = false;
            },
            hasSplatArguments: function() {
                var self;
                self = this;
                return self.splattedArguments;
            },
            generateJavaScript: function(buffer, scope) {
                var self, args;
                self = this;
                self.function.generateJavaScript(buffer, scope);
                args = codegenUtils.argsAndOptionalArgs(self.cg, self.functionArguments, self.optionalArguments);
                if (self.splattedArguments && self.function.isIndexer) {
                    buffer.write(".apply(");
                    self.function.object.generateJavaScript(buffer, scope);
                    buffer.write(",");
                    self.splattedArguments.generateJavaScript(buffer, scope);
                    return buffer.write(")");
                } else if (self.splattedArguments) {
                    buffer.write(".apply(");
                    if (self.passThisToApply) {
                        buffer.write("this");
                    } else {
                        buffer.write("null");
                    }
                    buffer.write(",");
                    self.splattedArguments.generateJavaScript(buffer, scope);
                    return buffer.write(")");
                } else {
                    buffer.write("(");
                    codegenUtils.writeToBufferWithDelimiter(args, ",", buffer, scope);
                    return buffer.write(")");
                }
            }
        });
    };
})).call(this);