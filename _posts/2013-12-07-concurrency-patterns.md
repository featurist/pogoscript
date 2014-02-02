---
layout: post
title: Concurrency Patterns
---

PogoScript has several primitives that make concurrency in Node.js apps very easy. We'll explore a few common concurrency use cases that are easily written and maintained in PogoScript.

# Concurrency

Concurrency in PogoScript is based on Node's support for non-blocking IO. Node apps are single-threaded, but they can launch operations in the background such as other processes and network IO. When those operations complete they call an event handler on the main app thread. In the meantime the main app thread is free to perform other computations or launch other IO operations. PogoScript's concurrency support is primarily in coordinating those concurrent operations.

## Node IO Primer

If you're not familiar with IO in Node, here's a quick primer. In regular environments such as Java, C# or C, one would read a file in a blocking manner, similar to this:

    String contents = File.ReadAllText("afile.txt");
    Console.WriteLine(contents);

The result of `File.ReadAllText()` is the contents of the file. (This is C# by the way, but most languages follow the same semantics.) The calling thread blocks while the file is being read from the disk.

In Node, on the other hand, you pass a **callback** that will be called the contents of the file when the `readFile()` operation completes. The callback receives ether an error or the contents of the file.

    fs.readFile('afile.txt', 'utf-8', function (error, contents) {
        if (error) {
            console.log('error loading file', error);
        } else {
            console.log(contents);
        }
    });
    doOtherStuff();

This is known as asynchronous IO, and the function `fs.readFile` is asynchronous. The JavaScript here is a little more verbose than the C# above, but there are many advantages to doing it this way. The first being that, because the thread is not blocked on reading the file, it can `doOtherStuff()` while reading the file, and therein lies Node's support for concurrency, and it's a beautiful thing.

Of course you can get concurrent behaviour in most other languages, including C# and Java, using threads. Threads allow you to do several things at the same time, but they are extremely difficult to get right, especially when you're sharing data between the threads. In fact they're so hard to get right that many experienced programmers are reluctant to use them at all.

In Node, all code is executed on the same thread, so thread synchronisation is a non-issue. Instead, the main thread reacts to events: servers react to incoming IO requests from web browsers, browser apps respond to user interface events like button clicks, and events come in from completed IO operations. All program execution is done in one thread, so you're safe from race conditions 

The JavaScript above works for little examples like this, but the callback style can quickly get out of hand in more sophisticated applications. That, in a nutshell, is why we use PogoScript.

# Sequence

By far the simplest pattern isn't really concurrency at all, but it's painful enough to do in regular JavaScript that it's included here.

The `!` operator can make calls to asynchronous functions and methods, but that syntactically appear to be synchronous. The `!` starts the operation and waits for it to finish before proceeding. Notice however, that we're not _blocking_ on the operation, other events can be handled and other operations can proceed while we wait for this one.

Anything following the call made with the `!` operator is done after the asynchronous callback is called.

Here the asynchronous `fs.read file` is invoked and the contents are printed out. The `console.log` isn't called until `fs.read file` is fully completed and has called its asynchronous callback.

    content = fs.read file ('a.txt', 'utf-8')!
    console.log (content)

You can form expressions using the result of an asynchronous function too:

    console.log (fs.read file ('a.txt' 'utf-8')!)

## Errors

If an error occurs while executing `fs.read file`, then `console.log` will not be executed. In JavaScript, this happens when an error is returned as the first argument to the callback.

In PogoScript, errors follow regular exception semantics as found in (non-async) JavaScript and many other languages. You can catch the exception using a `try catch` expression:

    try
        content = fs.read file ('a.txt', 'utf-8')!
        console.log (content)
    catch (error)
        console.log (error)

## New Functions

Of course, you can create a new function that calls other asynchronous functions.

    print file (filename)! =
        content = fs.read file (filename, 'utf-8')!
        console.log (content)

Since this new function `print file` is asynchronous too, you must also call it with the `!` operator:

    print file 'a.txt'!

# Futures

Futures allow you to start an asynchronous operation but not wait for it to finish. This means you can do something else in the meantime. The future can then later be used to wait for the result of the original operation.

Calling an asynchronous function with the `?` operator creates a **future result** of an operation. The future operator starts an asynchronous operation but does not wait for it to finish. The program can then go on to perform more computation, or start other asynchronous operations. The result of the call is a **future** which can be used to wait for and return the operation's result, or if the operation has already finished, just return the results.

To wait for and get the result of the future, we use the `!` operator again.

For example, here we start the asynchronous operation `fs.read file`, then perform some computation while it completes, then we synchronise on the it's completion by calling the future with the `!` operator, which yields the contents. In this script, `contents` represents the _future result_ of `fs.read file`'s output.

    contents = fs.read file 'a.txt' 'utf-8'?
    
    perform some lengthy computation ()

    console.log (contents!)

In another example, we start two asynchronous read file operations, for `a.txt` and `b.txt`, letting them run concurrenly. We then synchronise on both of them, waiting for them both to finish:

    contents a = fs.read file 'a.txt' 'utf-8'?
    contents b = fs.read file 'b.txt' 'utf-8'?

    console.log (contents a!)
    console.log (contents b!)

It doesn't matter which one finishes first, we still wait only as long as the longest to complete.

## Errors

If the operation threw an exception, invoking the future rethrows the exception.

    contents = fs.read file 'a.txt' 'utf-8'?

    try
        console.log (contents!)
    catch (ex)
        console.log ('an error ocurred while reading from `a.txt`', ex)

## Always the Same Result

Another property of futures is that they always return the same result, no matter how many times they're called. The second and subsequent calls don't wait for result of course:

    f = a?

    f! === f!

This is true with errors too of course.

# Concurrent List Processing

[List comprehensions](/2013/11/29/list-comprehensions.html) are concurrent in PogoScript. This allows you to make asynchronous operations over lists concurrent. This includes calling asynchronous functions to filter, map and even generate more lists. See the [docs](/2013/11/29/list-comprehensions.html) for a more thorough introduction.

Here we have a list of URLs and we make requests for all of them:

    pages = [url <- urls, http.get (url)!]

Each HTTP GET request is started without waiting for the last to finish. In effect, all HTTP GET requests are executed concurrently. The results are not returned until all requests have completed, and the results are returned in the same order as their corresponding urls in the `urls` list.

In the case of failure, the first to fail throws the exception and the rest of the results are abandonned. We can handle that failure using a regular `try catch` expression.

    try
        pages = [url <- urls, http.get (url)!]
    catch (ex)
        console.log (ex)

If we want to continue in the face of exceptions, we can insert the `try catch` into the comprehension. You'll have to think up an acceptable result if something goes wrong.

    pages = [
        url <- urls
        try
            http.get (url)!
        catch (ex)
            "error: #(ex)"
    ]

Or we can just filter out the broken pages:

    pages = [
        url <- urls
        page =
            try
                http.get (url)!
            catch (ex)
                nil

        page != nil
        page
    ]

# Early Start

You have an expensive or long running operation to perform, so you decide that its better to start this well before you need the results. You may be loading search indexes or user interface artefacts, they don't change, but you want to get them ready before the user needs them.

Our expensive operation here is `prepare index`. You want to start this early on in your app startup by calling it with `?` so we don't block:

    index = prepare index?

Now `index` is a future, you can call on this when you need it. In the meantime, the `prepare index` operation is off getting it ready in the background. The nice thing about futures is that you can call it multiple times and always receive the same result.

    search (q)! =
        i = index!
        i.(q)

Our `search` function calls the `index` future to see if the index is ready yet. If the index has not been loaded, it will wait the remaining time for them to load. If it has already loaded, it will just return the loaded index. From then on, repeatedly calling `index` will return the same loaded index without waiting. This is a neat way to avoid timing issues and race conditions - often the trickiest bugs - when loading things in the background.

# Cache

Another case for futures: You have an expensive operation, and once performed you don't want to have to perform again. Futures are effectively caches, once the result is first made available it is always available.

Here we have `search` which accepts a query argument `q`. We want to cache each search by the query argument and not run it again.

    cache = {}

    search (q)! =
        result = cache.(q) = cache.(q) @or http.get "/search?q=#(encode URI component (q))"?
        result!

The nice thing about this approach is that is solves the "cold start" problem in caching. If the cache isn't populated and there are lots of initial requests for the same query, the search is still performed lots of times because the cache isn't populated until the first result is received. With this approach the cache is populated with the *future* on the first request for the query, and all subsequent queries use that, regardless if the search had completed or not.

As is usually the case with caches, you will want to give entries a **time to live** so results don't get stale. Here we use a `set timeout` to clear the cache after 10 seconds.

    cache = {}

    search (q)! =
        result = cache.(q) = cache.(q) @or http.get "/search?q=#(encode URI component (q))"?

        set timeout
            cache.(q) = nil
        10000

        result!

# Fire and Forget

Of course, with futures you can start operations without caring about when (or if) they finish.

Here we start writing a file without caring when it finishes, or even if it fails.

    fs.write file 'a.txt' 'some text'?

    console.log "moving right along"

But often we'll want to do more than just one operation, we may want to do several operations in sequence, but we still don't want to wait for them to finish. Here we write to the file, and when that's done we tell the user. If any errors occur we print those too. We put all of those things into a block `@{ ... }` and call it with a `?`.

    @{
        try
            fs.write file 'a.txt' 'some text'!
            console.log 'done'
        catch (ex)
            console.log ('could not write to `a.txt`', ex)
    }?

    console.log "moving right along"

We can write a nice function for this called `fork`:

    fork (block) =
        @{
            try
                block ()!
            catch (ex)
                console.log (ex)
        }?

At least then we know if one of our fire and forget calls failed.

    fork
        fs.write file 'a.txt' 'some text'!

    console.log "moving right along"

# FIN
