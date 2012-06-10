require './class'
_ = require 'underscore'
util = require 'util'

module.exports (cg) =
    term = class {
        constructor (members) =
            self.cg = cg

            if (members)
                for @(member) in (members)
                    if (members.has own property (member))
                        self.(member) = members.(member)

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

        clone (rewrite (subterm): nil, limit (subterm): false) =
            clone object (original term, allow rewrite) =
                rewritten term = if ((original term :: term) && allow rewrite)
                    rewrite (original term)
                else
                    nil

                if (!rewritten term)
                    t = Object.create (Object.get prototype of (original term))

                    for @(member) in (original term)
                        if (original term.has own property (member))
                            t.(member) = clone subterm (original term.(member), allow rewrite)

                    t
                else
                    if (!(rewritten term :: term))
                        throw (new (Error "rewritten term not an instance of term"))

                    rewritten term.is derived from (original term)
                    rewritten term
                
            clone array (terms, allow rewrite) =
                _.map (terms) @(term)
                    clone subterm (term, allow rewrite)

            clone subterm (subterm, allow rewrite) =
                if (subterm :: Array)
                    clone array (subterm, allow rewrite)
                else if (subterm :: Function)
                    subterm
                else if (subterm :: Object)
                    clone object (subterm, allow rewrite && !limit (subterm))
                else
                    subterm
            
            clone subterm (self, true)

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

        walk descendants (walker, limit (): false) =
            walk children (term) =
                for each @(child) in (term.children ())
                    walker (child)
                    if (!limit (child))
                        walk children (child)

            walk children (self)

        walk descendants (walker) not below (limit) if = self.walk descendants (walker, limit: limit)

        generate java script return (buffer, scope) =
            buffer.write 'return '
            self.generate java script (buffer, scope)
            buffer.write ';'
        
        generate java script statement (buffer, scope) =
            self.generate java script (buffer, scope)
            buffer.write ';'

        definitions () = []

        definition name (scope) = nil

        arguments () = self

        inspect term () =
            util.inspect (self, false, 20)

        show (desc) =
            if (desc)
                console.log (desc, self.inspect term ())
            else
                console.log (self.inspect term ())

        hash entry () =
            self.cg.errors.add term (self) with message 'cannot be used as a hash entry'

        hash entry field () =
            self.cg.errors.add term (self) with message 'cannot be used as a field name'

        blockify (parameters, optional parameters) =
            b = self.cg.block (parameters, self.cg.statements [self])
            b.optional parameters = optional parameters
            b

        scopify () = self

        parameter () =
            this.cg.errors.add term (self) with message 'this cannot be used as a parameter'

        subterms () = nil
    }

    term prototype = new (term)
    

    {
        term = term
        term prototype = term prototype
    }
