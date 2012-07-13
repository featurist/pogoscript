((function() {
    var self, _;
    self = this;
    _ = require("underscore");
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
                var self, i, splatArgument;
                self = this;
                for (i = 0; i < self.splatArguments.length; i = i + 1) {
                    splatArgument = self.splatArguments[i];
                    if (i === 0) {
                        splatArgument.generateJavaScript(buffer, scope);
                    } else {
                        buffer.write(".concat(");
                        splatArgument.generateJavaScript(buffer, scope);
                        buffer.write(")");
                    }
                }
            }
        });
        return splatArguments = function(args, optionalArgs) {
            var splatArgs, previousArgs, foundSplat, i, current, next, concat;
            splatArgs = [];
            previousArgs = [];
            foundSplat = false;
            i = 0;
            while (i < args.length) {
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
                concat = function(initial, last) {
                    if (initial.length > 0) {
                        return terms.methodCall(concat(_.initial(initial), _.last(initial)), [ "concat" ], [ last ]);
                    } else {
                        return last;
                    }
                };
                return concat(_.initial(splatArgs), _.last(splatArgs));
            }
        };
    };
})).call(this);