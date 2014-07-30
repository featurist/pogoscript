---
layout: doc
guide: Splat Arguments
weight: 5
---

Some functions can accept an arbitrary number of arguments. Our hypothetical `sum` above was one of them. To acheive this, we use *splats*, which is some Ruby terminology for being able to access a number of arguments as one.

Lets finally implement our `sum` function:

    sum (numbers, ...) =
        sumSoFar = 0

        for each @(number) in (numbers)
            sumSoFar := sumSoFar + number

        sumSoFar

When we put some ellipses after `numbers`, we're saying that `numbers` represents all the arguments passed to `sum`. Likewise, if we had a list of numbers that we wanted to pass to `sum` when we called it, we could also use the ellipses:

    ourNumbers = [1, 2, 3]
    sum (ourNumbers, ...)

Which would be the same as:

    sum 1 2 3

When defining a function, we can only define one splat parameter, but we can continue to have other non-splat parameters before and after it. For example, the following would work:

    sum (first, second, middleNumbers, ..., last) =
        // ...

But for calling a function, we can specify as many splats as we're happy to:

    smallNumbers = [1, 2, 3]
    largeNumbers = [7, 8, 9]

    sum (smallNumbers) ... 4 5 6 (largeNumbers) ...

The only other restriction when defining functions is that splat parameters cannot be used alongside optional parameters - the following is not allowed:

    sum (args, ..., quickly = true) =
        // ...

The reason is that since optional arguments are optionally passed, we can never be sure whether an argument belongs in the splat or if it's the optional argument. A technical detail, but nonetheless restrictive.
