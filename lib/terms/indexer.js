(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(object, indexer) {
                var self = this;
                self.object = object;
                self.indexer = indexer;
                return self.isIndexer = true;
            },
            generateJavaScript: function(buffer, scope) {
                var self = this;
                return self.codeIntoBuffer(buffer, function(buffer) {
                    buffer.write(self.object.generate(scope));
                    buffer.write("[");
                    buffer.write(self.indexer.generate(scope));
                    return buffer.write("]");
                });
            },
            generateTarget: function() {
                var self = this;
                var args = Array.prototype.slice.call(arguments, 0, arguments.length);
                var gen1_o;
                gen1_o = self;
                return gen1_o.generate.apply(gen1_o, args);
            }
        });
    };
}).call(this);