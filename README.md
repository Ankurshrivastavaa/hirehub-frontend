# 🚀 HireHub — Full Stack Job Board Platform

> **Connect talent with opportunity** — A dual-role job board where recruiters post jobs and candidates apply, built with React.js, Node.js, MongoDB, and JWT Authentication.

<div align="center">

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_App-6366f1?style=for-the-badge)](https://hirehub-frontend-lemon.vercel.app)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Backend](https://img.shields.io/badge/Backend-Render-blue?style=for-the-badge)](https://render.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Author](#-author)

---

## 🎯 About the Project

**HireHub** is a production-ready, full-stack job board platform that connects job seekers with recruiters. It supports two distinct user roles — each with their own protected dashboard and workflow.

### 💡 Problem It Solves
Finding and posting jobs should be simple. HireHub provides a clean, fast platform where:
- **Recruiters** can post jobs, view all applicants, and manage their hiring pipeline
- **Job Seekers** can browse opportunities, apply instantly, and track every application

---

## ✨ Features

### For Job Seekers 🔍
- Browse all active job listings
- Search and filter by job type, location, and skills
- Apply with cover letter and resume link
- Track application status in real-time (Pending → Shortlisted → Hired)
- Personal profile with skills and bio

### For Recruiters 🏢
- Post and manage job listings
- View all applicants per job
- Update application status (Pending → Reviewing → Shortlisted → Rejected → Hired)
- Recruiter dashboard with stats (total jobs, applicants, hired)
- Company profile management

### Platform Features ⚡
- Dual-role authentication (Seeker & Recruiter)
- Role-based protected routes
- Fully responsive design (mobile + desktop)
- Real-time applicant count tracking
- Platform stats on homepage

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js 18 | UI Framework |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| Context API | State Management |
| Vercel | Deployment |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | Web Framework |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| Render | Deployment |

### Database
| Technology | Purpose |
|---|---|
| MongoDB Atlas | Database |
| Mongoose | ODM |

---

## 📸 Screenshots

> Add screenshots here after taking them!

| Home Page | Jobs Listing | Recruiter Dashboard |
|---|---|---|
| ![Home](https://via.placeholder.com/250x160/4F46E5/fff?text=Home+Page) | ![Jobs](https://via.placeholder.com/250x160/7C3AED/fff?text=Jobs+Page) | ![Dashboard](https://via.placeholder.com/250x160/2563EB/fff?text=Dashboard) |

---

## ⚡ Getting Started

### Prerequisites
```bash
node -v    # v16 or higher
npm -v     # v8 or higher
```

### Clone the Repository
```bash
git clone https://github.com/Ankurshrivastavaa/hirehub-frontend.git
cd hirehub-frontend
```

### Install Dependencies
```bash
npm install
```

### Create Environment File
```bash
# Create .env file
echo "REACT_APP_API_URL=http://localhost:5001" > .env
```

### Start Development Server
```bash
npm start
```

App opens at: `http://localhost:3000` ✅

---

## 📁 Project Structure

```
hirehub-frontend/
├── 📁 public/
│   ├── index.html        # App shell with HireHub branding + favicon
│   └── manifest.json
│
├── 📁 src/
│   ├── App.jsx           # Main app — all pages and components
│   ├── index.js          # React entry point
│   └── index.css         # Global styles
│
├── .env                  # Environment variables (not committed)
├── .gitignore
└── package.json
```

---

## 🔑 Environment Variables

```env
REACT_APP_API_URL=http://localhost:5001
```

For production (Vercel):
```env
REACT_APP_API_URL=https://your-render-backend-url.onrender.com
```

---

## 🚢 Deployment (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Add environment variable:
```
REACT_APP_API_URL = https://your-render-url.onrender.com
```
4. Click Deploy ✅

Auto-deploys on every `git push` to main branch.

---

## 🔗 Related Repository

⚙️ **Backend API:** [hirehub-backend](https://github.com/Ankurshrivastavaa/hirehub-backend)

---

## 👨‍💻 Author

**Ankur Shrivastava**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/ankur-shrivastava-65184724b/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=flat&logo=github)](https://github.com/Ankurshrivastavaa)
[![Email](https://img.shields.io/badge/Email-Contact-red?style=flat&logo=gmail)](mailto:ankurshrivastava0077@gmail.com)

---

<div align="center">
  <strong>Built with ❤️ by Ankur Shrivastava</strong><br/>
  <a href="https://hirehub-frontend-lemon.vercel.app">🌐 Live Demo</a> •
  <a href="https://github.com/Ankurshrivastavaa/hirehub-frontend">💻 Frontend</a> •
  <a href="https://github.com/Ankurshrivastavaa/hirehub-backend">⚙️ Backend</a>
</div>
