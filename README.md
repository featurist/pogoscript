# Why?

Inventing programming languages is my mission from god.

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
    [File deleteAt: filename];

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
    [HTTP get:url intoFile:filename];

That's kind of what I was thinking one day.

And to that end, variables, function names and method names can have spaces in them.

    total weight = 67

And for variables that have spaces in them, we use parentheses and not the at symbol (`@`) to access them:

    print (total weight)

# Function Calls

Function calls are a string of tokens separated by spaces. Variable references can be placed in them to pass arguments:

    this is my function it takes an argument @x

Of course, they can return values too:

    y = compute some value from @z and return it

No brackets. Relax.

Well, you can use brackets if you want nested function calls:

    md5 hash (read all text from file "sample.txt")

## Operators

Operators are just functions that happen to have exotic names like `+` and `*`.

	5 + 4

However, unlike normal functions, they don't require `@` symbols on their arguments:

	total weight + 56

There's no precedence so brackets will have to be used:

    total height = (header + (item * count)) + footer

But no precedence makes for a very simple and extendible language - a small price to pay.

## Optional Arguments

Optional arguments can be passed to functions to override defaults. Optional arguments come after commas and can have one argument each:

    connect to mysql database, address "1.2.3.4", port 3307

If there is no argument, then the argument is assumed to be `true`. The following two statements are equivalent:

    connect to mysql database, readonly
    
    is readonly = true
    connect to mysql database, readonly (is readonly)

The `not` keyword can be used to make an option `false`:

    connect to mysql database, not readonly

## Closures

Closures are passed to functions by declaring the closure parameters inline with the function call, like this:

    for each ?item in @list { print @item }

The bit in the curly braces contains the closure. The parameter of the closure is the `?item`. The function name explains what `item` is, and how the closure is used with `item`.

The curly braces can be replaced by an indented block underneath the function, like so:

    for each ?item in @list
        print @item

If a block is followed by another line, that line is part of the same function call. To see this in action, consider the familiar `do` `while` statement:

    item = 0
    
    do
        print @item
        item = item + 1
    while {item < 10}

This is interpreted as one function call:

    do {print @item. item = item + 1} while {item < 10}

To write two statements, put an empty line below the block. For example, this `do` `while` isn't really a `do` `while`:

    do
        print @item
        item = item + 1
    
    while {item < 10}

This is interpreted as two function calls, one for the `do` and the other for the `while`:

    do {print @item. item = item + 1}
    while {item < 10}

This syntax allows us to write control structures with regular functions and blocks that look indistinguishable from the built-in control structures. These functions can be macros too, allowing us to rewrite expressions at compile time. See below for more information on macros.

## Asynchronous Calls

Asynchronous function calls can be made with a tilde `~`.

    contents = ~ read file "sample.txt"

Asynchronous method calls are also made with the tilde, but the tilde appears after the colon:

    index = http server: ~ get "/index.html"

The results of async functions can be passed to other functions:

    find differences between (~ read file "sample.txt") and (~ read file "sample-old.txt")

Both async calls are invoked at the same time, effectively running them in parallel.

Normally however, asynchronous calls are made in sequence, so the following statements are called one after the other:

    is file = ~ @filename is file
    if (is file)
        config = ~ load file @filename
        ~ update local system with config @config

However, if you want to call asynchronous functions in parallel, use a higher level function to do it. Here we use one called `for each in` to make several DNS lookups in parallel.

    print dns records for ?domains =
        ~ for each ?domain in @domains, parallel
            ip = ~ dns: lookup "A" record for @domain
            console: log @ip
    
    ~ print dns records for (list "www.google.com" "www.apple.com" "www.facebook.com")
    console: log "done"

Or one that maps domains into ip addresses:

    find dns records for ?domains =
        ~ map each ?domain in @domains into, parallel
            ~ dns: lookup "A" record for @domain

    ip addresses = ~ find dns records for @domains
    
    for each ?(ip address) in (ip addresses)
        console: log (ip address)
    
    console: log "done"

These are just regular functions, but they are defined with an additional argument for the callback. `for each in` would be defined as the following (using the fabulous [underscore.js](http://documentcloud.github.com/underscore/) library):

    for each in ?list ?process ?callback =
        oustanding = 0
        nothing failed yet = true
        
        failure =
            nothing failed yet = false
        
        _: each @list ?item
            if (nothing failed yet)
                oustanding += 1
                process @item ?error ?result
                    outstanding -= 1
                
                    if error
                        failure!
                        callback @error
                    else
                        if (@outstanding is 0)
                            callback!

Which is the usual mental async code that node hackers are used to. Better it be factored into a nice little function that can be called without having to worry about the mentalness.

## Functions without Arguments

Calling a function with no arguments is done with the exclamation mark (`!`), or a question mark (`?`):

    update page!
    time = current time?

## Method Calls

Method calls use the colon (`:`) to separate the receiver from the method. The receiver on the left, and the method on the right:

    file = open file "README.md"
    file: read line!

If the receiver is the result of an expression, it can all go before the colon:

    open file "README.md": read line!

The colon makes for a concise way to access module items:

    http = require 'http'
    server = http: create server ?request ?response
        response: write head 200, "Content-Type" "text/plain"
        response: end "Hello World\n"

The colon can be used to express chains of method calls:

    list: map ?i into {i + 1}: include ?i where {i < 5}: each ?i do {console: log @i}

And

    list: map ?i into {
        i + 1
    }: include ?i where {
        i < 5
    }: each ?i do {
        console: log @i
    }

And, even:

    list:
        map ?i into
            i + 1
        include ?i where
            i < 5
        each ?i do
            console: log @i
    
Are the same as:

    mapped = list: map ?i into
        i + 1
    filtered = mapped: include ?i where
        i < 5
    filtered: each ?i do
        console: log @i

For no argument function or method calls, the exclamation mark (`!`) doubles as a colon:

    element: create child element! add class "error"

### Splatting Arguments

Splatting arguments is a Ruby term for turning a list into arguments to a function. By splatting arguments, for example, you can call a function that takes 3 arguments by "splatting" a list with 3 items.

Splatting arguments is done using the ellipses `...`, place them after the argument you want to splat.

    args = list 1 2 3
    console: log @args ...

This is semantically equivalent to:

    console: log 1 2 3

# Declaring Functions

To declare a function, use the `=` operator. Prefix arguments with the question mark (`?`):

    hide element ?element =
        set css for @element "display" = "none"

If the function body is small, you can put it on the same line:

    hide element ?element = set css for @element "display" = "none"

If the function doesn't take any arguments, the function body _must_ be on an indented line, otherwise it becomes a variable.

    update page =
        new page contents = ~ ask server for updated contents
        display contents (new page contents)

    update page!

The difference between variables and functions that don't take arguments is subtle. Functions are declared in a block: either in curly braces or indented on a new line. Variables are declared on the same line:

    this is a variable = "variable"
    
    this is a function =
        "function"
        
    this is also a function = {"function"}

To express a lambda without declaring it, specify its parameters with the question mark (`?`) and follow them with a block:

    ?element {set css for @element "display" = "none"}

In fact, there are several ways to define a function, all these are identical:

    succ ?n = n + 1
    
    succ ?n =
        n + 1
    
    succ = ?n {n + 1}
    
    succ = ?n
        n + 1
    
    succ = ? + 1

### Options

To declare options for a function, put them after commas:

    while connected to mysql ?do, readonly false, user "root", port 3306, address "127.0.0.1" =
        console: log "connecting to @("readonly" if readonly) MySQL connection at @address:@port for @user"
        ...

Or, if the options list is getting long:
        
    while connected to mysql @do,
        readonly false,
        user "root",
        port 3306,
        address "127.0.0.1" =
            console: log "connecting to @("readonly" if readonly) MySQL connection at @address:@port for @user"
            ...

All options can also be taken in one variable and passed to another function:

    with readonly mysql ?do, ?options =
        while connected to mysql @do, @options, readonly

If you specify an options variable and options too, then the declared options _will not_ be in the options object.

### Asynchronous Functions

Asynchronous callbacks have a bit of a convention in Javascript, lets look at `fs.readFile` from node.js:

> ### fs.readFile(filename, [encoding], [callback])
> Asynchronously reads the entire contents of a file.
> The callback is passed two arguments `(err, data)`, where data is the contents of the file.

The first argument to the callback is the error. If this is non-null then an error has occurred and it will be thrown into the exception handling mechanism. If the error is null then we look to the second argument as the result of the call. The remaining arguments (if any are passed) are ignored. This is slightly unfortunate for node.js's `fs.read` whose callback signature is `(err, bytesRead, buffer)` - but we opt for a simple approach.

Lets define a function that waits for a condition to arise. The condition is a function that returns either true or false, if it returns true, the wait ends. If it returns false, it uses `setTimeout` to delay until the next check:

    wait for condition ?condition ?callback, check every (50 milliseconds) =
        if (condition!)
            callback!
        else
            set timeout {
                wait for condition @condition @callback, check every = check every
            } (check every)

And to use it:

    number of requests = 0

    server = http: create server ?request ?response
        number of requests += 1
        response: end!
        
    server: listen 3000 "127.0.0.1"

    ~ wait for condition, check every (1 second)
        number of requests > 500
        
    console: log "we hit 500 requests!"
    server: close!

### Unsplatting Arguments

To unsplat arguments, that is, consume multiple arguments as a single list, use the ellipses immeidately after the parameter to take the list (`...`):

    print ?first ?second ?rest ... =
        console: log "first" @first
        console: log "second" @second
        
        for each ?arg in @rest do
            console: log "arg" @arg

## Currying

A normal function call appears like this:

    set html @html on @element with animation @animation

To curry, replace one or more arguments with question marks (`?`):

    set html ? on ? with animation @animation

This expression returns a function that takes two arguments. The order of the arguments is the order of the question marks as they appear lexically. This expression can be assigned to a variable and invoked:

    set html = set html ? on ? with animation @animation
    set @element html @html

## Arguments, Parameters and Function Names

Functions are identified by the string of identifiers that make them up. For example, the name of the function used in this expression `open file @filename` is `open file`, and it can be referred to as simply `open file`. Not passing arguments means that the function isn't called. The positions of the arguments in the function name don't matter either, with one exception: if the argument's position is before the function name, then its a method call, with that first argument being the object of the method. Besides that, the order of the arguments does matter. All of these calls are the same:

    @filename open file
    open @filename file
    open file @filename

Referring to the function itself without calling it:

    open file

If the function is the result of an expression:

    (open file) @filename


Calling the function with no arguments:

    open config file =
        open file "config.json"
    
    open config file!

Calling the function with an asynchronous callback:

    open config file =
        ~ open file "config.json"

    config file = ~ open config file

Call the function while passing a block that takes 2 arguments:

    sort @items comparing each ?left with ?right
        @left compared to @right

Again, the position of the parameters doesn't matter. What matters is the order of the parameters before the block. If there are more parameters after the block, they would be passed into the next block.

A block that takes arguments can be expressed in a similar way, by just omitting the function name:

    comparer = ?left ?right {@a compared to @b}
    
    sort @items comparing each with @comparer

And in fact, with the currying syntax this can be expressed as:

    comparer = ? compared to ?
    sort @items comparing each with @comparer

# Exception Handling

Exception handling is pretty straightforward, no surprises:

    try
        ...
    catch ?exception
        ...
    finally
        ...

Except, that exception handling crosses into asynchronous callbacks too:

    try
        contents = ~ @fs read file "example.txt"
    catch ?e
        console: log @e
    finally
        console: log "finished"

The `catch` is able to catch exceptions thrown from each of the async calls. The `finally` is only invoked after each of the async calls have completed. For example, if we were to invoke async calls in a loop, the finally would still only be invoked after all the calls had finished.

    try
        do 10 times
            contents = ~ @fs read file "example.txt"
            print lines in @contents that match r"connect"
    finally
        console: log "finished"

# Objects

Objects are created with the `object` keyword.

    dog = object
        bark sound = "woof!"
        
        public bark =
            console: log (bark sound)

    dog: bark!

This is an immediate object, it can't be used to create more. To do that make a function:

    create dog =
        object
            bark sound = "woof!"
        
            public bark =
                console: ©log (bark sound)
    
    first dog = create dog!
    first dog. bark!
    
    second dog = create dog!
    second dog.bark!

Or one with optional bark sound override:

    create dog, bark sound "woof!" =
        object
            public bark =
                console: log (bark sound)

    dog = create dog, bark sound "meow?"
    dog: bark!

Public definitions are accessible from outside the object, these are declared on the `this` object in JavaScript. But public variables are also accessible to functions defined inside the object, and continue to be, even if those functions are called using other receivers.

    create clickable element ?n = object
        public name = n
        
        element = $ ('#' + name)
        
        element: click
            alert @name
        
        public describe =
            alert @name

I think this covers most use-cases for using the `this` variable in JavaScript. Of course, at some point you'll want to pass the object itself to a method or function call, for that we give the object a name:

    object clickable element
        subscribe to events (clickable element)
        
        public notify event =
            console: log "event!"

And, just in case you want to access the `this` object, in a function for example, use the `self` keyword:

    click handler =
        console.log (self: tag name)
    
    $ 'body': click (click handler)

(Why `self` and not `this`? No really good reason, I just never really gelled with `this`, and I've got a bit of a soft spot for Ruby, SmallTalk and well, Self proper.)

## Accessing Fields

To access a field (not a method), don't pass arguments or suffix with exclamation mark (`!`):

    dog: bark sound

To set it, put it on the left side of the assignment:

    dog: bark sound = "woof! WOOF!"
    dog: bark!

# Statements

Statements are one per line:

    length = width * height
    do stuff!

But if you want to put several statements onto one line, use the dot (`.`).

    length = width * height. do stuff!

# Macros

Macros can be defined allowing code to be rewritten before it is compiled.

    macro (++ i) =
        assuming @i
            is variable
                assignment with target @i and source (operator @i plus (integer 1))

Allowing the following code:
    
    x = 4
    ++x

To be rewritten as:

    x = 4
    x = x + 1

There are several different types of macros. The simplest, as shown above, is one that is modelled after function calls. Anything that looks like a function call can be a macro.

We can also make macros for method calls, for example with this macro `do`, which calls each of the methods (`push`, `pop`) on the object `stack`.

    stack: do
        push 3
        push 4
        pop

This is defined like this:

    macro (object: do ?calls) =
        method calls = map each ?call in @calls into
            assuming @call
                is function call with name ?name and arguments ?arguments
                    method call on object @object with name @name and arguments @arguments

        statements (method calls)

And would result in the following code:

    stack: push 3
    stack: push 4
    stack: pop

We can also make macros for definitions, ie, the left hand side of the `=`.

    macro (export ?id = ?expr) =
        assuming @id
            is variable
                assignment with target (field reference of (self variable!) with index (id.as string!)) and source @expr

Allowing the code:

    export (x) = 5

To become

    self.x = 5

# Control Flow

## If

The `if` statement:

    condition = true
    if @condition
        do stuff!

The `if`/`else` statement:

    condition = false
    if @condition
        do stuff!
    else
        do other stuff!

## While

The `while` statement:

    condition = true
    while @condition
        do stuff!
        condition = false

## When

The `when` statement is like the `switch` statement in JavsScript and other C-like languages.

    greeting = "hi"
    
    when @greeting
        is "hi"
            print "English"
        is "ni hao"
            print "Mandarin"
        is "ola"
            print "Spanish"
        is "g'day"
            print "Australian"

Each of the cases are expressions, in the above example the expression involves the `is` function. The `when` statement evaluates each of the case expressions, each case expression returns a function that takes the condition (`greeting`) and returns an action function if the condition is met. The action function will carry out the handler for that case (print the language).

So the `is` function could be defined as:

    is ?value ?action =
        ?condition
            if (@condition == @value)
                action

You could easily write other case expressions to evaluate more complex rules such as pattern matching:

    is string starting with ?s ?action =
        ?condition
            if (((typeof @condition) == 'string') and ((condition:substring (s:length)) == @s))
                action

Or regular expressions:

    matches ?re ?action =
        ?condition
            if (re:test @condition)
                action

## Lambda

[Lambda is the ultimate imperative](http://library.readscheme.org/page1.html), so we'll use it a lot to build control flow.

# Lists

To create a list use the `list` function:

    list 1 2 3 4
    list @first @second @third
    empty list = list!

Indexing lists is done with colon (`:`), list on the left, index on the right:

    names = list "jeff" "jake" "john"
    first name = names: 0

# Hashes

Hashes use are written with `#{...}`:

    #{"Set-Cookie" @cookie, Location @redirect}
    empty hash = #{}
    
The hash entries are separated by commas (`,`) or dots (`.`).

The fields follow the same rules as function call options. If there's an argument, it is taken as the value of the field. If there isn't an argument, the field is taken to be `true`. If the field starts with `not` then it is taken to be `false`. If there are two arguments and no name, then the first argument is taken as the field and the second argument the value:

    headers = #{"Content-Type" "text/plain"}

They can also be written on an indented line:

    #
        "Set-Cookie" @cookie
        Location @redirect

Which is the same as:

    #{"Set-Cookie" @cookie. Location @redirect}

Referencing a hash follows the same syntax as referencing a list, only it can use normal names as well as expressions:

    header = hash ("Set-Cookie" @cookie, Location @redirect)
    
    cookie = header: "Set-Cookie"
    location = header: Location

# Control Flow

The usual control flow statements are all implemented using functions, there is no special syntax for these. For example, the humble `if` statement:

    if (x > 0)
        print "x is greater than zero"

Is easily implemented by a built-in function. If-else is as you'd expect too:

    if (x > 0)
        print "x is greater than zero"
    else
        print "x is less than or equal to zero"

But this demonstrates a feature of the parser: if a line immediately follows a block, then it is part of the same function call, that is, the function called `if else`. Similar for a familiar exception handling construct:

    try
        statement 1
        statement 2
    catch ?error
        print "error occurred: @error"
    finally
        print "finished, for good or bad"

This is just a function that would be defined as:

    try @block catch @handler finally @finally =
        ...

As it happens, this would be a built in function. Of course, we'd need to define all the permutations of try/catch/finally:

    try @block =
        try @block catch nil finally nil
    
    try @block catch @handler =
        try @block catch @handler finally nil
    
    try @block finally @finally =
        try @block catch nil finally @finally

If one _doesn't_ want the next statement to be part of the same function, then put an blank line in between:

    if (x > 0)
        print "x is greater than zero"

    another statement with @x

# JavaScript Translation

## Names and Variables

Names of variables and functions are camel cased, so `read file` becomes `readFile`.

Upper case words are preserved, so `open TCP socket` becomes `openTCPSocket`.

Underscores are preserved, so `open_tcp_socket` remains `open_tcp_socket`.

Whole words are preserved, so `OpenTcpSocket` remains `OpenTcpSocket`.

## Function calls

If there are arguments in a name, they are added to the argument list:

    upload file "stuff.html" to "ftp://ftp.mysite.com/"

becomes

    uploadFileTo("stuff.html", "ftp://ftp.mysite.com/")

If there are no arguments they just have an empty argument list:

    flush database!

becomes

    flushDatabase()

### Options

If there are no options, they aren't passed. If there are options they are passed as the last argument in a hash:

    http get "http://mysite/stuff.html", proxy "http://hahainternalproxy/", cookie (access cookie)

becomes

    httpGet("http://mysite/stuff.html", {proxy: "http://hahainternalproxy/", cookie: accessCookie})

Boolean options:

    open file "stuff.txt", readonly

becomes

    openFile("stuff.txt", {readonly: true})

### Blocks

If there are parameters in the call, they are added to the closest block to the right, so:

    map each ?item in @list to
        item + 10

becomes

    mapEachInTo(list, function (item) {
        return item + 10
    })

### Asynchronous Calls

Async calls are more complex, naturally. A single async call in a statement is relatively straightforward:

    write (~ read file "from.txt") to "to.txt"

becomes

    readFile("from.txt", function (err, data) {
        writeTo(data, "to.txt");
    });

Multiple async calls in a statement get tricky:

    files equal = (~ sha1 of file "old.txt") == (~ sha1 of file "new.txt")

becomes

    var callsReturned = 0;
    var oldSha1, newSha1;
    var filesEqual;
    
    var setFilesEqual = function () {
        filesEqual = oldSha1 == newSha1;
    }
    
    sha1OfFile("old.txt", function (err, result) {
        oldSha1 = result;
        if (++callsReturned == 2) {
            setFilesEqual();
        }
    });
    
    sha1OfFile("new.txt", function (err, result) {
        newSha1 = result;
        if (++callsReturned == 2) {
            setFilesEqual();
        }
    });

There are plenty of async libraries to do this kind of thing too.

Exception handling, and the finally clause make this more complex still:

    try
        file hashes = filenames: each ?filename do
            console: log (~ sha1 of file @filename)
        console: log "finished"
    catch ex
        console: log @ex

becomes

    var callsReturned = 0;
    var callsExpected = 0;
    
    var catchExceptionCalls = 0;
    var catchException = function (ex) {
        if (++catchExceptionCalls == 1) {
            console.log(ex);
        }
    };
    
    try {
        var finished = function () {
            console.log("finished");
        };
    
        filenames.eachDo(function (filename) {
            callsExpected++;
            sha1OfFile(filename, function (err, result) {
                if (err) {
                    catchException(ex);
                } else {
                    console: log(result);
                    if (++callsReturned == callsExpected) {
                        finished();
                    }
                }
            });
        });
    } catch (ex) {
        catchException(ex);
    }

Eek! I'm sure there are loads of bugs and weird corner cases in there. (All the better reason to have this stuff in a language!)