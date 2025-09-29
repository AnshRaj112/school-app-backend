module.exports = function registerPrincipalUserModel(conn) {
	const { Schema } = require('mongoose');
	const PrincipalUserSchema = new Schema({
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		passwordHash: { type: String, required: true },
		schoolId: { type: Schema.Types.ObjectId },
	}, { timestamps: true });
	conn.model('PrincipalUser', PrincipalUserSchema);
};
