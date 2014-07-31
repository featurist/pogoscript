---
layout: doc
guide: Objects
weight: 6
---

Functions are of course objects in their own way: they can encapsulate state (by referring to variables in lexical scope); they offer an abstract interface (you can call them by passing arguments); they are polymorphic (you can't really tell what implementation you're calling, and nor should you); and they can inherit the behaviour of other functions in delegation, arguably an analogue to object oriented inheritance.

But sometimes functions are not enough and something more is needed. What objects offer is the ability to invoke different but related operations, whereas functions can only invoke a single operation.

Objects in Pogoscript are, naturally, no different to objects in JavaScript, they just use a slight variation on the syntax:

    person = {
      name = "Jean Baudrillard"
      hobby = "Philosophy"
    }

There's also a shorthand, omitting the `=`:

    person = {name "Jean Baudrillard", hobby "Philosophy"}

Methods follow the same syntax as functions:

    person = {
      name = "Jean Baudrillard"
      hobby = "Philosophy"

      saySomething () =
        console.log "It is always the same: once you are liberated,
                     you are forced to ask who you are."
    }

Of course, you can define fields and methods from outside the object too. We could write the above like this:

    person = {}

    person.name = "Jean Baudrillard"
    person.hobby = "Philosophy"

    person.saySomething() =
      console.log "It is always the same: once you are liberated,
                   you are forced to ask who you are."

Accessing fields on objects is fairly predictable:

    person.name

Calling methods on objects is also fairly predictable:

    person.saySomething()

## Field Expressions

You can also access a field using an expression in parenthesis:

    fieldName = 'name'
    person.(fieldName)

And similarly for methods:

    methodName = 'saySomething'
    person.(methodName)()

The same is true for defining fields and methods. For example, you can create a hash object by adding values and keys:

    peopleByName = {}

    addPerson(person) =
      peopleByName.(person.name) = person

    personByName(name) =
      peopleByName.(name)

Javascript doesn't have classes like other programming languages, but it does objects and in a beautifully simple form. For example, where you might reach out for a class in another language, in Pogoscript (and Javascript) you can just create a function that returns a new object:

    personNamed (name) = {
      name = name
      sayHi() = console.log "Hi, I'm #(self.name)"
    }

    joe = personNamed "Joe"
    joe.sayHi()

## Prototypes

This is a very simple way to create objects, and every object created by this function will contain a `sayHi` method, technically not the _same_ method, but identical in behaviour. Another way to share methods and values between objects is to use prototypes. When you create an object with a prototype it inherits the prototype's properties and methods.

You can create a prototype with the `prototype` function:

    person = prototype {
      sayHi() = console.log "Hi, I'm #(self.name)"
    }

    personNamed (name) = person {
      name = name
    }

    joe = personNamed "Joe"
    joe.sayHi()

Here we defined a new prototype containing the `sayHi` method, then we created a new object with that prototype inheriting that method. The prototype `person` is a function that, when given an object will return a new object that shares all the properties of the person object.

## Extending Prototypes

You can also make a new prototype that extends another, inheriting some properties and methods and overriding others.

    person = prototype {
      sayHi() = console.log "Hi, I'm #(self.name)"
      age() = (self.dob - @new Date()).getTime() / 1000 / 60 / 60 / 365
    }

    australian = prototypeExtending (person) {
      sayHi() = console.log "G'day, I'm #(self.name)"
    }

    french = prototypeExtending (person) {
      sayHi() = console.log "Bonjour, je m'appel #(self.name)"
    }

    jack = australian {
      name = 'Jack'
      dob = @new Date(1995, 10, 3)
    }
    jack.sayHi()

    laurant = french {
      name = 'Laurant'
      dob = @new Date(1993, 4, 24)
    }
    laurant.sayHi()

## Which prototype?

You can ask an object if it inherits from a prototype using the `::` operator:

    jack :: australian
    > true

    jack :: french
    > false

    laurant :: french
    > true

    laurant :: person
    > true

This is also true of other types too, functions, strings, arrays and objects.
