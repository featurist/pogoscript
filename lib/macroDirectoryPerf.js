(function() {
    var self = this;
    var _, codegenUtils;
    _ = require("underscore");
    codegenUtils = require("./terms/codegenUtils");
    module.exports = function(terms) {
        var self = this;
        var regexToMatchStringsIn, regexFor, macroDirectory;
        regexToMatchStringsIn = function(macroArray) {
            return new RegExp("^(" + function() {
                var gen1_results, gen2_items, gen3_i, macro;
                gen1_results = [];
                gen2_items = macroArray;
                for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
                    macro = gen2_items[gen3_i];
                    gen1_results.push("(" + regexFor(macro) + ")");
                }
                return gen1_results;
            }().join("|") + ")$");
        };
        regexFor = function(macro) {
            var s, gen4_items, gen5_i, c;
            s = macro.name;
            gen4_items = "$".split("");
            for (gen5_i = 0; gen5_i < gen4_items.length; ++gen5_i) {
                c = gen4_items[gen5_i];
                s = s.replace(c, "\\" + c);
            }
            if (macro.wild) {
                return s + ".*";
            } else {
                return s;
            }
        };
        return macroDirectory = function() {
            return {
                macros: [],
                macroNames: {},
                regex: void 0,
                addMacro: function(name, macro, gen6_options) {
                    var self = this;
                    var wild;
                    wild = gen6_options !== void 0 && Object.prototype.hasOwnProperty.call(gen6_options, "wild") && gen6_options.wild !== void 0 ? gen6_options.wild : false;
                    if (Object.hasOwnProperty.call(self.macroNames, name)) {
                        return self.macros[self.macroNames[name]].macro = macro;
                    } else {
                        self.macros.push({
                            name: name,
                            macro: macro,
                            wild: wild
                        });
                        self.macroNames[name] = self.macros.length - 1;
                        return self.regex = regexToMatchStringsIn(self.macros);
                    }
                },
                addWildCardMacro: function(name, macro) {
                    var self = this;
                    return self.addMacro(name, macro, {
                        wild: true
                    });
                },
                findMacro: function(name) {
                    var self = this;
                    var match, i, macro;
                    debugger;
                    match = self.regex.exec(name);
                    if (match) {
                        console.log(name);
                        console.log(match);
                        i = _.indexOf(match.slice(2), name);
                        macro = self.macros[i];
                        if (macro.wild) {
                            macro.macro(name) || self.findMacro(name);
                        }
                        return $else(function() {
                            return macro.macro;
                        });
                    }
                }
            };
        };
    };
}).call(this);