((function() {
    var self, codegenUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self, methodCallTerm, methodCall;
        self = this;
        methodCallTerm = terms.term({
            constructor: function(object, name, args, gen1_options) {
                var optionalArguments, async, self;
                optionalArguments = gen1_options && gen1_options.hasOwnProperty("optionalArguments") && gen1_options.optionalArguments !== void 0 ? gen1_options.optionalArguments : [];
                async = gen1_options && gen1_options.hasOwnProperty("async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                self = this;
                self.isMethodCall = true;
                self.object = object;
                self.name = name;
                self.methodArguments = args;
                self.optionalArguments = optionalArguments;
                return self.isAsync = async;
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
            },
            makeAsyncCallWithCallback: function(callback) {
                var self, mc;
                self = this;
                mc = self.clone();
                mc.methodArguments.push(callback);
                return mc;
            }
        });
        return methodCall = function(object, name, args, gen2_options) {
            var optionalArguments, async, splattedArgs, objectVar, asyncResult;
            optionalArguments = gen2_options && gen2_options.hasOwnProperty("optionalArguments") && gen2_options.optionalArguments !== void 0 ? gen2_options.optionalArguments : [];
            async = gen2_options && gen2_options.hasOwnProperty("async") && gen2_options.async !== void 0 ? gen2_options.async : false;
            splattedArgs = terms.splatArguments(args, optionalArguments);
            if (splattedArgs) {
                objectVar = terms.generatedVariable([ "o" ]);
                return terms.subStatements([ terms.definition(objectVar, object), methodCall(terms.fieldReference(objectVar, name), [ "apply" ], [ objectVar, splattedArgs ], void 0, {
                    async: async
                }) ]);
            } else if (async) {
                asyncResult = terms.asyncResult();
                return terms.subStatements([ terms.definition(asyncResult, methodCallTerm(object, name, args, {
                    optionalArguments: optionalArguments,
                    async: async
                }), {
                    async: true
                }), asyncResult ]);
            } else {
                return methodCallTerm(object, name, args, {
                    optionalArguments: optionalArguments,
                    async: async
                });
            }
        };
    };
})).call(this);