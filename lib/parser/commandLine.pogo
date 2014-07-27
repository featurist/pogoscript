ms = require '../memorystream'
fs = require 'fs'
vm = require 'vm'
Module = require 'module'
path = require 'path'
repl = require 'repl'
versions = require '../versions'
compiler = require './compiler'

createTerms = require './codeGenerator'.codeGenerator

runningOnNode (version) orHigher =
    @not versions.(process.version) isLessThan (version)

exports.compileFile = compileFile (filename, ugly: false, promises: nil) =
    fullFilename = fs.realpathSync (filename)
    jsFilename = jsFilenameFromPogoFilename (filename)
    js = compileFromFile (filename, ugly: ugly, promises: promises, outputFilename: jsFilename)

    fs.writeFileSync (jsFilename, js)

when (filename) changes (act) =
    fs.watchFile (filename) {persistent, interval 500} @(prev, curr)
        if ((curr.size == prev.size) && (curr.mtime.getTime () == prev.mtime.getTime ()))
            return
        
        act ()

exports.showCompilingFile (filename, options) =
    console.log "compiling #(filename) => #(jsFilenameFromPogoFilename (filename))"
    compileFile (filename, options)

exports.watchFile (filename, options) =
    compile () =
        self.showCompilingFile (filename, options)

    compile ()

    when (filename) changes
        compile ()

exports.compileFileIfStale (filename, options) =
    jsFilename = jsFilenameFromPogoFilename (filename)
    jsFile = if (fs.existsSync (jsFilename))
        fs.statSync (jsFilename)

    if (@not jsFile || (fs.statSync (filename).mtime > jsFile.mtime))
        self.showCompilingFile (filename, options)

exports.lexFile (filename) =
    source = fs.readFileSync (filename) 'utf-8'
    tokens = exports.lex (source)

    for each @(token) in (tokens)
        text = (token.1 && "'#(token.1)'") || ''
        console.log "<#(token.0)> #(text)"

jsFilenameFromPogoFilename (pogo) =
    pogo.replace r/\.pogo$/ '' + '.js'

exports.runFile (filename) inModule (module, options) =
    js = compileFromFile (filename, options)
    module._compile (js, filename)

exports.runMain (filename, options) =
    fullFilename = fs.realpathSync (filename)
    
    process.argv.shift ()
    process.argv.0 = 'pogo'
    process.argv.1 = fullFilename
    
    module = new (Module (fullFilename, null))
    process.mainModule = module
    module.id = '.'
    module.filename = fullFilename
    module.paths = Module._nodeModulePaths (path.dirname (fullFilename))
    exports.runFile (fullFilename) inModule (module, options)
    module.loaded = true

exports.repl (promises: nil) =
  compilePogo (source, filename, terms) =
    exports.compile (
      source
      filename: filename
      ugly: true
      inScope: false
      global: true
      returnResult: false
      terms: terms
    )

  evalPogo (sourceWithParens, context, filename, callback) =
    source = sourceWithParens.replace r/^\(((.|[\r\n])*)\)$/mg '$1'
    terms = createTerms (promises: promises)

    terms.moduleConstants.onEachNewDefinition @(d)
      definitionJs = exports.generateCode (
        terms.statements [d]
        terms
        inScope: false
        global: true
      )
      vm.runInThisContext (definitionJs, filename)

    try
      js = compilePogo (source, filename, terms)

      if (source.trim () == '')
        callback ()
      else
        result = vm.runInThisContext (js, filename)
        if (result @and (typeof (result.then) == 'function'))
          result.then @(r)
            callback (nil, r)
          @(e)
            callback (e)
        else
          callback (nil, result)
    catch (error)
      callback (error)

  if (runningOnNode 'v0.8.0' orHigher)
    repl.start (eval: evalPogo, useGlobal: true)
  else
    repl.start (nil, nil, evalPogo)

compileFromFile (filename, ugly: false, outputFilename: nil, promises: nil) =
    contents = fs.readFileSync (filename) 'utf-8'
    exports.compile (contents, filename: filename, ugly: ugly, outputFilename: outputFilename, promises: promises)

exports.compile = compiler.compile
exports.generateCode = compiler.generateCode
exports.evaluate = compiler.evaluate
exports.lex = compiler.lex
