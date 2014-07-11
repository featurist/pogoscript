class = require '../class'.class
classExtending = require '../class'.classExtending
_ = require 'underscore'
ms = require '../memorystream'
sourceMap = require 'source-map'

buffer () =
    chunks = []
    {
        write (code) = chunks.push (code)
        chunks () = chunks
    }

module.exports (cg) =
    Node = class {
        cg = cg

        constructor (members) =
            if (members)
                for @(member) in (members)
                    if (members.hasOwnProperty (member))
                        self.(member) = members.(member)

        setLocation (newLocation) =
            Object.defineProperty(self, '_location', value: newLocation, writable: true)

        location () =
            if (self._location)
                self._location
            else
                children = self.children ()

                locations = [c <- children, loc = c.location (), loc, loc]

                if (locations.length > 0)
                    firstLine = _.min [l <- locations, l.firstLine]
                    lastLine = _.max [l <- locations, l.lastLine]

                    locationsOnFirstLine = [l <- locations, l.firstLine == firstLine, l]
                    locationsOnLastLine = [l <- locations, l.lastLine == lastLine, l]

                    {
                        firstLine = firstLine
                        lastLine = lastLine
                        firstColumn = _.min [l <- locationsOnFirstLine, l.firstColumn]
                        lastColumn = _.max [l <- locationsOnLastLine, l.lastColumn]
                        filename = locations.0.filename
                    }
                else
                    nil

        clone (rewrite (subterm): nil, limit (subterm): false, createObject (node): Object.create (Object.getPrototypeOf (node))) =
            cloneObject (node, allowRewrite, path) =
                t = createObject (node)

                for @(member) in (node)
                    if (node.hasOwnProperty (member))
                        t.(member) = cloneSubterm (node.(member), allowRewrite @and member.0 != '_', path)

                t

            cloneNode (originalNode, allowRewrite, path) =
                if (originalNode.dontClone)
                    originalNode
                else
                    try
                        path.push (originalNode)
                        rewrittenNode =
                            if ((originalNode :: Node) && allowRewrite)
                                subClone (node) =
                                    if (node)
                                        cloneSubterm (node, allowRewrite, path)
                                    else
                                        cloneObject (originalNode, allowRewrite, path)

                                rewrite (
                                    originalNode
                                    path: path
                                    clone: subClone
                                    rewrite: subClone
                                )
                            else
                                nil

                        if (!rewrittenNode)
                            cloneObject (originalNode, allowRewrite, path)
                        else
                            if (!(rewrittenNode :: Node))
                                throw (new (Error "rewritten node not an instance of Node"))

                            rewrittenNode.isDerivedFrom (originalNode)
                            rewrittenNode
                    finally
                        path.pop ()
                
            cloneArray (terms, allowRewrite, path) =
                try
                    path.push (terms)
                    [node <- terms, cloneSubterm (node, allowRewrite, path)]
                finally
                    path.pop ()

            cloneSubterm (subterm, allowRewrite, path) =
                if (subterm :: Array)
                    cloneArray (subterm, allowRewrite, path)
                else if (subterm :: Function)
                    subterm
                else if (subterm :: Object)
                    cloneNode (subterm, allowRewrite && !limit (subterm, path: path), path)
                else
                    subterm
            
            cloneSubterm (self, true, [])

        isDerivedFrom (ancestorNode) =
            self.setLocation (ancestorNode.location ())

        rewrite (options) =
            options := options || {}
            options.createObject (node) = node
            self.clone (options)

        children () =
            children = []

            addMember (member) =
                if (member :: Node)
                    children.push (member)
                else if (member :: Array)
                    for each @(item) in (member)
                        addMember (item)
                else if (member :: Object)
                    addMembersInObject (member)

            addMembersInObject (object) =
                for @(property) in (object)
                    if (object.hasOwnProperty (property) @and property.0 != '_')
                        member = object.(property)

                        addMember (member)

            addMembersInObject (self)

            children

        walkDescendants (walker, limit (): false) =
            path = []

            walkChildren (node) =
                try
                    path.push (node)
                    for each @(child) in (node.children ())
                        walker (child, path)
                        if (!limit (child, path))
                            walkChildren (child)
                finally
                    path.pop ()

            walkChildren (self)

        walkDescendants (walker) notBelowIf (limit) = self.walkDescendants (walker, limit: limit)

        reduceWithReducedChildrenInto (reducer, limit (term): false, cacheName: nil) =
            path = []

            cachingReducer =
                if (cacheName)
                    @(node, reducedChildren)
                        if (node.hasOwnProperty 'reductionCache')
                            if (node.reductionCache.hasOwnProperty (cacheName))
                                node.reductionCache.(cacheName)
                        else
                            reducedValue = reducer (node, reducedChildren)

                            if (!node.hasOwnProperty 'reductionCache')
                                node.reductionCache = {}

                            node.reductionCache.(cacheName) = reducedValue

                            reducedValue
                else
                    reducer

            mapReduceChildren (node) =
                try
                    path.push (node)
                    mappedChildren = []
                    for each @(child) in (node.children ())
                        if (!limit (child, path))
                            mappedChildren.push (mapReduceChildren (child))

                    cachingReducer (node, mappedChildren)
                finally
                    path.pop ()

            mapReduceChildren (self)
    }

    Term = classExtending (Node) {
        arguments () = self

        inspectTerm (depth: 20) =
            util = require 'util'
            util.inspect (self, false, depth)

        show (desc: nil, depth: 20) =
            if (desc)
                console.log (desc, self.inspectTerm (depth: depth))
            else
                console.log (self.inspectTerm (depth: depth))

        hashEntry () =
            self.cg.errors.addTerm (self) withMessage 'cannot be used as a hash entry'

        hashEntryField () =
            self.cg.errors.addTerm (self) withMessage 'cannot be used as a field name'

        blockify (parameters, options) =
            self.cg.block (parameters, self.cg.asyncStatements [self], options)

        scopify () = self

        parameter () =
            self.cg.errors.addTerm (self) withMessage 'this cannot be used as a parameter'

        subterms () = nil

        expandMacro () = nil

        expandMacros () =
            self.clone (
                rewrite (term, clone: nil): term.expandMacro (clone)
            )

        rewriteStatements () = nil

        rewriteAllStatements () =
            self.clone (
                rewrite (term, clone: nil): term.rewriteStatements (clone)
            )

        serialiseSubStatements () = nil
        serialiseStatements () = nil
        serialiseAllStatements () =
            self.rewrite (
                rewrite (term):
                    term.serialiseStatements ()
            )

        defineVariables () = nil
        canonicalName () = nil

        definitions () =
          defs = []

          self.walkDescendants @(term)
            if (term.isDefinition)
              defs.push(term)
          notBelow @(term) if
            term.isNewScope

          if (self.isDefinition)
            defs.push(self)

          defs

        makeAsyncWithCallbackForResult (createCallbackForResult) = nil

        containsContinuation () =
            found = false

            self.walkDescendants @(term)
                found := term.isContinuation @or found
            (limit (term): term.isClosure @and term.isAsync)

            found

        containsAsync () =
            isAsync = false

            self.walkDescendants @(term)
                isAsync := isAsync @or (term.isDefinition @and term.isAsync)
            (limit (term): term.isClosure)

            isAsync

        rewriteResultTermInto (returnTerm) =
          returnTerm (self)

        asyncify () = nil

        alreadyPromise () =
          self._alreadyPromise = true
          self

        promisify () =
          if (self._alreadyPromise)
            self
          else
            cg.methodCall (cg.promise(), ['resolve'], [self]).alreadyPromise()

        code (chunks, ...) =
            location = self.location ()

            if (location)
                @new sourceMap.SourceNode (
                    location.firstLine
                    location.firstColumn
                    location.filename
                    chunks
                )
            else
                chunks

        generateIntoBuffer (generateCodeIntoBuffer) =
            chunks = 
                b = buffer ()
                generateCodeIntoBuffer (b)
                b.chunks ()

            location = self.location ()

            if (location)
                @new sourceMap.SourceNode (
                    location.firstLine
                    location.firstColumn
                    location.filename
                    chunks
                )
            else
                chunks

        generateStatement (scope) =
            self.code (self.generate (scope), ';')

        generateFunction (scope) =
            self.generate (scope)
    }

    termPrototype = new (Term)

    term (members) =
        termConstructor = classExtending (Term, members)

        @(args, ...)
            new (termConstructor (args, ...))

    {
        Node = Node
        Term = Term
        term = term
        termPrototype = termPrototype
    }
