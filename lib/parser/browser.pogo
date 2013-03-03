target = if ( typeof (window) == 'undefined' ) @{ this } else @{ window }
target.pogoscript = require './compiler'
