fs = require 'fs'

fork (block) = block @{}

fork
    console.log "reading contents of file #(__filename)"
    contents = fs.read file (__filename,  'utf-8')!
    console.log ("contents of #(__filename):")
    process.stdout.write (contents)

console.log 'processing other stuff'
