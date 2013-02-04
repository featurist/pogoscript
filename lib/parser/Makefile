all: jisonParser.js

jisonParser.js: grammar.js
	./genparser
	patch jisonParser.js jisonParser.patch

clean:
	rm jisonParser.js
