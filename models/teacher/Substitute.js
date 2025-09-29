module.exports = function registerSubstituteModel(conn) {
	const { Schema } = require('mongoose');
	const SubstituteSchema = new Schema({
		schoolId: { type: Schema.Types.ObjectId, required: true },
		date: { type: Date, required: true },
		sectionId: { type: Schema.Types.ObjectId, required: true },
		subjectId: { type: Schema.Types.ObjectId, required: true },
		originalTeacherId: { type: Schema.Types.ObjectId, required: true },
		substituteTeacherId: { type: Schema.Types.ObjectId, required: true },
	}, { timestamps: true });
	conn.model('Substitute', SubstituteSchema);
};
