module.exports = function registerSubjectModel(conn) {
	const { Schema } = require('mongoose');
	const SubjectSchema = new Schema({
		schoolId: { type: Schema.Types.ObjectId, required: true },
		name: { type: String, required: true },
		code: { type: String, required: true },
		sectionId: { type: Schema.Types.ObjectId, required: true },
		teacherId: { type: Schema.Types.ObjectId },
	}, { timestamps: true });
	conn.model('Subject', SubjectSchema);
};
