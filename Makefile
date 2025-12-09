dist/index.html: ${wildcard src/**} 
	npm run build

dist/CNAME: CNAME
	mkdir -p dist
	cp CNAME dist/CNAME

.PHONY: build
build: dist/index.html