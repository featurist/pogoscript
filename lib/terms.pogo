require './class'
_ = require 'underscore'

term = exports.term = class {
    set location (new location) =
        self._location = new location

    location () =
        self._location

    constructor (members) =
        if (members)
            for @(member) in (members)
                if (members.has own property (member))
                    self.(member) = members.(member)

    clone (rewrite (): nil) =
        clone object (original term) =
            rewritten term = if (original term :: term)
                rewrite (original term)
            else
                nil

            if (!rewritten term)
                t = Object.create (Object.get prototype of (original term))

                for @(member) in (original term)
                    if (original term.has own property (member))
                        t.(member) = clone subterm (original term.(member))

                t
            else
                if (!(rewritten term :: term))
                    throw (new (Error "rewritten term not an instance of term"))

                rewritten term.is derived from (original term)
                rewritten term
            
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

    is derived from (ancestor term) =
        self.set location (ancestor term.location ())
}
