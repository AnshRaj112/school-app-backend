module.exports = function registerHolidayModel(conn) {
	const { Schema } = require('mongoose');
	const HolidaySchema = new Schema({
		schoolId: { type: Schema.Types.ObjectId, required: true },
		title: { type: String, required: true },
		date: { type: Date, required: true },
		description: { type: String },
	}, { timestamps: true });
	conn.model('Holiday', HolidaySchema);
};
