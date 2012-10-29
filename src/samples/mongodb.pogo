mongodb = require 'mongodb'
assert = require 'assert'

open mongodb connection to (name, address: '127.0.0.1', port: 27017) =
    db = new (mongodb.Db (name, new (mongodb.Server (address, port)), safe: false))

with mongodb! (name, block, options) =
    db = open mongodb connection to (name, options)
    db.open!()
    block!(db)
    db.close!()
        
with mongodb! 'test' @(test db)
    collection = test db.collection 'test_insert'

    collection.remove!()

    console.log "inserting" {a 2}
    docs = collection.insert! {a 2}

    count = collection.count!()
    console.log "document count: #(count)"

    console.log "searching"
    results = collection.find ().to array!()

    console.log "found #(results.length) documents"

    for each @(doc) in (results)
        console.log "document:" (doc)
