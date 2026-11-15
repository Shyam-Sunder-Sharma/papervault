# PaperVault ("Find. Contribute. Learn.")

> **Centralized previous-year question paper repository for Uttar Pradesh Textile Technology Institute (UPTTI Kanpur) students.**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=flat&logo=github)](https://github.com/Shyam-Sunder-Sharma/papervault)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v24+-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)

---

## 🏛️ About PaperVault

**PaperVault** is an academic platform designed to make past examination papers readily accessible to students at **UPTTI Kanpur**. Whether preparing for end-semester exams, mid-semester unit tests, or carry-over back papers, students can easily search, filter, preview, and download verified PDF question papers across all engineering departments.

### 🌟 Key Features

- **Departmental Coverage:** Tailored for all five UPTTI Kanpur engineering branches:
  - Computer Science & Engineering (`CSE`)
  - Textile Technology (`TT`)
  - Textile Chemistry (`TC`)
  - Man-Made Fibre Technology (`MMFT`)
  - Textile Engineering (`TE`)
- **Semesters 1 through 8:** Complete curriculum hierarchy with subject codes matching AKTU / UPTTI syllabus.
- **Fast Live Search & Filters:** Instant filtering by subject name, AKTU subject code (e.g. `BCS-301`), branch, semester, and academic year.
- **Instant In-Browser PDF Preview:** Inspect question papers with an inline viewer before downloading.
- **Direct-to-Supabase Secure Uploads:** Students can upload question papers (up to 15MB) using signed upload URLs directly to Supabase Storage.
- **Admin Moderation CMS:** Complete back-office review workflow to fix student typos, review PDFs, approve, reject, unpublish, or delete submissions.
- **Student Feedback & Request Box:** Submit requests for missing papers, report broken scans, or offer suggestions.
- **Security & Rate Limiting:** JWT-based HttpOnly cookie admin authentication, password hashing with `bcrypt`, and request rate limiting via `express-rate-limit`.

---

## 🏗️ Architecture & Tech Stack

```
PaperVault/
├── client/                 # React 19 + Vite frontend
│   ├── src/
│   │   ├── components/     # Navbar, Footer, PdfModal, UploadModal, SuggestionModal
│   │   ├── pages/          # LandingPage, RepositoryPage, AdminLoginPage, AdminDashboard
│   │   ├── api.js          # Axios API client & Supabase direct upload helpers
│   │   ├── App.jsx         # React Router DOM configuration
│   │   └── index.css       # Tailwind CSS v4 styling
│   └── package.json
├── server/                 # Express.js REST API & PostgreSQL / Supabase
│   ├── src/
│   │   ├── middleware/     # JWT verifyAdmin authentication guard
│   │   ├── routes/         # meta, papers, suggestions, admin routes
│   │   ├── db.js           # PostgreSQL connection pool & Supabase JS client
│   │   ├── seed.js         # Automated schema application & database seeder
│   │   └── server.js       # Express server initialization
│   ├── schema.sql          # PostgreSQL table schemas & constraints
│   ├── .env.example        # Environment variable templates
│   └── package.json
├── package.json            # Monorepo root with concurrently scripts
├── .gitignore              # Ignores node_modules, .env, and build dist
└── README.md
```

---

## 🗄️ Database Schema (`server/schema.sql`)

The repository uses PostgreSQL hosted on **Supabase**:

- **`admins`**: Stores moderator accounts (`id`, `username`, `password_hash`, `created_at`).
- **`branches`**: UPTTI branches (`id`, `name`, `code`).
- **`semesters`**: Semesters 1 to 8 (`id`, `number`).
- **`subjects`**: Course catalog (`id`, `branch_id`, `semester_id`, `name`, `code`).
- **`papers`**: Question paper records (`id` UUID, `branch_id`, `semester_id`, `subject_name`, `subject_code`, `academic_year`, `exam_type`, `file_url`, `file_path`, `status` (`pending`, `approved`, `rejected`, `unpublished`), `submitted_at`, `reviewed_at`).
- **`suggestions`**: Feedback & missing paper requests (`id` UUID, `category`, `message`, `status` (`new`, `in_progress`, `resolved`, `archived`), `created_at`).

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v18 or higher (v24 recommended)
- **npm**: v9 or higher

### 2. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/Shyam-Sunder-Sharma/papervault.git
cd papervault
npm install
npm install --prefix server
npm install --prefix client
```

### 3. Environment Configuration
Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# PostgreSQL Database Connection String
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Supabase Storage & API
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# JWT & Admin
JWT_SECRET=super_secret_jwt_key_at_least_32_characters
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

### 4. Database Seeding
To run the automated schema migration and populate branches, semesters, subjects, default admin account, and sample verified papers:
```bash
npm run seed
```

### 5. Running in Development
Start both frontend and backend concurrently with a single command:
```bash
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Admin CMS:** [http://localhost:5173/admin/login](http://localhost:5173/admin/login)

---

## 📡 API Reference

### Public Student Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health status and uptime |
| `GET` | `/api/meta` | Lists all branches, semesters, and subjects |
| `GET` | `/api/papers` | Retrieves approved papers (supports `search`, `branch_id`, `semester_id`, `academic_year`) |
| `POST` | `/api/papers/upload-url` | Generates a signed Supabase upload URL for direct PDF uploads (max 15MB) |
| `POST` | `/api/papers` | Submits a paper for admin verification (prevents duplicate approved papers) |
| `POST` | `/api/suggestions` | Submits student feedback or missing paper requests |

### Protected Admin Endpoints (`/api/admin/*`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/login` | Authenticates admin and sets `HttpOnly` JWT cookie |
| `POST` | `/api/admin/logout` | Clears authentication cookie |
| `GET` | `/api/admin/me` | Validates active admin session |
| `GET` | `/api/admin/stats` | Dashboard metrics and recent 5 items |
| `GET` | `/api/admin/papers` | Lists all papers filterable by `status` |
| `PATCH` | `/api/admin/papers/:id` | Updates metadata or modifies status (`approved`, `rejected`, `unpublished`) |
| `DELETE` | `/api/admin/papers/:id` | Deletes paper record and removes PDF from Supabase Storage |
| `GET` | `/api/admin/suggestions` | Lists student suggestions |
| `PATCH` | `/api/admin/suggestions/:id` | Updates suggestion status (`new`, `in_progress`, `resolved`, `archived`) |

---

## 🔒 Security Measures
- **Signed Uploads:** Students upload directly to Supabase storage without passing heavy 15MB PDF streams through the Express server.
- **Duplicate Prevention:** Prevents submitting duplicate papers for already approved subject codes, exam years, and exam types.
- **HttpOnly Cookies:** JWT tokens are stored in `HttpOnly`, `SameSite=Lax` cookies to prevent XSS credential theft.
- **Rate Limiting:** Prevents brute force and API abuse using `express-rate-limit`.

---

## 👥 Contributing
Contributions from UPTTI Kanpur alumni and students are welcome! Submit a Pull Request or open an issue on GitHub.
