---
layout: doc
---

# How do I?

Ok, so you want to know what this pogoscript thing is all about… It's a programming langauge, you probably knew that already. It compiles to JavaScript too, you probably also knew that. Because it compiles to JavaScript it's like JavaScript. Most, if not all of the language's behaviour is identical to JavaScript, pogoscript is merely a new syntax for JavaScript, plus a few interesting things which we'll get to.

# Variables

The first, most basic, and most surprising feature of the language is variables. In PogoScript variable names can contain spaces, ala:

	wind speed = 25

Here we've declared and initialised a new variable called `wind speed`. And now we can assign a new value to it too:

	wind speed = 13

Variables can contain spaces, but the same variables can be written using camel case too and amount to the same thing:

	windSpeed
	=> 13

# Functions

Variables are the building blocks, but functions have all the fun. In PogoScript functions are called by passing arguments. Arguments can be numbers, strings or other expressions like variables or indeed other functions.

	is (wind speed) strong enough for my kite?

Here we called a function named `is strong enough for my kite`. We passed one argument in parenthesis, `wind speed`. The question mark `?` on the end is optional but it helps it to be read like a question.

The actual position of the arguments does not matter, in fact, we could call the same function like this:

	(wind speed) is strong enough for my kite?

Or

	is strong enough for my (wind speed) kite?

Neither of which read as well as the first, but are nevertheless effectively the same thing.

As with variables, function names can be written in camel case, so we could write it in classical JavaScript style too:

	isStrongEnoughForMyKite(windSpeed)

Eventually, you'll want to define your own functions too. Like variables, we use equals `=`, like this:

	is (wind speed) too strong for my kite? = wind speed > 30

These are simple functions, but there are other ways functions can be called, and it's all to do with how the arguments are written. For example, lets imagine we have a function called `sum`, it returns the sum of the numbers you pass to it.

	sum 1 2 3
	=> 6

Notice how the numbers didn't need parenthesis? Numbers and strings don't need to be in parenthesis, but there's nothing stopping you from using them:

	sum (1) (2) (3)
	=> 6

In fact, you can use brackets for some arguments and not for others:

	sum (1) 2 (3)
	=> 6

If two arguments are next to each other, they can be in the same parantheses and separated by commas:

	sum (1, 2) 3
	=> 6

Or

	sum (1, 2, 3)
	=> 6

Now all of the above is true if there is a name, in this case `sum`. It's time to introduce some new terminology to help us: all of the examples you've seen so far are *forms*. A form is a list of words, numbers, strings and expressions in parentheses. (They can also contain blocks and parameters, but we'll get to that soon.) A form has a name if it contains some words, like our `sum` example above. If a form doesn't have a name, for example, if it's all arguments like this:

	(sum, 1, 2, 3)

Then the *first* argument is taken as the function and the remaining arguments the arguments to that function. So the following forms are functionally identical:

	(sum, 1, 2, 3)
	sum 1 2 3
	(sum) 1 2 3

If there's only *one* argument and no name, then that argument is taken as a value, not a function, and it's not called. So the following are identical:

	(wind speed)
	wind speed

So how can you call a function if it has no arguments? There are three ways to do this, the first should be familiar to many programmers:

	sum()

And you can use either the question mark `?` at the end of the form, which we've seen before, or the exclamation mark `!`.

	sum!
	sum?

Whether you use `()`, `?` or `!` matters not at all, but your selection would be based on a convention:

For functions whose sole purpose is to answer some question and return an answer, you should use `?`. We can call these *queries*.

For functions that don't answer a question but just do something, you should use `!`. We can call these *commands*.

That kind of leaves `()` out for conventional use, but its there anyway just in case somebody invents a new convention for it. Nevertheless, this is just a convention, and is useful to communicate to other programmers how you intended to use or define the function.

# Blocks

Blocks are new functions that are passed as arguments to other functions. After all, functions do have all the fun. As weird as it sounds, this technique is frequently used in practice. We often use blocks to mark some code to run later, or several times over, or within a context of some sort.

Lets say we have a function called `after seconds` which takes a number of seconds to wait, and a function to call when it's stopped waiting:

	after 5 seconds
		print 'hi'

When we called that, we'd see `hi` after 5 seconds. The indented code (the `print 'hi'`) is the block, which is a newly defined function that is passed to `after seconds`. You can also write blocks between `@{` and `}`, so we could write this instead:

	after 5 seconds @{ print 'hi' }

Which is the same thing.

Even though the `after seconds` function takes a block, the block argument is no different to other arguments, so we can define it like this using JavaScript's `setTimeout` function. `setTimeout` takes the function to call as the first argument, and the delay in milliseconds as the second argument.

	after (n) seconds (do it) = set timeout (do it, n * 1000)

Sometimes blocks can be called with arguments themselves. Lets imagine we're writing a very simple email client. Emails can come in at any moment and we want to print the subject of the email as soon as it comes in. We'll want the email itself to be passed to our block so we can print its subject.

	when email @(email) arrives
		print (email: subject)

`@(email)` defines a parameter for our block, called `email`. When the block is called, `email` will refer to the email that just arrived, and we can print the subject. Notice the expression `email: subject`, that means we're accessing the `subject` field of the `email` object. We'll cover objects very shortly.

Like arguments, block parameters can be placed anywhere in the call, the only requirement is that they're placed *before* the block, and of course like arguments, the order is significant.