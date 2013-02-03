fs = require 'fs'
create parser = require './parser'.create parser
Module = require 'module'
path = require 'path'
repl = require 'repl'
vm = require 'vm'
versions = require '../../lib/versions'
compiler = require './compiler'

create terms () = require './codeGenerator'.code generator ()

running on node (version) or higher =
    !versions.(process.version) is less than (version)

exports.compile file = compile file (filename, ugly: false) =
    js = compile from file (filename, ugly: ugly)

    js filename = js filename from pogo filename (filename)
    fs.write file sync (js filename, js)

when (filename) changes (act) =
    fs.watch file (filename) {persistent, interval 500} @(prev, curr)
        if ((curr.size == prev.size) && (curr.mtime.get time () == prev.mtime.get time ()))
            return
        
        act ()

exports.show compiling file (filename, options) =
    console.log "compiling #(filename) => #(js filename from pogo filename (filename))"
    compile file (filename, options)

exports.watch file (filename, options) =
    compile () =
        self.show compiling file (filename, options)

    compile ()

    when (filename) changes
        compile ()

exports.compile file if stale (filename, options) =
    js filename = js filename from pogo filename (filename)
    js file = if (fs.exists sync (js filename))
        fs.stat sync (js filename)

    if (!js file || (fs.stat sync (filename).mtime > js file.mtime))
        self.show compiling file (filename, options)

exports.lex file (filename) =
    source = fs.read file sync (filename) 'utf-8'
    parser = create parser (terms: create terms ())
    tokens = parser.lex (source)

    for each @(token) in (tokens)
        text = (token.1 && "'#(token.1)'") || ''
        console.log "<#(token.0)> #(text)"

js filename from pogo filename (pogo) =
    pogo.replace r/\.pogo$/ '' + '.js'

exports.run file (filename) in module (module) =
    js = compile from file (filename)
    module._compile (js, filename)

exports.run main (filename) =
    full filename = fs.realpath sync (filename)
    
    process.argv.shift ()
    process.argv.0 = 'pogo'
    process.argv.1 = full filename
    
    module = new (Module (full filename, null))
    process.main module = module
    module.id = '.'
    module.filename = full filename
    module.paths = Module._node module paths (path.dirname (full filename))
    exports.run file (full filename) in module (module)
    module.loaded = true

exports.repl () =
    compile pogo (source, filename, terms) =
        exports.compile (
            source
            filename: filename
            ugly: true
            in scope: false
            global: true
            return result: false
            async: true
            terms: terms
        )

    eval pogo (source with parens, context, filename, callback) =
        source = source with parens.replace r/^\(((.|[\r\n])*)\)$/mg '$1'
        terms = create terms ()
        js = compile pogo (source, filename, terms)

        if (source.trim () == '')
            callback ()
        else
            try
                context.(terms.callback function.canonical name ()) = callback
                result = vm.run (js) in context (context) (filename)
            catch (error)
                callback (error)

    if (running on node 'v0.8.0' or higher)
        repl.start (
            eval: eval pogo
        )
    else
        repl.start (undefined, undefined, eval pogo)

compile from file (filename, ugly: false) =
    contents = fs.read file sync (filename) 'utf-8'
    exports.compile (contents, filename: filename, ugly: ugly)

exports.compile = compiler.compile
exports.evaluate = compiler.evaluate
