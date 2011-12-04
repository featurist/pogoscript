---
layout: main
---

## What is it?

PogoScript is a language optimised for readability. It's also a language that compiles to JavaScript, so it shares all the dynamic loveliness of JavaScript.

## Ok, what does it look like?

    library = object
        :books = []

        :add book @book =
            :books: push @book

    new book with title @title, number of pages = object
        :title = title
        :number of pages = number of pages

    library: add book with title @title, details ... =
        add book (new book with title @title, details ...)

    library: add book with title "Wuthering Heights",
        number of pages 260
    library: add book with title "Heart of Darkness",
        number of pages 96

The idea is to trick you into thinking you're not reading code. Spaces are allowed in identifiers - no more word conjugation hacks like camel case, hyphens or underscores. Also arguments (and indeed block parameters) can be placed anywhere in a function call. Careful placement of an argument can give it a _lot_ of meaning:

    select from @list if (is selected) =
        included items = []

        for each ?item in @list
            if (@item is selected)
                included items: push @item

        included items

    library: select books with more than @minimum pages =
        select ?book from @books if
            book: number of pages > minimum

    long books = library: select books with more than 52 pages

## Is that all?

This is a pretty gentle introduction to the motivating philosophy of PogoScript. There's loads more to explore, including a sane syntax for asynchronous function calls (especially useful in [Node](http://nodejs.org/) apps), a hygenic macro system and loads of other useful tidbits. [Stay tuned](https://github.com/refractalize/pogoscript).


