(function() {
    var self = this;
    var createIndentStack;
    require("./runtime");
    exports.createIndentStack = createIndentStack = function() {
        return object(function() {
            var self = this;
            self.indents = [ 0 ];
            self.indentationRegex = /\r?\n( *)$/;
            self.multiNewLineRegex = /\r?\n *\r?\n/;
            self.isMultiNewLine = function(text) {
                var self = this;
                return self.multiNewLineRegex.test(text);
            };
            self.hasNewLine = function(text) {
                var self = this;
                return self.indentationRegex.test(text);
            };
            self.indentation = function(newLine) {
                var self = this;
                return self.indentationRegex.exec(newLine)[1].length;
            };
            self.currentIndentation = function() {
                var self = this;
                return self.indents[0];
            };
            self.setIndentation = function(text) {
                var self = this;
                var current;
                if (self.hasNewLine(text)) {
                    self.indents.unshift("bracket");
                    return self.indents.unshift(self.indentation(text));
                } else {
                    current = self.currentIndentation();
                    self.indents.unshift("bracket");
                    return self.indents.unshift(current);
                }
            };
            self.unsetIndentation = function() {
                var self = this;
                var tokens;
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
                var self = this;
                var tokens, indents;
                tokens = [];
                indents = self.indents.length;
                while (indents > 1) {
                    tokens.push("}");
                    --indents;
                }
                tokens.push("eof");
                return tokens;
            };
            return self.tokensForNewLine = function(text) {
                var self = this;
                var currentIndentation, indentation, tokens;
                if (self.hasNewLine(text)) {
                    currentIndentation = self.currentIndentation();
                    indentation = self.indentation(text);
                    if (currentIndentation === indentation) {
                        return [ "," ];
                    } else if (currentIndentation < indentation) {
                        self.indents.unshift(indentation);
                        return [ "@{" ];
                    } else {
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
}).call(this);