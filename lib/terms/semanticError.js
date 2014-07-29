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
            generate: function() {
                var self = this;
                return "";
            },
            printError: function(sourceFile, buffer) {
                var self = this;
                sourceFile.printLocation(self.errorTerms[0].location(), buffer);
                return buffer.write(self.message + "\n");
            },
            generateHashEntry: function() {
                var self = this;
                return "";
            },
            declare: function() {
                var self = this;
                return void 0;
            }
        });
    };
}).call(this);