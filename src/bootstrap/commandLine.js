(function() {
    var self, fs, ms, parser, parse, uglify, errors, generateCode, beautify, compileFile, whenChanges, jsFilenameFromPogoFilename, jsFromPogoFile, sourceLocationPrinter;
    self = this;
    fs = require("fs");
    ms = require("../lib/memorystream");
    parser = require("./parser");
    parse = parser.parse;
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
    self.compileFile = compileFile = function(filename, gen1_options) {
        var ugly, js, jsFilename;
        ugly = gen1_options && gen1_options.ugly != null ? gen1_options.ugly : undefined;
        js = jsFromPogoFile(filename);
        if (!ugly) {
            js = beautify(js);
        }
        jsFilename = jsFilenameFromPogoFilename(filename);
        return fs.writeFileSync(jsFilename, js);
    };
    whenChanges = function(filename, act) {
        return fs.watchFile(filename, {
            persistent: true,
            interval: 500
        }, function(prev, curr) {
            if (curr.size === prev.size && curr.mtime.getTime() === prev.mtime.getTime()) {
                return;
            }
            return act();
        });
    };
    self.watchFile = function(filename, options) {
        var self, compile;
        self = this;
        compile = function() {
            console.log("compiling " + filename + " => " + jsFilenameFromPogoFilename(filename));
            return compileFile(filename, options);
        };
        compile();
        return whenChanges(filename, function() {
            return compile();
        });
    };
    self.lexFile = function(filename) {
        var self, source, tokens, gen2_items, gen3_i, token;
        self = this;
        source = fs.readFileSync(filename, "utf-8");
        tokens = parser.lex(source);
        gen2_items = tokens;
        for (gen3_i = 0; gen3_i < gen2_items.length; gen3_i++) {
            token = gen2_items[gen3_i];
            console.log("<" + token + ">");
        }
    };
    jsFilenameFromPogoFilename = function(pogo) {
        return pogo.replace(/\.pogo$/, "") + ".js";
    };
    self.runFile = function(filename) {
        var self, js;
        self = this;
        js = jsFromPogoFile(filename);
        module.filename = fs.realpathSync(filename);
        process.argv.shift();
        process.argv[0] = "pogo";
        return module._compile(js, filename);
    };
    jsFromPogoFile = function(filename) {
        var contents, term, code;
        contents = fs.readFileSync(filename, "utf-8");
        term = parse(contents);
        code = generateCode(term);
        if (errors.hasErrors()) {
            errors.printErrors(sourceLocationPrinter({
                filename: filename,
                source: contents
            }));
            return process.exit(1);
        } else {
            return code;
        }
    };
    sourceLocationPrinter = function(gen4_options) {
        var filename, source;
        filename = gen4_options && gen4_options.filename != null ? gen4_options.filename : undefined;
        source = gen4_options && gen4_options.source != null ? gen4_options.source : undefined;
        return object(function() {
            var self;
            self = this;
            self.linesInRange = function(range) {
                var self, lines;
                self = this;
                lines = source.split(/\n/);
                return lines.slice(range.from - 1, range.to);
            };
            self.printLinesInRange = function(gen5_options) {
                var prefix, from, to, self, gen6_items, gen7_i, line;
                prefix = gen5_options && gen5_options.prefix != null ? gen5_options.prefix : "";
                from = gen5_options && gen5_options.from != null ? gen5_options.from : undefined;
                to = gen5_options && gen5_options.to != null ? gen5_options.to : undefined;
                self = this;
                gen6_items = self.linesInRange({
                    from: from,
                    to: to
                });
                for (gen7_i = 0; gen7_i < gen6_items.length; gen7_i++) {
                    line = gen6_items[gen7_i];
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
}).call(this);