option parser = require '../lib/optionParser'
should = require 'should'

describe 'option parser'
    describe 'long options'
        it 'parses a boolean option written fully, like --option'
            args = ['--option']

            cli = option parser.create parser ()
            cli.option '--option this is an option'
            options = cli.parse (args)
            (options).option.should.equal (true)

        it 'long options with hyphens are accessed with camel-case'
            args = ['--big-name']

            cli = option parser.create parser ()
            cli.option '--big-name this is an option'
            options = cli.parse (args)
            (options).big name.should.equal (true)

        it 'parses a boolean option written fully, like --option, even when short is defined'
            args = ['--option', 'filename']

            cli = option parser.create parser ()
            cli.option '-o, --option this is an option'
            options = cli.parse (args)
            (options).option.should.equal (true)

    describe 'short options'
        it 'parses a boolean option written short, like -o'
            args = ['-o', 'filename']

            cli = option parser.create parser ()
            cli.option '-o, --option this is an option'
            options = cli.parse (args)
            (options).option.should.equal (true)

        it 'parses several boolean options written short, like -of'
            args = ['-of', 'filename']

            cli = option parser.create parser ()
            cli.option '-o, --option this is an option'
            cli.option '-f, --filename this is the filename'
            options = cli.parse (args)
            (options).option.should.equal (true)
            (options).filename.should.equal (true)

    it 'throws error if option given that was not defined'
        args = ['-f', 'filename']

        cli = option parser.create parser ()
        cli.option '-o, --option this is an option'

        @{ cli.parse (args) }.should.throw 'no such option -f'

    describe 'remaining, non-option arguments'
        it "only parses options up to the first non option, no further.
            this is so we can pass the remaining options to the script
            which is the first non-option argument"

            args = ['-f', 'filename', '--option']

            cli = option parser.create parser ()
            cli.option '-o, --option this is an option'
            cli.option '-f, --filename this is the filename'

            options = cli.parse (args)
            (options).filename.should.equal (true)
            (options).option.should.equal (false)

        it 'lists the remaining arguments in _'
            args = ['-f', 'filename', '--option']

            cli = option parser.create parser ()
            cli.option '-o, --option this is an option'
            cli.option '-f, --filename this is the filename'

            options = cli.parse (args)
            options._.should.eql ['filename', '--option']

        it '_ is empty if there are no further arguments'
            args = ['-f']

            cli = option parser.create parser ()
            cli.option '-f, --filename this is the filename'

            options = cli.parse (args)
            options._.should.eql []
