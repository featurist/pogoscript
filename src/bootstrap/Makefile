pogo : commandLine.js codeGenerator/unaryOperatorExpression.js runtime.js grammar.js indentStack.js parserContext.js

test : *Spec.pogo
	bash -c 'for spec in *Spec.pogo; do echo $$spec; pogo $$spec; done'

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

codeGenerator/unaryOperatorExpression.js : codeGenerator/unaryOperatorExpression.pogo
	pogo -c codeGenerator/unaryOperatorExpression.pogo

clean :
	rm parser.js runtime.js codeGenerator/unaryOperatorExpression.js commandLine.js indentStack.js grammar.js parserContext.js
