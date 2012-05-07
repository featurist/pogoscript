((function() {
    var self, fs, ms, parser, parse, uglify, errors, _, readline, util, Module, path, generateCode, beautify, compileFile, whenChanges, jsFilenameFromPogoFilename, evaluteReplLine, compileFromFile, sourceLocationPrinter;
    self = this;
    fs = require("fs");
    ms = require("../lib/memorystream");
    parser = require("./parser");
    parse = parser.parse;
    uglify = require("uglify-js");
    errors = require("./codeGenerator/errors");
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
        ugly = gen1_options && gen1_options.ugly != null ? gen1_options.ugly : undefined;
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
            (function(gen3_i) {
                var token, text;
                token = gen2_items[gen3_i];
                text = token[1] && "'" + token[1] + "'" || "";
                console.log("<" + token[0] + "> " + text);
            })(gen3_i);
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
    exports.compile = function(pogo, gen4_options) {
        var filename, inScope, ugly, global, returnResult, self, moduleTerm, code;
        filename = gen4_options && gen4_options.filename != null ? gen4_options.filename : undefined;
        inScope = gen4_options && gen4_options.inScope != null ? gen4_options.inScope : true;
        ugly = gen4_options && gen4_options.ugly != null ? gen4_options.ugly : undefined;
        global = gen4_options && gen4_options.global != null ? gen4_options.global : false;
        returnResult = gen4_options && gen4_options.returnResult != null ? gen4_options.returnResult : false;
        self = this;
        moduleTerm = parse(pogo);
        moduleTerm.inScope = inScope;
        moduleTerm.global = global;
        moduleTerm.returnResult = returnResult;
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
    exports.evaluate = function(pogo, gen5_options) {
        var definitions, global, self, js, definitionNames, parameters, runScript, definitionValues;
        definitions = gen5_options && gen5_options.definitions != null ? gen5_options.definitions : {};
        global = gen5_options && gen5_options.global != null ? gen5_options.global : false;
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
    compileFromFile = function(filename, gen6_options) {
        var ugly, contents;
        ugly = gen6_options && gen6_options.ugly != null ? gen6_options.ugly : undefined;
        contents = fs.readFileSync(filename, "utf-8");
        return exports.compile(contents, {
            filename: filename,
            ugly: ugly
        });
    };
    sourceLocationPrinter = function(gen7_options) {
        var filename, source;
        filename = gen7_options && gen7_options.filename != null ? gen7_options.filename : undefined;
        source = gen7_options && gen7_options.source != null ? gen7_options.source : undefined;
        return object(function() {
            var self;
            self = this;
            self.linesInRange = function(range) {
                var self, lines;
                self = this;
                lines = source.split(/\n/);
                return lines.slice(range.from - 1, range.to);
            };
            self.printLinesInRange = function(gen8_options) {
                var prefix, from, to, self, gen9_items, gen10_i;
                prefix = gen8_options && gen8_options.prefix != null ? gen8_options.prefix : "";
                from = gen8_options && gen8_options.from != null ? gen8_options.from : undefined;
                to = gen8_options && gen8_options.to != null ? gen8_options.to : undefined;
                self = this;
                gen9_items = self.linesInRange({
                    from: from,
                    to: to
                });
                for (gen10_i = 0; gen10_i < gen9_items.length; gen10_i++) {
                    (function(gen10_i) {
                        var line;
                        line = gen9_items[gen10_i];
                        process.stderr.write(prefix + line + "\n");
                    })(gen10_i);
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
                    (function(i) {
                        strings.push(s);
                    })(i);
                }
                return strings.join("");
            };
        });
    };
    require.extensions[".pogo"] = function(module, filename) {
        var self;
        self = this;
        return exports.runFileInModule(filename, module);
    };
})).call(this);