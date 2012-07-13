((function() {
    var self, fs, ms, parser, parse, uglify, _, Module, path, repl, vm, versions, runningOnNodeOrHigher, generateCode, beautify, compileFile, whenChanges, jsFilenameFromPogoFilename, compileFromFile, sourceLocationPrinter;
    self = this;
    fs = require("fs");
    ms = require("../../lib/memorystream");
    parser = require("./parser");
    parse = parser.parse;
    uglify = require("uglify-js");
    _ = require("underscore");
    Module = require("module");
    path = require("path");
    repl = require("repl");
    vm = require("vm");
    versions = require("../../lib/versions");
    runningOnNodeOrHigher = function(version) {
        return !versions.isLessThan(process.version, version);
    };
    generateCode = function(term) {
        var memoryStream;
        memoryStream = new ms.MemoryStream;
        term.generateJavaScriptModule(memoryStream);
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
    exports.showCompilingFile = function(filename, options) {
        var self;
        self = this;
        console.log("compiling " + filename + " => " + jsFilenameFromPogoFilename(filename));
        return compileFile(filename, options);
    };
    exports.watchFile = function(filename, options) {
        var self, compile;
        self = this;
        compile = function() {
            return self.showCompilingFile(filename, options);
        };
        compile();
        return whenChanges(filename, function() {
            return compile();
        });
    };
    exports.compileFileIfStale = function(filename, options) {
        var self, jsFilename, jsFile;
        self = this;
        jsFilename = jsFilenameFromPogoFilename(filename);
        jsFile = function() {
            if (fs.existsSync(jsFilename)) {
                return fs.statSync(jsFilename);
            }
        }();
        if (!jsFile || fs.statSync(filename).mtime > jsFile.mtime) {
            return self.showCompilingFile(filename, options);
        }
    };
    exports.lexFile = function(filename) {
        var self, source, tokens, gen2_items, gen3_i, token, text;
        self = this;
        source = fs.readFileSync(filename, "utf-8");
        tokens = parser.lex(source);
        gen2_items = tokens;
        for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
            token = gen2_items[gen3_i];
            text = token[1] && "'" + token[1] + "'" || "";
            console.log("<" + token[0] + "> " + text);
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
        var filename, inScope, ugly, global, returnResult, self, moduleTerm, rewrittenModule, code;
        filename = gen4_options && gen4_options.hasOwnProperty("filename") && gen4_options.filename !== void 0 ? gen4_options.filename : void 0;
        inScope = gen4_options && gen4_options.hasOwnProperty("inScope") && gen4_options.inScope !== void 0 ? gen4_options.inScope : true;
        ugly = gen4_options && gen4_options.hasOwnProperty("ugly") && gen4_options.ugly !== void 0 ? gen4_options.ugly : false;
        global = gen4_options && gen4_options.hasOwnProperty("global") && gen4_options.global !== void 0 ? gen4_options.global : false;
        returnResult = gen4_options && gen4_options.hasOwnProperty("returnResult") && gen4_options.returnResult !== void 0 ? gen4_options.returnResult : false;
        self = this;
        moduleTerm = parse(pogo);
        moduleTerm.inScope = inScope;
        moduleTerm.global = global;
        moduleTerm.returnResult = returnResult;
        rewrittenModule = moduleTerm.rewrite();
        code = generateCode(rewrittenModule);
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
    exports.evaluate = function(pogo, gen5_options) {
        var definitions, global, self, js, definitionNames, parameters, runScript, definitionValues;
        definitions = gen5_options && gen5_options.hasOwnProperty("definitions") && gen5_options.definitions !== void 0 ? gen5_options.definitions : {};
        global = gen5_options && gen5_options.hasOwnProperty("global") && gen5_options.global !== void 0 ? gen5_options.global : false;
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
        var self, compilePogo, evalPogo;
        self = this;
        compilePogo = function(source, filename) {
            return exports.compile(source, {
                filename: filename,
                ugly: true,
                inScope: false,
                global: true,
                returnResult: false
            });
        };
        evalPogo = function(source, context, filename, callback) {
            var js, result;
            js = compilePogo(source, filename);
            try {
                result = vm.runInContext(js, context, filename);
                return callback(void 0, result);
            } catch (error) {
                return callback(error);
            }
        };
        if (runningOnNodeOrHigher("v0.8.0")) {
            return repl.start({
                eval: evalPogo
            });
        } else {
            return repl.start(undefined, undefined, evalPogo);
        }
    };
    compileFromFile = function(filename, gen6_options) {
        var ugly, contents;
        ugly = gen6_options && gen6_options.hasOwnProperty("ugly") && gen6_options.ugly !== void 0 ? gen6_options.ugly : false;
        contents = fs.readFileSync(filename, "utf-8");
        return exports.compile(contents, {
            filename: filename,
            ugly: ugly
        });
    };
    sourceLocationPrinter = function(gen7_options) {
        var filename, source;
        filename = gen7_options && gen7_options.hasOwnProperty("filename") && gen7_options.filename !== void 0 ? gen7_options.filename : void 0;
        source = gen7_options && gen7_options.hasOwnProperty("source") && gen7_options.source !== void 0 ? gen7_options.source : void 0;
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
                var prefix, from, to, self, gen9_items, gen10_i, line;
                prefix = gen8_options && gen8_options.hasOwnProperty("prefix") && gen8_options.prefix !== void 0 ? gen8_options.prefix : "";
                from = gen8_options && gen8_options.hasOwnProperty("from") && gen8_options.from !== void 0 ? gen8_options.from : void 0;
                to = gen8_options && gen8_options.hasOwnProperty("to") && gen8_options.to !== void 0 ? gen8_options.to : void 0;
                self = this;
                gen9_items = self.linesInRange({
                    from: from,
                    to: to
                });
                for (gen10_i = 0; gen10_i < gen9_items.length; ++gen10_i) {
                    line = gen9_items[gen10_i];
                    process.stderr.write(prefix + line + "\n");
                }
            };
            self.printLocation = function(location) {
                var self, spaces, markers;
                self = this;
                process.stderr.write(filename + ":" + location.firstLine + "\n");
                if (location.firstLine === location.lastLine) {
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
})).call(this);