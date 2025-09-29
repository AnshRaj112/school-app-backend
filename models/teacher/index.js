module.exports = function registerTeacher(conn) {
	require('./TeacherUser')(conn);
	require('./Attendance')(conn);
	require('./Assignment')(conn);
	require('./Marks')(conn);
	require('./Substitute')(conn);
};
