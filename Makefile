.PHONY: build docker

build:
	@echo 'Build Docker'
	@cp -r pkg cmd package.*json Dockerfile build
	@docker build $(shell pwd)/build -t driver:latest
	@rm -r build
	@mkdir build
	@mkdir build/cert
	@echo 'Image Build'
docker:
	@docker save driver:latest -o driver.tar
