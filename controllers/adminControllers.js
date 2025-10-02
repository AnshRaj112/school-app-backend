const Admin = require("../models/admin");

/**
 * Create a new admin of any type
 * role must be: super_admin | admin | moderator
 */
exports.createAdmin = async (req, res) => {
  try {
    // Safety: fallback if req.body is undefined
    const body = req.body || {};
    const { username, email, password, fullName, role, permissions } = body;

    if (!username || !email || !password || !fullName || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["super_admin", "admin", "moderator"].includes(role)) {
      return res.status(400).json({ message: "Invalid role type" });
    }

    // lean() returns plain JS object → faster than full Mongoose document
    const existing = await Admin.findOne({
      $or: [{ email }, { username }],
    }).lean();

    if (existing) {
      return res
        .status(400)
        .json({ message: "Email or username already exists" });
    }

    // Let the model handle password hashing via pre('save')
    const admin = new Admin({
      username,
      email,
      password,
      fullName,
      role,
      permissions,
    });

    await admin.save();

    return res.status(201).json({
      message: "Admin created successfully",
      admin: admin.toPublicJSON(),
    });
  } catch (error) {
    console.error("CreateAdmin Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
