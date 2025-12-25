const mongoose = require("mongoose");
const Admin = require("../models/admin");
const Principal = require("../models/principal");

/**
 * Internal actor resolution + validation
 */
async function resolveActor(actorId) {
  if (!actorId) {
    return {
      ok: false,
      status: 400,
      message: "actorId is required",
    };
  }

  if (!mongoose.Types.ObjectId.isValid(actorId)) {
    return {
      ok: false,
      status: 400,
      message: "Invalid actorId format",
    };
  }

  const admin = await Admin.findById(actorId);
  if (admin) {
    return {
      ok: true,
      role: admin.role, // e.g. super_admin
      actorType: "admin",
      actor: admin,
    };
  }

  const principal = await Principal.findById(actorId);
  if (principal && principal.isActive) {
    return {
      ok: true,
      role: "principal",
      actorType: "principal",
      actor: principal,
    };
  }

  return {
    ok: false,
    status: 401,
    message: "Actor not found or inactive",
  };
}

/**
 * Public: authorization check
 */
async function isPrivileged(actorId) {
  const result = await resolveActor(actorId);

  if (!result.ok) {
    return result; // propagate validation error
  }

  const allowed = result.role === "super_admin" || result.role === "principal";

  if (!allowed) {
    return {
      ok: false,
      status: 403,
      message: "Insufficient privileges",
    };
  }

  return {
    ok: true,
    role: result.role,
    actorType: result.actorType,
    actor: result.actor,
  };
}

module.exports = { isPrivileged };
