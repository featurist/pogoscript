all : subdirs index.js

index.js : index.pogo
	pogo -c index.pogo

subdirs:
	for subdir in lib; do \
		$(MAKE) -C $$subdir; \
	done

test : non-wip-tests

non-wip-tests :
	npm test

wip : wip-tests

wip-tests :
	mocha -g @wip test/*Spec.* test/*/*Spec.*

clean:
	for subdir in src/bootstrap lib; do \
		$(MAKE) -C $$subdir clean; \
	done
