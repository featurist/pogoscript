(function() {
    var self, fs, ms, createLineParser, createIndentStack;
    self = this;
    fs = require("fs");
    ms = require("../lib/memorystream");
    require("./runtime");
    exports.createLineParser = createLineParser = function() {
        var lastIndentation, indentationPattern, isEmptyLinePattern, lineEndsWithBracketPattern, lineStartsWithBracketPattern, isFirstLine, isEmpty, startsWithBracket, endsWithBracket;
        lastIndentation = "";
        indentationPattern = new RegExp("^( *)(.*)$");
        isEmptyLinePattern = new RegExp("^\\s*$");
        lineEndsWithBracketPattern = new RegExp("[{([]\\s*$");
        lineStartsWithBracketPattern = new RegExp("^\\s*[\\])}]");
        isFirstLine = true;
        isEmpty = function(line) {
            return isEmptyLinePattern.test(line);
        };
        startsWithBracket = function(line) {
            return lineStartsWithBracketPattern.test(line);
        };
        endsWithBracket = function(line) {
            return lineEndsWithBracketPattern.test(line);
        };
        return function(line) {
            if (isEmpty(line)) {
                var line;
                line = {
                    isEmpty: true,
                    line: line,
                    isFirstLine: isFirstLine
                };
                return line;
            } else {
                var indentationMatch, indentation, code;
                indentationMatch = indentationPattern.exec(line);
                indentation = indentationMatch[1];
                code = indentationMatch[2];
                line = {
                    line: line,
                    code: code,
                    indentation: indentation,
                    isIndent: indentation > lastIndentation,
                    isUnindent: indentation < lastIndentation,
                    isNewLine: indentation == lastIndentation,
                    endsWithBracket: endsWithBracket(line),
                    startsWithBracket: startsWithBracket(line),
                    isFirstLine: isFirstLine
                };
                isFirstLine = false;
                lastIndentation = indentation;
                return line;
            }
        };
    };
    exports.createIndentStack = createIndentStack = function() {
        var indents, peek;
        indents = [ "" ];
        peek = function(array) {
            return array[array.length - 1];
        };
        return object(function() {
            this.indentTo = function(i) {
                return indents.push(i);
            };
            return this.countUnindentsWhileUnwindingTo = function(i) {
                var unindentCount;
                unindentCount = 0;
                while (peek(indents) != i) {
                    unindentCount = unindentCount + 1;
                    indents.pop();
                }
                return unindentCount;
            };
        });
    };
    exports.createFileParser = function() {
        return function(source) {
            var lines, lastLine, parse, stream, indentStack, plusIf, write, writeAppending, concatTimes, gen1_items, gen2_i, sline, line, numberOfUnwindBrackets;
            lines = source.split("\n");
            lastLine = {
                noLine: true
            };
            parse = createLineParser();
            stream = new ms.MemoryStream;
            indentStack = createIndentStack();
            plusIf = function(s, a, c) {
                if (c) {
                    return s + a;
                } else {
                    return s;
                }
            };
            write = function(l) {
                if (!l.noLine) {
                    return stream.write(l.line + "\n");
                }
            };
            writeAppending = function(l, s) {
                if (!l.noLine) {
                    return stream.write(l.line + s + "\n");
                }
            };
            concatTimes = function(s, n) {
                var r;
                r = "";
                while (n > 0) {
                    var n;
                    r = r + s;
                    n = n - 1;
                }
                return r;
            };
            gen1_items = lines;
            for (gen2_i = 0; gen2_i < gen1_items.length; gen2_i++) {
                sline = gen1_items[gen2_i];
                line = parse(sline);
                if (line.isNewLine) {
                    writeAppending(lastLine, plusIf("", ".", !(line.isFirstLine || lastLine.endsWithBracket || line.startsWithBracket)));
                }
                if (line.isEmpty) {
                    write(lastLine);
                }
                if (line.isIndent) {
                    writeAppending(lastLine, plusIf("", "{", !lastLine.endsWithBracket));
                    indentStack.indentTo(line.indentation);
                }
                if (line.isUnindent) {
                    var lastLineEnding;
                    numberOfUnwindBrackets = indentStack.countUnindentsWhileUnwindingTo(line.indentation);
                    if (line.startsWithBracket) {
                        numberOfUnwindBrackets = numberOfUnwindBrackets - 1;
                    }
                    lastLineEnding = concatTimes("}", numberOfUnwindBrackets);
                    writeAppending(lastLine, plusIf(lastLineEnding, ".", lastLine.isEmpty));
                }
                lastLine = line;
            }
            numberOfUnwindBrackets = indentStack.countUnindentsWhileUnwindingTo("");
            writeAppending(lastLine, concatTimes("}", numberOfUnwindBrackets));
            return stream.toString();
        };
    };
})();