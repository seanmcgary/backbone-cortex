PATCH=patch
MINOR=minor
MAJOR=major

VERSION_CMD="console.log(require('./package.json').version)"

ifeq ($(VERSION),$(MAJOR))
	VERSION=$(MAJOR)
else ifeq ($(VERSION),$(MINOR))
	VERSION=$(MINOR)
else
	VERSION=$(PATCH)
endif


.PHONY: release

clean:
	rm build/*.js

release: bumpVersion 

bumpVersion:
	npm version $(VERSION)

minify:
	uglifyjs --compress --mangle --output build/cortex.$$(echo ${VERSION_CMD} | node).min.js -- client/cortex.js
	uglifyjs --output build/cortex.$$(echo ${VERSION_CMD} | node).js -- client/cortex.js

