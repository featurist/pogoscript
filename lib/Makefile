all:
	pogo -cs *.pogo

clean:
	for pogo in *.pogo; do \
		js_file=$${pogo%.pogo}.js; \
		if [ -e $$js_file ]; \
		then \
			rm $$js_file; \
		fi; \
	done

