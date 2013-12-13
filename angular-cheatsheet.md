---
layout: doc
title: Angular Cheat Sheet
---

# Compile
In angular you might compile some html with this JavaScript:

    $compile ('<div></div>') (scope)

If you copy that into pogo it will run but with some unexpected results. As the statement is on a single line pogo treats  `(scope)` as an argument to `$compile`. The reason for this is that pogo supports positional arguments and as scope is wrapped in parenthesis it is considered an argument to the compile method.

To make this work in pogo we need to separate the two operations - the call to $compile, and the call to the compiler.
One way to do this is to delimte the calls by line:

    compiler = $compile ('<div></div>')
    compiler(scope)

However this is such a common angular pattern that it would be best to keep it familiar. To do this we delimte the operations by wrapping the first call in parenthesis:

    ($compile ('<div></div>')) (scope)

Pogo now knows to execute the `$compile` method with the argument `'<div></div>'` and to call the return value as a function with the `scope` argument.


