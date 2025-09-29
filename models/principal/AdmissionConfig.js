module.exports = function registerAdmissionConfigModel(conn) {
	const { Schema } = require('mongoose');
	const AdmissionConfigSchema = new Schema({
		schoolId: { type: Schema.Types.ObjectId, required: true },
		isOpen: { type: Boolean, default: false },
		price: { type: Number, default: 0 },
		openFrom: { type: Date },
		openTo: { type: Date },
	}, { timestamps: true });
	conn.model('AdmissionConfig', AdmissionConfigSchema);
};
