module.exports = function registerLeaveRequestModel(conn) {
	const { Schema } = require('mongoose');
	const LeaveRequestSchema = new Schema({
		schoolId: { type: Schema.Types.ObjectId, required: true },
		studentId: { type: Schema.Types.ObjectId, required: true }, // users.User with role 'student'
		reason: { type: String, required: true },
		fromDate: { type: Date, required: true },
		toDate: { type: Date, required: true },
		status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
	}, { timestamps: true });
	conn.model('LeaveRequest', LeaveRequestSchema);
};
