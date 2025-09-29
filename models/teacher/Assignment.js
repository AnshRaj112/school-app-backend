module.exports = function registerAssignmentModel(conn) {
	const { Schema } = require('mongoose');
	const AssignmentSchema = new Schema({
		schoolId: { type: Schema.Types.ObjectId, required: true },
		sectionId: { type: Schema.Types.ObjectId, required: true },
		subjectId: { type: Schema.Types.ObjectId, required: true },
		teacherId: { type: Schema.Types.ObjectId, required: true },
		type: { type: String, enum: ['class_work', 'home_work', 'assignment'], required: true },
		title: { type: String, required: true },
		description: { type: String },
		dueDate: { type: Date },
		attachments: [{ type: String }],
	}, { timestamps: true });
	conn.model('Assignment', AssignmentSchema);
};
