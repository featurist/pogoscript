express = require 'express'
require '../bootstrap/runtime.pogo'

web server @methods, port 3000 =
    app = express : create server?

    app context = object =>
        : get @path @action =
            app : get @path #req #res
                request context = object =>
                    : request = req
                    : response = res
                    : stuff = 'stuff'
                
                res : send (action : call (request context))
    
    methods : call (app context)
    app : listen @port

web server, port 4567 =>
    : get '/' =>
        "Hello World\n"
