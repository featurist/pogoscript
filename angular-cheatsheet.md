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

# Watch
When setting up a watcher we often want to change the default behaviour so that it tests for equality rather than reference, we do this by passing the `$watch` method a third argument of `true`.

First we call `$watch` with our watch expression (`'modelName'`) we then give it a callback (pogo calls this a block) by indenting the next line. The third line is used to specify additional arguments, in this case the value `true`.

    $scope.$watch 'modelName'
        do stuff ()
    (true)

Note that you *MUST* wrap true in parenthesis. If you do not then pogo will think that 'true' is a part of the method name that you are calling. In this case it would try to call a method `$scope.$watchTrue`. To prevent this we explicitly tell pogo that `true` is an argument by wrapping it in parenthesis.
