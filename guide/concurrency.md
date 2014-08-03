---
layout: doc
guide: Concurrency
weight: 7
---

Concurrency is one of the most fascinating aspects of computing. It offers so much, yet is so hard to do right. For a long time mainstream languages only offered the shared-state concurrency model, using mutexes to coordinate threads as they manipulated shared objects. It's hard to overstate how notoriously difficult it is to make reliable concurrent software like this! It's so hard to do that its very rarely done at all.

By contrast JavaScript is single-threaded, which certainly simplifies things, but how can you write concurrent applications in a single-threaded environment?

JavaScript uses an **asynchronous programming model**. This means that when you ask for an external resource, like the contents of a file or a database query, it sends a request for that resource and continues. It doesn't block or wait for that resource to become ready. Instead you add a **callback function** to the request which is called when the resource is ready. When the callback function is called with the resource, it's done on the same single thread, so you can manipulate the application state without needing mutexes or thread synchronisation.

## Promises

Pogoscript models these asynchronous interactions using **promises**. Promises are a "promise to deliver a result in the near future." When you ask for an external resource, you don't receive the resource immediately, you receive a promise of that external resource.

    promise = httpism.get "http://api.app.com/people/bob"

But a promise of a response on it's own isn't very much use to us, we need the actual response before we can do anything interesting...

## The Resolve Operator: `!`

The `!` operator is a very special operator in Pogoscript: it waits for a promise to turn into a real value. It does this by splitting your code into two bits: the code before the `!` and the code after. The code after the `!` doesn't run until the promise is resolved. While it's waiting your application can continue to handle other events. Let's resolve that promise and do something with the response:

    promise = httpism.get "http://api.app.com/people/bob"
    response = promise!
    console.log(response.body)

In terms of the asynchronous programming model:

1. We start out by making a request to a HTTP server.
2. In return we get a promise of the response, but nothing has happened yet.
3. Then we use the `!` operator, which, behind the scenes registers a callback function that will be called when the HTTP server responds.
4. We wait for a few milliseconds. Our application can process other events in this time.
5. The server responds, and the code after the `!` is executed
6. The promise resolves, returning the HTTP response
7. We print out the body of the response

We can reduce our code into one line, resolving the promise inline:

    bob = httpism.get "http://api.app.com/people/bob"!.body
    console.log(bob)

Now if we want to wrap this up into a function, we can do that too:

    printPerson(personId) =
      response = httpism.get "http://api.app.com/people/#(personId)"!
      console.log(response.body)

    printPerson 'bob'

Now because the `printPerson()` function resolves a promise using the `!` operator, it too returns a promise. We can use this promise to wait for Bob's details to be printed:

    printBobPromise = printPerson 'bob'
    console.log "waiting for bob's details..."
    printBobPromise!
    console.log "bob's details printed"

More commonly we expect things to finish before proceeding so we use the `!` on the function call itself.

    printPerson 'bob'!
    printPerson 'mary'!
    console.log 'our favourite people...'

Here we print the details of both Bob and Mary, one after the other, then we print something nice about them.

To print out Bob and Mary's details concurrently however, we can _start_ printing each of their details, then wait for them both to complete:

    bobPromise = printPerson 'bob'
    maryPromise = printPerson 'mary'
    bobPromise!
    maryPromise!
    console.log 'our favourite people...'

## Avoiding Race Conditions

One of the problems with the above code is that we can't be sure that Bob's details will be printed before Mary's. For all kinds of reasons, Mary's details might be returned before Bob's and hers will be printed first. It's likely to happen 50% of the time in this case. This is a very common cause of bugs in concurrent software, and we call it a **race condition** when two or more operations are in a race to finish, and we can't be sure which will win. Fortunately in our example the consequences aren't terrible, but it's wise to fix it anyway, if only to ensure that the user sees the same order each time they run our app.

What we'll do is refactor our code a little. We'll separate fetching the details from printing the details:

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

Each of their promises resolve to their details, which we print. Doing it this way, Bob's details will always be printed before Mary's, no matter which one came back from the server first.

## List Comprehensions

There is another way to do this too, using another Pogoscript feature called **list comprehensions**:

    people = [
      personId <- ['bob', 'mary']
      personDetailsFor (personId)!
    ]

    for each @(person) in (people)
      printPerson (person)

The list comprehension enumerates the people in the array `['bob', 'mary']` and calls `personDetailsFor()` on each of them. When we use the `!` operator in a list comprehension it does this concurrently, not waiting for each call to complete before making the next one. However, it does wait for all of the people's details to come back before returning them, and crucially, it always returns the people's details in the same order in which they were enumerated, i.e. Bob before Mary. Then we enumerate the details and print them.

## Promises and Functional Programming

As we've seen above, we can still write code that contains race conditions. The important thing to remember is that concurrent asynchronous calls can execute in any order.

Functional programming is a very useful tool in preventing race conditions. If our asynchronous functions manipulate application state, they can do it in any order and we are susceptible to race conditions. If, instead of writing functions that manipulate application state, we write functions that return new state, then we can ensure that we always get the same thing, regardless of the order in which events occurred. This is functional programming style, which is generally useful when writing software, but it's also very useful when writing concurrent software.

For example, let's say we want to download the details of both Bob and Mary so we can use them later:

    peopleCache = {}

    cacheDetailsOf (id) =
      details = personDetailsFor (id)!
      peopleCache.(id) = details

    cacheDetailsOf 'bob'
    cacheDetailsOf 'mary'

Here we declare an object `peopleCache` to hold the details, and `cacheDetailsOf()` to add the details of each person. The trouble with this code is that the `peopleCache` can be populated at any moment in the future. We can't be sure _when_ it will be populated, or even _if_ it will be populated in case there are errors. Unfortunately this uncertainty is exposed to the rest of the application.

For example, if we had a button that sent a message to one of our users:

    sendEmailTo (personId) =
      person = peopleCache.(personId)
      mailer.send! {
        subject = "hi"
        to = person.email
        body = "some details for you..."
      }

Unfortunately we now have a part of our application that assumes that `peopleCache` is populated. So if somebody clicked that button too soon, before the details were cached, it wouldn't work.

A better way to do this is to use promises more explicitly. Let's continue to use `peopleCache` as our cache, but let's make it a _promise_ of a cache. It _might_ be populated, or it might not, but we can always ensure that it _is_ populated before doing something with it. Instead of writing functions that manipulate our cache, let's use a functional style and write a function that returns our cache:

    detailsOfAllPeople () =
      bob = personDetailsFor 'bob'
      mary = personDetailsFor 'mary'
      {
        bob = bob!
        mary = mary!
      }

    peopleCache = detailsOfAllPeople()

Then, when we need to retrieve somebody from the cache, we ensure that the cache promise is fulfilled by using `peopleCache!`:

    sendEmailTo (personId) =
      person = peopleCache!.(personId)
      mailer.send! {
        subject = "hi"
        to = person.email
        body = "some details for you..."
      }

We resolve the `peopleCache` everytime we try to send an email to somebody: the first time we call `peopleCache!` we may have to wait for it to be populated. The second time, and all subsequent times, it will have been populated and it will return the cache immediately.

But what if Bob's details take a long time to load, but Mary's came back quickly: ideally we should still be able to send Mary an email. Let's try a different approach and make each _cache entry_ a promise:

    detailsOfAllPeople () =
      {
        bob = personDetailsFor 'bob'
        mary = personDetailsFor 'mary'
      }

    peopleCache = detailsOfAllPeople()

And then access the details as a promise:

    sendEmailTo (personId) =
      person = peopleCache.(personId)!
      mailer.send {
        subject = "hi"
        to = person.email
        body = "some details for you..."
      }!

This way, `peopleCache` will be populated immediately but with promises of the poeple inside it. If one person's details are slow to come back we can still send emails to the others.

In fact, let's do it properly. Let's put the caching behaviour into our `personDetailsFor()` function. That way the rest of our application doesn't need to know about how we cache each person:

    personDetailsFor (personId) =
      getPersonDetails() =
        httpism.get "http://api.app.com/people/#(personId)"!.body

      cached = peopleCache.(personId)
      if (cached)
        cached
      else
        peopleCache.(personId) = getPersonDetails()

With this function we look in the cache first and return the promise of the user's details if it's there. Otherwise we make a request for the user's details, and put the promise into the cache.

One way to look at promises is that they _are_ caches. Not only do they ensure (with `!`) that a value will _eventually_ be there, once resolved, the value will _always_ be there.

## Timing

Promises aren't just useful for getting information, they're also useful in getting _timing_ information. For example, we might not be interested in Mary's details, we might be interested knowing _when_ Mary's details are ready.

From a UI perspective, we might want to indicate to the user that we have a person's details, and that they can send them an email. We can disable the "email" button initially, and enable it when their details are ready.

    button.disabled = true
    personDetailsFor 'mary'!
    button.disabled = false

Here we rely on caching a little bit: we're making a request for Mary's details even though we're not interested in them. What we are interested in is the timing, we want to know when Mary's details are ready so we can enable the button.

## FIN

With a combination of the `!` operator, promises and list comprehensions, writing reliable concurrent software in Pogoscript is very easy, so much so that we tend to do it all the time.
