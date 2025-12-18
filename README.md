# 📚 PorTask App

PorTask App is a **task and activity management system** designed for **students and instructors**.
It allows instructors to create and manage activities, while students can view, submit, and track their tasks.

The project is built using **Node.js + Express + MongoDB** for the backend and **React Native (Expo)** for the mobile application.

---

## ✨ Features

### 👨‍🎓 Student

* Register and log in
* View assigned activities
* Mark activities as done
* Upload attachments (images or files)
* View activity status (Pending, Done, Missed)
* Receive notifications
* View activities using calendar view
* Manage profile and log out

### 👩‍🏫 Instructor

* Register and log in
* Create new assignments with attachments
* Close or reopen activities
* View student submissions count
* Receive instructor-specific notifications
* View activities using calendar view
* Dashboard summary (Active, Reviewed, Submissions)
* Manage profile and log out

---

## 🗂 Project Structure

```
PorTask-App.2/
├─ backend/
│  ├─ package.json
│  ├─ package-lock.json
│  ├─ .env
│  └─ src/
│     ├─ index.js
│     ├─ db.js
│     ├─ middleware/
│     │  └─ authMiddleware.js
│     ├─ models/
│     │  ├─ User.js
│     │  ├─ Assignment.js
│     │  ├─ Notification.js
│     │  └─ InstructorNotification.js
│     └─ routes/
│        ├─ authRoutes.js
│        ├─ assignmentRoutes.js
│        ├─ notificationRoutes.js
│        └─ instructorNotificationRoutes.js
│
└─ mobile/
   ├─ package.json
   ├─ package-lock.json
   ├─ app.json
   ├─ assets/
   │  └─ images/
   │     └─ image43.png
   ├─ app/
   │  ├─ _layout.jsx
   │  ├─ index.jsx
   │  ├─ registration.jsx
   │  ├─ about.jsx
   │  ├─ activity-details.jsx
   │  ├─ instructor-add.jsx
   │  ├─ instructor-all.jsx
   │  ├─ instructor-activities.jsx
   │  ├─ (tabs)/
   │  │  ├─ _layout.jsx
   │  │  ├─ home.jsx
   │  │  ├─ calendar.jsx
   │  │  ├─ notification.jsx
   │  │  └─ profile.jsx
   │  └─ (instructorTabs)/
   │     ├─ _layout.jsx
   │     ├─ home.jsx
   │     ├─ calendar.jsx
   │     ├─ notification.jsx
   │     └─ profile.jsx
   ├─ data/
   │  ├─ assignments.js
   │  ├─ notifications.js
   │  └─ instructorNotifications.js
   └─ lib/
      └─ apiClient.js

```

---

## 🛠 Technologies Used

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Token (JWT)
* bcryptjs
* dotenv

### Mobile App

* React Native
* Expo
* Expo Router
* AsyncStorage
* React Native Calendars

---

## 🚀 How to Run the Project

### 1️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file:

```
PORT=3001
MONGO_URI=mongodb+srv://cyrildayak03_db_user:PkDinT96hRTiY0B4@cluster0.v8iargf.mongodb.net/PorTask-App_db?appName=Cluster0
JWT_SECRET=1vfzevuapiDfoJe3KoRuGq8xrrOUBO00clW88TULVGE=

```

### 2️⃣ Mobile App Setup

```bash
cd mobile
npm install
npx expo start
```

You can run the app using:

* Expo Go (mobile)
* Android Emulator
* iOS Simulator

---

## 🔐 Authentication & Roles

* Users are authenticated using **JWT**
* Role is automatically assigned:

  * `@university.edu` → Instructor
  * Other emails → Student
* Protected routes ensure correct access based on role

---

## 📌 Notes

* Attachments are stored as temporary URLs
* Submission count is tracked instead of individual student records
* UI and logic were kept simple for learning purposes

---

## 👨‍💻 Authors

Developed as a **student project** for learning full-stack mobile development.

---

## 📄 License

This project is for **educational purposes only**.

---
