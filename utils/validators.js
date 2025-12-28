const mongoose = require("mongoose");
const Class = require("../models/class");
const Section = require("../models/section");
const Subject = require("../models/subject");
const Teacher = require("../models/teacher");
const School = require("../models/school");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function validateSchool(schoolId) {
  if (!isValidObjectId(schoolId)) return null;
  return School.findById(schoolId);
}

async function validateClass(classId) {
  if (!isValidObjectId(classId)) return null;
  return Class.findById(classId);
}

async function validateSection(sectionId) {
  if (!isValidObjectId(sectionId)) return null;
  return Section.findById(sectionId);
}

async function validateSubject(subjectId) {
  if (!isValidObjectId(subjectId)) return null;
  return Subject.findById(subjectId);
}

async function validateTeacher(teacherId) {
  if (!isValidObjectId(teacherId)) return null;
  return Teacher.findById(teacherId);
}

module.exports = {
  validateSchool,
  validateClass,
  validateSection,
  validateSubject,
  validateTeacher,
};
