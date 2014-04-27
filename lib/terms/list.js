(function() {
    var self = this;
    var codegenUtils, _;
    codegenUtils = require("./codegenUtils");
    _ = require("underscore");
    module.exports = function(terms) {
        var self = this;
        var listTerm, list;
        listTerm = terms.term({
            constructor: function(items) {
                var self = this;
                self.isList = true;
                return self.items = items;
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                var splatArguments;
                splatArguments = terms.splatArguments(self.items);
                if (splatArguments) {
                    return splatArguments.generateJavaScript(buffer, scope);
                } else {
                    buffer.write("[");
                    codegenUtils.writeToBufferWithDelimiter(self.items, ",", buffer, scope);
                    return buffer.write("]");
                }
            }
        });
        return list = function(items) {
            var hashEntry, hasGenerator, macro;
            hashEntry = _.find(items, function(item) {
                return item.isHashEntry;
            });
            hasGenerator = _.find(items, function(item) {
                return item.isGenerator;
            });
            if (hashEntry) {
                macro = terms.listMacros.findMacro(hashEntry.field);
                if (macro) {
                    return macro(listTerm(items), hashEntry.field);
                } else {
                    return terms.errors.addTermWithMessage(hashEntry, "no macro for " + hashEntry.field.join(" "));
                }
            } else if (hasGenerator) {
                return terms.listComprehension(items);
            } else {
                return listTerm(items);
            }
        };
    };
}).call(this);