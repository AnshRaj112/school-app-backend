module.exports = function registerUsers(conn) {
	require('./User')(conn);
	require('./LeaveRequest')(conn);
};
