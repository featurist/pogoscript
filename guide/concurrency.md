---
layout: doc
guide: Concurrency
weight: 7
---

Concurrency is one of the most fascinating aspects of computing, although I find it difficult to explain precisely why! For a long time it has been a very difficult proposition. While necessary in some situations, and just useful and many more, getting it right is so hard that it was rarely a viable option when building normal applications. My advice was often to avoid it completely and rely on the database to do the clever work of managing concurrent reads and writes.

For a long time mainstream languages only offered the shared memory model, which allows several concurrent processes to share the same memory space and manipulate objects by coordinating the timing of threads with locks. I can't overstate how notoriously difficult this is to do right! More recently we've seen message passing concurrency adopted in mainstream languages and frameworks: Erlang offers a very finegrained message passing model, Web Workers is based on message passing, and the entire internet could be thought of as a massive message passing machine.

In the message passing model each node has private state, is single threaded and communicates with other nodes by sending and receiving messages. Each node exposes its state through a higher-level messaging API, and crucially chooses _when_ to respond to messages, i.e. when it's state is consistent.

JavaScript, although not officially a message passing platform, behaves in very similar ways to nodes in a message passing model. JavaScript is single-threaded, and applications expose themselves through higher-level events and callbacks that can be handled when the application is ready and internally consistent.

JavaScript applications have an event loop. The event loop has a queue of events (aka messages) that have come from outside the application. Each event is handled one at a time until they're all done, at which point the runtime becomes idle waiting for further events.

The only way to get anything done in JavaScript is to handle an event. The very first "event" is of course fired when the script starts up, from there it may register new event handlers or callbacks that can be run on subsequent event loops. When an application makes a request for a resource outside the application it passes a handler function to call when the request is fulfilled.

What Pogoscript offers is a syntax that mimicks regular synchronous programming, but that has all the advantages of the asynchronous model. In JavaScript you can write concurrent software without having to worry about thread synchronisation and deadlocks. In Pogoscript you can write concurrent software without having to worry about callbacks. In practice this means you tend to write reliable concurrent software by default.

## Asynchronous Requests

Let's start with a simple HTTP GET request. Here we'll get details of a person who uses our system:

    personId = 'bob'
    response = httpism.get "http://api.app.com/people/#(personId)"!
    console.log(response.body)

Notice the `!` operator on the end of the request, this indicates that `httpism.get()` is asynchronous and to wait for the response before processing it further. Technically speaking the `!` ends the current event loop, leaving the JavaScript runtime to process other events or idle until the response is ready. When the response is ready our code is executed once more, this time starting where the `!` left off: assigning the request to the `request` variable and printing out the body.

Now if we want to wrap this up into a function, we can:

    printPerson(personId) =
      response = httpism.get "http://api.app.com/people/#(personId)"!
      console.log(response.body)

    printPerson 'bob'!

Notice that the function `printPerson` is also asynchronous, and if we want to wait for it to finish before moving on we have to call it with the `!` operator too. We don't _have_ to wait until it's finished, if we don't care then we can just call it without the `!` operator:

    printPerson 'bob'

Which is fine, but often we'll have something interesting to do after `printPerson()` that assumes that it has completed.

    printPerson 'bob'!
    printPerson 'mary'!
    console.log 'our favourite people...'

Here we print the details of both Bob and Mary, one after the other, then we print something nice about them.

## Promises

But what about concurrency? Can't we make HTTP requests for both Bob and Mary at the same time? Let's try:

    bobPromise = printPerson 'bob'
    maryPromise = printPerson 'mary'
    bobPromise!
    maryPromise!
    console.log 'our favourite people...'

When we call an asynchronous function like `printPerson()`, or indeed `httpism.get()` they return a **promise**, which is like saying "I promise to print Bob's details eventually, I'll let you know when I've done it." A promise is returned from `printPerson()`, we can wait for this promise to become fulfilled by using the `!` operator again, at which point we know that Bob's details have been printed. In the above code, we _ask_ to print Bob's and Mary's details, but without waiting for either to finish. Both of these requests are started at almost the same time and execute concurrently. We then wait for both of those requests to complete before printing `our favourite people...`.

## Avoiding Race Conditions

One of the problems with the above code is that we can't be sure that Bob's details will be printed before Mary's. The server may have had some contention on Bob's records in the database so his request, even though it was made very slightly earlier than Mary's, could come back slightly later. This is a common cause of bugs in concurrent software, and we call it a **race condition** when two or more operations are in a race to finish, and we can't be sure which will win. Fortunately in our example the consequences aren't terrible, but we'll fix it anyway, if only to ensure that the user sees the same order each time they run our app.

What we'll do is refactor our code a little. We'll separate getting the details from printing the details:

    personDetailsFor (personId) =
      httpism.get "http://api.app.com/people/#(personId)"!.body

    printPerson (person) =
      console.log (person)

Then we can get the details concurrently, but print them in order:

    bobPromise = personDetailsFor 'bob'
    maryPromise = personDetailsFor 'mary'

    printPerson (bobPromise!)
    printPerson (maryPromise!)
    console.log 'our favourite people...'

This way Bob's details will always be printed before Mary's, no matter which one came back from the server first.

## List Comprehensions

There is another way to do this too, using another Pogoscript feature called **list comprehensions**:

    people = [personId <- ['bob', 'mary'], personDetailsFor (personId)!]
    for each @(person) in (people)
      printPerson (person)

The list comprehension enumerates the people in the array `['bob', 'mary']` and calls `personDetailsFor()` on each of them. It does this concurrently, not waiting for each call to complete before requesting the next person. However, it does wait for all of the people's details to be returned before returning them, and crucially, it returns the people's details in the same order in which they were enumerated, i.e. Bob before Mary. Then we enumerate the details and print them.

The combination of asynchronous calls returning promises and list comprehensions form the foundation of concurrent programming in Pogoscript.

## Everything is Concurrent

You may think that the concurrency of the above example is only in executing the `personDetailsFor()` functions. There could be a long wait between making the requests and receiving all of them. How can we use that more efficiently?  In a larger application, there may be hundreds or thousands of other similar bits of code running at the same time, and while we wait for Bob and Mary's details, we may be making other requests to read files, run processes, query databases or interact with the user. The important thing is that this particular piece of code **always executes in the right order**.

## Promises and Functional Programming

As we've seen above, we can still write code that contains timing bugs. The important thing to remember is that concurrent asynchronous calls can execute in any order. We can use list comprehensions to ensure the order of responses, and we can use a functional programming approach to ensure that objects can be constructed concurrently, but also deterministically.

For example, let's say we want to have an object to cache the details of both Bob and Mary:

    people = {}

    addDetailsOf (id) =
      details = personDetailsFor (id)!
      people.(id) = details

    addDetailsOf 'bob'
    addDetailsOf 'mary'

Here we declare an object `people` to hold the details, and `addDetailsOf()` to add the details of each person. The trouble with this mechanism is that the `people` object isn't ready until both `addDetailsOf()` calls are done, but it's still accessible by the rest of the application. Let's say we have a function that repeatedly prints the value of `people` over time:

    setInterval @{
      console.log(people)
    } 100

We'll see that `people` starts off unpopulated, then we'll see Mary and Bob's details added to it over time. This might be interesting to see, but it could be a source of a bug if we're expecting both of our people to be present, let's say if we planned to email both of them:

    sendEmailTo (personId) =
      person = people.(personId)
      mailer.send! {
        subject = "hi"
        to = person.email
        body = "some details for you..."
      }

    sendEmailTo 'bob'!
    sendEmailTo 'mary'!

Unfortunately we now have a part of our application that assumes that `people` is populated. A better way to do this is to use promises more explicitly. Let's continue to use `people` as our cache, but let's make it a _promise_ of a cache. It _might_ be populated, or it might not, but we can always ensure that it _is_ populated before doing something with it. Instead of writing functions that manipulate our cache, let's write one function that returns our cache:

    detailsOfAllPeople () =
      bob = personDetailsFor 'bob'
      mary = personDetailsFor 'mary'
      {
        bob = bob!
        mary = mary!
      }

    people = detailsOfAllPeople()

Then, when we need to retrieve somebody from the cache, we ensure that the cache promise is fulfilled by using `people!`:

    sendEmailTo (personId) =
      person = people!.(personId)
      mailer.send! {
        subject = "hi"
        to = person.email
        body = "some details for you..."
      }

The first time we call `people!` we may have to wait for it to be populated. The second time however, it will have been populated and it will return the cache immediately. Of course there's a much more general way to make caches, let's make each _cache entry_ a promise:

    detailsOfAllPeople () =
      {
        bob = personDetailsFor 'bob'
        mary = personDetailsFor 'mary'
      }

    people = detailsOfAllPeople()

And then access the details as a promise:

    sendEmailTo (personId) =
      person = people.(personId)!
      mailer.send { subject = "hi", to = person.email, body = "some details for you..." }!

This way, `people` will be populated immediately but with promises of the poeple inside it. This way if someone's details are slow to come back, the rest of the people don't have to wait for their emails.

In fact, let's do it properly. Let's insert the caching behaviour into our `personDetailsFor()` function:

    personDetailsFor (personId) =
      getPersonDetails() =
        httpism.get "http://api.app.com/people/#(personId)"!.body

      cached = people.(personId)
      if (cached)
        cached
      else
        people.(personId) = getPersonDetails()

With this function we look in the cache first and return the promise of the user's details if it's there. Otherwise we make a request for the user's details, and put the promise into the cache.

Why is it better to keep promises in the cache instead of the actual user's details? Because the promise will be there as soon as we first request the details, any subsequent requests for the user will just return that promise. For example, if we put the _details_ into the cache and we ask for Mary's details twice in a row, the second request would check the cache and find Mary's details missing and make _another_ request for Mary's details from the server, making two requests to the server instead of one, and delaying the second request.

One way to look at promises is that they _are_ caches. Not only do they ensure (with `!`) that a value will _eventually_ be there, they guarantee that it will always be there.
