((function() {
    var self, fs, ms, parser, parse, uglify, errors, _, readline, generateCode, beautify, compileFile, whenChanges, jsFilenameFromPogoFilename, evaluateLocally, evaluateGlobally, jsFromPogoFile, sourceLocationPrinter;
    self = this;
    fs = require("fs");
    ms = require("../lib/memorystream");
    parser = require("./parser");
    parse = parser.parse;
    uglify = require("uglify-js");
    errors = require("./codeGenerator/errors");
    _ = require("underscore");
    readline = require("readline");
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
        js = jsFromPogoFile(filename, {
            ugly: ugly
        });
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
            console.log("<" + token[0] + ">", token[1]);
        }
    };
    jsFilenameFromPogoFilename = function(pogo) {
        return pogo.replace(/\.pogo$/, "") + ".js";
    };
    self.runFile = function(filename) {
        var self;
        self = this;
        process.argv.shift();
        process.argv[0] = "pogo";
        process.argv[1] = fs.realpathSync(filename);
        return require("module").runMain();
    };
    self.compile = function(pogo, gen4_options) {
        var filename, inScope, ugly, global, self, moduleTerm, code;
        filename = gen4_options && gen4_options.filename != null ? gen4_options.filename : undefined;
        inScope = gen4_options && gen4_options.inScope != null ? gen4_options.inScope : true;
        ugly = gen4_options && gen4_options.ugly != null ? gen4_options.ugly : undefined;
        global = gen4_options && gen4_options.global != null ? gen4_options.global : false;
        self = this;
        moduleTerm = parse(pogo);
        moduleTerm.inScope = inScope;
        moduleTerm.global = global;
        code = generateCode(moduleTerm);
        if (!ugly) {
            code = beautify(code);
        }
        if (errors.hasErrors()) {
            errors.printErrors(sourceLocationPrinter({
                filename: filename,
                source: pogo
            }));
            return process.exit(1);
        } else {
            return code;
        }
    };
    evaluateLocally = function(pogo, gen5_options) {
        var definitions, js, definitionNames, parameters, runScript, definitionValues;
        definitions = gen5_options && gen5_options.definitions != null ? gen5_options.definitions : undefined;
        js = exports.compile(pogo, {
            ugly: true
        });
        definitionNames = _.keys(definitions);
        parameters = definitionNames.join(",");
        runScript = new Function(parameters, js);
        definitionValues = _.map(definitionNames, function(name) {
            return definitions[name];
        });
        return runScript.apply(undefined, definitionValues);
    };
    evaluateGlobally = function(pogo) {
        var js;
        js = exports.compile(pogo, {
            ugly: true,
            inScope: false,
            global: true
        });
        return eval(js);
    };
    self.evaluate = function(pogo, gen6_options) {
        var definitions, global, self;
        definitions = gen6_options && gen6_options.definitions != null ? gen6_options.definitions : undefined;
        global = gen6_options && gen6_options.global != null ? gen6_options.global : undefined;
        self = this;
        if (global) {
            if (definitions) {
                throw new Error("cannot evaluate globally with definitions");
            }
            return evaluateGlobally(pogo);
        } else {
            return evaluateLocally(pogo, {
                definitions: definitions || {}
            });
        }
    };
    self.repl = function() {
        var self, interface;
        self = this;
        interface = readline.createInterface(process.stdin, process.stdout);
        interface.setPrompt("> ");
        interface.prompt();
        interface.on("line", function(line) {
            try {
                console.log(exports.evaluate(line, {
                    global: true
                }));
            } catch (ex) {
                console.log(ex.message);
            }
            return interface.prompt();
        });
        return interface.on("close", function() {
            console.log();
            return process.exit(0);
        });
    };
    jsFromPogoFile = function(filename, gen7_options) {
        var ugly, contents;
        ugly = gen7_options && gen7_options.ugly != null ? gen7_options.ugly : undefined;
        contents = fs.readFileSync(filename, "utf-8");
        return exports.compile(contents, {
            filename: filename,
            ugly: ugly
        });
    };
    sourceLocationPrinter = function(gen8_options) {
        var filename, source;
        filename = gen8_options && gen8_options.filename != null ? gen8_options.filename : undefined;
        source = gen8_options && gen8_options.source != null ? gen8_options.source : undefined;
        return object(function() {
            var self;
            self = this;
            self.linesInRange = function(range) {
                var self, lines;
                self = this;
                lines = source.split(/\n/);
                return lines.slice(range.from - 1, range.to);
            };
            self.printLinesInRange = function(gen9_options) {
                var prefix, from, to, self, gen10_items, gen11_i, line;
                prefix = gen9_options && gen9_options.prefix != null ? gen9_options.prefix : "";
                from = gen9_options && gen9_options.from != null ? gen9_options.from : undefined;
                to = gen9_options && gen9_options.to != null ? gen9_options.to : undefined;
                self = this;
                gen10_items = self.linesInRange({
                    from: from,
                    to: to
                });
                for (gen11_i = 0; gen11_i < gen10_items.length; gen11_i++) {
                    line = gen10_items[gen11_i];
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
})).call(this);