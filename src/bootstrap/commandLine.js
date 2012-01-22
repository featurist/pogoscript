(function() {
    var self, fs, ms, parse, uglify, errors, generateCode, beautify, jsFilenameFromPogoFilename, jsFromPogoFile, sourceLocationPrinter;
    self = this;
    fs = require("fs");
    ms = require("../lib/memorystream");
    parse = require("./parser").parse;
    uglify = require("uglify-js");
    errors = require("./codeGenerator/errors");
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
        var self, ugly, js, jsFilename;
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
        return pogo.replace(new RegExp("\\.pogo$"), "") + ".js";
    };
    exports.runFile = function(filename) {
        var self, js;
        self = this;
        js = jsFromPogoFile(filename);
        module.filename = fs.realpathSync(filename);
        process.argv[1] = module.filename;
        return module._compile(js, filename);
    };
    jsFromPogoFile = function(filename) {
        var contents, term;
        contents = fs.readFileSync(filename, "utf-8");
        term = parse(contents);
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
            var self;
            self = this;
            self.linesInRange = function(range) {
                var self, lines;
                self = this;
                lines = source.split(new RegExp("\n"));
                return lines.slice(range.from - 1, range.to);
            };
            self.printLinesInRange = function(gen3_options) {
                var self, prefix, from, to, gen4_items, gen5_i, line;
                self = this;
                prefix = gen3_options && gen3_options.prefix != null ? gen3_options.prefix : "";
                from = gen3_options && gen3_options.from != null ? gen3_options.from : undefined;
                to = gen3_options && gen3_options.to != null ? gen3_options.to : undefined;
                gen4_items = self.linesInRange({
                    from: from,
                    to: to
                });
                for (gen5_i = 0; gen5_i < gen4_items.length; gen5_i++) {
                    line = gen4_items[gen5_i];
                    process.stderr.write(prefix + line + "\n");
                }
            };
            self.printLocation = function(location) {
                var self;
                self = this;
                process.stderr.write(filename + ":" + location.firstLine + "\n");
                if (location.firstLine == location.lastLine) {
                    var spaces, markers;
                    self.printLinesInRange({
                        from: location.firstLine,
                        to: location.lastLine
                    });
                    spaces = self.times(" ", location.firstColumn);
                    markers = self.times("^", location.lastColumn - location.firstColumn);
                    return process.stderr.write(spaces + markers + "\n");
                } else {
                    return self.printLinesInRange({
                        prefix: "> ",
                        from: location.firstLine,
                        to: location.lastLine
                    });
                }
            };
            return self.times = function(s, n) {
                var self, strings, i;
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
        var self, content;
        self = this;
        content = jsFromPogoFile(filename);
        return module._compile(content, filename);
    };
})();