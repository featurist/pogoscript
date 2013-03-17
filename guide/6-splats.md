---
layout: doc
guide: Splat Arguments
permalink: splats.html
---

Some functions can accept an arbitrary number of arguments. Our hypothetical `sum` above was one of them. To acheive this, we use *splats*, which is some Ruby terminology for being able to access a number of arguments as one.

Lets (finally) implement our `sum` function:

    sum (numbers, ...) =
        sum so far = 0

        for each @(number) in (numbers)
            sum so far = sum so far + number

        sum so far

When we put some ellipses after `numbers`, we're saying that `numbers` represents all the arguments passed to `sum`. Likewise, if we had a list of numbers that we wanted to pass to `sum` when we called it, we could also use the ellipses:

    our numbers = [1, 2, 3]
    sum (our numbers, ...)

Which would be the same as:

    sum 1 2 3

When defining a function, we can only define one splat parameter, but we can continue to have other non-splat parameters before and after it. For example, the following would work:

    sum (first, second, middle numbers, ..., last) =
        // ...

But for calling a function, we can specify as many splats as we're happy to:

    small numbers = [1, 2, 3]
    large numbers = [7, 8, 9]

    sum (small numbers) ... 4 5 6 (large numbers) ...

The only other restriction when defining functions is that splat parameters cannot be used alongside optional parameters - the following is not allowed:

    sum (args, ..., quickly: true) =
        // ...

The reason is that since optional arguments are optionally passed, we can never be sure whether an argument belongs in the splat or if it's the optional argument. A technical detail, but nonetheless restrictive.
