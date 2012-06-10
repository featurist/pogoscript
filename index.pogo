module.exports = require 'src/bootstrap/commandLine.js'

require.extensions.'.pogo' (module, filename) =
    exports.run file (filename) in module (module)
