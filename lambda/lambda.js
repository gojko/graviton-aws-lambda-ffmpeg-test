'use strict';
const arch = process.env.LAMBDA_ARCH,
	processor = require('./processor');
exports.handler = async (event, context) => {
	const snsMessage = JSON.parse(event.Records[0].Sns.Message),
		s3 = snsMessage.Records[0].s3,
		bucket = s3.bucket.name,
		key = s3.object.key,
		fileSize = s3.object.size,
		memorySize = context.memoryLimitInMB,
		time = await processor({bucket, key});
	console.log({key, memorySize, arch, time, fileSize});
};
