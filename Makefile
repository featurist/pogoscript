all : subdirs index.js

index.js : index.pogo
	pogo -c index.pogo

subdirs:
	for subdir in lib lib/parser; do \
		$(MAKE) -C $$subdir; \
	done

test : non-wip-tests

non-wip-tests : all
	npm test

wip : wip-tests

wip-tests :
	mocha -g @wip test/*Spec.* test/*/*Spec.*

test/pogo.js : browser-test

browser-test :
	pogo tools/bundle-pogo-tests.pogo > test/pogo.js

html/pogo.js : browser

browser : all
	browserify -t pogoify -x fs -x uglify-js lib/parser/browser.js > pogo.js

clean:
	for subdir in src/bootstrap lib; do \
		$(MAKE) -C $$subdir clean; \
	done
