(function() {
    var self = this;
    var codegenUtils, _;
    codegenUtils = require("./codegenUtils");
    _ = require("underscore");
    module.exports = function(terms) {
        var self = this;
        var listTerm, insertSplatsAfterRanges, list;
        listTerm = terms.term({
            constructor: function(items) {
                var self = this;
                self.isList = true;
                return self.items = items;
            },
            generate: function(scope) {
                var self = this;
                return self.generateIntoBuffer(function(buffer) {
                    var splatArguments;
                    splatArguments = terms.splatArguments(self.items);
                    if (splatArguments) {
                        return buffer.write(splatArguments.generate(scope));
                    } else {
                        buffer.write("[");
                        codegenUtils.writeToBufferWithDelimiter(self.items, ",", buffer, scope);
                        return buffer.write("]");
                    }
                });
            }
        });
        insertSplatsAfterRanges = function(items) {
            var itemsWithSplats, n, item;
            itemsWithSplats = [];
            for (n = 0; n < items.length; ++n) {
                item = items[n];
                itemsWithSplats.push(item);
                if (item.isRange) {
                    item.inList = true;
                    itemsWithSplats.push(terms.splat());
                }
            }
            return itemsWithSplats;
        };
        return list = function(listItems) {
            var items, hashEntry, hasGenerator, macro;
            items = insertSplatsAfterRanges(listItems);
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