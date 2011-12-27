(function() {
    var self, fs, preparser, ms, parse, uglify, errors, preparse, generateCode, beautify, generateJavaScriptFromPogoFile, indexForFileWithSource, duplicateStringTimes;
    self = this;
    fs = require("fs");
    preparser = require("./preparser");
    ms = require("../lib/memorystream");
    parse = require("./parser").parse;
    uglify = require("uglify-js");
    errors = require("./codeGenerator/errors");
    preparse = preparser.createFileParser();
    generateCode = function(term) {
        var memoryStream;
        memoryStream = new ms.MemoryStream;
        term.generateJavaScript(memoryStream);
        return memoryStream.toString();
    };
    beautify = function(code) {
        var ast;
        ast = uglify.parser.parse(code);
        return uglify.uglify.gen_code(ast, {
            beautify: true
        });
    };
    exports.compileFile = function(filename) {
        var js, beautifulJs, jsFilename;
        self = this;
        js = generateJavaScriptFromPogoFile(filename);
        beautifulJs = beautify(js);
        jsFilename = filename.replace(new RegExp(".pogo$"), ".js");
        return fs.writeFileSync(jsFilename, beautifulJs);
    };
    exports.runFile = function(filename) {
        var js;
        self = this;
        js = generateJavaScriptFromPogoFile(filename);
        module.filename = fs.realpathSync(filename);
        process.argv[1] = module.filename;
        return module._compile(js, filename);
    };
    generateJavaScriptFromPogoFile = function(filename) {
        var contents, p, term;
        contents = fs.readFileSync(filename, "utf-8");
        p = preparse(contents);
        term = parse(p);
        if (errors.hasErrors()) {
            errors.printErrors(indexForFileWithSource(filename, contents));
            return process.exit(1);
        } else {
            return generateCode(term);
        }
    };
    indexForFileWithSource = function(filename, source) {
        return object(function() {
            self = this;
            self.linesInRange = function(range) {
                var lines;
                self = this;
                lines = source.split(new RegExp("\n"));
                return lines.slice(range.from - 1, range.to);
            };
            self.printLinesInRange = function(range) {
                var gen1_items, gen2_i, line;
                self = this;
                gen1_items = self.linesInRange(range);
                for (gen2_i = 0; gen2_i < gen1_items.length; gen2_i++) {
                    line = gen1_items[gen2_i];
                    process.stderr.write(line + "\n");
                }
            };
            return self.printLocation = function(location) {
                self = this;
                process.stderr.write(filename + ":" + location.firstLine + "\n");
                self.printLinesInRange({
                    from: location.firstLine,
                    to: location.lastLine
                });
                return process.stderr.write(duplicateStringTimes(" ", location.firstColumn) + duplicateStringTimes("^", location.lastColumn - location.firstColumn) + "\n");
            };
        });
    };
    duplicateStringTimes = function(s, n) {
        var strings, i;
        strings = [];
        for (i = 0; i < n; i = i + 1) {
            strings.push(s);
        }
        return strings.join("");
    };
})();