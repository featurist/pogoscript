((function() {
    var self, fs, ms, parser, parse, uglify, _, readline, util, Module, path, generateCode, beautify, compileFile, whenChanges, jsFilenameFromPogoFilename, evaluteReplLine, compileFromFile, sourceLocationPrinter;
    self = this;
    fs = require("fs");
    ms = require("../../lib/memorystream");
    parser = require("./parser");
    parse = parser.parse;
    uglify = require("uglify-js");
    _ = require("underscore");
    readline = require("readline");
    util = require("util");
    Module = require("module");
    path = require("path");
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
    exports.compileFile = compileFile = function(filename, gen1_options) {
        var ugly, js, jsFilename;
        ugly = gen1_options && gen1_options.hasOwnProperty("ugly") && gen1_options.ugly !== void 0 ? gen1_options.ugly : false;
        js = compileFromFile(filename, {
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
    exports.watchFile = function(filename, options) {
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
    exports.lexFile = function(filename) {
        var self, source, tokens, gen2_items, gen3_i;
        self = this;
        source = fs.readFileSync(filename, "utf-8");
        tokens = parser.lex(source);
        gen2_items = tokens;
        for (gen3_i = 0; gen3_i < gen2_items.length; gen3_i++) {
            var gen4_forResult;
            gen4_forResult = void 0;
            if (function(gen3_i) {
                var token, text;
                token = gen2_items[gen3_i];
                text = token[1] && "'" + token[1] + "'" || "";
                console.log("<" + token[0] + "> " + text);
            }(gen3_i)) {
                return gen4_forResult;
            }
        }
    };
    jsFilenameFromPogoFilename = function(pogo) {
        return pogo.replace(/\.pogo$/, "") + ".js";
    };
    exports.runFileInModule = function(filename, module) {
        var self, js;
        self = this;
        js = compileFromFile(filename);
        return module._compile(js, filename);
    };
    exports.runMain = function(filename) {
        var self, fullFilename, module;
        self = this;
        fullFilename = fs.realpathSync(filename);
        process.argv.shift();
        process.argv[0] = "pogo";
        process.argv[1] = fullFilename;
        module = new Module(fullFilename, null);
        process.mainModule = module;
        module.id = ".";
        module.filename = fullFilename;
        module.paths = Module._nodeModulePaths(path.dirname(fullFilename));
        exports.runFileInModule(fullFilename, module);
        return module.loaded = true;
    };
    exports.compile = function(pogo, gen5_options) {
        var filename, inScope, ugly, global, returnResult, self, moduleTerm, code;
        filename = gen5_options && gen5_options.hasOwnProperty("filename") && gen5_options.filename !== void 0 ? gen5_options.filename : void 0;
        inScope = gen5_options && gen5_options.hasOwnProperty("inScope") && gen5_options.inScope !== void 0 ? gen5_options.inScope : true;
        ugly = gen5_options && gen5_options.hasOwnProperty("ugly") && gen5_options.ugly !== void 0 ? gen5_options.ugly : false;
        global = gen5_options && gen5_options.hasOwnProperty("global") && gen5_options.global !== void 0 ? gen5_options.global : false;
        returnResult = gen5_options && gen5_options.hasOwnProperty("returnResult") && gen5_options.returnResult !== void 0 ? gen5_options.returnResult : false;
        self = this;
        moduleTerm = parse(pogo);
        moduleTerm.inScope = inScope;
        moduleTerm.global = global;
        moduleTerm.returnResult = returnResult;
        code = generateCode(moduleTerm);
        if (!ugly) {
            code = beautify(code);
        }
        if (parser.errors.hasErrors()) {
            parser.errors.printErrors(sourceLocationPrinter({
                filename: filename,
                source: pogo
            }));
            return process.exit(1);
        } else {
            return code;
        }
    };
    exports.evaluate = function(pogo, gen6_options) {
        var definitions, global, self, js, definitionNames, parameters, runScript, definitionValues;
        definitions = gen6_options && gen6_options.hasOwnProperty("definitions") && gen6_options.definitions !== void 0 ? gen6_options.definitions : {};
        global = gen6_options && gen6_options.hasOwnProperty("global") && gen6_options.global !== void 0 ? gen6_options.global : false;
        self = this;
        js = exports.compile(pogo, {
            ugly: true,
            inScope: !global,
            global: global,
            returnResult: global
        });
        definitionNames = _.keys(definitions);
        parameters = definitionNames.join(",");
        runScript = new Function(parameters, js);
        definitionValues = _.map(definitionNames, function(name) {
            return definitions[name];
        });
        return runScript.apply(undefined, definitionValues);
    };
    exports.repl = function() {
        var self, interface, prompt;
        self = this;
        interface = readline.createInterface(process.stdin, process.stdout);
        prompt = "λ ";
        interface.setPrompt(prompt, prompt.length);
        interface.prompt();
        interface.on("line", function(line) {
            evaluteReplLine(line);
            return interface.prompt();
        });
        return interface.on("close", function() {
            process.stdout.write("\n");
            return process.exit(0);
        });
    };
    evaluteReplLine = function(line) {
        try {
            var result;
            result = exports.evaluate(line, {
                global: true
            });
            return console.log(" =>", util.inspect(result, undefined, undefined, true));
        } catch (ex) {
            return console.log(ex.message);
        }
    };
    compileFromFile = function(filename, gen7_options) {
        var ugly, contents;
        ugly = gen7_options && gen7_options.hasOwnProperty("ugly") && gen7_options.ugly !== void 0 ? gen7_options.ugly : false;
        contents = fs.readFileSync(filename, "utf-8");
        return exports.compile(contents, {
            filename: filename,
            ugly: ugly
        });
    };
    sourceLocationPrinter = function(gen8_options) {
        var filename, source;
        filename = gen8_options && gen8_options.hasOwnProperty("filename") && gen8_options.filename !== void 0 ? gen8_options.filename : void 0;
        source = gen8_options && gen8_options.hasOwnProperty("source") && gen8_options.source !== void 0 ? gen8_options.source : void 0;
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
                var prefix, from, to, self, gen10_items, gen11_i;
                prefix = gen9_options && gen9_options.hasOwnProperty("prefix") && gen9_options.prefix !== void 0 ? gen9_options.prefix : "";
                from = gen9_options && gen9_options.hasOwnProperty("from") && gen9_options.from !== void 0 ? gen9_options.from : void 0;
                to = gen9_options && gen9_options.hasOwnProperty("to") && gen9_options.to !== void 0 ? gen9_options.to : void 0;
                self = this;
                gen10_items = self.linesInRange({
                    from: from,
                    to: to
                });
                for (gen11_i = 0; gen11_i < gen10_items.length; gen11_i++) {
                    var gen12_forResult;
                    gen12_forResult = void 0;
                    if (function(gen11_i) {
                        var line;
                        line = gen10_items[gen11_i];
                        process.stderr.write(prefix + line + "\n");
                    }(gen11_i)) {
                        return gen12_forResult;
                    }
                }
            };
            self.printLocation = function(location) {
                var self;
                self = this;
                process.stderr.write(filename + ":" + location.firstLine + "\n");
                if (location.firstLine === location.lastLine) {
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
                    var gen13_forResult;
                    gen13_forResult = void 0;
                    if (function(i) {
                        strings.push(s);
                    }(i)) {
                        return gen13_forResult;
                    }
                }
                return strings.join("");
            };
        });
    };
})).call(this);