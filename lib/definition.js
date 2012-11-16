(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(target, source, gen1_options) {
                var self = this;
                var async, shadow, assignment;
                async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
                shadow = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "shadow") && gen1_options.shadow !== void 0 ? gen1_options.shadow : false;
                assignment = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "assignment") && gen1_options.assignment !== void 0 ? gen1_options.assignment : false;
                self.isDefinition = true;
                self.target = target;
                self.source = source;
                self.isAsync = async;
                self.shadow = shadow;
                return self.isAssignment = assignment;
            },
            expression: function() {
                var self = this;
                return self;
            },
            hashEntry: function() {
                var self = this;
                return self.cg.hashEntry(self.target.hashEntryField(), self.source);
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                self.target.generateJavaScriptTarget(buffer, scope);
                buffer.write("=");
                return self.source.generateJavaScript(buffer, scope);
            },
            declareVariables: function(variables, scope) {
                var self = this;
                var name;
                if (!self.isAssignment) {
                    name = self.target.variableName(scope);
                    if (name) {
                        if (self.shadow || !scope.isDefined(name)) {
                            return variables.push(name);
                        } else if (scope.isDefined(name)) {
                            return terms.errors.addTermWithMessage(self, "variable " + name + " already defined, use := to reassign it");
                        }
                    }
                }
            },
            makeAsyncWithCallbackForResult: function(createCallbackForResult) {
                var self = this;
                var callback;
                if (self.isAsync) {
                    callback = createCallbackForResult(self.target);
                    return self.source.makeAsyncCallWithCallback(callback);
                }
            }
        });
    };
}).call(this);