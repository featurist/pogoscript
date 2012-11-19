(function() {
    var self = this;
    var _;
    _ = require("underscore");
    module.exports = function(terms) {
        var self = this;
        var splatArgumentsTerm, splatArguments;
        splatArgumentsTerm = terms.term({
            constructor: function(splatArguments) {
                var self = this;
                return self.splatArguments = splatArguments;
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                var i, splatArgument;
                for (i = 0; i < self.splatArguments.length; ++i) {
                    splatArgument = self.splatArguments[i];
                    if (i === 0) {
                        splatArgument.generateJavaScript(buffer, scope);
                    } else {
                        buffer.write(".concat(");
                        splatArgument.generateJavaScript(buffer, scope);
                        buffer.write(")");
                    }
                }
                return void 0;
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
                    ++i;
                } else if (current.isSplat) {
                    terms.errors.addTermWithMessage(current, "splat keyword with no argument to splat");
                } else {
                    previousArgs.push(current);
                }
                ++i;
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
}).call(this);