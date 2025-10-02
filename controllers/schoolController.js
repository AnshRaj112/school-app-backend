const School = require("../models/school");
const Admin = require("../models/admin");
const Principal = require("../models/principal");

/**
 * Create a new school
 * Only Super Admin allowed
 */
exports.createSchool = async (req, res) => {
  try {
    const { actorId } = req.body; // ID of the admin/principal performing action
    const actor = await Admin.findById(actorId);

    if (!actor || actor.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Only Super Admin can create schools" });
    }

    const { name, code, address, city, state, country, pincode, phone, email } =
      req.body;

    const existing = await School.findOne({ $or: [{ name }, { code }] });
    if (existing) {
      return res
        .status(400)
        .json({ message: "School with same name or code already exists" });
    }

    const school = new School({
      name,
      code,
      address,
      city,
      state,
      country,
      pincode,
      phone,
      email,
    });

    await school.save();
    return res
      .status(201)
      .json({ message: "School created successfully", school });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * Retrieve all schools
 * Super Admin only
 */
exports.getAllSchools = async (req, res) => {
  try {
    const { actorId } = req.body;
    const actor = await Admin.findById(actorId);

    if (!actor || actor.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Only Super Admin can view all schools" });
    }

    const schools = await School.find();
    return res.status(200).json({ schools });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * Retrieve school details
 * Admin => only their school
 * Principal => only their school
 * Super Admin => any school
 */
exports.getSchoolById = async (req, res) => {
  try {
    const { actorId } = req.body;
    const { id } = req.params;

    let actor = await Admin.findById(actorId);
    let principal = null;

    if (!actor) {
      principal = await Principal.findById(actorId);
    }

    if (actor && actor.role === "super_admin") {
      const school = await School.findById(id);
      return res.status(200).json({ school });
    }

    if (actor && actor.role === "admin") {
      if (actor.school?.toString() !== id) {
        return res
          .status(403)
          .json({ message: "Admins can only access their own school" });
      }
      const school = await School.findById(id);
      return res.status(200).json({ school });
    }

    if (principal) {
      if (principal.school?.toString() !== id) {
        return res
          .status(403)
          .json({ message: "Principals can only access their own school" });
      }
      const school = await School.findById(id);
      return res.status(200).json({ school });
    }

    return res.status(403).json({ message: "Unauthorized" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * Update school details
 * Admin => only their school
 * Principal => only their school
 * Super Admin => any school
 */
exports.updateSchool = async (req, res) => {
  try {
    const { actorId } = req.body;
    const { id } = req.params;
    const updates = req.body;

    let actor = await Admin.findById(actorId);
    let principal = null;

    if (!actor) {
      principal = await Principal.findById(actorId);
    }

    if (actor && actor.role === "super_admin") {
      const school = await School.findByIdAndUpdate(id, updates, { new: true });
      return res.status(200).json({ message: "School updated", school });
    }

    if (actor && actor.role === "admin") {
      if (actor.school?.toString() !== id) {
        return res
          .status(403)
          .json({ message: "Admins can only update their own school" });
      }
      const school = await School.findByIdAndUpdate(id, updates, { new: true });
      return res.status(200).json({ message: "School updated", school });
    }

    if (principal) {
      if (principal.school?.toString() !== id) {
        return res
          .status(403)
          .json({ message: "Principals can only update their own school" });
      }
      const school = await School.findByIdAndUpdate(id, updates, { new: true });
      return res.status(200).json({ message: "School updated", school });
    }

    return res.status(403).json({ message: "Unauthorized" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete a school
 * Only Super Admin
 */
exports.deleteSchool = async (req, res) => {
  try {
    const { actorId } = req.body;
    const { id } = req.params;
    const actor = await Admin.findById(actorId);

    if (!actor || actor.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Only Super Admin can delete schools" });
    }

    await School.findByIdAndDelete(id);
    return res.status(200).json({ message: "School deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
