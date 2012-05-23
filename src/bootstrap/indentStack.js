((function() {
    var self, createIndentStack;
    self = this;
    require("./runtime");
    exports.createIndentStack = createIndentStack = function() {
        return object(function() {
            var self;
            self = this;
            self.indents = [ 0 ];
            self.indentationRegex = new RegExp("\\r?\\n( *)$");
            self.multiNewLineRegex = new RegExp("\\r?\\n *\\r?\\n");
            self.isMultiNewLine = function(text) {
                var self;
                self = this;
                return self.multiNewLineRegex.test(text);
            };
            self.hasNewLine = function(text) {
                var self;
                self = this;
                return self.indentationRegex.test(text);
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
                    self.indents.unshift("bracket");
                    return self.indents.unshift(self.indentation(text));
                } else {
                    var current;
                    current = self.currentIndentation();
                    self.indents.unshift("bracket");
                    return self.indents.unshift(current);
                }
            };
            self.unsetIndentation = function() {
                var self, tokens;
                self = this;
                self.indents.shift();
                tokens = [];
                while (self.indents.length > 0 && self.indents[0] !== "bracket") {
                    tokens.push("}");
                    self.indents.shift();
                }
                self.indents.shift();
                return tokens;
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
                var self;
                self = this;
                if (self.hasNewLine(text)) {
                    var currentIndentation, indentation;
                    currentIndentation = self.currentIndentation();
                    indentation = self.indentation(text);
                    if (currentIndentation === indentation) {
                        return [ "," ];
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
                            tokens.push(",");
                        }
                        if (self.indents[0] < indentation) {
                            tokens.push("@{");
                            self.indents.unshift(indentation);
                        }
                        return tokens;
                    }
                } else {
                    return [];
                }
            };
        });
    };
})).call(this);