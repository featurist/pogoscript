((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self;
        self = this;
        return terms.term({
            constructor: function(object, indexer) {
                var self;
                self = this;
                self.object = object;
                self.indexer = indexer;
                return self.isIndexer = true;
            },
            generateJavaScript: function(buffer, scope) {
                var self;
                self = this;
                self.object.generateJavaScript(buffer, scope);
                buffer.write("[");
                self.indexer.generateJavaScript(buffer, scope);
                return buffer.write("]");
            },
            generateJavaScriptTarget: function() {
                var args, self, gen1_o;
                args = Array.prototype.slice.call(arguments, 0, arguments.length);
                self = this;
                gen1_o = self;
                return gen1_o.generateJavaScript.apply(gen1_o, args);
            }
        });
    };
})).call(this);