module.exports = function registerSchoolModel(conn) {
	const { Schema } = require('mongoose');
	const SchoolSettingsSchema = require('./schoolSettings.schema')(conn);
	const SchoolSchema = new Schema({
		name: { type: String, required: true },
		code: { type: String, required: true, unique: true },
		address: { type: String },
		settings: { type: SchoolSettingsSchema, default: () => ({}) },
		createdByAdminId: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
	}, { timestamps: true });
	conn.model('School', SchoolSchema);
};
