require('dotenv').config();
const mongoose = require('mongoose');
const { createConnection, getMongoUri, setMongooseDebug } = require('./lib/mongoose');

setMongooseDebug(process.env.MONGOOSE_DEBUG === 'true');

const mongoUri = getMongoUri('MONGO_URI');
const adminConn = createConnection(mongoUri, 'school_app_admin');
const principalConn = createConnection(mongoUri, 'school_app_principal');
const teacherConn = createConnection(mongoUri, 'school_app_teacher');
const usersConn = createConnection(mongoUri, 'school_app_users');

require('./models/admin/index.js')(adminConn);
require('./models/principal/index.js')(principalConn);
require('./models/teacher/index.js')(teacherConn);
require('./models/users/index.js')(usersConn);

async function start() {
	try {
		await Promise.all([
			adminConn.asPromise(),
			principalConn.asPromise(),
			teacherConn.asPromise(),
			usersConn.asPromise(),
		]);
		console.log('[DB] Connected: admin, principal, teacher, users');

		module.exports = {
			connections: { adminConn, principalConn, teacherConn, usersConn },
			mongoose,
		};

		if (require.main === module) {
			console.log('School App Backend initialized.');
		}
	} catch (err) {
		console.error('Failed to connect to MongoDBs:', err);
		process.exit(1);
	}
}

start();
