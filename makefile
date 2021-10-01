# e.g. make deploy MEMORY_SIZE=10240 DEPLOYMENT_BUCKET=my-cf-deployment-bucket

STACK_NAME := graviton-test
MEMORY_SIZE := 2048

out: 
	mkdir -p out

out/lambda/lambda.js: lambda/lambda.js | out
	cd lambda && npm ci && `npm bin`/esbuild --bundle lambda.js --outdir=../out/lambda --platform=node --target=es2020

out/ffmpeg-release-%-static.tar.xz: | out
	curl -L https://johnvansickle.com/ffmpeg/releases/$(@F) -o $@

out/ffmpeg-layer-%/ffmpeg: out/ffmpeg-release-%-static.tar.xz 
	mkdir -p $(@D)
	tar jxf $< -C $(@D) --strip-components 1
	touch $@ # ignore tar timestamp to avoid constant rebuilds

out/template.yaml: template.yaml out/lambda/lambda.js out/ffmpeg-layer-arm64/ffmpeg out/ffmpeg-layer-amd64/ffmpeg
	aws cloudformation package --template-file $< --output-template-file $@ --s3-bucket $(DEPLOYMENT_BUCKET)

deploy: out/template.yaml
	aws cloudformation deploy --template-file $< --stack-name $(STACK_NAME) --capabilities CAPABILITY_IAM --parameter-overrides MemorySize=$(MEMORY_SIZE)

outputs:
	aws cloudformation describe-stacks --stack-name $(STACK_NAME) --query Stacks[].Outputs[] --output text

clean:
	rm -rf out

.PHONY: clean deploy

