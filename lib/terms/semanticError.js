(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(errorTerms, message) {
                var self = this;
                self.isSemanticError = true;
                self.errorTerms = errorTerms;
                return self.message = message;
            },
            generateJavaScript: function() {
                var self = this;
                return void 0;
            },
            printError: function(sourceFile, buffer) {
                var self = this;
                sourceFile.printLocation(self.errorTerms[0].location(), buffer);
                return buffer.write(this.message + "\n");
            },
            generateJavaScriptHashEntry: function() {
                var self = this;
                return void 0;
            }
        });
    };
}).call(this);