((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self, splatArgumentsTerm, splatArguments;
        self = this;
        splatArgumentsTerm = terms.term({
            constructor: function(splatArguments) {
                var self;
                self = this;
                return self.splatArguments = splatArguments;
            },
            generateJavaScript: function(buffer, scope) {
                var self, i;
                self = this;
                for (i = 0; i < self.splatArguments.length; i = i + 1) {
                    var gen1_forResult;
                    gen1_forResult = void 0;
                    if (function(i) {
                        var splatArgument;
                        splatArgument = self.splatArguments[i];
                        if (i === 0) {
                            splatArgument.generateJavaScript(buffer, scope);
                        } else {
                            buffer.write(".concat(");
                            splatArgument.generateJavaScript(buffer, scope);
                            buffer.write(")");
                        }
                    }(i)) {
                        return gen1_forResult;
                    }
                }
            }
        });
        return splatArguments = function(args, optionalArgs) {
            var splatArgs, previousArgs, foundSplat, i;
            splatArgs = [];
            previousArgs = [];
            foundSplat = false;
            i = 0;
            while (i < args.length) {
                var current, next;
                current = args[i];
                next = args[i + 1];
                if (next && next.isSplat) {
                    foundSplat = true;
                    if (previousArgs.length > 0) {
                        splatArgs.push(terms.list(previousArgs));
                        previousArgs = [];
                    }
                    splatArgs.push(current);
                    i = i + 1;
                } else if (current.isSplat) {
                    terms.errors.addTermWithMessage(current, "splat keyword with no argument to splat");
                } else {
                    previousArgs.push(current);
                }
                i = i + 1;
            }
            if (optionalArgs && optionalArgs.length > 0) {
                previousArgs.push(terms.hash(optionalArgs));
            }
            if (previousArgs.length > 0) {
                splatArgs.push(terms.list(previousArgs));
            }
            if (foundSplat) {
                return splatArgumentsTerm(splatArgs);
            }
        };
    };
})).call(this);