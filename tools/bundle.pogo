stitch = require 'stitch'

fs = require 'fs'

package = stitch.create package {
  identifier = 'pogoscript'
  paths = [
    __dirname + '/../lib'
    __dirname + '/../lib/terms'
    __dirname + '/../node_modules/underscore'
  ]
}

source = package.compile!
fs.write file ('html/pogo.js', source)
console.log('Compiled package.js')
