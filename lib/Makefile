all:
	pogo -cs *.pogo parser/*.pogo terms/*.pogo

clean:
	for pogo in *.pogo parser/*.pogo terms/*.pogo; do \
		js_file=$${pogo%.pogo}.js; \
		if [ -e $$js_file ]; \
		then \
			rm $$js_file; \
		fi; \
	done

