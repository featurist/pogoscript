(function() {
    var self = this;
    var $class, BooleanOption, StringOption, camelCaseName, string, boolean, parsers, OptionParser;
    $class = require("./class").class;
    BooleanOption = $class({
        constructor: function(gen1_options) {
            var self = this;
            var shortName, longName, description;
            shortName = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "shortName") && gen1_options.shortName !== void 0 ? gen1_options.shortName : void 0;
            longName = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "longName") && gen1_options.longName !== void 0 ? gen1_options.longName : void 0;
            description = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "description") && gen1_options.description !== void 0 ? gen1_options.description : void 0;
            self.shortName = shortName;
            self.name = camelCaseName(longName);
            self.longName = longName;
            return self.description = description;
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
    StringOption = $class({
        constructor: function(gen2_options) {
            var self = this;
            var shortName, longName, description;
            shortName = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "shortName") && gen2_options.shortName !== void 0 ? gen2_options.shortName : void 0;
            longName = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "longName") && gen2_options.longName !== void 0 ? gen2_options.longName : void 0;
            description = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "description") && gen2_options.description !== void 0 ? gen2_options.description : void 0;
            self.shortName = shortName;
            self.name = camelCaseName(longName);
            self.longName = longName;
            return self.description = description;
        },
        init: function(options) {
            var self = this;
            return options[self.name] = void 0;
        },
        set: function(options, arguments) {
            var self = this;
            return options[self.name] = arguments.shift();
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
    camelCaseName = function(longName) {
        var segments, name, n, segment;
        segments = longName.split(/-/);
        name = segments[0];
        for (n = 1; n < segments.length; ++n) {
            segment = segments[n];
            name = name + (segment[0].toUpperCase() + segment.substring(1));
        }
        return name;
    };
    parsers = [ string = function(description) {
        var match, shortName, longName;
        match = /(-([a-z0-9])\s*,\s*)?--([a-z0-9-]+)=<[a-z0-9-]+>\s*(.*)/i.exec(description);
        if (match) {
            shortName = match[2];
            longName = match[3];
            return new StringOption({
                shortName: shortName,
                longName: longName,
                description: match[4]
            });
        }
    }, boolean = function(description) {
        var match, shortName, longName;
        match = /(-([a-z0-9])\s*,\s*)?--([a-z0-9-]*)\s*(.*)/i.exec(description);
        if (match) {
            shortName = match[2];
            longName = match[3];
            return new BooleanOption({
                shortName: shortName,
                longName: longName,
                description: match[4]
            });
        }
    } ];
    OptionParser = $class({
        constructor: function() {
            var self = this;
            self._longOptions = {};
            self._shortOptions = {};
            return self._options = [];
        },
        option: function(description) {
            var self = this;
            var option;
            option = function() {
                var gen3_results, gen4_items, gen5_i, parser;
                gen3_results = [];
                gen4_items = parsers;
                for (gen5_i = 0; gen5_i < gen4_items.length; ++gen5_i) {
                    parser = gen4_items[gen5_i];
                    (function(parser) {
                        var option;
                        option = parser(description);
                        if (option) {
                            return gen3_results.push(option);
                        }
                    })(parser);
                }
                return gen3_results;
            }()[0];
            if (option) {
                return self._addOption(option);
            } else {
                throw new Error("expected option be of the form '[-x, ]--xxxx[=<value>] some description of xxxx'");
            }
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
            var gen6_items, gen7_i, option;
            gen6_items = self._options;
            for (gen7_i = 0; gen7_i < gen6_items.length; ++gen7_i) {
                option = gen6_items[gen7_i];
                option.init(options);
            }
            return void 0;
        },
        parse: function(args) {
            var self = this;
            var options, remainingArguments, arg, longMatch, shortMatch, option, gen8_items, gen9_i, shortOption, gen10_o;
            if (!args) {
                args = process.argv;
            }
            options = {
                _: []
            };
            self._setDefaultOptions(options);
            remainingArguments = args.slice();
            while (remainingArguments.length > 0) {
                arg = remainingArguments.shift();
                longMatch = /^--([a-z0-9-]*)$/.exec(arg);
                shortMatch = /^-([a-z0-9-]*)$/.exec(arg);
                option = void 0;
                if (longMatch) {
                    option = self._findLongOption(longMatch[1]);
                    option.set(options, remainingArguments);
                } else if (shortMatch) {
                    gen8_items = shortMatch[1];
                    for (gen9_i = 0; gen9_i < gen8_items.length; ++gen9_i) {
                        shortOption = gen8_items[gen9_i];
                        option = self._findShortOption(shortOption);
                        option.set(options, remainingArguments);
                    }
                } else {
                    gen10_o = options._;
                    gen10_o.push.apply(gen10_o, [ arg ].concat(remainingArguments.slice()));
                    return options;
                }
            }
            return options;
        },
        help: function() {
            var self = this;
            var gen11_items, gen12_i, option;
            process.stdout.write("usage:\n\n    pogo [debug] script.pogo [script options]\n    pogo [options] scripts ...\n\noptions:\n\n");
            gen11_items = self._options;
            for (gen12_i = 0; gen12_i < gen11_items.length; ++gen12_i) {
                option = gen11_items[gen12_i];
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