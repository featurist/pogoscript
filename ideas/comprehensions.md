# Comprehensions

This comprehension:

    (x * y) where (x = [1..2], (x) is even, y = [4, 5, 6], x * y > 10)

would become

    function () {
        var results = [];
        var list = [1, 2];
        for (var x = 0; x < list.length; x++) {
            if (isEven(x)) {
                var pogo$1$y = [4, 5, 6];
                for (var y = 0; y < pogo$1$y.length; y++) {
                    if (x * y > 10) {
                        results.push(x * y);
                    }
                }
            }
        }
        return results;
    }();

each:

    where (x <- [1, 2])
        console: log (x)

map:

    (x * 2) where (x <- [1, 2])

filter:

    (x) where (x <- [1, 2], (x) is even)
