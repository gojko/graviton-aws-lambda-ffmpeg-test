'use strict';
const fs = require('fs'),
	{ S3Client, GetObjectCommand } = require('@aws-sdk/client-s3'),
	s3Client = new S3Client();
module.exports = async function downloadFileFromS3 ({bucket, key, localFile}) {
	const file = fs.createWriteStream(localFile),
		data = await s3Client.send(new GetObjectCommand({Bucket: bucket, Key: key})),
		stream = data.Body;
	return new Promise((resolve, reject) => {
		stream.on('error', reject);
		file.on('error', reject);
		file.on('finish', () => {
			resolve(localFile);
		});
		stream.pipe(file);
	});
};
