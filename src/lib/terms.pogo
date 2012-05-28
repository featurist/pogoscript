require './class'
_ = require 'underscore'

exports.term = class {
    location () = nil
    clone (rewrite (): nil) =
        clone object (term) =
            rewritten = rewrite (term)

            if (!rewritten)
                t = Object.create (Object.get prototype of (term))

                for @(member) in (term)
                    if (term.has own property (member))
                        t.(member) = clone subterm (term.(member))

                t
            else
                rewritten
            
        clone array (terms) =
            _.map (terms) @(term)
                clone subterm (term)

        clone subterm (subterm) =
            if (_.(subterm) is array)
                clone array (subterm)
            else if (_.(subterm) is object)
                clone object (subterm)
            else
                subterm
        
        clone subterm (self)

    is derived from (ancestor term) = nil
}
