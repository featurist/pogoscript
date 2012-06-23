((function() {
    var self, OptionParser;
    self = this;
    require("./class");
    OptionParser = $class({
        constructor: function() {
            var self;
            self = this;
            self._longOptions = {};
            self._shortOptions = {};
            return self._options = [];
        },
        option: function(description) {
            var self, match, shortName, longName, option;
            self = this;
            match = /(-([a-z0-9])\s*,\s*)?--([a-z0-9-]*)\s*(.*)/i.exec(description);
            if (!match) {
                throw new Error("expected option be of the form '[-x, ]--xxxx some description of xxxx'");
            }
            shortName = match[2];
            longName = match[3];
            option = {
                shortName: shortName,
                name: longName,
                description: match[4]
            };
            self._longOptions[longName] = option;
            self._shortOptions[shortName] = option;
            return self._options.push(option);
        },
        findLongOption: function(name) {
            var self, option;
            self = this;
            option = self._longOptions[name];
            if (option) {
                return option;
            } else {
                throw new Error("no such option --" + name);
            }
        },
        findShortOption: function(name) {
            var self, option;
            self = this;
            option = self._shortOptions[name];
            if (option) {
                return option;
            } else {
                throw new Error("no such option -" + name);
            }
        },
        setDefaultOptions: function(options) {
            var self, gen1_items, gen2_i, option;
            self = this;
            gen1_items = self._options;
            for (gen2_i = 0; gen2_i < gen1_items.length; gen2_i++) {
                option = gen1_items[gen2_i];
                options[option.name] = false;
            }
        },
        parse: function(args) {
            var self, options, n, gen3_forResult;
            self = this;
            if (!args) {
                args = process.argv;
            }
            options = {
                _: []
            };
            self.setDefaultOptions(options);
            for (n = 0; n < args.length; n = n + 1) {
                gen3_forResult = void 0;
                if (function(n) {
                    var arg, longMatch, shortMatch, option, gen4_items, gen5_i, shortOption, gen6_o;
                    arg = args[n];
                    longMatch = /^--([a-z0-9-]*)$/.exec(arg);
                    shortMatch = /^-([a-z0-9-]*)$/.exec(arg);
                    if (longMatch) {
                        option = self.findLongOption(longMatch[1]);
                        options[option.name] = true;
                    } else if (shortMatch) {
                        gen4_items = shortMatch[1];
                        for (gen5_i = 0; gen5_i < gen4_items.length; gen5_i++) {
                            shortOption = gen4_items[gen5_i];
                            option = self.findShortOption(shortOption);
                            options[option.name] = true;
                        }
                    } else {
                        gen6_o = options._;
                        gen6_o.push.apply(gen6_o, args.slice(n));
                        gen3_forResult = options;
                        return true;
                    }
                }(n)) {
                    return gen3_forResult;
                }
            }
            return options;
        }
    });
    exports.createParser = function() {
        var self;
        self = this;
        return new OptionParser;
    };
})).call(this);