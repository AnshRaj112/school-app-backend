module.exports = function createSchoolSettingsSchema() {
	const { Schema } = require('mongoose');
	return new Schema({
		attendanceCutoffTime: { type: String, default: '18:00' },
		maxDailyPeriods: { type: Number, default: 8 },
	}, { _id: false });
};
