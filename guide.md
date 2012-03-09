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

# Functions

Variables are the building blocks, but functions have all the fun. In PogoScript functions are called by passing arguments. Arguments can be numbers, strings or other expressions like variables or indeed other functions.

	is (wind speed) strong enough for my kite?

Here we called a function called `is strong enough for my kite`. We passed one argument in parenthesis, `wind speed`. The question mark `?` on the end is optional here.

Eventually, you'll want to define your own functions too. Like variables, we use equals `=`, like this:

	is (wind speed) too strong for my kite? = wind speed > 30

These are simple functions, but there are other ways functions can be called, and it's all to do with how the arguments are written. For example, lets imagine we have a function called `sum`, it returns the sum of the numbers you pass to it.

	sum 1 2 3
	=> 6

Notice how the numbers didn't need parenthesis? Numbers and strings don't need to be in parenthesis, but there's nothing stopping you from using them:

	sum (1, 2, 3)
	=> 6

In fact, you can use brackets for some arguments and not for others:

	sum (1) 2 (3)
	=> 6

If two arguments are next to each other, they can be in the same parantheses and separated by commas:

	sum (1, 2) 3
	=> 6

Now all of the above is true if there is a name, in this case `sum`. It's time to introduce some new terminology to help us, the *form*. All of the examples you've seen so far are forms. A form is a list of words, numbers, strings and expressions in parentheses. (They can also contain blocks and parameters, but we'll get to that soon.) A form has a name if it contains some words, like our `sum` example above. If a form doesn't have a name, for example, if it's all arguments like this:

	(sum, 1, 2, 3)

Then the *first* argument is taken as the function and the remaining arguments the arguments to that function. So the following forms are functionally identical:

	(sum, 1, 2, 3)
	sum 1 2 3
	(sum) 1 2 3

Also, the name can be placed anywhere in the form:

	sum 1 2 3
	1 sum 2 3
	1 2 sum 3
	1 2 3 sum

Are all identical calls. It makes more sense with a better example:

	(Noah) is friends with (Sammy)

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

*Blocks* are new functions that are passed as arguments to other functions. After all, functions do have all the fun. As weird as it sounds, this technique is frequently used in practice.