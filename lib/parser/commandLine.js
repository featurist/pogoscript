(function() {
    var self = this;
    var ms, fs, vm, Module, path, repl, versions, compiler, createTerms, runningOnNodeOrHigher, compileFile, whenChanges, jsFilenameFromPogoFilename, compileFromFile;
    ms = require("../memorystream");
    fs = require("fs");
    vm = require("vm");
    Module = require("module");
    path = require("path");
    repl = require("repl");
    versions = require("../versions");
    compiler = require("./compiler");
    createTerms = require("./codeGenerator").codeGenerator;
    runningOnNodeOrHigher = function(version) {
        return !versions.isLessThan(process.version, version);
    };
    exports.compileFile = compileFile = function(filename, gen1_options) {
        var ugly, promises;
        ugly = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "ugly") && gen1_options.ugly !== void 0 ? gen1_options.ugly : false;
        promises = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "promises") && gen1_options.promises !== void 0 ? gen1_options.promises : void 0;
        var fullFilename, jsFilename, js;
        fullFilename = fs.realpathSync(filename);
        jsFilename = jsFilenameFromPogoFilename(filename);
        js = compileFromFile(filename, {
            ugly: ugly,
            promises: promises,
            outputFilename: jsFilename
        });
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
        var source, tokens, gen2_items, gen3_i, token, text;
        source = fs.readFileSync(filename, "utf-8");
        tokens = exports.lex(source);
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
    exports.runFileInModule = function(filename, module, options) {
        var self = this;
        var js;
        js = compileFromFile(filename, options);
        return module._compile(js, filename);
    };
    exports.runMain = function(filename, options) {
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
        exports.runFileInModule(fullFilename, module, options);
        return module.loaded = true;
    };
    exports.repl = function(gen4_options) {
        var self = this;
        var promises;
        promises = gen4_options !== void 0 && Object.prototype.hasOwnProperty.call(gen4_options, "promises") && gen4_options.promises !== void 0 ? gen4_options.promises : void 0;
        var compilePogo, evalPogo;
        compilePogo = function(source, filename, terms) {
            return exports.compile(source, {
                filename: filename,
                ugly: true,
                inScope: false,
                global: true,
                returnResult: false,
                terms: terms
            });
        };
        evalPogo = function(sourceWithParens, context, filename, callback) {
            var source, terms, js, result;
            source = sourceWithParens.replace(/^\(((.|[\r\n])*)\)$/gm, "$1");
            terms = createTerms({
                promises: promises
            });
            terms.moduleConstants.onEachNewDefinition(function(d) {
                var definitionJs;
                definitionJs = exports.generateCode(terms.statements([ d ]), terms, {
                    inScope: false,
                    global: true
                });
                return vm.runInThisContext(definitionJs, filename);
            });
            try {
                js = compilePogo(source, filename, terms);
                if (source.trim() === "") {
                    return callback();
                } else {
                    result = vm.runInThisContext(js, filename);
                    if (result && typeof result.then === "function") {
                        return result.then(function(r) {
                            return callback(void 0, r);
                        }, function(e) {
                            return callback(e);
                        });
                    } else {
                        return callback(void 0, result);
                    }
                }
            } catch (error) {
                return callback(error);
            }
        };
        if (runningOnNodeOrHigher("v0.8.0")) {
            return repl.start({
                eval: evalPogo,
                useGlobal: true
            });
        } else {
            return repl.start(void 0, void 0, evalPogo);
        }
    };
    compileFromFile = function(filename, gen5_options) {
        var ugly, outputFilename, promises;
        ugly = gen5_options !== void 0 && Object.prototype.hasOwnProperty.call(gen5_options, "ugly") && gen5_options.ugly !== void 0 ? gen5_options.ugly : false;
        outputFilename = gen5_options !== void 0 && Object.prototype.hasOwnProperty.call(gen5_options, "outputFilename") && gen5_options.outputFilename !== void 0 ? gen5_options.outputFilename : void 0;
        promises = gen5_options !== void 0 && Object.prototype.hasOwnProperty.call(gen5_options, "promises") && gen5_options.promises !== void 0 ? gen5_options.promises : void 0;
        var contents;
        contents = fs.readFileSync(filename, "utf-8");
        return exports.compile(contents, {
            filename: filename,
            ugly: ugly,
            outputFilename: outputFilename,
            promises: promises
        });
    };
    exports.compile = compiler.compile;
    exports.generateCode = compiler.generateCode;
    exports.evaluate = compiler.evaluate;
    exports.lex = compiler.lex;
}).call(this);