const mongoose = require("mongoose");
require("dotenv").config();

function createConnection(uri, name) {
  const connection = mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  connection.on("connected", () => {
    console.log(`✅ ${name} database connected successfully`);
  });

  connection.on("error", (err) => {
    console.error(`❌ ${name} database connection error:`, err.message);
  });

  connection.on("disconnected", () => {
    console.log(`⚠️ ${name} database disconnected`);
  });

  return connection;
}

// Core role-based databases (as requested: separate DBs for admin, principal, teacher, users)
const Cluster_Admin = createConnection(process.env.MONGO_URI, "Admin");
const Cluster_Principal = createConnection(process.env.MONGO_URI, "Principal");
const Cluster_Teacher = createConnection(process.env.MONGO_URI, "Teacher");
const Cluster_User = createConnection(process.env.MONGO_URI, "Users");

// Domain databases
const Cluster_School = createConnection(process.env.MONGO_URI, "School");
const Cluster_Academics = createConnection(process.env.MONGO_URI, "Academics");
const Cluster_Operations = createConnection(process.env.MONGO_URI, "Operations");

Promise.all([
  new Promise((resolve) => Cluster_Admin.once("connected", resolve)),
  new Promise((resolve) => Cluster_Principal.once("connected", resolve)),
  new Promise((resolve) => Cluster_Teacher.once("connected", resolve)),
  new Promise((resolve) => Cluster_User.once("connected", resolve)),
  new Promise((resolve) => Cluster_School.once("connected", resolve)),
  new Promise((resolve) => Cluster_Academics.once("connected", resolve)),
  new Promise((resolve) => Cluster_Operations.once("connected", resolve)),
])
  .then(() => {
    console.log("🎉 All database connections established successfully!");
  })
  .catch((err) => {
    console.error("❌ Failed to establish database connections:", err.message);
  });

module.exports = {
  Cluster_Admin,
  Cluster_Principal,
  Cluster_Teacher,
  Cluster_User,
  Cluster_School,
  Cluster_Academics,
  Cluster_Operations,
};


