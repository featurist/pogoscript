# Parsing Architecture

We have 3 representations:

* text
* forms

    Forms are collections of atoms in brackets. So you can have `{one "two" 3 (r/four/ ['five'] 6.6)}`. Operators are inline, and are parsed as infix operators later. Different brackets can be used, parens `()`, braces `{}` and square brackets `[]`.

    Atoms represent each of the items that can be found in forms, and can be forms themselves allowing a nested structure. Atoms will have a json format so they can be inlined into source when the macro is compiled. Atoms have an **atom type**, which is a string that can be used to build an object from if needed.
    
        {
            atom type = 'integer'
            value = 8
        }

    The idea behind this is that macros have access to the raw tokenised input, giving them a lot of freedom to interpret their arguments as they wish.

* javascript terms