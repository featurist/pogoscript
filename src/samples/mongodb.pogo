mongodb = require 'mongodb'
assert = require 'assert'

server, address '127.0.0.1', port 27017 =
    new (mongodb: Server @address @port)

db, name, server (server?) =
    new (mongodb: Db @name @server)

test db = db, name 'test'

test @err @collection =
    collection: remove
        collection: insert {a 2} #err #docs
            collection: count #err #count
                console: log @count

            collection: find? : to array #err #results
                console: log (results: length)
                console: log (results: 0: a)

                test db: close!

test db: open
    test db: collection 'test_insert' @test
