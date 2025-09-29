module.exports = function registerMarksModel(conn) {
	const { Schema } = require('mongoose');

	const MarksEntrySchema = new Schema({
		studentId: { type: Schema.Types.ObjectId, required: true }, // users.User with role 'student'
		score: { type: Number, required: true },
		maxScore: { type: Number, required: true },
		answerSheetUrl: { type: String },
	}, { _id: false });

	const MarksSchema = new Schema({
		schoolId: { type: Schema.Types.ObjectId, required: true },
		sectionId: { type: Schema.Types.ObjectId, required: true },
		subjectId: { type: Schema.Types.ObjectId, required: true },
		teacherId: { type: Schema.Types.ObjectId, required: true },
		assessmentName: { type: String, required: true },
		entries: { type: [MarksEntrySchema], default: [] },
	}, { timestamps: true });

	conn.model('Marks', MarksSchema);
};
