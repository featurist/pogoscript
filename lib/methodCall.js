((function() {
    var self, codegenUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self, methodCallTerm, methodCall;
        self = this;
        methodCallTerm = terms.term({
            constructor: function(object, name, args, optionalArgs) {
                var self;
                self = this;
                self.isMethodCall = true;
                self.object = object;
                self.name = name;
                self.methodArguments = args;
                return self.optionalArguments = optionalArgs;
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                self.object.generateJavaScript(buffer, scope);
                buffer.write(".");
                buffer.write(codegenUtils.concatName(self.name));
                buffer.write("(");
                codegenUtils.writeToBufferWithDelimiter(codegenUtils.argsAndOptionalArgs(self.cg, self.methodArguments, self.optionalArguments), ",", buffer, scope);
                return buffer.write(")");
            }
        });
        return methodCall = function(object, name, args, optionalArgs) {
            var splattedArgs;
            splattedArgs = codegenUtils.splattedArguments(terms, args, optionalArgs);
            if (splattedArgs) {
                var objectVar;
                objectVar = terms.generatedVariable([ "o" ]);
                return terms.statements([ terms.definition(objectVar, object), terms.methodCall(terms.fieldReference(objectVar, name), [ "apply" ], [ objectVar, splattedArgs ]) ], {
                    expression: true
                });
            } else {
                return methodCallTerm(object, name, args, optionalArgs);
            }
        };
    };
})).call(this);