module.exports = function registerSectionModel(conn) {
	const { Schema } = require('mongoose');
	const SectionSchema = new Schema({
		schoolId: { type: Schema.Types.ObjectId, required: true },
		name: { type: String, required: true },
		grade: { type: String, required: true },
		classTeacherId: { type: Schema.Types.ObjectId },
		teacherIds: [{ type: Schema.Types.ObjectId }],
		studentIds: [{ type: Schema.Types.ObjectId }], // users.User with role 'student'
	}, { timestamps: true });
	conn.model('Section', SectionSchema);
};
