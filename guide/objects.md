---
layout: doc
guide: Objects
weight: 6
---

Functions are of course objects in their own way: they can encapsulate state (by referring to variables in lexical scope); they offer an abstract interface (you can call them by passing arguments); they are polymorphic (you can't really tell what implementation you're calling, and nor should you); and they can inherit the behaviour of other functions in delegation, arguably an analogue to object oriented inheritance.

But sometimes functions are not enough and something more is needed. What objects offer is the ability to invoke different but related operations, whereas functions can only invoke a single operation.

Objects in Pogoscript are, naturally, no different to objects in JavaScript, they just use a slight variation on the syntax:

    philosopher = {
      name = "Jean Baudrillard"
      hobby = "Philosophy"
    }

There's also a shorthand, omitting the `=`:

    philosopher = {name "Jean Baudrillard", hobby "Philosophy"}

Methods follow the same syntax as functions:

    philosopher = {
      name = "Jean Baudrillard"
      hobby = "Philosophy"

      saySomething () =
        console.log "It is always the same: once you are liberated,
                     you are forced to ask who you are."
    }

Of course, you can define fields and methods from outside the object too. We could write the above like this:

    philosopher = {}

    philosopher.name = "Jean Baudrillard"
    philosopher.hobby = "Philosophy"

    philosopher.saySomething() =
      console.log "It is always the same: once you are liberated,
                   you are forced to ask who you are."

Accessing fields on objects is fairly predictable:

    philosopher.name

Calling methods on objects is also fairly predictable:

    philosopher.saySomething()

You can also access a field using an expression in parenthesis:

    fieldName = 'name'
    philosopher.(fieldName)

And similarly for methods:

    methodName = 'saySomething'
    philosopher.(methodName)()

The same is true for defining fields and methods. For example, you can create a hash object by adding values and keys:

    philosophersByName = {}

    addPhilosopher(philosopher) =
      philosophersByName.(philosopher.name) = philosopher

    philosopherByName(name) =
      philosophersByName.(name)

As in Javascript there are no classes in the strict sense of the word. Not having classes might sound like an omission, but not having classes are a pleasant simplification. For example, where you might reach out for a class in another language, in Pogoscript (and Javascript) you can just create a function that returns a new object:

    personNamed (name) = {
      name = name
      sayHi() = console.log "Hi, I'm #(self.name)"
    }

    joe = personNamed "Joe"
    joe.sayHi()

This is a very simple way to create objects, and every object created by this function will contain a `sayHi` method, technically not the _same_ method, but identical in behaviour. Another way to share methods and values between objects is to use prototypes. You can create a prototype with the `prototype` function:

    person = prototype {
      sayHi() = console.log "Hi, I'm #(self.name)"
    }

    personNamed (name) = person {
      name = name
    }

    joe = personNamed "Joe"
    joe.sayHi()

Here we defined a new prototype containing the `sayHi` method, then we created a new object with that prototype inheriting that method. The prototype `person` is a function that, when given an object will return a new object that shares all the properties of the person object.
