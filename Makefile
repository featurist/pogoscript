all : subdirs index.js

index.js : index.pogo
	pogo -c index.pogo

subdirs:
	for subdir in src/bootstrap lib; do \
		$(MAKE) -C $$subdir; \
	done

test : test_all

test_all : test/*Spec.pogo
	mogo test/*Spec.*
