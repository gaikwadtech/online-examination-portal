# TestEdge - Online Examination Portal

![TestEdge Banner](/public/logo111.png)


**TestEdge** is a comprehensive, secure, and modern online examination platform designed to streamline the assessment process for educational institutions and students. Built with the latest web technologies, it offers a seamless experience for creating, managing, and conducting exams with real-time analytics.

---

## 🚀 Key Features

### 🎓 For Students

- **Intuitive Exam Interface**: Distraction-free exam environment with split-screen layout.
- **Real-Time Analytics**: Instant feedback and detailed performance reports after exam completion.
- **Profile Management**: Manage personal details and track academic progress.
- **Secure Testing**: Automatic session management and tab-switch monitoring (optional configuration).

### 👨‍🏫 For Administrators

- **Comprehensive Dashboard**: At-a-glance view of total students, active exams, and recent activities.
- **Exam Management**: Create and configure exams with various question types (MCQs, coding, etc.).
- **Question Bank**: Organized repository for managing questions efficiently.
- **User Management**: easily manage student enrollments and profiles.
- **Reports & Insights**: Generate detailed reports on student performance and exam difficulty.

### 🌍 Eco-Friendly Impact

- **"Trees Saved" Analytics**: Tracks the environmental impact of switching to digital exams by calculating paper saved.

---

## 🛠️ Technology Stack

This project is built using a modern full-stack architecture:

- **Frontend**: [Next.js 14+](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) (Animations)
- **Backend**: Next.js API Routes (Serverless)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: Custom secure session handling (`sessionStorage` & JWT)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📂 Project Structure

```bash
/src
├── app
│   ├── (auth)          # 🔒 Public authentication routes
│   ├── (dashboard)     # 💻 Protected layouts (Admin, Student)
│   ├── (public)        # 🌐 Public marketing/info pages
│   └── api             # ⚙️ Backend API endpoints
├── components          # 🧱 Reusable UI components
├── lib                 # 🧩 Utility functions, DB connections
├── models              # 💾 Mongoose database schemas
└── styles              # 🎨 Global styles
```

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local or Atlas URL)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/gaikwadtech/online-examination-portal.git
    cd online-examination-portal
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and add the following:
```bash
    MONGODB_URI = 
    JWT_SECRET =
    EMAIL_USER =
    EMAIL_PASS =

    Example :- 
    MONGODB_URI = mongodb://localhost:27017/online-examination-portal
    JWT_SECRET = mysecretkey12345
    EMAIL_USER = pmg14@gmail.com
    EMAIL_PASS = rshhpcmcacojeqrh
```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

5.  **Open the app:**

    Visit [http://localhost:5050](http://localhost:5050) in your browser.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---


Built with ❤️ by **TestEdge Team**.
