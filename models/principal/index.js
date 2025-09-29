module.exports = function registerPrincipal(conn) {
	require('./PrincipalUser')(conn);
	require('./Section')(conn);
	require('./Subject')(conn);
	require('./Holiday')(conn);
	require('./AdmissionConfig')(conn);
};
