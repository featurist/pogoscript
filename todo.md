# Stuff to do

* allow indent or new line after operators, `;` and `:`.
* introduce `+=`, `-=`, `&=`, `*=`, `/=`, `|=`.
* make operators compile to indexers, not fields. This way we don't need to mangle them:

        a #=> b

    becomes
    
        a['#=>'](b)