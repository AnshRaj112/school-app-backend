const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

// Import Models
const School = require("./models/school");
const Teacher = require("./models/teacher");
const Class = require("./models/class");
const Section = require("./models/section");
const Subject = require("./models/subject");
const Student = require("./models/student");
const TeachingAssignment = require("./models/teachingAssignment");

const TEACHER_NAMES = [
    "Aarav Patel",
    "Vivaan Rao",
    "Aditya Sharma",
    "Vihaan Gupta",
    "Arjun Singh",
    "Sai Kumar",
    "Reyansh Verma",
    "Krishna Iyer",
    "Ishaan Reddy",
    "Shaurya Nair",
    "Saanvi Mehta",
    "Anya Joshi",
    "Kiara Malhotra",
    "Diya Saxena",
    "Anaya Kulkarni",
    "Myra Deshmukh",
    "Aditi Bhatia",
    "Pari Choudhury",
    "Riya Kapoor",
    "Anvi Chatterjee"
];

const SUBJECTS = [
    { name: "Mathematics", code: "MATH" },
    { name: "English", code: "ENG" },
    { name: "Science", code: "SCI" },
    { name: "History", code: "HIST" },
    { name: "Geography", code: "GEO" },
    { name: "Art", code: "ART" }
];

async function seed() {
    console.log("🌱 Starting Improved Seed Script...");

    if (!process.env.MONGO_URI) {
        console.error("❌ MONGO_URI is missing.");
        process.exit(1);
    }

    try {
        // Wait for DB Connection
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 1. Find or Create School
        let school = await School.findOne();
        if (!school) {
            school = await School.create({
                name: "Springfield Public School",
                code: "SPS",
                address: "123 Evergreen Terrace",
                status: "active"
            });
        }
        const SCHOOL_ID = school._id;
        console.log(`✅ School: ${school.name}`);

        // !! CLEAR EXISTING DATA !!
        console.log("🧹 Clearing old data...");
        await Teacher.deleteMany({ schoolId: SCHOOL_ID });
        await Class.deleteMany({ schoolId: SCHOOL_ID });
        await Section.deleteMany({ schoolId: SCHOOL_ID });
        await Subject.deleteMany({ schoolId: SCHOOL_ID });
        await Student.deleteMany({ school: SCHOOL_ID });
        await TeachingAssignment.deleteMany({ schoolId: SCHOOL_ID });

        // 2. Create Teachers
        console.log("Creating Teachers...");
        const teacherDocs = [];
        for (const name of TEACHER_NAMES) {
            const username = name.toLowerCase().replace(/\s+/g, ".");
            const email = `${username}@springfield.edu`;
            const teacher = await Teacher.create({
                schoolId: SCHOOL_ID,
                username,
                email,
                password: "password123",
                fullName: name,
                roles: ["subject_teacher"], // Default role, upgrade later
                teachableGrades: [{ from: 1, to: 5 }]
            });
            teacherDocs.push(teacher);
        }

        // 3. Create Classes, Sections, Subjects, and Assign Teachers
        // Pool for Class Teachers (take first 10, e.g.)
        // Pool for Subject Teachers (all)
        let classTeacherIndex = 0;

        for (let g = 1; g <= 5; g++) {
            const cls = await Class.create({ schoolId: SCHOOL_ID, grade: g });

            // Sections A & B
            for (const secName of ["A", "B"]) {
                // Assign unique Class Teacher
                const classTeacher = teacherDocs[classTeacherIndex % teacherDocs.length];
                classTeacherIndex++;

                // Upgrade role
                await Teacher.findByIdAndUpdate(classTeacher._id, { $addToSet: { roles: "class_teacher" } });

                const section = await Section.create({
                    schoolId: SCHOOL_ID,
                    classId: cls._id,
                    name: secName,
                    classTeacherId: classTeacher._id
                });

                // Create Subjects and Assignments
                for (const subj of SUBJECTS) {
                    const subject = await Subject.create({
                        schoolId: SCHOOL_ID,
                        classId: cls._id,
                        name: subj.name,
                        code: `${subj.code}-${g}-${secName}` // Unique code per section/class usually
                    });

                    // Assign a random teacher as Subject Teacher
                    const subjectTeacher = teacherDocs[Math.floor(Math.random() * teacherDocs.length)];

                    await TeachingAssignment.create({
                        schoolId: SCHOOL_ID,
                        sectionId: section._id,
                        subjectId: subject._id,
                        teacherId: subjectTeacher._id,
                        academicYear: "2025-26"
                    });
                }
            }
        }

        // 4. Create Students (300)
        console.log("Creating 300 Students...");
        const sections = await Section.find({ schoolId: SCHOOL_ID });

        // Batch Insert for speed (~300 items is fine)
        const students = [];
        for (let i = 0; i < 300; i++) {
            const section = sections[Math.floor(Math.random() * sections.length)];
            const firstName = `Student${i + 1}`;
            const lastName = "Doe";
            const fullName = `${firstName} ${lastName}`;
            students.push({
                username: `${firstName}.${lastName}`.toLowerCase(),
                email: `${firstName}.${lastName}${i}@student.springfield.edu`, // Ensure unique email
                password: "password123", // Note: Pre-save hook might not run on insertMany, iterating loop is safer for hashing
                fullName,
                school: SCHOOL_ID,
                section: section._id
            });
        }

        // Use loop to trigger pre-save middleware (hashing)
        // To speed up, we can hash once manually or just accept slower seed
        // Let's use loop.
        for (const s of students) {
            await Student.create(s);
        }

        console.log("🏁 Seeding Complete!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding Failed:", error);
        process.exit(1);
    }
}

seed();
