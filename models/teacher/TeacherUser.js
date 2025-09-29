module.exports = function registerTeacherUserModel(conn) {
	const { Schema } = require('mongoose');
	const TeacherUserSchema = new Schema({
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		passwordHash: { type: String, required: true },
		schoolId: { type: Schema.Types.ObjectId, required: true },
		role: { type: String, enum: ['class_teacher', 'subject_teacher', 'substitute_teacher'], required: true },
		assignedSectionIds: [{ type: Schema.Types.ObjectId }],
		subjectIds: [{ type: Schema.Types.ObjectId }],
	}, { timestamps: true });
	conn.model('TeacherUser', TeacherUserSchema);
};
