((function() {
    var self, codegenUtils, argumentUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    argumentUtils = require("./argumentUtils");
    module.exports = function(terms) {
        var self, functionCallTerm, functionCall;
        self = this;
        functionCallTerm = terms.term({
            constructor: function(fun, args, gen1_options) {
                var optionalArguments, async, passThisToApply, originallyAsync, self;
                optionalArguments = gen1_options && gen1_options.hasOwnProperty("optionalArguments") && gen1_options.optionalArguments !== void 0 ? gen1_options.optionalArguments : [];
                async = gen1_options && gen1_options.hasOwnProperty("async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                passThisToApply = gen1_options && gen1_options.hasOwnProperty("passThisToApply") && gen1_options.passThisToApply !== void 0 ? gen1_options.passThisToApply : false;
                originallyAsync = gen1_options && gen1_options.hasOwnProperty("originallyAsync") && gen1_options.originallyAsync !== void 0 ? gen1_options.originallyAsync : false;
                self = this;
                self.isFunctionCall = true;
                self.function = fun;
                self.functionArguments = args;
                self.optionalArguments = optionalArguments;
                self.splattedArguments = self.cg.splatArguments(args, optionalArguments);
                self.passThisToApply = passThisToApply;
                self.isAsync = async;
                return self.originallyAsync = originallyAsync;
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
            },
            makeAsyncCallWithCallback: function(callback) {
                var self, fc;
                self = this;
                fc = self.clone();
                fc.functionArguments.push(callback);
                return fc;
            }
        });
        return functionCall = function(fun, args, gen2_options) {
            var optionalArguments, async, passThisToApply, asyncResult, name, macro;
            optionalArguments = gen2_options && gen2_options.hasOwnProperty("optionalArguments") && gen2_options.optionalArguments !== void 0 ? gen2_options.optionalArguments : [];
            async = gen2_options && gen2_options.hasOwnProperty("async") && gen2_options.async !== void 0 ? gen2_options.async : false;
            passThisToApply = gen2_options && gen2_options.hasOwnProperty("passThisToApply") && gen2_options.passThisToApply !== void 0 ? gen2_options.passThisToApply : false;
            if (async) {
                asyncResult = terms.asyncResult();
                terms.argumentUtils.asyncifyArguments(args, optionalArguments);
                return terms.subStatements([ terms.definition(asyncResult, functionCallTerm(fun, args, {
                    optionalArguments: optionalArguments,
                    passThisToApply: passThisToApply,
                    originallyAsync: true
                }), {
                    async: true
                }), asyncResult ]);
            } else if (fun.variable) {
                name = fun.variable;
                macro = terms.macros.findMacro(name);
                if (macro) {
                    return macro(name, args, optionalArguments);
                }
            }
            return functionCallTerm(fun, args, {
                optionalArguments: optionalArguments,
                passThisToApply: passThisToApply
            });
        };
    };
})).call(this);