fs = require 'fs'

for each in (list, action) asynchronously (done) =
    outstanding callbacks = 0

    for each @(item) in (list)
        outstanding callbacks := outstanding callbacks + 1
        action (item) @(error, result)
            outstanding callbacks := outstanding callbacks - 1

            if (outstanding callbacks == 0)
                done (error)

filenames = fs.readdir! '.'

for each! @(filename) in (filenames) asynchronously
    stat = fs.stat! (filename)
    console.log "#(filename): #(stat.size)"

console.log ()
console.log "#(filenames.length) files in total"
