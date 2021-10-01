'use strict';
const fs = require('fs'),
	path = require('path'),
	os = require('os'),
	uuid = require('uuid'),
	downloadFileFromS3 = require('./download-file-from-s3'),
	childProcessPromise = require('./child-process-promise');
module.exports = async function processor({bucket, key}) {
	if (!bucket || !key) {
		throw new Error('invalid args:' + JSON.stringify({bucket, key}));
	}
	const tempFileExtension = path.extname(key),
		localFile = path.join(os.tmpdir(), uuid.v4() + '.' + tempFileExtension),
		resultFile = path.join(os.tmpdir(), uuid.v4() + '.mp4');
	await downloadFileFromS3({bucket, key, localFile});
	const startTime = Date.now();
	await childProcessPromise.spawn('/opt/ffmpeg', ['-y', '-loglevel', 'error', '-i', localFile, '-filter_complex', '[0:v]scale=1280:720,setsar=sar=1/1[v1]', '-map', '[v1]', '-map', 'a:0?', resultFile]);
	const finishTime = Date.now();
	await Promise.all([localFile, resultFile].map(fs.promises.unlink));
	return finishTime - startTime;
};
