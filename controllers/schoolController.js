const School = require("../models/school");
const Admin = require("../models/admin");
const Principal = require("../models/principal");

/**
 * CREATE SCHOOL (POST)
 */
exports.createSchool = async (req, res) => {
  try {
    const { actorId } = req.body;
    const actor = await Admin.findById(actorId);

    if (!actor || actor.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Only Super Admin can create schools" });
    }

    const school = await School.create(req.body);
    return res.status(201).json({ message: "School created", school });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * GET ALL SCHOOLS (GET)
 */
exports.getAllSchools = async (req, res) => {
  try {
    const { actorId } = req.query;

    const actor = await Admin.findById(actorId);
    if (!actor || actor.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Only Super Admin can view schools" });
    }

    const schools = await School.find();
    return res.json({ schools });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * GET SCHOOL BY ID (GET)
 */
exports.getSchoolById = async (req, res) => {
  try {
    const { actorId } = req.query;
    const { id } = req.params;

    const admin = await Admin.findById(actorId);
    const principal = admin ? null : await Principal.findById(actorId);

    if (admin && admin.role === "super_admin") {
      return res.json({ school: await School.findById(id) });
    }

    if (admin && admin.school?.toString() === id) {
      return res.json({ school: await School.findById(id) });
    }

    if (principal && principal.school?.toString() === id) {
      return res.json({ school: await School.findById(id) });
    }

    return res.status(403).json({ message: "Unauthorized" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * UPDATE SCHOOL (PUT)
 */
exports.updateSchool = async (req, res) => {
  try {
    const { actorId } = req.body;
    const { id } = req.params;

    const admin = await Admin.findById(actorId);
    const principal = admin ? null : await Principal.findById(actorId);

    if (admin && admin.role === "super_admin") {
      return res.json({
        message: "School updated",
        school: await School.findByIdAndUpdate(id, req.body, { new: true }),
      });
    }

    if (admin && admin.school?.toString() === id) {
      return res.json({
        message: "School updated",
        school: await School.findByIdAndUpdate(id, req.body, { new: true }),
      });
    }

    if (principal && principal.school?.toString() === id) {
      return res.json({
        message: "School updated",
        school: await School.findByIdAndUpdate(id, req.body, { new: true }),
      });
    }

    return res.status(403).json({ message: "Unauthorized" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * DELETE SCHOOL (DELETE)
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
    return res.json({ message: "School deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
