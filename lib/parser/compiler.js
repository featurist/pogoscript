(function() {
    var self = this;
    var ms, createParser, uglify, createTerms, beautify, generateCode, sourceLocationPrinter;
    ms = require("../../lib/memorystream");
    createParser = require("./parser").createParser;
    uglify = require("uglify-js");
    createTerms = function() {
        return require("./codeGenerator").codeGenerator();
    };
    beautify = function(code) {
        var ast, stream;
        ast = uglify.parse(code);
        stream = uglify.OutputStream({
            beautify: true
        });
        ast.print(stream);
        return stream.toString();
    };
    generateCode = function(term) {
        var memoryStream;
        memoryStream = new ms.MemoryStream();
        term.generateJavaScriptModule(memoryStream);
        return memoryStream.toString();
    };
    exports.compile = function(pogo, gen1_options) {
        var self = this;
        var filename, inScope, ugly, global, returnResult, async, terms;
        filename = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "filename") && gen1_options.filename !== void 0 ? gen1_options.filename : void 0;
        inScope = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "inScope") && gen1_options.inScope !== void 0 ? gen1_options.inScope : true;
        ugly = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "ugly") && gen1_options.ugly !== void 0 ? gen1_options.ugly : false;
        global = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "global") && gen1_options.global !== void 0 ? gen1_options.global : false;
        returnResult = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "returnResult") && gen1_options.returnResult !== void 0 ? gen1_options.returnResult : false;
        async = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "async") && gen1_options.async !== void 0 ? gen1_options.async : false;
        terms = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "terms") && gen1_options.terms !== void 0 ? gen1_options.terms : createTerms();
        var parser, statements, moduleTerm, code, memoryStream, error;
        parser = createParser({
            terms: terms
        });
        statements = parser.parse(pogo);
        if (async) {
            statements.asyncify({
                returnCallToContinuation: returnResult
            });
        }
        moduleTerm = terms.module(statements, {
            inScope: inScope,
            global: global,
            returnLastStatement: returnResult
        });
        code = generateCode(moduleTerm);
        if (parser.errors.hasErrors()) {
            memoryStream = new ms.MemoryStream();
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
    exports.evaluate = function(pogo, gen2_options) {
        var self = this;
        var definitions, ugly, global;
        definitions = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "definitions") && gen2_options.definitions !== void 0 ? gen2_options.definitions : {};
        ugly = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "ugly") && gen2_options.ugly !== void 0 ? gen2_options.ugly : true;
        global = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "global") && gen2_options.global !== void 0 ? gen2_options.global : false;
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
            var gen3_results, gen4_items, gen5_i, name;
            gen3_results = [];
            gen4_items = definitionNames;
            for (gen5_i = 0; gen5_i < gen4_items.length; ++gen5_i) {
                name = gen4_items[gen5_i];
                gen3_results.push(definitions[name]);
            }
            return gen3_results;
        }();
        return runScript.apply(undefined, definitionValues);
    };
    sourceLocationPrinter = function(gen6_options) {
        var filename, source;
        filename = gen6_options !== void 0 && Object.prototype.hasOwnProperty.call(gen6_options, "filename") && gen6_options.filename !== void 0 ? gen6_options.filename : void 0;
        source = gen6_options !== void 0 && Object.prototype.hasOwnProperty.call(gen6_options, "source") && gen6_options.source !== void 0 ? gen6_options.source : void 0;
        return object(function() {
            var self = this;
            self.linesInRange = function(range) {
                var self = this;
                var lines;
                lines = source.split(/\n/);
                return lines.slice(range.from - 1, range.to);
            };
            self.printLinesInRange = function(gen7_options) {
                var self = this;
                var prefix, from, to, buffer;
                prefix = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "prefix") && gen7_options.prefix !== void 0 ? gen7_options.prefix : "";
                from = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "from") && gen7_options.from !== void 0 ? gen7_options.from : void 0;
                to = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "to") && gen7_options.to !== void 0 ? gen7_options.to : void 0;
                buffer = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "buffer") && gen7_options.buffer !== void 0 ? gen7_options.buffer : buffer;
                var gen8_items, gen9_i, line;
                gen8_items = self.linesInRange({
                    from: from,
                    to: to
                });
                for (gen9_i = 0; gen9_i < gen8_items.length; ++gen9_i) {
                    line = gen8_items[gen9_i];
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