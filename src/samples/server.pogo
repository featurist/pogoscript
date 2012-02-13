http = require 'http'

after @time @block =
    set timeout @block @time
    
@n seconds =
    n * 1000

@n minutes =
    (@n * 60) seconds

server = http : create server #req #res
    res : write "stuff\n"
    
    after (0.05 minutes)
        res : write "stuff after 0.05 minutes\n"

        after (0.5 seconds)
            res : end "stuff after 0.5 seconds\n"

port = 8000
server : listen @port
console: log "run > curl localhost:@port"