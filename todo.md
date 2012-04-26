# Stuff to do

* allow indent or new line after operators, `;` and `:`.
* introduce `+=`, `-=`, `&=`, `*=`, `/=`, `|=`.
* make operators compile to indexers, not fields. This way we don't need to mangle them, so:

        a #=> b

    becomes
    
        a['#=>'](b)

* When `undefined` and `null` are interplated in strings, make sure they generate empty strings.

        "name: #(undefined)"

    makes
    
        "name: "

    not
    
        "name: undefined"