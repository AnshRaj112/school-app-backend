module.exports = function registerAdminUserModel(conn) {
	const { Schema } = require('mongoose');
	const AdminUserSchema = new Schema({
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		passwordHash: { type: String, required: true },
		roles: [{ type: String, enum: ['super_admin', 'school_admin'] }],
		managedSchoolIds: [{ type: Schema.Types.ObjectId, ref: 'School' }],
	}, { timestamps: true });
	conn.model('AdminUser', AdminUserSchema);
};
