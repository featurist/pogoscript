require './class'
_ = require 'underscore'

term = exports.term = class {
    set location (new location) =
        self._location = new location

    location () =
        if (self._location)
            self._location
        else
            children = self.children ()

            locations = _.map (children) @(child)
                child.location ()

            first line = _.min (_.map (locations) @(location) @{location.first line})
            last line = _.max (_.map (locations) @(location) @{location.last line})

            locations on first line = _.filter (locations) @(location) @{location.first line == first line}
            locations on last line = _.filter (locations) @(location) @{location.last line == last line}

            {
                first line = first line
                last line = last line
                first column = _.min (_.map (locations on first line) @(location) @{location.first column})
                last column = _.max (_.map (locations on last line) @(location) @{location.last column})
            }

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

    children () =
        children = []

        add member (member) =
            if (member :: term)
                children.push (member)
            else if (member :: Array)
                for each @(item) in (member)
                    add member (item)
            else if (member :: Object)
                add members in object (member)

        add members in object (object) =
            for @(property) in (object)
                if (object.has own property (property))
                    member = object.(property)

                    add member (member)

        add members in object (self)

        children
}
