const Principal = require("../models/principal");
const Admin = require("../models/admin");
const School = require("../models/school");

/**
 * Helper: build a sanitized principal object for responses
 */
function sanitizePrincipal(principalObj, schoolObj = null) {
  if (!principalObj) return null;
  const { _id, username, email, fullName, isActive, createdAt, updatedAt } =
    principalObj;

  return {
    _id,
    username,
    email,
    fullName,
    isActive: !!isActive,
    createdAt,
    updatedAt,
    school: schoolObj
      ? { _id: schoolObj._id, name: schoolObj.name, code: schoolObj.code }
      : null,
  };
}

/**
 * Create a new Principal
 * Only Super Admin can create
 */
exports.createPrincipal = async (req, res) => {
  try {
    const { actorId } = req.body;
    const actor = await Admin.findById(actorId).lean();
    if (!actor || actor.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Only Super Admin can create principals" });
    }

    const {
      username,
      email,
      password,
      fullName,
      school: schoolId,
      permissions,
    } = req.body;

    // validate school exists (school model lives on school cluster)
    const school = await School.findById(schoolId).lean();
    if (!school) return res.status(400).json({ message: "Invalid school ID" });

    // Check duplicates
    const existing = await Principal.findOne({
      $or: [{ username }, { email }],
    }).lean();
    if (existing)
      return res
        .status(400)
        .json({ message: "Username or email already exists" });

    const principal = new Principal({
      username,
      email,
      password,
      fullName,
      school: schoolId,
      permissions,
    });

    await principal.save();

    // Build a sanitized response
    const saved = await Principal.findById(principal._id).lean(); // minimal read
    const resp = sanitizePrincipal(saved, school);

    return res
      .status(201)
      .json({ message: "Principal created successfully", principal: resp });
  } catch (error) {
    console.error("createPrincipal error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * Update Principal
 * Only Super Admin can update
 */
exports.updatePrincipal = async (req, res) => {
  try {
    const { actorId } = req.body;
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.actorId; // never use actorId as update data

    const actor = await Admin.findById(actorId).lean();
    if (!actor || actor.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Only Super Admin can update principals" });
    }

    // If school is being changed, validate it
    let newSchool = null;
    if (updates.school) {
      newSchool = await School.findById(updates.school).lean();
      if (!newSchool)
        return res.status(400).json({ message: "Invalid school ID" });
    }

    const principal = await Principal.findByIdAndUpdate(id, updates, {
      new: true,
    }).lean();
    if (!principal)
      return res.status(404).json({ message: "Principal not found" });

    // If school not changed, fetch current school info
    const schoolObj =
      newSchool ||
      (principal.school
        ? await School.findById(principal.school).lean()
        : null);

    const principalResponse = sanitizePrincipal(principal, schoolObj);
    return res
      .status(200)
      .json({ message: "Principal updated", principal: principalResponse });
  } catch (error) {
    console.error("updatePrincipal error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * Get all Principals
 * Only Super Admin
 */
exports.getAllPrincipals = async (req, res) => {
  try {
    const { actorId } = req.body;
    const actor = await Admin.findById(actorId).lean();
    if (!actor || actor.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Only Super Admin can view principals" });
    }

    // fetch principals (lean)
    const principals = await Principal.find().lean();
    if (!principals.length) return res.status(200).json({ principals: [] });

    // gather school ids and fetch schools once
    const schoolIds = [
      ...new Set(
        principals.map((p) => p.school && p.school.toString()).filter(Boolean)
      ),
    ];
    const schools = await School.find({ _id: { $in: schoolIds } }).lean();

    // map for O(1) lookup
    const schoolMap = new Map(schools.map((s) => [s._id.toString(), s]));

    // sanitize results
    const result = principals.map((p) =>
      sanitizePrincipal(p, p.school ? schoolMap.get(p.school.toString()) : null)
    );

    return res.status(200).json({ principals: result });
  } catch (error) {
    console.error("getAllPrincipals error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/**
 * Get Principal by ID
 * Only Super Admin
 */
exports.getPrincipalById = async (req, res) => {
  try {
    const { actorId } = req.body;
    const { id } = req.params;

    const actor = await Admin.findById(actorId).lean();
    if (!actor || actor.role !== "super_admin") {
      return res
        .status(403)
        .json({ message: "Only Super Admin can view principals" });
    }

    const principal = await Principal.findById(id).lean();
    if (!principal)
      return res.status(404).json({ message: "Principal not found" });

    const school = principal.school
      ? await School.findById(principal.school).lean()
      : null;
    const principalWithSchool = sanitizePrincipal(principal, school);

    return res.status(200).json({ principal: principalWithSchool });
  } catch (error) {
    console.error("getPrincipalById error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
