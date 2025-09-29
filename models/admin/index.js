module.exports = function registerAdmin(conn) {
	require('./School')(conn);
	require('./AdminUser')(conn);
};
