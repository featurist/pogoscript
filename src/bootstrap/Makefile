pogo : commandLine.js

commandLine.js : commandLine.pogo
	pogo -c commandLine.pogo

commandLine.pogo : preparser.js parser.js

preparser.js : preparser.pogo
	pogo -c preparser.pogo

parser.js : parser.ocean
	ocean --compile parser.ocean

runtime.js : runtime.pogo
	pogo -c runtime.pogo
