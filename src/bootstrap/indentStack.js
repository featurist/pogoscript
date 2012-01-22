(function() {
    var self, createIndentStack;
    self = this;
    require("./runtime");
    exports.createIndentStack = createIndentStack = function() {
        var peek;
        peek = function(array) {
            return array[array.length - 1];
        };
        return object(function() {
            var self;
            self = this;
            self.indents = [ 0 ];
            self.indentationRegex = new RegExp("\\n( *)$");
            self.multiNewLineRegex = new RegExp("\\n *\\n");
            self.newLineRegex = new RegExp("\\n");
            self.isMultiNewLine = function(text) {
                var self;
                self = this;
                return self.multiNewLineRegex.test(text);
            };
            self.hasNewLine = function(text) {
                var self;
                self = this;
                return self.newLineRegex.test(text);
            };
            self.indentation = function(newLine) {
                var self;
                self = this;
                return self.indentationRegex.exec(newLine)[1].length;
            };
            self.currentIndentation = function() {
                var self;
                self = this;
                return self.indents[0];
            };
            self.setIndentation = function(text) {
                var self;
                self = this;
                if (self.hasNewLine(text)) {
                    return self.indents.unshift(self.indentation(text));
                } else {
                    return self.indents.unshift(self.currentIndentation());
                }
            };
            self.unsetIndentation = function() {
                var self;
                self = this;
                return self.indents.shift();
            };
            self.tokensForEof = function() {
                var self, tokens, indents;
                self = this;
                tokens = [];
                indents = self.indents.length;
                while (indents > 1) {
                    tokens.push("}");
                    indents = indents - 1;
                }
                tokens.push("eof");
                return tokens;
            };
            return self.tokensForNewLine = function(text) {
                var self, currentIndentation, indentation;
                self = this;
                currentIndentation = self.currentIndentation();
                indentation = self.indentation(text);
                if (currentIndentation == indentation) {
                    return [ "." ];
                } else if (currentIndentation < indentation) {
                    self.indents.unshift(indentation);
                    return [ "@{" ];
                } else {
                    var tokens;
                    tokens = [];
                    while (self.indents[0] > indentation) {
                        tokens.push("}");
                        self.indents.shift();
                    }
                    if (self.isMultiNewLine(text)) {
                        tokens.push(".");
                    }
                    if (self.indents[0] < indentation) {
                        tokens.push("@{");
                        self.indents.unshift(indentation);
                    }
                    return tokens;
                }
            };
        });
    };
})();