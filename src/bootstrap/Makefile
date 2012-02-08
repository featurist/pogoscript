pogo : commandLine.js codeGenerator/unaryOperatorExpression.js runtime.js

commandLine.js : commandLine.pogo
	pogo -c commandLine.pogo

commandLine.pogo : parser.js

parser.js : parser.pogo grammar.js
	pogo -c parser.pogo

grammar.js : grammar.pogo
	pogo -c grammar.pogo

runtime.js : runtime.pogo
	pogo -c runtime.pogo

codeGenerator/unaryOperatorExpression.js : codeGenerator/unaryOperatorExpression.pogo
	pogo -c codeGenerator/unaryOperatorExpression.pogo

clean :
	rm parser.js runtime.js codeGenerator/unaryOperatorExpression.js commandLine.js