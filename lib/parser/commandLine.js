(function() {
    var self = this;
    var fs, ms, createParser, uglify, Module, path, repl, vm, versions, createTerms, runningOnNodeOrHigher, generateCode, beautify, compileFile, whenChanges, jsFilenameFromPogoFilename, compileFromFile, sourceLocationPrinter;
    fs = require("fs");
    ms = require("../../lib/memorystream");
    createParser = require("./parser").createParser;
    uglify = require("uglify-js");
    Module = require("module");
    path = require("path");
    repl = require("repl");
    vm = require("vm");
    versions = require("../../lib/versions");
    createTerms = function() {
        return require("./codeGenerator").codeGenerator();
    };
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
        var ugly;
        ugly = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "ugly") && gen1_options.ugly !== void 0 ? gen1_options.ugly : false;
        var js, jsFilename;
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
        var self = this;
        console.log("compiling " + filename + " => " + jsFilenameFromPogoFilename(filename));
        return compileFile(filename, options);
    };
    exports.watchFile = function(filename, options) {
        var self = this;
        var compile;
        compile = function() {
            return self.showCompilingFile(filename, options);
        };
        compile();
        return whenChanges(filename, function() {
            return compile();
        });
    };
    exports.compileFileIfStale = function(filename, options) {
        var self = this;
        var jsFilename, jsFile;
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
        var self = this;
        var source, parser, tokens, gen2_items, gen3_i, token, text;
        source = fs.readFileSync(filename, "utf-8");
        parser = createParser({
            terms: createTerms()
        });
        tokens = parser.lex(source);
        gen2_items = tokens;
        for (gen3_i = 0; gen3_i < gen2_items.length; ++gen3_i) {
            token = gen2_items[gen3_i];
            text = token[1] && "'" + token[1] + "'" || "";
            console.log("<" + token[0] + "> " + text);
        }
        return void 0;
    };
    jsFilenameFromPogoFilename = function(pogo) {
        return pogo.replace(/\.pogo$/, "") + ".js";
    };
    exports.runFileInModule = function(filename, module) {
        var self = this;
        var js;
        js = compileFromFile(filename);
        return module._compile(js, filename);
    };
    exports.runMain = function(filename) {
        var self = this;
        var fullFilename, module;
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
        var self = this;
        var filename, inScope, ugly, global, returnResult, async, terms;
        filename = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "filename") && gen4_options.filename !== void 0 ? gen4_options.filename : void 0;
        inScope = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "inScope") && gen4_options.inScope !== void 0 ? gen4_options.inScope : true;
        ugly = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "ugly") && gen4_options.ugly !== void 0 ? gen4_options.ugly : false;
        global = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "global") && gen4_options.global !== void 0 ? gen4_options.global : false;
        returnResult = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "returnResult") && gen4_options.returnResult !== void 0 ? gen4_options.returnResult : false;
        async = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "async") && gen4_options.async !== void 0 ? gen4_options.async : false;
        terms = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "terms") && gen4_options.terms !== void 0 ? gen4_options.terms : createTerms();
        var parser, statements, moduleTerm, code, memoryStream, error;
        parser = createParser({
            terms: terms
        });
        statements = parser.parse(pogo);
        if (async) {
            statements.asyncify();
        }
        moduleTerm = terms.module(statements, {
            inScope: inScope,
            global: global,
            returnLastStatement: returnResult
        });
        code = generateCode(moduleTerm);
        if (parser.errors.hasErrors()) {
            memoryStream = new ms.MemoryStream;
            parser.errors.printErrors(sourceLocationPrinter({
                filename: filename,
                source: pogo
            }), memoryStream);
            error = new Error(memoryStream.toString());
            error.isSemanticErrors = true;
            throw error;
        } else {
            if (ugly) {
                return code;
            } else {
                return beautify(code);
            }
        }
    };
    exports.evaluate = function(pogo, gen5_options) {
        var self = this;
        var definitions, ugly, global;
        definitions = gen5_options !== void 0 && Object.prototype.hasOwnProperty.call(gen5_options, "definitions") && gen5_options.definitions !== void 0 ? gen5_options.definitions : {};
        ugly = gen5_options !== void 0 && Object.prototype.hasOwnProperty.call(gen5_options, "ugly") && gen5_options.ugly !== void 0 ? gen5_options.ugly : true;
        global = gen5_options !== void 0 && Object.prototype.hasOwnProperty.call(gen5_options, "global") && gen5_options.global !== void 0 ? gen5_options.global : false;
        var js, definitionNames, parameters, runScript, definitionValues;
        js = exports.compile(pogo, {
            ugly: ugly,
            inScope: !global,
            global: global,
            returnResult: !global
        });
        definitionNames = Object.keys(definitions);
        parameters = definitionNames.join(",");
        runScript = new Function(parameters, "return " + js + ";");
        definitionValues = function() {
            var gen6_results, gen7_items, gen8_i, name;
            gen6_results = [];
            gen7_items = definitionNames;
            for (gen8_i = 0; gen8_i < gen7_items.length; ++gen8_i) {
                name = gen7_items[gen8_i];
                gen6_results.push(definitions[name]);
            }
            return gen6_results;
        }();
        return runScript.apply(undefined, definitionValues);
    };
    exports.repl = function() {
        var self = this;
        var compilePogo, evalPogo;
        compilePogo = function(source, filename, terms) {
            return exports.compile(source, {
                filename: filename,
                ugly: true,
                inScope: false,
                global: true,
                returnResult: false,
                async: true,
                terms: terms
            });
        };
        evalPogo = function(sourceWithParens, context, filename, callback) {
            var source, terms, js, result;
            source = sourceWithParens.replace(/^\(((.|[\r\n])*)\)$/mg, "$1");
            terms = createTerms();
            js = compilePogo(source, filename, terms);
            if (source.trim() === "") {
                return callback();
            } else {
                try {
                    context[terms.callbackFunction.genVar] = callback;
                    return result = vm.runInContext(js, context, filename);
                } catch (error) {
                    return callback(error);
                }
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
    compileFromFile = function(filename, gen9_options) {
        var ugly;
        ugly = gen9_options !== void 0 && Object.prototype.hasOwnProperty.call(gen9_options, "ugly") && gen9_options.ugly !== void 0 ? gen9_options.ugly : false;
        var contents;
        contents = fs.readFileSync(filename, "utf-8");
        return exports.compile(contents, {
            filename: filename,
            ugly: ugly
        });
    };
    sourceLocationPrinter = function(gen10_options) {
        var filename, source;
        filename = gen10_options !== void 0 && Object.prototype.hasOwnProperty.call(gen10_options, "filename") && gen10_options.filename !== void 0 ? gen10_options.filename : void 0;
        source = gen10_options !== void 0 && Object.prototype.hasOwnProperty.call(gen10_options, "source") && gen10_options.source !== void 0 ? gen10_options.source : void 0;
        return object(function() {
            var self = this;
            self.linesInRange = function(range) {
                var self = this;
                var lines;
                lines = source.split(/\n/);
                return lines.slice(range.from - 1, range.to);
            };
            self.printLinesInRange = function(gen11_options) {
                var self = this;
                var prefix, from, to, buffer;
                prefix = gen11_options !== void 0 && Object.prototype.hasOwnProperty.call(gen11_options, "prefix") && gen11_options.prefix !== void 0 ? gen11_options.prefix : "";
                from = gen11_options !== void 0 && Object.prototype.hasOwnProperty.call(gen11_options, "from") && gen11_options.from !== void 0 ? gen11_options.from : void 0;
                to = gen11_options !== void 0 && Object.prototype.hasOwnProperty.call(gen11_options, "to") && gen11_options.to !== void 0 ? gen11_options.to : void 0;
                buffer = gen11_options !== void 0 && Object.prototype.hasOwnProperty.call(gen11_options, "buffer") && gen11_options.buffer !== void 0 ? gen11_options.buffer : buffer;
                var gen12_items, gen13_i, line;
                gen12_items = self.linesInRange({
                    from: from,
                    to: to
                });
                for (gen13_i = 0; gen13_i < gen12_items.length; ++gen13_i) {
                    line = gen12_items[gen13_i];
                    buffer.write(prefix + line + "\n");
                }
                return void 0;
            };
            self.printLocation = function(location, buffer) {
                var self = this;
                var spaces, markers;
                buffer.write(filename + ":" + location.firstLine + "\n");
                if (location.firstLine === location.lastLine) {
                    self.printLinesInRange({
                        from: location.firstLine,
                        to: location.lastLine,
                        buffer: buffer
                    });
                    spaces = self.times(" ", location.firstColumn);
                    markers = self.times("^", location.lastColumn - location.firstColumn);
                    return buffer.write(spaces + markers + "\n");
                } else {
                    return self.printLinesInRange({
                        prefix: "> ",
                        from: location.firstLine,
                        to: location.lastLine,
                        buffer: buffer
                    });
                }
            };
            return self.times = function(s, n) {
                var self = this;
                var strings, i;
                strings = [];
                for (i = 0; i < n; ++i) {
                    strings.push(s);
                }
                return strings.join("");
            };
        });
    };
}).call(this);