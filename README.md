# 🎓 Project Management System (PMS) — Sandip Foundation

A comprehensive **Project Management System** built for Sandip Foundation to streamline the management of student projects, documents, abstracts, certificates, and ITR (In-Training Report) activities across departments.

---

## ✨ Features

### 👤 Role-Based Access

| Role                | Capabilities                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| **Admin (HOD)**     | Full access — manage students, mentors, groups, abstracts, documents, certificates, ITR, notices |
| **Mentor**          | View assigned students/groups, review abstracts & documents, manage notices                      |
| **Student**         | View group, submit abstracts/documents/certificates, access sample documents                     |
| **ITR Coordinator** | Manage ITR students, attendance, assignments, certificates, fees                                 |

### 📦 Core Modules

- **Student Management** — Add, search, filter students by academic year & department
- **Group Management** — Create groups, assign members & mentors, track project progress
- **Abstract Submission** — Students submit, mentors/admins approve or reject with feedback
- **Document Upload** — Multi-stage (Stage 1 & 2) document management with review workflow
- **Certificate Tracking** — Upload & verify certificates (ITR, published papers, competitions, Udemy)
- **Notice Board** — Create and send notices to students, guides, or ITR coordinators
- **Sample Documents** — Download templates for weekly diary, synopsis, PPT, reports, etc.
- **ITR Module** — Student records, daily attendance, assignments, fee tracking

---

## 🛠️ Tech Stack

### Frontend

| Technology        | Purpose                 |
| ----------------- | ----------------------- |
| React 18          | UI framework            |
| TypeScript        | Type safety             |
| Vite              | Build tool & dev server |
| TailwindCSS       | Utility-first CSS       |
| ShadCN UI (Radix) | Component library       |
| React Router      | Client-side routing     |
| React Query       | Server state management |
| Recharts          | Dashboard charts        |

### Backend _(In Development)_

| Technology         | Purpose         |
| ------------------ | --------------- |
| Node.js + Express  | REST API server |
| MongoDB + Mongoose | Database & ODM  |
| JWT                | Authentication  |
| Multer             | File uploads    |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **bun**

### Installation

```bash
# Clone the repository
git clone https://github.com/shubham-hire/PMS_sandip_foundation.git
cd PMS_sandip_foundation

# Install frontend dependencies
cd project-harmony-hub-main
npm install

# Start the development server
npm run dev
```

The app will be available at **http://localhost:8080/**

### Demo Credentials

| Role            | Email              | Password |
| --------------- | ------------------ | -------- |
| Admin           | admin@sandip.edu   | any      |
| Mentor          | mentor@sandip.edu  | any      |
| Student         | student@sandip.edu | any      |
| ITR Coordinator | itr@sandip.edu     | any      |

---

## 📁 Project Structure

```
PMS/
├── project-harmony-hub-main/       # React frontend
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── contexts/               # Auth context
│   │   ├── hooks/                  # Custom hooks
│   │   ├── integrations/           # Supabase client
│   │   ├── pages/                  # Route pages
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   └── dashboard/          # Role-based dashboards
│   │   ├── types/                  # TypeScript interfaces
│   │   └── App.tsx                 # Routes & providers
│   └── package.json
└── pms-backend/                    # Node.js backend (coming soon)
```

---

## 📄 License

This project is developed as part of an internship at **Sandip Foundation**.

---

## 👥 Contributors

- **Shubham** — Developer
`