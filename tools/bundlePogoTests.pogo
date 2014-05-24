browserify = require 'browserify'
b = browserify(extensions: ['.pogo'])
b.transform 'pogoify'

glob = require 'glob'

specs = glob './test/*Spec.*' ^!.concat (glob './test/parser/*Spec.*' ^!)

for each @(spec) in (specs)
  b.add (spec)

b.bundle().pipe(process.stdout)
