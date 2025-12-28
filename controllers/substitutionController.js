const Substitution = require("../models/substituteAssignment");
const TeachingAssignment = require("../models/teachingAssignment");
const Teacher = require("../models/teacher");

const { isPrivileged } = require("../utils/authorization");

/**
 * Create Substitution
 */
exports.createSubstitution = async (req, res) => {
  try {
    const auth = await isPrivileged(req.body.actorId);
    if (!auth.ok)
      return res.status(auth.status).json({ message: auth.message });

    const substitution = await Substitution.create({
      ...req.body,
      assignedById: req.body.actorId,
    });

    res.status(201).json({ message: "Substitution created", substitution });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Substitution already exists" });
    }
    res.status(500).json({ message: "Failed to create substitution" });
  }
};

/**
 * Get Substitutions by Date
 */
exports.getByDate = async (req, res) => {
  const auth = await isPrivileged(req.query.actorId);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  const subs = await Substitution.find({
    date: req.query.date,
    isActive: true,
  });

  res.json({ substitutions: subs });
};

/**
 * Get Substitutions by Section
 */
exports.getBySection = async (req, res) => {
  const auth = await isPrivileged(req.query.actorId);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  const assignments = await TeachingAssignment.find({
    sectionId: req.query.sectionId,
  });

  const subs = await Substitution.find({
    teachingAssignmentId: { $in: assignments.map((a) => a._id) },
    isActive: true,
  });

  res.json({ substitutions: subs });
};

/**
 * Get Available Substitute Teachers
 */
exports.getAvailableTeachers = async (req, res) => {
  const auth = await isPrivileged(req.query.actorId);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  const { schoolId, date } = req.query;

  const occupied = await Substitution.find({ date }).distinct(
    "substituteTeacherId"
  );

  const teachers = await Teacher.find({
    schoolId,
    isActive: true,
    _id: { $nin: occupied },
  });

  res.json({ teachers });
};

/**
 * Activate / Deactivate Substitution
 */
exports.updateSubstitutionStatus = async (req, res) => {
  const auth = await isPrivileged(req.body.actorId);
  if (!auth.ok) return res.status(auth.status).json({ message: auth.message });

  const sub = await Substitution.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true }
  );

  res.json({ message: "Substitution updated", substitution: sub });
};
