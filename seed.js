const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

// Import Models (core)
const School = require("./models/school");
const Teacher = require("./models/teacher");
const Class = require("./models/class");
const Section = require("./models/section");
const Subject = require("./models/subject");
const Student = require("./models/student");
const TeachingAssignment = require("./models/teachingAssignment");
const Principal = require("./models/principal");

// Academics domain
const Assignment = require("./models/assignment");
const AssignmentResource = require("./models/assignmentResources");
const AssignmentSubmission = require("./models/assignmentSubmission");
const Attendance = require("./models/attendance");
const Timetable = require("./models/timetable");

// Operations domain
const Holiday = require("./models/holiday");
const FeeRule = require("./models/feeRule");
const StudentFee = require("./models/studentFee");
const FeePayment = require("./models/feePayment");
const SchoolSetting = require("./models/schoolSetting");
const Notice = require("./models/notice");

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

        // 1.a Ensure a default SchoolSetting
        await SchoolSetting.deleteMany({ school: SCHOOL_ID });
        const academicYearStart = new Date(new Date().getFullYear(), 3, 1); // 1 Apr current year
        const academicYearEnd = new Date(academicYearStart.getFullYear() + 1, 2, 31); // 31 Mar next year
        await SchoolSetting.create({
            school: SCHOOL_ID,
            attendanceCutoffTime: "18:00",
            timezone: "Asia/Kolkata",
            academicYearStart,
            academicYearEnd,
        });

        // 1.b Ensure a Principal for this school
        await Principal.deleteMany({ school: SCHOOL_ID });
        const principal = await Principal.create({
            username: "principal.sps",
            email: "principal@springfield.edu",
            password: "password123",
            fullName: "Principal Springfield",
            school: SCHOOL_ID,
        });

        // !! CLEAR EXISTING DATA (academics + operations) !!
        console.log("🧹 Clearing old academic/operations data...");
        await Promise.all([
            Teacher.deleteMany({ schoolId: SCHOOL_ID }),
            Class.deleteMany({ schoolId: SCHOOL_ID }),
            Section.deleteMany({ schoolId: SCHOOL_ID }),
            Subject.deleteMany({ schoolId: SCHOOL_ID }),
            Student.deleteMany({ school: SCHOOL_ID }),
            TeachingAssignment.deleteMany({ schoolId: SCHOOL_ID }),

            Assignment.deleteMany({}),
            AssignmentResource.deleteMany({}),
            AssignmentSubmission.deleteMany({}),
            Attendance.deleteMany({ school: SCHOOL_ID }),
            Timetable.deleteMany({ schoolId: SCHOOL_ID }),

            Holiday.deleteMany({ school: SCHOOL_ID }),
            StudentFee.deleteMany({ school: SCHOOL_ID }),
            FeePayment.deleteMany({ school: SCHOOL_ID }),
            FeeRule.deleteMany({ school: SCHOOL_ID }),
        ]);

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
        const createdNoths = [];
        for (const s of students) {
            const doc = await Student.create(s);
            createdStudents.push(doc);
        }

        // 5. Create Timetable entries (simple 3 periods per section)
        console.log("Creating Timetable...");
        const teachingAssignments = await TeachingAssignment.find({ schoolId: SCHOOL_ID });

        let slot = 0;
        for (const ta of teachingAssignments) {
            // Only create a few entries per section to avoid explosion
            for (let day = 1; day <= 5; day++) {
                const startMinute = 9 * 60 + (slot % 4) * 45; // 9:00, 9:45, 10:30, 11:15
                const endMinute = startMinute + 40;
                await Timetable.create({
                    schoolId: SCHOOL_ID,
                    sectionId: ta.sectionId,
                    subjectId: ta.subjectId,
                    teacherId: ta.teacherId,
                    dayOfWeek: day,
                    startMinute,
                    endMinute,
                });
            }
            slot++;
        }

        // 6. Create Holidays (next 60 days)
        console.log("Creating Holidays...");
        const today = new Date();
        const holidayTemplates = [
            { offset: 7, title: "Second Saturday Holiday" },
            { offset: 15, title: "Festival Break" },
            { offset: 30, title: "Sports Day" },
        ];
        for (const h of holidayTemplates) {
            const date = new Date(today);
            date.setDate(date.getDate() + h.offset);
            await Holiday.create({
                school: SCHOOL_ID,
                title: h.title,
                date,
                description: `${h.title} (auto-seeded)`,
                isFullDay: true,
            });
        }

        // 7. Create Assignments + Resources + Submissions
        console.log("Creating Assignments, Resources, Submissions...");
        const sectionsForAssignments = await Section.find({ schoolId: SCHOOL_ID });
        const subjects = await Subject.find({ schoolId: SCHOOL_ID });

        const assignments = [];
        for (const section of sectionsForAssignments) {
            // Pick subjects for that class
            const classSubjects = subjects.filter(
                (s) => String(s.classId) === String(section.classId)
            );

            for (const subj of classSubjects.slice(0, 3)) {
                // Find a teaching assignment for this section+subject
                const ta = teachingAssignments.find(
                    (t) =>
                        String(t.sectionId._id) === String(section._id) &&
                        String(t.subjectId._id) === String(subj._id)
                );
                if (!ta) continue;

                const baseDate = new Date();
                const dueSoon = new Date(baseDate);
                dueSoon.setDate(dueSoon.getDate() + 3);

                const docs = await Assignment.create([
                    {
                        section: section._id,
                        subject: subj._id,
                        title: `${subj.name} Classwork - Intro`,
                        description: "In-class problems to understand basics.",
                        type: "classwork",
                        assignedBy: ta.teacherId,
                        status: "published",
                        dueDate: null,
                    },
                    {
                        section: section._id,
                        subject: subj._id,
                        title: `${subj.name} Homework - Practice Set`,
                        description: "Solve the attached worksheet.",
                        type: "homework",
                        assignedBy: ta.teacherId,
                        status: "published",
                        dueDate: dueSoon,
                    },
                ]);

                assignments.push(...docs);

                // Resources for each assignment
                for (const a of docs) {
                    await AssignmentResource.create({
                        assignment: a._id,
                        uploadedBy: ta.teacherId,
                        title: `${subj.name} Notes`,
                        url: "https://example.com/sample-notes.pdf",
                        resourceType: "pdf",
                        fileSize: 123456,
                        isPrimary: true,
                    });
                }
            }
        }

        // 8. Create Attendance for last 10 days for a subset of students
        console.log("Creating Attendance...");
        const subsetStudents = createdStudents.slice(0, 50);
        const teachersForAttendance = teacherDocs.slice(0, 5);
        for (let i = 0; i < 10; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            for (const st of subsetStudents) {
                const teacher = teachersForAttendance[i % teachersForAttendance.length];
                await Attendance.create({
                    school: SCHOOL_ID,
                    section: st.section,
                    student: st._id,
                    date,
                    status: Math.random() < 0.9 ? "present" : "absent",
                    markedBy: teacher._id,
                    cutoffTime: "18:00",
                    isLateEntry: false,
                });
            }
        }

        // 9. Fees: FeeRule + StudentFee + FeePayment
        console.log("Creating Fee Rules & Payments...");
        const feeRule = await FeeRule.create({
            school: SCHOOL_ID,
            academicYearStart,
            academicYearEnd,
            version: 1,
            components: [
                {
                    code: "TUITION",
                    label: "Tuition Fee",
                    amount: 20000,
                    frequency: "yearly",
                    applicableGrades: [],
                    applicableSections: [],
                    isOptional: false,
                },
                {
                    code: "LAB",
                    label: "Lab Fee",
                    amount: 3000,
                    frequency: "yearly",
                    applicableGrades: [],
                    applicableSections: [],
                    isOptional: false,
                },
            ],
            meta: {},
            createdBy: principal._id,
        });

        const feeStudents = createdStudents.slice(0, 50);
        for (const st of feeStudents) {
            const totalAmount = 23000;
            const netPayable = totalAmount;
            const paidAmount = 10000;
            const remainingAmount = netPayable - paidAmount;

            const sf = await StudentFee.create({
                school: SCHOOL_ID,
                student: st._id,
                section: st.section,
                academicYearStart,
                academicYearEnd,
                feeRule: feeRule._id,
                version: 1,
                currency: "INR",
                breakdown: [
                    {
                        componentCode: "TUITION",
                        label: "Tuition Fee",
                        amount: 20000,
                        discounts: 0,
                        netAmount: 20000,
                    },
                    {
                        componentCode: "LAB",
                        label: "Lab Fee",
                        amount: 3000,
                        discounts: 0,
                        netAmount: 3000,
                    },
                ],
                totalAmount,
                discountAmount: 0,
                netPayable,
                paidAmount,
                remainingAmount,
                status: "partial",
            });

            await FeePayment.create({
                school: SCHOOL_ID,
                student: st._id,
                studentFee: sf._id,
                amount: paidAmount,
                method: "upi",
                reference: "UPI-TXN-123456",
                notes: "Initial payment (seed data)",
            });
        }

        // 10. Create sample submissions for a couple of assignments
        console.log("Creating Assignment Submissions...");
        const sampleAssignments = assignments.slice(0, 10);
        for (const a of sampleAssignments) {
            const someStudents = createdStudents
                .filter((st) => String(st.section) === String(a.section))
                .slice(0, 10);
            for (const st of someStudents) {
                await AssignmentSubmission.create({
                    assignment: a._id,
                    student: st._id,
                    submissionText: "My homework submission (auto-generated).",
                    attachments: [
                        {
                            url: "https://example.com/homework-doc",
                            name: "Homework doc",
                            fileType: "link",
                            fileSize: 0,
                        },
                    ],
                    status: "submitted",
                    submittedAt: new Date(),
                });
            }
        }

        // 11. Create Notices
        console.log("Creating Notices...");
        const classTeacher = teacherDocs[0]; // Use first teacher as class teacher

        const noticeTemplates = [
            {
                title: "Annual Sports Day Registration",
                content: "Registration for Annual Sports Day is now open. Please submit your forms by February 15th.",
                postedBy: principal?._id || classTeacher._id,
                postedByType: principal ? "Principal" : "Teacher",
                postedByName: principal?.fullName || classTeacher.fullName,
                priority: "high",
                targetAudience: "all",
            },
            {
                title: "Library Hours Extended",
                content: "The school library will now be open until 6 PM on weekdays for better access to study materials.",
                postedBy: principal?._id || classTeacher._id,
                postedByType: principal ? "Principal" : "Teacher",
                postedByName: principal?.fullName || classTeacher.fullName,
                priority: "normal",
                targetAudience: "all",
            },
            {
                title: "Parent-Teacher Meeting",
                content: "Scheduled for February 20th, 2026. Please ensure your parents attend to discuss your progress.",
                postedBy: principal?._id || classTeacher._id,
                postedByType: principal ? "Principal" : "Teacher",
                postedByName: principal?.fullName || classTeacher.fullName,
                priority: "high",
                targetAudience: "all",
            },
            {
                title: "Science Fair Project Submission",
                content: "Science fair projects are due by March 1st. Submit your projects to your science teacher.",
                postedBy: classTeacher._id,
                postedByType: "Teacher",
                postedByName: classTeacher.fullName,
                priority: "normal",
                targetAudience: "all",
            },
        ];

        for (const noticeData of noticeTemplates) {
            await Notice.create({
                school: SCHOOL_ID,
                ...noticeData,
                expiryDate: new Date(Date.now() + 30 * 86400000), // 30 days from now
            });
        }

        console.log("🏁 Seeding Complete!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding Failed:", error);
        process.exit(1);
    }
}

seed();
