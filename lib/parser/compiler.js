(function() {
    var self = this;
    var ms, createParser, createTerms, object, sm, beautify, serialise, sourceLocationPrinter;
    ms = require("../memorystream");
    createParser = require("./parser").createParser;
    createTerms = require("./codeGenerator").codeGenerator;
    object = require("./runtime").object;
    sm = require("source-map");
    beautify = function(code) {
        var uglify, ast, stream;
        uglify = require("uglify-js");
        ast = uglify.parse(code);
        stream = uglify.OutputStream({
            beautify: true
        });
        ast.print(stream);
        return stream.toString();
    };
    serialise = function(code) {
        if (code instanceof sm.SourceNode) {
            return code;
        } else {
            return new sm.SourceNode(0, 0, 0, code);
        }
    };
    exports.generateCode = function(term, terms, gen1_options) {
        var self = this;
        var inScope, global, returnResult, outputFilename, sourceMap;
        inScope = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "inScope") && gen1_options.inScope !== void 0 ? gen1_options.inScope : true;
        global = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "global") && gen1_options.global !== void 0 ? gen1_options.global : false;
        returnResult = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "returnResult") && gen1_options.returnResult !== void 0 ? gen1_options.returnResult : false;
        outputFilename = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "outputFilename") && gen1_options.outputFilename !== void 0 ? gen1_options.outputFilename : outputFilename;
        sourceMap = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "sourceMap") && gen1_options.sourceMap !== void 0 ? gen1_options.sourceMap : false;
        var moduleTerm, code;
        moduleTerm = terms.module(term, {
            inScope: inScope,
            global: global,
            returnLastStatement: returnResult
        });
        code = serialise(moduleTerm.generateModule());
        if (sourceMap) {
            return code.toStringWithSourceMap({
                file: outputFilename
            });
        } else {
            return code.toString();
        }
    };
    exports.compile = function(pogo, gen2_options) {
        var self = this;
        var filename, inScope, ugly, global, returnResult, async, outputFilename, sourceMap, promises, terms;
        filename = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "filename") && gen2_options.filename !== void 0 ? gen2_options.filename : void 0;
        inScope = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "inScope") && gen2_options.inScope !== void 0 ? gen2_options.inScope : true;
        ugly = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "ugly") && gen2_options.ugly !== void 0 ? gen2_options.ugly : false;
        global = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "global") && gen2_options.global !== void 0 ? gen2_options.global : false;
        returnResult = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "returnResult") && gen2_options.returnResult !== void 0 ? gen2_options.returnResult : false;
        async = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "async") && gen2_options.async !== void 0 ? gen2_options.async : false;
        outputFilename = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "outputFilename") && gen2_options.outputFilename !== void 0 ? gen2_options.outputFilename : void 0;
        sourceMap = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "sourceMap") && gen2_options.sourceMap !== void 0 ? gen2_options.sourceMap : false;
        promises = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "promises") && gen2_options.promises !== void 0 ? gen2_options.promises : void 0;
        terms = gen2_options !== void 0 && Object.prototype.hasOwnProperty.call(gen2_options, "terms") && gen2_options.terms !== void 0 ? gen2_options.terms : createTerms({
            promises: promises
        });
        var parser, statements, output, memoryStream, error;
        parser = createParser({
            terms: terms,
            filename: filename
        });
        statements = parser.parse(pogo);
        if (async) {
            statements.asyncify({
                returnCallToContinuation: returnResult
            });
        }
        output = exports.generateCode(statements, terms, {
            inScope: inScope,
            global: global,
            returnResult: returnResult,
            outputFilename: outputFilename,
            sourceMap: sourceMap
        });
        if (parser.errors.hasErrors()) {
            memoryStream = new ms.MemoryStream();
            parser.errors.printErrors(sourceLocationPrinter({
                filename: filename,
                source: pogo
            }), memoryStream);
            error = new Error(memoryStream.toString());
            error.isSemanticErrors = true;
            throw error;
        } else if (sourceMap) {
            output.map.setSourceContent(filename, pogo);
            return {
                code: output.code,
                map: JSON.parse(output.map.toString())
            };
        } else {
            if (!ugly) {
                return beautify(output);
            } else {
                return output;
            }
        }
    };
    exports.evaluate = function(pogo, gen3_options) {
        var self = this;
        var definitions, ugly, global;
        definitions = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "definitions") && gen3_options.definitions !== void 0 ? gen3_options.definitions : {};
        ugly = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "ugly") && gen3_options.ugly !== void 0 ? gen3_options.ugly : true;
        global = gen3_options !== void 0 && Object.prototype.hasOwnProperty.call(gen3_options, "global") && gen3_options.global !== void 0 ? gen3_options.global : false;
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
            var gen4_results, gen5_items, gen6_i, name;
            gen4_results = [];
            gen5_items = definitionNames;
            for (gen6_i = 0; gen6_i < gen5_items.length; ++gen6_i) {
                name = gen5_items[gen6_i];
                (function(name) {
                    return gen4_results.push(definitions[name]);
                })(name);
            }
            return gen4_results;
        }();
        return runScript.apply(undefined, definitionValues);
    };
    sourceLocationPrinter = function(gen7_options) {
        var filename, source;
        filename = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "filename") && gen7_options.filename !== void 0 ? gen7_options.filename : void 0;
        source = gen7_options !== void 0 && Object.prototype.hasOwnProperty.call(gen7_options, "source") && gen7_options.source !== void 0 ? gen7_options.source : void 0;
        return {
            linesInRange: function(range) {
                var self = this;
                var lines;
                lines = source.split(/\n/);
                return lines.slice(range.from - 1, range.to);
            },
            printLinesInRange: function(gen8_options) {
                var self = this;
                var prefix, from, to, buffer;
                prefix = gen8_options !== void 0 && Object.prototype.hasOwnProperty.call(gen8_options, "prefix") && gen8_options.prefix !== void 0 ? gen8_options.prefix : "";
                from = gen8_options !== void 0 && Object.prototype.hasOwnProperty.call(gen8_options, "from") && gen8_options.from !== void 0 ? gen8_options.from : void 0;
                to = gen8_options !== void 0 && Object.prototype.hasOwnProperty.call(gen8_options, "to") && gen8_options.to !== void 0 ? gen8_options.to : void 0;
                buffer = gen8_options !== void 0 && Object.prototype.hasOwnProperty.call(gen8_options, "buffer") && gen8_options.buffer !== void 0 ? gen8_options.buffer : buffer;
                var gen9_items, gen10_i, line;
                gen9_items = self.linesInRange({
                    from: from,
                    to: to
                });
                for (gen10_i = 0; gen10_i < gen9_items.length; ++gen10_i) {
                    line = gen9_items[gen10_i];
                    buffer.write(prefix + line + "\n");
                }
                return void 0;
            },
            printLocation: function(location, buffer) {
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
            },
            times: function(s, n) {
                var self = this;
                var strings, i;
                strings = [];
                for (i = 0; i < n; ++i) {
                    strings.push(s);
                }
                return strings.join("");
            }
        };
    };
    exports.lex = function(pogo) {
        var self = this;
        var parser;
        parser = createParser({
            terms: createTerms()
        });
        return parser.lex(pogo);
    };
}).call(this);