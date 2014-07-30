---
layout: doc
guide: Objects
weight: 6
---

Functions are of course objects in their own way: they can encapsulate state (by referring to variables in lexical scope); they offer an abstract interface (you can call them by passing arguments); they are polymorphic (you can't really tell what implementation you're calling, and nor should you); and they can inherit the behaviour of other functions in delegation, arguably an analogue to object oriented inheritance.

But sometimes functions are not enough and something more is needed. What objects offer is the ability to invoke different but related operations, whereas functions can only invoke a single operation.

Objects in Pogoscript are, naturally, no different to objects in JavaScript, they just use a slight variation on the syntax:

    a philosopher = {
        name = "Jean Baudrillard"
        hobby = "Philosophy"
    }

There's also a shorthand, omitting the `=`:

    a philosopher = {name "Jean Baudrillard", hobby "Philosophy"}

Methods follow the same syntax as functions:

    a philosopher = {
        name = "Jean Baudrillard"
        hobby = "Philosophy"
        
        say something () =
            console.log "It is always the same: once you are liberated,
                         you are forced to ask who you are."
    }

Of course, you can define fields and methods from outside the object too. We could write the above like this:

    a philosopher = {}

    a philosopher.name = "Jean Baudrillard"
    a philosopher.hobby = "Philosophy"

    a philosopher.say something! = 
        console.log "It is always the same: once you are liberated,
                     you are forced to ask who you are."

More to come!
