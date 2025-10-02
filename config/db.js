const mongoose = require("mongoose");
require("dotenv").config({ debug: false });

const DEBUG_DB = process.env.DEBUG_DB === "true";

function createConnection(uri, name) {
  if (!uri) throw new Error(`MongoDB URI for ${name} is not defined!`);

  const connection = mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  if (DEBUG_DB) {
    connection.on("connected", () =>
      console.log(`✅ ${name} database connected successfully`)
    );
    connection.on("error", (err) =>
      console.error(`❌ ${name} database connection error:`, err.message)
    );
    connection.on("disconnected", () =>
      console.log(`⚠️ ${name} database disconnected`)
    );
  } else {
    connection.on("error", (err) =>
      console.error(`❌ ${name} database connection error:`, err.message)
    );
  }

  return connection;
}

// All databases using the same URI
const Cluster_Admin = createConnection(process.env.MONGO_URI, "Admin");
const Cluster_Principal = createConnection(process.env.MONGO_URI, "Principal");
const Cluster_Teacher = createConnection(process.env.MONGO_URI, "Teacher");
const Cluster_User = createConnection(process.env.MONGO_URI, "Users");
const Cluster_School = createConnection(process.env.MONGO_URI, "School");
const Cluster_Academics = createConnection(process.env.MONGO_URI, "Academics");
const Cluster_Operations = createConnection(
  process.env.MONGO_URI,
  "Operations"
);

Promise.all(
  [
    Cluster_Admin,
    Cluster_Principal,
    Cluster_Teacher,
    Cluster_User,
    Cluster_School,
    Cluster_Academics,
    Cluster_Operations,
  ].map((conn) => new Promise((resolve) => conn.once("connected", resolve)))
)
  .then(() => {
    if (!DEBUG_DB) console.log("🎉 All databases successfully connected!");
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
