# Variables

Variables are initialised with a `=` sign:

    x = 9

Variables are accessed by prepending an `@` sign:

    print @a

Why is that? Well, I want to emphasise the names of functions and methods to really bring out the intent of the programmer. To do that I remove a little syntactic tax from function and method names and add a little syntactic tax to variables. Here's how we might, for example, delete a file on disk:

    filename = "example.txt"
    delete file @filename

It reads a tiny bit better than, say:

    deleteFile(filename);
    (delete-file filename)
    delete_file filename
    rm $filename
    File.Delete(filename);

A bit better but hardly a great improvement. But, if we pass several arguments it gets clearer:

    url = "http://www.google.com/search?q=stuff"
    filename = "results.html"
    http get @url into file @filename

Better than:

    httpGetIntoFile(url, filename);
    (http-get-into-file url filename)
    http_get_into_file url, filename
    curl $url > $filename
    Http.GetIntoFile(url, filename);

That's kind of what I was thinking one day.

# Function Calls

Function calls are a string of tokens separated by spaces. Variable references can be placed in them to pass arguments:

    this is my function it takes an argument @x

Of course, they can return values too:

    y = compute some value from @z and return it

No brackets. Relax.

Closures are passed to functions by declaring the closure parameters inline with the function call, like this:

    this function takes a list @mylist and returns a new list containing each item ?x where {@x is less than 10}

The bit in the curly braces contains the closure. The parameter of the closure is the `?x`. The function name explains what `x` is, and how the closure is used with `x`.

The curly braces can be replaced by an indented block underneath the function, like so:

    this function takes a list @mylist and returns a new list containing each item ?x where
        @x is less than 10

This function name is a bit of a mouthful, lets examine a more realistic example - opening a file and writing to it in a block:

    open file "sample.txt" as ?file
        @file write line "hi"

Which brings us to method calls, which are pretty much identical to function calls except that they start with a variable reference, which is the object (the `self`, or `this` object).

    @stack push @item
    @stack pop

Optional arguments can be passed to functions to override defaults. Optional arguments follow the same rules as function calls, except they appear after commas:

    connect to mysql database, at "1.2.3.4", on port 3307

