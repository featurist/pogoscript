compiler = require '../lib/parser/compiler'
Bundler = require './bundler'.Bundler

bundler = @new Bundler ('pogoscript-tests', description: 'PogoScript Tests')

bundler.add files! 'lib/*.js'
bundler.add files! 'lib/terms/*.js'
bundler.add files! 'lib/parser/*.js'
bundler.add dependency!('underscore', file: 'node_modules/underscore/underscore.js')
bundler.add dependency!('should', contents: 'module.exports = chai.should();')
bundler.add dependency!('util', contents: 'exports.inspect = function(o){JSON.stringify(o, null, 2);};')

bundler.compile 'pogo' @(source) into
    compiler.compile (source)

bundler.add index files! 'test/*.js'
bundler.add index files! 'test/*.pogo'

js = bundler.build!

process.stdout.write (js)
