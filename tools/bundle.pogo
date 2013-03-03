fs = require 'fs'
glob = require 'glob'
Builder = require 'component-builder'
path = require 'path'

builder = @new Builder (__dirname + '/../component')
builder.conf = {name = 'pogoscript'}

root (dir) = __dirname + '/../' + dir

add files! (pattern) =
    file paths = glob! (root (pattern))
    for each @(file path) in (file paths)
        file = path.relative (__dirname + '/../', file path)
        contents = fs.read file! (file, 'utf-8')
        builder.add file ('scripts', file, contents)

contents of file! (path) =
    fs.read file! (path, 'utf-8')

add files! 'lib/*.js'
add files! 'lib/terms/*.js'
add files! 'lib/parser/*.js'
builder.add file ('scripts', 'deps/underscore.js', contents of file! 'node_modules/underscore/underscore.js')
builder.add file ('scripts', 'index.js', "module.exports = require('./lib/parser/compiler');")

build script from builder! (builder) with global name (name) =
    package = builder.build!
    ";(function(){
       #(package.require)
       #(package.js)
       if (typeof exports == 'object') {
         module.exports = require('#(name)');
       } else if (typeof define == 'function' && define.amd) {
         define(function(){ return require('#(name)'); });
       } else if (typeof window == 'undefined') {
         this['#(name)'] = require('#(name)');
       } else {
         window['#(name)'] = require('#(name)');
       }
     })();"

js = build script from builder! (builder) with global name 'pogoscript'

process.stdout.write (js)
