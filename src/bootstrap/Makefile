pogo : commandLine.js runtime.js grammar.js indentStack.js parserContext.js dynamicLexer.js interpolation.js

test : *Spec.pogo
	bash -c 'for spec in *Spec.pogo; do echo $$spec; mogo $$spec; done'

commandLine.js : commandLine.pogo
	pogo -c commandLine.pogo

commandLine.pogo : parser.js

parser.js : parser.pogo
	pogo -c parser.pogo

grammar.js : grammar.pogo
	pogo -c grammar.pogo

runtime.js : runtime.pogo
	pogo -c runtime.pogo

indentStack.js : indentStack.pogo
	pogo -c indentStack.pogo

parserContext.js : parserContext.pogo
	pogo -c parserContext.pogo

dynamicLexer.js : dynamicLexer.pogo
	pogo -c dynamicLexer.pogo

interpolation.js : interpolation.pogo
	pogo -c interpolation.pogo

clean :
	rm \
		parser.js \
		runtime.js \
		commandLine.js \
		indentStack.js \
		grammar.js \
		parserContext.js \
		dynamicLexer.js
