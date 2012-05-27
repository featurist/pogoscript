mongodb = require 'mongodb'
assert = require 'assert'

server (address: '127.0.0.1', port: 27017) =
    new (mongodb.Server (address, port))

db (name: nil, svr: server ()) =
    new (mongodb.Db (name, svr))

test db = db (name: 'test')

test (err, collection) =
    collection.remove
        console.log "inserting" {a 2}
        collection.insert {a 2} @(err, docs)
            collection.count @(err, count)
                console.log "document count: #(count)"

            console.log "searching"
            collection.find ().to array @(err, results)
                console.log "found #(results.length) documents"
                console.log "document:" (results.0)

                test db.close ()

test db.open
    test db.collection 'test_insert' (test)
