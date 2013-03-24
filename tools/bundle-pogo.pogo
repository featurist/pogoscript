Bundler = require './bundler'.Bundler

bundler = @new Bundler ('pogoscript', description: 'PogoScript Compiler')

bundler.add files! 'lib/*.js'
bundler.add files! 'lib/terms/*.js'
bundler.add files! 'lib/parser/*.js'
bundler.add dependency! ('underscore', file: 'node_modules/underscore/underscore.js')
bundler.add index "module.exports = require('./lib/parser/compiler');"

js = bundler.build!

process.stdout.write (js)
