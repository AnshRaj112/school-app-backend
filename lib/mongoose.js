const mongoose = require('mongoose');

function getMongoUri(envKey) {
	const uri = process.env[envKey];
	if (!uri) {
		throw new Error(`Missing environment variable: ${envKey}`);
	}
	return uri;
}

function setMongooseDebug(enabled) {
	mongoose.set('debug', !!enabled);
}

function createConnection(uri, dbName) {
    const conn = mongoose.createConnection(uri, {
        dbName,
        maxPoolSize: 10,
        autoIndex: true,
    });
    conn.on('connected', () => console.log(`[mongoose] connected ${uri}/${dbName || ''}`));
    conn.on('error', (err) => console.error(`[mongoose] error ${uri}/${dbName || ''}`, err));
    conn.on('disconnected', () => console.warn(`[mongoose] disconnected ${uri}/${dbName || ''}`));
    return conn;
}

module.exports = {
	getMongoUri,
	createConnection,
	setMongooseDebug,
};
