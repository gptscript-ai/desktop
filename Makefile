build: clean
	yarn install --pure-lockfile
	yarn generate

clean:
	yarn clean
