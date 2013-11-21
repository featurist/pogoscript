FILES=*.pogo parser/*.pogo terms/*.pogo

all:
	pogo -cs $(FILES)

clean:
	for pogo in $(FILES); do \
		js_file=$${pogo%.pogo}.js; \
		if [ -e $$js_file ]; \
		then \
			rm $$js_file; \
		fi; \
	done

