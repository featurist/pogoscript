---
layout: main
---

# What is it?

PogoScript is a language optimised for readability. It's also a language that compiles to JavaScript, so it shares all the dynamic loveliness of JavaScript.

## Ok, what does it look like?

    library = object
        :books = []

        :add book ?book =
            books: push @book

        :find book with title containing (a portion of a title) =
            title regex = re/.*@(a portion of a title).*/i

            for each ?book in (:books)
                if (title regex: test (book:title))
                    return @book

    new book with title ?:title, :number of pages = object {}

    wuthering heights = new book with title "Wuthering Heights"
    heart of darkness = new book with title "Heart of Darkness",
        number of pages 132

    library: add book (heart of darkness)
    library: add book (wuthering heights)

    my favourite book = library: find book with title containing "dark"

The idea is to trick you into thinking you're reading English. For this Pogo allows spaces in function, method and variable names. In terms of JavaScript, the names get compressed down into camel case names: so `add book` becomes `addBook`. But it's not just about putting spaces back into names, it's also about where you put the arguments, in Pogo, arguments can be placed anywhere in a function or method's name:

    select from @list if ?select =
        included items = []

        for each ?item in @list
            if (select @item)
                included items: push @item

        included items

    library: select books with more than ?minimum pages =
        select ?book from @books if
            book: number of pages > minimum

    library: select books with more than 45 pages

The placement of an argument can give it a _lot_ of meaning.

## Is that all?

This is a pretty gentle introduction to the motivating philosophy of PogoScript. There's loads more to explore, including a sane approach to asynchronous function calls (especially useful in Node.js apps); a hygenic macro system; and loads of other useful tidbits. [Stay tuned](https://github.com/refractalize/pogoscript).


