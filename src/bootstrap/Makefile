pogo : commandLine.js codeGenerator/unaryOperatorExpression.js

commandLine.js : commandLine.pogo
	pogo -c commandLine.pogo

commandLine.pogo : preparser.js parser.js

preparser.js : preparser.pogo
	pogo -c preparser.pogo

parser.js : parser.pogo
	pogo -c parser.pogo

runtime.js : runtime.pogo
	pogo -c runtime.pogo

codeGenerator/unaryOperatorExpression.js : codeGenerator/unaryOperatorExpression.pogo
	pogo -c codeGenerator/unaryOperatorExpression.pogo