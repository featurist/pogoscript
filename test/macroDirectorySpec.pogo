terms = require '../lib/parser/codeGenerator'.code generator ()
require './assertions'
assert = require 'assert'
macro directory = (require '../lib/macroDirectoryPerf') (terms)

describe 'macro directory'
    it 'one macro'
        md = macro directory ()
        md.add macro ('one', 1)
        assert.equal (md.find macro ('one'), 1)

    it "longer name doesn't find macro with shorter name"
        md = macro directory ()
        md.add macro ('one', 1)
        assert.equal (md.find macro ('oneTwo'), nil)

    it 'finds correct macro among two'
        md = macro directory ()
        md.add macro ('one', 1)
        md.add macro ('oneTwo', 2)
        assert.equal (md.find macro ('one'), 1)
        assert.equal (md.find macro ('oneTwo'), 2)

    it 'adding same macro overwrites previous'
        md = macro directory ()
        md.add macro ('oneTwo', 2)
        md.add macro ('oneTwo', 3)
        assert.equal (md.find macro ('oneTwo'), 3)

    describe 'wild card macros'
        it 'wild card macro with further name requirement'
            md = macro directory ()

            macro = {}

            wild (name) =
                console.log "name: #(name)"
                if (name == 'oneTwoThree')
                    macro

            md.add wild card macro ('oneTwo', wild)

            assert.equal (md.find macro ('oneTwo'), nil)
            assert.equal (md.find macro ('oneTwoThree'), macro)
            assert.equal (md.find macro ('oneTwoFour'), nil)
        
        it 'wild card macro with exact name'
            md = macro directory ()

            macro = {}

            wild (name) =
                macro

            md.add wild card macro ('oneTwo', wild)

            assert.equal (md.find macro ('oneTwo'), macro)
        
        it 'normal macros have priority over wild card macros'
            md = macro directory ()

            macro = {}

            wild (name) =
                if (name == 'oneTwoThree')
                    macro

            md.add wild card macro ('oneTwo', wild)
            md.add macro ('oneTwoThree', 3)

            assert.equal (md.find macro ('oneTwo'), nil)
            assert.equal (md.find macro ('oneTwoThree'), 3)
            assert.equal (md.find macro ('oneTwoFour'), nil)
