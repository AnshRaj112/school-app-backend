require("dotenv").config();

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
const SubstituteTeacher = require("./models/substituteTeacher");

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
  },
};


