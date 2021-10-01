'use strict';
const childProcess = require('child_process'),
	spawnPromise = function (command, options, envOptions, progress) {
		return new Promise((resolve, reject) => {
			const childProc = childProcess.spawn(command, options, envOptions || {env: process.env, cwd: process.cwd()}),
				resultBuffers = [],
				errorBuffers = [];
			childProc.stdout.on('data', buffer => resultBuffers.push(buffer));
			childProc.stderr.on('data', buffer => {
				if (progress) {
					progress(buffer.toString().trim());
					errorBuffers.splice(errorBuffers.length - 1, 1, buffer);
				} else {
					errorBuffers.push(buffer);
				}
			});
			childProc.on('close', (code) => {
				if (code !== 0) {
					reject(new Error(
						[command].concat(options).join(' ') + '\n' +
						Buffer.concat(errorBuffers.concat(resultBuffers)).toString().trim()
					));
				} else {
					const result = Buffer.concat(resultBuffers).toString().trim();
					resolve(result);
				}
			});
		});
	};
module.exports = {
	spawn: spawnPromise
};
