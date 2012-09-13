((function() {
    var self, codegenUtils;
    self = this;
    codegenUtils = require("./codegenUtils");
    module.exports = function(terms) {
        var self, functionCallTerm, functionCall;
        self = this;
        functionCallTerm = terms.term({
            constructor: function(fun, args, optionalArgs, gen1_options) {
                var async, passThisToApply, self;
                async = gen1_options && gen1_options.hasOwnProperty("async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                passThisToApply = gen1_options && gen1_options.hasOwnProperty("passThisToApply") && gen1_options.passThisToApply !== void 0 ? gen1_options.passThisToApply : false;
                self = this;
                self.isFunctionCall = true;
                self.function = fun;
                self.functionArguments = args;
                self.optionalArguments = optionalArgs || [];
                self.splattedArguments = self.cg.splatArguments(args, optionalArgs);
                self.passThisToApply = passThisToApply;
                return self.isAsync = async;
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
        return functionCall = function(fun, args, optionalArgs, gen2_options) {
            var async, passThisToApply, asyncResult, name, macro;
            async = gen2_options && gen2_options.hasOwnProperty("async") && gen2_options.async !== void 0 ? gen2_options.async : false;
            passThisToApply = gen2_options && gen2_options.hasOwnProperty("passThisToApply") && gen2_options.passThisToApply !== void 0 ? gen2_options.passThisToApply : false;
            if (async) {
                asyncResult = terms.asyncResult();
                return terms.subStatements([ terms.definition(asyncResult, functionCallTerm(fun, args, optionalArgs, {
                    passThisToApply: passThisToApply
                }), {
                    async: true
                }), asyncResult ]);
            } else if (fun.variable) {
                name = fun.variable;
                macro = terms.macros.findMacro(name);
                if (macro) {
                    return macro(name, args, optionalArgs);
                }
            }
            return functionCallTerm(fun, args, optionalArgs, {
                passThisToApply: passThisToApply
            });
        };
    };
})).call(this);