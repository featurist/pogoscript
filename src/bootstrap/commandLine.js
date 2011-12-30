(function() {
    var self, fs, preparser, ms, parse, uglify, errors, preparse, generateCode, beautify, jsFilenameFromPogoFilename, jsFromPogoFile, sourceLocationPrinter;
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
    exports.compileFile = function(filename, gen1_options) {
        var ugly, js, jsFilename;
        self = this;
        ugly = gen1_options && gen1_options.ugly != null ? gen1_options.ugly : undefined;
        js = jsFromPogoFile(filename);
        if (!ugly) {
            js = beautify(js);
        }
        jsFilename = jsFilenameFromPogoFilename(filename);
        return fs.writeFileSync(jsFilename, js);
    };
    jsFilenameFromPogoFilename = function(pogo) {
        return pogo.replace(new RegExp(".pogo$"), "") + ".js";
    };
    exports.runFile = function(filename) {
        var js;
        self = this;
        js = jsFromPogoFile(filename);
        module.filename = fs.realpathSync(filename);
        process.argv[1] = module.filename;
        return module._compile(js, filename);
    };
    jsFromPogoFile = function(filename) {
        var contents, p, term;
        contents = fs.readFileSync(filename, "utf-8");
        p = preparse(contents);
        term = parse(p);
        if (errors.hasErrors()) {
            errors.printErrors(sourceLocationPrinter({
                filename: filename,
                source: contents
            }));
            return process.exit(1);
        } else {
            return generateCode(term);
        }
    };
    sourceLocationPrinter = function(gen2_options) {
        var filename, source;
        filename = gen2_options && gen2_options.filename != null ? gen2_options.filename : undefined;
        source = gen2_options && gen2_options.source != null ? gen2_options.source : undefined;
        return object(function() {
            self = this;
            self.linesInRange = function(range) {
                var lines;
                self = this;
                lines = source.split(new RegExp("\n"));
                return lines.slice(range.from - 1, range.to);
            };
            self.printLinesInRange = function(range) {
                var gen3_items, gen4_i, line;
                self = this;
                gen3_items = self.linesInRange(range);
                for (gen4_i = 0; gen4_i < gen3_items.length; gen4_i++) {
                    line = gen3_items[gen4_i];
                    process.stderr.write(line + "\n");
                }
            };
            self.printLocation = function(location) {
                var spaces, markers;
                self = this;
                process.stderr.write(filename + ":" + location.firstLine + "\n");
                self.printLinesInRange({
                    from: location.firstLine,
                    to: location.lastLine
                });
                spaces = self.duplicateStringTimes(" ", location.firstColumn);
                markers = self.duplicateStringTimes("^", location.lastColumn - location.firstColumn);
                return process.stderr.write(spaces + markers + "\n");
            };
            return self.duplicateStringTimes = function(s, n) {
                var strings, i;
                self = this;
                strings = [];
                for (i = 0; i < n; i = i + 1) {
                    strings.push(s);
                }
                return strings.join("");
            };
        });
    };
    require.extensions[".pogo"] = function(module, filename) {
        var content;
        content = jsFromPogoFile(filename);
        return module._compile(content, filename);
    };
})();