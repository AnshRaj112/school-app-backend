module.exports = function registerAttendanceModel(conn) {
	const { Schema } = require('mongoose');

	const AttendanceEntrySchema = new Schema({
		studentId: { type: Schema.Types.ObjectId, required: true }, // users.User with role 'student'
		status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
		markedAt: { type: Date, default: Date.now },
	}, { _id: false });

	const AttendanceSchema = new Schema({
		schoolId: { type: Schema.Types.ObjectId, required: true },
		sectionId: { type: Schema.Types.ObjectId, required: true },
		date: { type: Date, required: true },
		markedByTeacherId: { type: Schema.Types.ObjectId, required: true },
		entries: { type: [AttendanceEntrySchema], default: [] },
		cutoffTime: { type: String },
	}, { timestamps: true });

	conn.model('Attendance', AttendanceSchema);
};
