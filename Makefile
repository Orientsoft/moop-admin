.PHONY: build push

DEPLOY_NAMESPACE = moop-dev
TAG			= $(shell git describe --tags --always)
REGISTRY	= registry.mooplab.com:8443/moop
IMAGE		= moop-admin-service


build: 
	docker build --rm -t "$(REGISTRY)/$(IMAGE):$(TAG)" -f Dockerfile .

push: build
	docker push "$(REGISTRY)/$(IMAGE):$(TAG)"

deploy: push
	# replace image tag on deployment.yaml
	sed -i 's/{IMAGE_TAG_for_change}/$(TAG)/g' deploy/server-deployment.yaml
	# apply change
	kubectl apply -f deploy/ --namespace "$(DEPLOY_NAMESPACE)"
	# restore deployment.yaml
	sed -i 's/$(TAG)/{IMAGE_TAG_for_change}/g' deploy/server-deployment.yaml
