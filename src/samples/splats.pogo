util = require 'util'

printf @format @args ... =
    console: log (util: format @format @args ...)

printf "%s => %d" 'one' 3