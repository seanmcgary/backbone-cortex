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

release: bumpVersion build
	git add .
	git commit -m 'release version $$(echo ${VERSION_CMD} | node)'
	git tag -a $$(echo ${VERSION_CMD} | node) -m "$$(echo ${VERSION_CMD} | node)"
	git push --tags
	npm publish

bumpVersion:
	npm version $(VERSION) --no-git-tag-version

build: minify

minify:
	git rm --cached build/cortex-*.js | true
	rm build/cortex-*.js | true
	uglifyjs --compress --mangle --output build/cortex-$$(echo ${VERSION_CMD} | node).min.js -- client/cortex.js
	uglifyjs --output build/cortex-$$(echo ${VERSION_CMD} | node).js -- client/cortex.js

