.PHONY: default build run clean

IMAGE_NAME := starlight-api
COMMON_ENV := --env-file ".env"

default: build run

build:
	cd ../ && docker build -t $(IMAGE_NAME) -f Dockerfile.api .

run:
	docker run \
		--network=host \
		--rm \
		--name $(IMAGE_NAME) \
		$(COMMON_ENV) \
		$(IMAGE_NAME)

clean:
	docker rmi $(IMAGE_NAME)

shell:
	docker run \
		--rm \
		--name $(IMAGE_NAME)-shell \
		$(COMMON_ENV) \
		--no-healthcheck \
		-it $(IMAGE_NAME) /bin/sh
