all : subdirs index.js

index.js : index.pogo
	pogo -c index.pogo

subdirs:
	for subdir in lib lib/parser; do \
		$(MAKE) -C $$subdir; \
	done

test : non-wip-tests

non-wip-tests :
	npm test

wip : wip-tests

wip-tests :
	mocha -g @wip test/*Spec.* test/*/*Spec.*

test/pogo.js : browser-test

browser-test :
	pogo lib/tools/bundle.pogo --test > test/pogo.js

html/pogo.js : browser

browser :
	pogo lib/tools/bundle.pogo > html/pogo.js

clean:
	for subdir in src/bootstrap lib; do \
		$(MAKE) -C $$subdir clean; \
	done
