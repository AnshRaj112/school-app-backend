module.exports = function registerUserModel(conn) {
	const { Schema } = require('mongoose');

	const UserDetailsSchema = new Schema({
		dateOfBirth: { type: Date },
		address: { type: String },
		guardianName: { type: String },
		guardianPhone: { type: String },
	}, { _id: false });

	const UserSchema = new Schema({
		name: { type: String, required: true },
		email: { type: String, unique: true },
		passwordHash: { type: String },
		role: { type: String, enum: ['student', 'parent'], required: true },
		schoolId: { type: Schema.Types.ObjectId, required: true },
		sectionId: { type: Schema.Types.ObjectId },
		rollNumber: { type: String },
		details: { type: UserDetailsSchema, default: () => ({}) },
		linkedUserIds: [{ type: Schema.Types.ObjectId }],
	}, { timestamps: true });

	conn.model('User', UserSchema);
};
