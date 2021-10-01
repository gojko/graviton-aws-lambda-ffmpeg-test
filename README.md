# Test fixture for Graviton2/Intel AWS Lambda ffMpeg conversion

This stack makes it easy to compare Graviton2 (ARM64) and Intel (X68_64/AMD64) architecture performance on AWS Lambda for CPU-intensive video file conversions using ffMpeg.

The stack sets up a S3 bucket and two Lambda functions. Both functions take any file uploaded to the S3 bucket, resample it using ffMpeg, and output the time for the ffMpeg job (ignoring lambda startup and s3 file download time). 


## Prerequisites

* GNU make or compatible makefile runner
* aws command line tools (optionally AWS SAM to look for logs easily)
* Node.js 14 or later 

## How to deploy

Deploy the stack to your aws account (replace DEPLOYMENT_BUCKET value with your bucket, optionally setting the max allowed memory size as well):

```
make deploy MEMORY_SIZE=10240 DEPLOYMENT_BUCKET=my-cf-deployment-bucket
```

by default the stack name will be graviton-test, you can change that by setting `STACK_NAME` during deployment, similar to the parameters above.


## How to run a test

Get the upload bucket name for the stack

```
make outputs
```

Upload a video to the bucket for conversion (get the upload bucket name from the previous command)

```
aws s3 cp video-file.mp4 s3://UPLOAD_BUCKET_NAME
```

Look for logs in cloudwatch, or using AWS SAM:

```
sam logs -n ArmConvertFileFunction --stack-name graviton-test
sam logs -n IntelConvertFileFunction --stack-name graviton-test
```

## Test output

Each function logs to its own cloudwatch logs, with a JSON format outputing the uploaded key, max available memory size for lambda

- Graviton 2/ arm function

```json
{
  key: 'pexels-i-am-sorin-6172942.mp4',
  memorySize: '10240',
  arch: 'arm64',
  time: 53565,
  fileSize: 184974533
}
```

- Intel/X86 function

```json
{
  key: 'pexels-i-am-sorin-6172942.mp4',
  memorySize: '10240',
  arch: 'x86_64',
  time: 43454,
  fileSize: 184974533
}
```

## Remove resources


