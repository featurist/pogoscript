fs = require 'fs'
glob = require 'glob'
Builder = require 'component-builder'
path = require 'path'
class = require '../lib/class'.class

root (dir) = __dirname + '/../' + dir

(file) ext = r/\.(.*)$/.exec (file).1
(file) as js = file.replace(r/\.(.*)$/, '.js')
(file) without ext = file.replace(r/\.(.*)$/, '')

exports.Bundler = class {
    constructor (name, description: description) =
        self.builder = @new Builder (__dirname)
        self.builder.conf = {name = name}
        self.name = name
        self.description = description
        self.compilers = {}
        self.indexes = []
        
    add files! (pattern, add to index: false) =
        file paths = glob! (root (pattern))
        for each @(file path) in (file paths)
            file = path.relative (__dirname + '/../', file path)
            contents = self.compile! (file)
            self.builder.add file ('scripts', (file) as js, contents)
            if (add to index)
                self.indexes.push "require('./#((file) without ext)');"

    add dependency! (name, file: nil, contents: nil) =
        file contents = nil

        if (file)
            file contents := self.contents of file! (file)
        else if (contents)
            file contents := contents

        if (file contents)
            self.builder.add file ('scripts', "deps/#(name).js", file contents)
        else
            throw 'expected either content or file'
        
    add file (file) with source (source) =
        self.builder.add file ('scripts', file, source)

    add index files! (pattern) =
        self.add files! (pattern, add to index: true)

    add index (contents) =
        self.indexes.push (contents)

    compile into (ext, compiler) =
        self.compilers.(ext) = compiler

    compile! (file) =
        extension = (file) ext

        source = self.contents of file! (file)
        debugger
        compile = self.compilers.(extension)

        if (compile)
            compile (source)
        else
            source

    build index () =
        index = self.indexes.join "\n"
        self.builder.add file ('scripts', 'index.js', index)

    build! =
        self.build index ()

        package = self.builder.build!
        "/* #(self.description) */
         ;(function(){
           #(package.require)
           #(package.js)
           if (typeof exports == 'object') {
             module.exports = require('#(self.name)');
           } else if (typeof define == 'function' && define.amd) {
             define(function(){ return require('#(self.name)'); });
           } else if (typeof window == 'undefined') {
             this['#(self.name)'] = require('#(self.name)');
           } else {
             window['#(self.name)'] = require('#(self.name)');
           }
         })();"

    contents of file! (path) =
        fs.read file! (path, 'utf-8')
}
