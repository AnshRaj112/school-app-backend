require("dotenv").config({ debug: false });

// Initialize database connections
const {
  Cluster_Admin,
  Cluster_Principal,
  Cluster_Teacher,
  Cluster_User,
  Cluster_School,
  Cluster_Academics,
  Cluster_Operations,
} = require("./config/db");

// Register models (ensures schemas are compiled on their respective connections)
const Admin = require("./models/admin");
const Principal = require("./models/principal");
const Teacher = require("./models/teacher");
const Student = require("./models/student");

const School = require("./models/school");
const SchoolSetting = require("./models/schoolSetting");

const Section = require("./models/section");
const Subject = require("./models/subject");

const Holiday = require("./models/holiday");
const AdmissionConfig = require("./models/admissionConfig");

const Attendance = require("./models/attendance");
const Assignment = require("./models/assignment");
const Mark = require("./models/marks");

const Leave = require("./models/leave");
const SubstituteTeacher = require("./models/substituteAssignment");
const FeeRule = require("./models/feeRule");
const StudentFee = require("./models/studentFee");
const FeePayment = require("./models/feePayment");

const express = require("express");
const app = express();

// Port
const PORT = process.env.PORT || 3000;
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
app.use(express.json()); // for parsing JSON
app.use(express.urlencoded({ extended: true })); // for parsing form data

const adminRoutes = require("./routes/adminRoutes");
const schoolRoutes = require("./routes/schoolRoutes");
const principalRoutes = require("./routes/principalRoutes");

// Academic domain (new DB-aligned controllers)
const classRoutes = require("./routes/classRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const teachingAssignmentRoutes = require("./routes/teachingAssignmentRoutes");
const substitutionRoutes = require("./routes/substitutionRoutes");

// Core system routes (unchanged)
app.use("/admin", adminRoutes);
app.use("/schools", schoolRoutes);
app.use("/principals", principalRoutes);

// Academic routes (flat & readable)
app.use("/classes", classRoutes);
app.use("/sections", sectionRoutes);
app.use("/subjects", subjectRoutes);
app.use("/teachers", teacherRoutes);
app.use("/assignments", teachingAssignmentRoutes);
app.use("/substitutions", substitutionRoutes);

// Optionally export connections and models for external usage
module.exports = {
  connections: {
    Cluster_Admin,
    Cluster_Principal,
    Cluster_Teacher,
    Cluster_User,
    Cluster_School,
    Cluster_Academics,
    Cluster_Operations,
  },
  models: {
    Admin,
    Principal,
    Teacher,
    Student,
    School,
    SchoolSetting,
    Section,
    Subject,
    Holiday,
    AdmissionConfig,
    Attendance,
    Assignment,
    Mark,
    Leave,
    SubstituteTeacher,
    FeeRule,
    StudentFee,
    FeePayment,
  },
};
