const Principal = require("../models/principal");
const Admin = require("../models/admin");
const School = require("../models/school");

/**
 * Helper: sanitize principal
 */
function sanitizePrincipal(principal, school = null) {
  if (!principal) return null;

  const { _id, username, email, fullName, isActive, createdAt, updatedAt } =
    principal;

  return {
    _id,
    username,
    email,
    fullName,
    isActive: !!isActive,
    createdAt,
    updatedAt,
    school: school
      ? { _id: school._id, name: school.name, code: school.code }
      : null,
  };
}

/**
 * CREATE PRINCIPAL (POST)
 */
exports.createPrincipal = async (req, res) => {
  try {
    const {
      actorId,
      username,
      email,
      password,
      fullName,
      school: schoolId,
    } = req.body;

    const actor = await Admin.findById(actorId);
    if (!actor || actor.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Only Super Admin can create principals" });
    }

    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(400).json({ message: "Invalid school ID" });
    }

    const existing = await Principal.findOne({
      $or: [{ username }, { email }],
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    const principal = await Principal.create({
      username,
      email,
      password,
      fullName,
      school: schoolId,
    });

    return res.status(201).json({
      message: "Principal created successfully",
      principal: sanitizePrincipal(principal, school),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * UPDATE PRINCIPAL (PUT)
 */
exports.updatePrincipal = async (req, res) => {
  try {
    const { actorId } = req.body;
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.actorId;

    const actor = await Admin.findById(actorId);
    if (!actor || actor.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Only Super Admin can update principals" });
    }

    const principal = await Principal.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!principal) {
      return res.status(404).json({ message: "Principal not found" });
    }

    const school = principal.school
      ? await School.findById(principal.school)
      : null;

    return res.json({
      message: "Principal updated",
      principal: sanitizePrincipal(principal, school),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * GET ALL PRINCIPALS (GET)
 */
exports.getAllPrincipals = async (req, res) => {
  try {
    const { actorId } = req.query;

    const actor = await Admin.findById(actorId);
    if (!actor || actor.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Only Super Admin can view principals" });
    }

    const principals = await Principal.find().lean();
    if (!principals.length) return res.json({ principals: [] });

    const schoolIds = [
      ...new Set(principals.map((p) => p.school?.toString()).filter(Boolean)),
    ];
    const schools = await School.find({ _id: { $in: schoolIds } }).lean();
    const schoolMap = new Map(schools.map((s) => [s._id.toString(), s]));

    const result = principals.map((p) =>
      sanitizePrincipal(p, schoolMap.get(p.school?.toString()))
    );

    return res.json({ principals: result });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * GET PRINCIPAL BY ID (GET)
 */
exports.getPrincipalById = async (req, res) => {
  try {
    const { actorId } = req.query;
    const { id } = req.params;

    const actor = await Admin.findById(actorId);
    if (!actor || actor.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Only Super Admin can view principals" });
    }

    const principal = await Principal.findById(id).lean();
    if (!principal) {
      return res.status(404).json({ message: "Principal not found" });
    }

    const school = principal.school
      ? await School.findById(principal.school).lean()
      : null;

    return res.json({
      principal: sanitizePrincipal(principal, school),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
