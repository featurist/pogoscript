(function() {
    var self = this;
    var BooleanOption, OptionParser;
    require("./class");
    BooleanOption = $class({
        constructor: function(gen1_options) {
            var self = this;
            var shortName, longName, description;
            shortName = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "shortName") && gen1_options.shortName !== void 0 ? gen1_options.shortName : void 0;
            longName = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "longName") && gen1_options.longName !== void 0 ? gen1_options.longName : void 0;
            description = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "description") && gen1_options.description !== void 0 ? gen1_options.description : void 0;
            self.shortName = shortName;
            self.name = self._camelCaseName(longName);
            self.longName = longName;
            return self.description = description;
        },
        _camelCaseName: function(longName) {
            var self = this;
            var segments, name, n, segment;
            segments = longName.split(/-/);
            name = segments[0];
            for (n = 1; n < segments.length; ++n) {
                segment = segments[n];
                name = name + (segment[0].toUpperCase() + segment.substring(1));
            }
            return name;
        },
        init: function(options) {
            var self = this;
            return options[self.name] = false;
        },
        set: function(options) {
            var self = this;
            return options[self.name] = true;
        },
        toString: function() {
            var self = this;
            var switches;
            switches = [ function() {
                if (self.shortName) {
                    return "-" + self.shortName;
                }
            }(), function() {
                if (self.longName) {
                    return "--" + self.longName;
                }
            }() ].filter(function(s) {
                return s;
            }).join(", ");
            return "    " + switches + "\n\n        " + self.description + "\n";
        }
    });
    OptionParser = $class({
        constructor: function() {
            var self = this;
            self._longOptions = {};
            self._shortOptions = {};
            return self._options = [];
        },
        option: function(description) {
            var self = this;
            var match, shortName, longName, option;
            match = /(-([a-z0-9])\s*,\s*)?--([a-z0-9-]*)\s*(.*)/i.exec(description);
            if (!match) {
                throw new Error("expected option be of the form '[-x, ]--xxxx some description of xxxx'");
            }
            shortName = match[2];
            longName = match[3];
            option = new BooleanOption({
                shortName: shortName,
                longName: longName,
                description: match[4]
            });
            return self._addOption(option);
        },
        _addOption: function(option) {
            var self = this;
            self._longOptions[option.longName] = option;
            self._shortOptions[option.shortName] = option;
            return self._options.push(option);
        },
        _findLongOption: function(name) {
            var self = this;
            var option;
            option = self._longOptions[name];
            if (option) {
                return option;
            } else {
                throw new Error("no such option --" + name);
            }
        },
        _findShortOption: function(name) {
            var self = this;
            var option;
            option = self._shortOptions[name];
            if (option) {
                return option;
            } else {
                throw new Error("no such option -" + name);
            }
        },
        _setDefaultOptions: function(options) {
            var self = this;
            var gen2_items, gen3_i, option;
            gen2_items = self._options;
            for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
                option = gen2_items[gen3_i];
                option.init(options);
            }
            return void 0;
        },
        parse: function(args) {
            var self = this;
            var options, n, gen4_forResult;
            if (!args) {
                args = process.argv;
            }
            options = {
                _: []
            };
            self._setDefaultOptions(options);
            for (n = 0; n < args.length; ++n) {
                gen4_forResult = void 0;
                if (function(n) {
                    var arg, longMatch, shortMatch, option, gen5_items, gen6_i, shortOption, gen7_o;
                    arg = args[n];
                    longMatch = /^--([a-z0-9-]*)$/.exec(arg);
                    shortMatch = /^-([a-z0-9-]*)$/.exec(arg);
                    option = void 0;
                    if (longMatch) {
                        option = self._findLongOption(longMatch[1]);
                        option.set(options);
                    } else if (shortMatch) {
                        gen5_items = shortMatch[1];
                        for (gen6_i = 0; gen6_i < gen5_items.length; ++gen6_i) {
                            shortOption = gen5_items[gen6_i];
                            option = self._findShortOption(shortOption);
                            option.set(options);
                        }
                    } else {
                        gen7_o = options._;
                        gen7_o.push.apply(gen7_o, args.slice(n));
                        gen4_forResult = options;
                        return true;
                    }
                }(n)) {
                    return gen4_forResult;
                }
            }
            return options;
        },
        help: function() {
            var self = this;
            var gen8_items, gen9_i, option;
            process.stdout.write("usage:\n\n    pogo [debug] script.pogo [script options]\n    pogo [options] scripts ...\n\noptions:\n\n");
            gen8_items = self._options;
            for (gen9_i = 0; gen9_i < gen8_items.length; ++gen9_i) {
                option = gen8_items[gen9_i];
                process.stdout.write(option + "\n");
            }
            return void 0;
        }
    });
    exports.createParser = function() {
        var self = this;
        return new OptionParser();
    };
}).call(this);