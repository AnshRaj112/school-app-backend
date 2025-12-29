# API Documentation

Base URL: `http://localhost:5000` (Local) or as configured.

> [!NOTE]
> Most endpoints require an `actorId` in the body or query params for authorization.

## Admin
**Base URL**: `/admin`

### Create Admin
**POST** `/create`

**Input:**
```json
{
  "username": "superadmin",
  "email": "admin@school.com",
  "password": "securePassword123",
  "fullName": "Super Admin",
  "role": "super_admin",
  "secretKey": "YOUR_SECRET_KEY"
}
```

**Output:**
```json
{
  "message": "Admin created",
  "admin": {
    "_id": "60d5ec49f1b2c82a8c8e1234",
    "username": "superadmin",
    "email": "admin@school.com",
    "role": "super_admin"
  }
}
```

---

## Principals
**Base URL**: `/principals`

### Create Principal
**POST** `/create`

**Input:**
```json
{
  "actorId": "60d5ec49f1b2c82a8c8e1234",
  "username": "skinner",
  "email": "skinner@springfield.edu",
  "password": "password123",
  "fullName": "Seymour Skinner",
  "school": "60d5ec49f1b2c82a8c8e5678"
}
```

**Output:**
```json
{
  "message": "Principal created successfully",
  "principal": {
    "_id": "60d5ec49f1b2c82a8c8e9999",
    "username": "skinner",
    "fullName": "Seymour Skinner",
    "email": "skinner@springfield.edu",
    "school": {
      "_id": "60d5ec49f1b2c82a8c8e5678",
      "name": "Springfield Elementary"
    }
  }
}
```

---

## Schools
**Base URL**: `/schools`

### Create School
**POST** `/create`

**Input:**
```json
{
  "actorId": "60d5ec49f1b2c82a8c8e1234",
  "name": "Springfield Elementary",
  "code": "SPS",
  "address": "123 Evergreen Terrace"
}
```

**Output:**
```json
{
  "message": "School created",
  "school": {
    "_id": "60d5ec49f1b2c82a8c8e5678",
    "name": "Springfield Elementary",
    "code": "SPS",
    "status": "active"
  }
}
```

### Get All Schools
**GET** `/fetch?actorId=60d5ec49f1b2c82a8c8e1234`

**Output:**
```json
{
  "schools": [
    {
      "_id": "60d5ec49f1b2c82a8c8e5678",
      "name": "Springfield Elementary",
      "code": "SPS"
    }
  ]
}
```

### Get School Stats
**GET** `/:schoolId/stats`

**Output:**
```json
{
  "success": true,
  "stats": {
    "classes": 12,
    "sections": 24,
    "teachers": 30,
    "students": 450
  }
}
```

---

## Classes
**Base URL**: `/classes`

### Create Class
**POST** `/`

**Input:**
```json
{
  "actorId": "60d5ec49f1b2c82a8c8e9999",
  "schoolId": "60d5ec49f1b2c82a8c8e5678",
  "grade": 4
}
```

**Output:**
```json
{
  "message": "Class created",
  "class": {
    "_id": "60d5ec49f1b2c82a8c8e4444",
    "grade": 4,
    "isActive": true
  }
}
```

### Get Classes (by School)
**GET** `/?actorId=...&schoolId=...`

**Output:**
```json
{
  "count": 5,
  "classes": [
    { "_id": "...", "grade": 1 },
    { "_id": "...", "grade": 2 }
  ]
}
```

---

## Sections
**Base URL**: `/sections`

### Create Section
**POST** `/`

**Input:**
```json
{
  "actorId": "60d5ec49f1b2c82a8c8e9999",
  "schoolId": "60d5ec49f1b2c82a8c8e5678",
  "classId": "60d5ec49f1b2c82a8c8e4444",
  "name": "A"
}
```

### Assign Class Teacher
**POST** `/:id/assign-class-teacher`

**Input:**
```json
{
  "actorId": "60d5ec49f1b2c82a8c8e9999",
  "teacherId": "60d5ec49f1b2c82a8c8e2222"
}
```

**Output:**
```json
{
  "message": "Class teacher assigned successfully",
  "section": {
    "_id": "60d5ec49f1b2c82a8c8e7777",
    "name": "A",
    "classTeacherId": "60d5ec49f1b2c82a8c8e2222"
  },
  "teacher": {
    "_id": "60d5ec49f1b2c82a8c8e2222",
    "fullName": "Edna Krabappel",
    "roles": ["subject_teacher", "class_teacher"]
  }
}
```

---

## Subjects
**Base URL**: `/subjects`

### Create Subject
**POST** `/`

**Input:**
```json
{
  "actorId": "60d5ec49f1b2c82a8c8e9999",
  "schoolId": "60d5ec49f1b2c82a8c8e5678",
  "classId": "60d5ec49f1b2c82a8c8e4444",
  "name": "Science",
  "code": "SCI-04"
}
```

---

## Teachers
**Base URL**: `/teachers`

### Create Teacher
**POST** `/`

**Input:**
```json
{
  "actorId": "60d5ec49f1b2c82a8c8e9999",
  "schoolId": "60d5ec49f1b2c82a8c8e5678",
  "username": "ekrabappel",
  "email": "edna@springfield.edu",
  "password": "password123",
  "fullName": "Edna Krabappel",
  "roles": ["subject_teacher"],
  "teachableGrades": [{ "from": 1, "to": 6 }]
}
```

### Get Teachers
**GET** `/by-school?actorId=...&schoolId=...`

**Output:**
```json
{
  "teachers": [
    {
      "_id": "60d5ec49f1b2c82a8c8e2222",
      "fullName": "Edna Krabappel",
      "email": "edna@springfield.edu",
      "roles": ["subject_teacher", "class_teacher"],
      "isActive": true
    }
  ]
}
```

### Get Teacher Profile (with Assignments)
**GET** `/:id?actorId=...`

**Output:**
```json
{
  "teacher": {
    "_id": "60d5ec49f1b2c82a8c8e2222",
    "fullName": "Edna Krabappel",
    "email": "edna@springfield.edu",
    "roles": ["subject_teacher", "class_teacher"],
    "isActive": true
  },
  "assignments": [
    {
      "_id": "60d5ec49f1b2c82a8c8e0000",
      "subjectId": {
        "_id": "60d5ec49f1b2c82a8c8e3333",
        "name": "Science",
        "code": "SCI-04"
      },
      "sectionId": {
        "_id": "60d5ec49f1b2c82a8c8e7777",
        "name": "A",
        "classId": {
          "_id": "60d5ec49f1b2c82a8c8e4444",
          "grade": 4
        }
      },
      "academicYear": "2024-2025",
      "isActive": true
    }
  ],
  "substitutions": []
}
```

---

## Students
**Base URL**: `/students`

### Create Student
**POST** `/`

**Input:**
```json
{
  "actorId": "60d5ec49f1b2c82a8c8e9999",
  "schoolId": "60d5ec49f1b2c82a8c8e5678",
  "sectionId": "60d5ec49f1b2c82a8c8e7777",
  "username": "bart.simpson",
  "email": "bart@student.springfield.edu",
  "password": "eatmyshorts",
  "fullName": "Bart Simpson"
}
```

### Get Students (Filtered)
**GET** `/?schoolId=...&sectionId=...&page=1&limit=10`

**Output:**
```json
{
  "students": [
    {
      "_id": "60d5ec49f1b2c82a8c8e1111",
      "fullName": "Bart Simpson",
      "section": {
        "_id": "60d5ec49f1b2c82a8c8e7777",
        "name": "A",
        "classId": { "grade": 4 }
      }
    }
  ],
  "totalStudents": 30,
  "totalPages": 3,
  "success": true
}
```

---

## Teaching Assignments
**Base URL**: `/teaching-assignments`

### Create Assignment
**POST** `/`

**Input:**
```json
{
  "actorId": "60d5ec49f1b2c82a8c8e9999",
  "schoolId": "60d5ec49f1b2c82a8c8e5678",
  "teacherId": "60d5ec49f1b2c82a8c8e2222",
  "sectionId": "60d5ec49f1b2c82a8c8e7777",
  "subjectId": "60d5ec49f1b2c82a8c8e3333",
  "academicYear": "2024-2025"
}
```

**Output:**
```json
{
  "message": "Assignment created",
  "assignment": {
    "_id": "60d5ec49f1b2c82a8c8e0000",
    "subjectId": "60d5ec49f1b2c82a8c8e3333",
    "isActive": true
  }
}
```

---

## Substitutions
**Base URL**: `/substitutions`

### Create Substitution
**POST** `/`

**Input:**
```json
{
  "actorId": "60d5ec49f1b2c82a8c8e9999",
  "schoolId": "60d5ec49f1b2c82a8c8e5678",
  "originalTeacherId": "60d5ec49f1b2c82a8c8e2222",
  "substitutionTeacherId": "60d5ec49f1b2c82a8c8e8888",
  "sectionId": "60d5ec49f1b2c82a8c8e7777",
  "subjectId": "60d5ec49f1b2c82a8c8e3333",
  "date": "2024-05-20",
  "slot": 1
}
```

**Output:**
```json
{
  "message": "Substitution created",
  "substitution": {
    "_id": "60d5ec49f1b2c82a8c8e5555",
    "status": "pending"
  }
}
```
