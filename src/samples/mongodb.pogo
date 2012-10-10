mongodb = require 'mongodb'
assert = require 'assert'

connect to mongodb (name, address: '127.0.0.1', port: 27017) =
    new (mongodb.Db (name, new (mongodb.Server (address, port)), safe: false))

test db = connect to mongodb 'test'

test db.open!()

collection = test db.collection 'test_insert'

collection.remove!()

console.log "inserting" {a 2}
docs = collection.insert! {a 2}

count = collection.count!()
console.log "document count: #(count)"

console.log "searching"
results = collection.find ().to array!()

console.log "found #(results.length) documents"
console.log "document:" (results.0)

test db.close!()
