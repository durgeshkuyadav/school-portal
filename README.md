# School Management Portal — Complete Setup Guide

## 📁 FOLDER STRUCTURE

```
school-portal/
│
├── docker-compose.yml          ← Sab kuch ek command mein chalao
├── .env.example                ← Environment variables template
│
├── eureka-server/              ← Service Discovery (port 8761)
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/...
│
├── api-gateway/                ← Single entry point (port 8080)
│   ├── Dockerfile              ← JWT check + route sab services ko
│   ├── pom.xml
│   └── src/main/...
│       └── filter/JwtAuthFilter.java
│
├── auth-service/               ← Login/Register/JWT (port 8081)
│   ├── Dockerfile
│   └── src/main/java/com/school/auth/
│       ├── config/
│       │   ├── DataSeeder.java     ← DEFAULT USERS YAHAN CREATE HOTE HAIN
│       │   └── SecurityConfig.java
│       ├── controller/AuthController.java
│       ├── dto/                    ← LoginRequest, AuthResponse, etc.
│       ├── entity/User.java        ← User + Role enum
│       ├── exception/
│       ├── repository/
│       ├── security/JwtService.java
│       └── service/AuthService.java
│
├── student-service/            ← Students + Classes + TASKS (port 8083)
│   └── src/main/java/com/school/student/
│       ├── controller/
│       │   ├── StudentController.java
│       │   ├── ClassController.java
│       │   └── TaskController.java   ← TASK MANAGEMENT ENDPOINTS
│       ├── entity/
│       │   ├── Student.java
│       │   ├── SchoolClass.java
│       │   └── Task.java             ← Task entity
│       ├── repository/
│       │   ├── StudentRepository.java
│       │   ├── SchoolClassRepository.java
│       │   └── TaskRepository.java
│       └── service/
│           ├── StudentService.java
│           └── TaskService.java
│
├── academic-service/           ← Exams + Results (port 8084)
├── content-service/            ← Study Materials/MongoDB (port 8085)
├── teacher-service/            ← Teacher Profiles (port 8086)
├── calendar-service/           ← Events + Holidays (port 8087)
├── notification-service/       ← Kafka consumer (port 8089) [mail OFF]
├── online-test-service/        ← MCQ Tests (port 8091)
│
└── frontend/                   ← React App (port 3000)
    └── src/
        ├── api/
        │   ├── apiClient.js        ← Axios + JWT interceptor + auto-refresh
        │   └── services.js         ← All API calls (authApi, taskApi, etc.)
        ├── components/
        │   ├── common/ProtectedRoute.jsx
        │   └── layout/AppLayout.jsx  ← Sidebar with Tasks nav
        ├── pages/
        │   ├── admin/
        │   │   ├── AdminDashboard.jsx
        │   │   ├── ManageStudents.jsx
        │   │   ├── ManageTeachers.jsx
        │   │   ├── ManageClasses.jsx
        │   │   ├── AdminCalendar.jsx
        │   │   └── ManageTasks.jsx    ← TASK ASSIGNMENT PAGE
        │   ├── teacher/
        │   │   ├── TeacherDashboard.jsx
        │   │   ├── ManageExams.jsx
        │   │   ├── ManageResults.jsx
        │   │   ├── UploadContent.jsx
        │   │   └── MyTasks.jsx        ← TEACHER TASKS VIEW
        │   ├── student/
        │   │   ├── StudentDashboard.jsx
        │   │   ├── StudentResults.jsx
        │   │   ├── StudentContent.jsx
        │   │   └── OnlineTest.jsx
        │   ├── auth/LoginPage.jsx
        │   └── public/
        │       ├── HomePage.jsx
        │       └── PublicPages.jsx
        └── store/
            ├── store.js
            └── slices/authSlice.js
```

---

## 🚀 HOW TO RUN

### Prerequisites
- Docker Desktop installed and running
- Windows: `C:\Users\durge\Downloads\` mein zip extract karo

### Step 1: Folder Open Karo
```
cd C:\Users\durge\Downloads\school-portal-FINAL\school-portal
```

### Step 2: Ek Command — Sab kuch Start
```
docker compose up -d --build
```

### Step 3: Wait (~3-5 minutes)
Services is order mein start hoti hain:
1. Databases (MySQL x6, MongoDB, Redis) — ~30 sec
2. Kafka + Zookeeper — ~45 sec
3. Eureka Server — ~60 sec
4. API Gateway + Services — ~2 min
5. Frontend — last mein

### Step 4: Check All Running
```
docker compose ps
```
Sab "healthy" dikhna chahiye.

---

## 🌐 URLS

| URL | Kya hai |
|-----|---------|
| **http://localhost:3000** | Frontend (School Portal) |
| http://localhost:8761 | Eureka — service registry |
| http://localhost:8080 | API Gateway |
| http://localhost:8081/swagger-ui.html | Auth API docs |
| http://localhost:8083/swagger-ui.html | Student API docs |

---

## 🔐 DEFAULT LOGIN CREDENTIALS

| Username | Password | Role | Access |
|----------|----------|------|--------|
| **admin** | **admin123** | SUPER_ADMIN | Sab kuch |
| **principal** | **principal123** | SCHOOL_ADMIN | Admin panel |
| **teacher1** | **teacher123** | CLASS_TEACHER | Teacher panel |
| **teacher2** | **teacher123** | SUBJECT_TEACHER | Teacher panel |
| **student1** | **student123** | STUDENT | Student panel |
| **parent1** | **parent123** | PARENT | (future) |

> ⚠️ Pehli baar start hone par DataSeeder automatically ye users bana deta hai.

---

## 📱 HOW TO ACCESS FRONTEND

### Step 1: Browser mein kholo
```
http://localhost:3000
```

### Step 2: Login karo
- Top-right mein "Login" button click karo
- Username: `admin`, Password: `admin123`

### Step 3: Dashboard pe aao
Login hone ke baad role ke hisaab se redirect hoga:
- Admin → `/admin/dashboard`
- Teacher → `/teacher/dashboard`
- Student → `/student/dashboard`

### Frontend → Backend Connection
```
Browser (localhost:3000)
    ↓ API calls go to /api/*
Nginx (inside Docker)
    ↓ proxies to
API Gateway (api-gateway:8080)
    ↓ JWT check + routes to
Individual Services (auth-service, student-service, etc.)
    ↓ each reads/writes to
Own Database (MySQL/MongoDB/Redis)
```

---

## ✅ TASK MANAGEMENT — Admin Guide

### Task Assign Karna
1. Admin login karo (admin/admin123)
2. Left sidebar → "Task Management"
3. "New Task" button click karo
4. Fill karo:
   - Title (required)
   - Description
   - Assign To: teacher select karo dropdown se
   - Priority: LOW / MEDIUM / HIGH / URGENT
   - Category: ACADEMIC / ADMINISTRATIVE / EVENT / OTHER
   - Due Date
5. "Assign Task" click karo

### Task Status Track Karna
- Dashboard pe colored stats dikhai denge
- Tabs: All / Pending / In Progress / Completed
- Comment icon se Admin Remark add karo
- Edit icon se task update/reassign karo

### Teacher ka view (teacher1 login karo)
- Left sidebar → "My Tasks"
- "Start" button → status IN_PROGRESS
- "Mark Complete" button → status COMPLETED
- Note likh sakte hain complete karte waqt

---

## 📧 EMAIL NOTIFICATIONS
Mail currently **OFF** hai (test environment ke liye).
Jab ready ho toh `docker-compose.yml` mein add karo:
```yaml
notification-service:
  environment:
    MAIL_ENABLED: "true"
    MAIL_HOST: smtp.gmail.com
    MAIL_USER: your@gmail.com
    MAIL_PASS: your-app-password
```

---

## 🔄 COMMON COMMANDS

```bash
# Start sab kuch
docker compose up -d --build

# Stop sab kuch
docker compose down

# Sirf frontend rebuild karo (code change ke baad)
docker compose up -d --build frontend

# Logs dekhna
docker compose logs -f auth-service
docker compose logs -f frontend

# Restart ek service
docker compose restart student-service

# Sab data delete karo (fresh start)
docker compose down -v
docker compose up -d --build
```

---

## ❓ TROUBLESHOOTING

**Login nahi ho raha?**
- auth-service healthy hai? `docker compose ps`
- Pehli baar start ho raha hai toh 2-3 min wait karo
- DataSeeder ne users bana diye? `docker compose logs auth-service | grep "Created user"`

**Frontend kuch nahi dikha raha?**
- Browser console mein error check karo (F12)
- API Gateway chal raha hai? `http://localhost:8080/actuator/health`
- nginx proxy theek hai — `/api/*` → `api-gateway:8080`

**Services crash ho rahe hain?**
- RAM check karo: Docker needs ~6GB
- `docker compose logs SERVICE_NAME` se error dekho

