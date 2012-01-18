http = require 'http'

after @time @block =
    set timeout @block @time
    
@n seconds =
    n * 1000

@n minutes =
    (@n * 60) seconds

server = http : create server #req #res
    res : write "stuff\n"
    
    after (0.2 minutes)
        res : write "stuff\n"

        after (0.5 seconds)
            res : end "hello world\n"

server : listen 8000