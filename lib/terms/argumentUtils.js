(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return {
            asyncifyArguments: function(arguments, optionalArguments) {
                var self = this;
                var gen1_items, gen2_i, arg, gen3_items, gen4_i, optArg;
                gen1_items = arguments;
                for (gen2_i = 0; gen2_i < gen1_items.length; ++gen2_i) {
                    arg = gen1_items[gen2_i];
                    arg.asyncify();
                }
                gen3_items = optionalArguments;
                for (gen4_i = 0; gen4_i < gen3_items.length; ++gen4_i) {
                    optArg = gen3_items[gen4_i];
                    optArg.asyncify();
                }
                return void 0;
            },
            asyncifyBody: function(body, args) {
                var self = this;
                if (body) {
                    return terms.closure(args || [], body);
                } else {
                    return terms.nil();
                }
            },
            optionalArguments: function(args) {
                var self = this;
                return function() {
                    var gen5_results, gen6_items, gen7_i, arg;
                    gen5_results = [];
                    gen6_items = args;
                    for (gen7_i = 0; gen7_i < gen6_items.length; ++gen7_i) {
                        arg = gen6_items[gen7_i];
                        (function(arg) {
                            if (arg.isDefinition || arg.isHashEntry) {
                                return gen5_results.push(arg.hashEntry());
                            }
                        })(arg);
                    }
                    return gen5_results;
                }();
            },
            positionalArguments: function(args) {
                var self = this;
                return function() {
                    var gen8_results, gen9_items, gen10_i, arg;
                    gen8_results = [];
                    gen9_items = args;
                    for (gen10_i = 0; gen10_i < gen9_items.length; ++gen10_i) {
                        arg = gen9_items[gen10_i];
                        (function(arg) {
                            if (!(arg.isDefinition || arg.isHashEntry)) {
                                return gen8_results.push(arg);
                            }
                        })(arg);
                    }
                    return gen8_results;
                }();
            }
        };
    };
}).call(this);