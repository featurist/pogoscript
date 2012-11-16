all : subdirs index.js

index.js : index.pogo
	pogo -c index.pogo

subdirs:
	for subdir in src/bootstrap lib; do \
		$(MAKE) -C $$subdir; \
	done

test :
	npm test

clean:
	for subdir in src/bootstrap lib; do \
		$(MAKE) -C $$subdir clean; \
	done
