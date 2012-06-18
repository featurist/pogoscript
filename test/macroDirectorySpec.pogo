cg = require '../src/bootstrap/codeGenerator/codeGenerator'.code generator ()
require './assertions.pogo'
assert = require 'assert'

describe 'macro directory'
    it 'one macro'
        md = cg.macro directory ()
        md.add macro (['one'], 1)
        assert.equal (md.find macro (['one']), 1)

    it "longer name doesn't find macro with shorter name"
        md = cg.macro directory ()
        md.add macro (['one'], 1)
        assert.equal (md.find macro (['one', 'two']), nil)

    it 'finds correct macro among two'
        md = cg.macro directory ()
        md.add macro (['one'], 1)
        md.add macro (['one', 'two'], 2)
        assert.equal (md.find macro (['one', 'two']), 2)

    it 'adding same macro overwrites previous'
        md = cg.macro directory ()
        md.add macro (['one', 'two'], 2)
        md.add macro (['one', 'two'], 3)
        assert.equal (md.find macro (['one', 'two']), 3)

    describe 'wild card macros'
        it 'wild card macro with further name requirement'
            md = cg.macro directory ()

            macro = {}

            wild (name) =
                if ((name.length == 3) && (name.2 == 'three'))
                    macro

            md.add wild card macro (['one', 'two'], wild)

            assert.equal (md.find macro (['one', 'two']), nil)
            assert.equal (md.find macro (['one', 'two', 'three']), macro)
            assert.equal (md.find macro (['one', 'two', 'four']), nil)
        
        it 'wild card macro with exact name'
            md = cg.macro directory ()

            macro = {}

            wild (name) =
                macro

            md.add wild card macro (['one', 'two'], wild)

            assert.equal (md.find macro (['one', 'two']), macro)
        
        it 'normal macros have priority over wild card macros'
            md = cg.macro directory ()

            macro = {}

            wild (name) =
                if ((name.length == 3) && (name.2 == 'three'))
                    macro

            md.add wild card macro (['one', 'two'], wild)
            md.add macro (['one', 'two', 'three'], 3)

            assert.equal (md.find macro (['one', 'two']), nil)
            assert.equal (md.find macro (['one', 'two', 'three']), 3)
            assert.equal (md.find macro (['one', 'two', 'four']), nil)
