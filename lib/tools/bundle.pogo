browserify = require 'browserify'
fs = require 'fs'
glob = require 'glob'
compiler = require '../parser/compiler'

cli = require '../optionParser'.create parser ()

cli.option '-t, --test include tests'
options = cli.parse (process.argv.slice (2))

root (dir) = __dirname + '/../../' + dir

bundle = browserify ()

add files! (pattern) =
    files = glob! (root (pattern))
    for each @(file) in (files)
        bundle.require (file)

add files! 'lib/terms/*.js'
add files! 'lib/*.js'

bundle.register '.pogo' @(pogo)
    compiler.compile (pogo)

add entries! (patterns, ...) =
    for each @(pattern) in (patterns)
        files = glob! (root (pattern))
        for each @(spec) in (files)
            bundle.add entry (spec)

if (options.test)
    add entries! 'test/*Spec.pogo' 'test/terms/*Spec.pogo' 'test/parser/*Spec.pogo'
else
    bundle.add entry (root 'lib/parser/browser.js')

js = bundle.bundle ()

process.stdout.write (js)
