---
layout: post
title: List Comprehensions
---

A little thing, but quite useful.

List comprehensions have been in pogoscript for a little while. They look like this:

    [x + 1, where: x <- [1, 2, 3]]

This just returns the list with 1 added to each item: `[2, 3, 4]`.

There have been some changes however, the `where:` syntax was a little verbose, and the ordering of the syntax, where the result is the first item and the rest is behind the `where:` was a found to be unintuitive. The same expression now looks like this:

    [x <- [1, 2, 3], x + 1]

The order of execution is now left to right, or if written vertically, as sometimes happens with the more complex examples, execution is intuitively top to bottom with the result coming last:

    [
        x <- [1, 2, 3]
        x + 1
    ]

## Compatibility

Both syntaxes are supported from pogo 0.6, but the `where:` style list comprehensions will be phased out eventually.

## Features

Needless to say, list comprehensions in all languages support three basic features: generation of values from a list, mapping items and filtering items.

### Mapping

    > [x <- [1, 2, 3, 4], x * 10]
    [10, 20, 30]

### Filtering

    > [x <- [1, 2, 3, 4], x % 2, x]
    [1, 3]

### Cartesian Product

With 2 or more generators you can generate cartesian products, or permutations of the generated values:

    > [x <- [1, 2], y <- [1, 2], [x, y]]
    [[1, 1], [1, 2], [2, 1], [2, 2]]

### Definitions

    > [x <- [1, 2, 3], y = x + 1, [x, y]]
    [[1, 2], [2, 3], [3, 4]]

## Concurrency

And yes, concurrency, the interesting bit! The new list comprehensions are concurrent where the old ones weren't.

Lets start with a common use case, well for me anyway: making concurrent HTTP requests.

    documents = [id <- documentIds, http.get "/documents/#(id)"!]

Unlike the previous list comprehension, this expression won't wait for the first HTTP request to complete before moving onto the next one.

Another example, this time really taking advantage of list comprehensions:

    citiesIn (countryCodes) containing (population) peopleOrMore = [
        countryCode <- countryCodes
        country = http.get "/countries/#(countryCode)"!
        cityName <- country.cities
        city = http.get "/cities/#(cityName)"!
        city.population > population
        city
    ]

### A Small Warning

Concurrency in list comprehensions is almost always what you want. List comprehensions force you to write code that is **functional**, so concurrency is relatively risk free in these situations. Also, the examples use HTTP GETs, which, for the most part don't meaningfully change state on the server and can be executed in any order with no appreciable change in behaviour. On the other hand, HTTP POSTs in list comprehensions do tend to change state on the server, and you'll need to be more careful. If in doubt, choose a non-concurrent construct like `for each in` where order of execution is guaranteed.

Nevertheless, regardless of order of execution the results will always respect the order of the input lists.

## Execution Model

List comprehensions have their own execution semantics, and you can almost see them as being their own mini-language inside pogoscript. It's quite simple though, here are the constructs and what they mean.

### Generators

    x <- array

All statements that follow a generator are executed once for each item in `array` where `x` is the value of the item. If one of those statements is an asynchronous call, the asynchronous operation will be started, and the execution will immediately begin on the next item in the generator. When the asynchronous operation completes, the rest of the statements for that item will be executed.

### Filters

    x > 10

Any expression, except for a generator or a definition is taken as a filter. A truthy expression allows the execution to pass to the next statement, a falsy expression stops the execution and the result is not included in the list of results.

### Defintitions

    y = x + 1

You can define a new variable as the result of another with a definition, and that variable can be used in all subsequent statements.

### Result

The last expression is the result for that execution. All executions are collated and returned as the result of the whole list comprehension. Results are always in the order in which they were taken from their input lists, regardless of concurrency.
