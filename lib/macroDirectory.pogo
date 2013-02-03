_ = require 'underscore'

module.exports (terms) =
    macro directory = class {
        constructor () =
            self.name tree root = {}

        name node (name) =
            name tree = self.name tree root
            _ (name).each @(name segment)
                if (!name tree.has own property (name segment))
                    name tree := name tree.(name segment) = {}
                else
                    name tree := name tree.(name segment)

            name tree
    
        add macro (name, create macro) =
            name tree = self.name node (name)
            name tree.'create macro' = create macro
    
        add wild card macro (name, match macro) =
            name tree = self.name node (name)
        
            match macros = nil

            if (!name tree.has own property 'match macro')
                match macros := name tree.'match macro' = []
            else
                match macros := name tree.'match macro'
        
            match macros.push (match macro)
    
        find macro (name) =
            find matching wild macro (wild macros, name) =
                n = 0
                while (n < wild macros.length)
                    wild macro = wild macros.(n)
                    macro = wild macro (name)
                    if (macro)
                        return (macro)

                    ++n
        
            find macro in tree (name tree, name, index, wild macros) =
                if (index < name.length)
                    if (name tree.has own property (name.(index)))
                        subtree = name tree.(name.(index))
                        if (subtree.has own property 'match macro')
                            wild macros := subtree.'match macro'.concat (wild macros)

                        find macro in tree (subtree, name, index + 1, wild macros)
                    else
                        find matching wild macro (wild macros, name)
                else
                    if (name tree.has own property 'create macro')
                        name tree.'create macro'
                    else
                        find matching wild macro (wild macros, name)
        
            find macro in tree (self.name tree root, name, 0, [])
    }

    create macro directory (args, ...) = new (macro directory (args, ...))
