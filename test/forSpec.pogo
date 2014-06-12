script = require './scriptAssertions'

describe 'for'
    describe 'for each'
      it "returns in functions within for don't return from for"
        script.'items = [[1, 2, 3], [1, 2], [1]]

                for each @(item) in (items)
                  item count () = return (item.length)

                  print (item count ())' shouldOutput '3
                                                       2
                                                       1'

      describe 'async'
        it "waits for loop to finish resolving promise before moving onto next loop"
          script.'items = [1, 2, 3]

                  for each @(item) in (items)
                    print "before #(item)"
                    p()!
                    print "after #(item)"

                  print "finished"' shouldOutput "'before 1'
                                                  'after 1'
                                                  'before 2'
                                                  'after 2'
                                                  'before 3'
                                                  'after 3'
                                                  'finished'"

        it "doesn't loop if there aren't any items"
          script.'items = []

                  for each @(item) in (items)
                    print "before #(item)"
                    p()!
                    print "after #(item)"

                  print "finished"' shouldOutput "'finished'"

    describe 'for loop'
      it 'can be returned from'
        script.'count to three () =
                  for (n = 0, n < 10, ++n)
                    if (n > 2)
                      return "three"

                print (count to three ())' shouldOutput "'three'"

      it 'can loop'
        script.'count to three () =
                  for (n = 0, n < 10, ++n)
                    print (n)

                count to three ()' shouldOutput '0
                                                 1
                                                 2
                                                 3
                                                 4
                                                 5
                                                 6
                                                 7
                                                 8
                                                 9'

      describe 'async'
        it 'waits for loop to finish resolving promise before moving onto next loop'
          script.'for (n = 0, n < 3, ++n)
                    print "before #(n)"
                    p()!
                    print "after #(n)"

                  print "finished"' shouldOutput "'before 0'
                                                  'after 0'
                                                  'before 1'
                                                  'after 1'
                                                  'before 2'
                                                  'after 2'
                                                  'finished'"

        it "doesn't loop if the test fails"
          script.'for (n = 0, false, ++n)
                    print "before #(n)"
                    p()!
                    print "after #(n)"

                  print "finished"' shouldOutput "'finished'"

    describe 'for in'
        it "iterates over object's fields"
            script.'object = {a = 1, b = 2}

                    for @(field) in (object)
                        print (field)' shouldOutput "'a'
                                                     'b'"
