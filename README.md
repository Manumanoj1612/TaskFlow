# TaskFlow — MERN Stack Task Management Application

TaskFlow is a full-stack task management web application built using the MERN stack (MongoDB, Express.js, React.js, Node.js). It provides an organized personal workspace where authenticated users can create, track, categorize, search, filter, and manage tasks through an intuitive dashboard.

The application is structured to demonstrate clean full-stack fundamentals, separation of concerns, secure stateless authentication, database-level metrics aggregation, and strict user data isolation suitable for a technical hiring assessment.

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [How to Run the Application](#how-to-run-the-application)
- [Application Usage](#application-usage)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [AI Development Experience](#ai-development-experience)
- [Challenges and Solutions](#challenges-and-solutions)
- [Future Improvements](#future-improvements)
- [Author](#author)

---

## Features

- **User Authentication:** Registration and login with email normalization, password confirmation, and input validation.
- **JWT Authorization:** Stateless session management using JSON Web Tokens passed via HTTP `Bearer` headers.
- **Password Security:** Passwords hashed with `bcryptjs` (salt rounds: 10) before saving; password hashes are excluded from all query outputs and API responses.
- **Strict Data Isolation:** All task queries and mutations are filtered exclusively by `req.user._id` derived from verified JWT payloads. Users cannot read, modify, or delete tasks belonging to others.
- **Task Management (CRUD):**
  - Create tasks with title, description, status, priority, and optional due date.
  - View all personal tasks sorted newest first.
  - View detailed single task views.
  - Update task title, description, status, priority, and due date.
  - Delete tasks with immediate UI updates.
- **Status & Priority Tracking:**
  - Statuses: `TODO`, `IN_PROGRESS`, `COMPLETED`
  - Priorities: `LOW`, `MEDIUM`, `HIGH`
- **Dashboard Statistics:** Real-time metrics breakdown (`Total Tasks`, `Todo`, `In Progress`, `Completed`, `High Priority`) calculated using MongoDB aggregation.
- **Live Search & Multi-Filter:** Client-side real-time task search by title/description combined with simultaneous status and priority filtering.
- **Responsive Interface:** Modern responsive layout styled with Tailwind CSS, supporting mobile, tablet, and desktop viewports.
- **UI States:** Dedicated loading spinners (`LoadingState`), empty states (`EmptyState`), dismissable error banners (`ErrorMessage`), and protected route guards (`ProtectedRoute`).

---

## Technology Stack

### Backend
- **Node.js:** Server runtime environment
- **Express.js (v4.21.2):** REST API web framework
- **MongoDB:** NoSQL database
- **Mongoose (v8.10.0):** Object Data Modeling (ODM) library
- **jsonwebtoken (v9.0.2):** JWT generation and verification
- **bcryptjs (v2.4.3):** Password hashing
- **cors (v2.8.5):** Cross-Origin Resource Sharing middleware
- **dotenv (v16.4.7):** Environment variable management
- **nodemon (v3.1.9):** Development auto-restart utility

### Frontend
- **React.js (v18.3.1):** Component-based user interface library
- **Vite (v6.1.0):** Frontend tooling and build system
- **React Router DOM (v6.28.2):** Client-side routing and navigation guards
- **Tailwind CSS (v3.4.17):** Utility-first CSS styling framework
- **Axios (v1.7.9):** Promise-based HTTP client with request and response interceptors
- **lucide-react (v0.475.0):** Icon library

---

## Project Structure

The project is structured as a decoupled monorepo with distinct `server` and `client` directories:

```
task-project/
├── .gitignore
├── README.md
│
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB connection using Mongoose
│   ├── controllers/
│   │   ├── authController.js     # Auth logic (register, login, getMe)
│   │   └── taskController.js     # Task CRUD and stats aggregation logic
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer verification middleware (protect)
│   │   └── errorMiddleware.js    # 404 and global error handling middleware
│   ├── models/
│   │   ├── User.js               # User Mongoose schema, validation, bcrypt pre-save hook
│   │   └── Task.js               # Task Mongoose schema, enums, compound index
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth route definitions
│   │   └── taskRoutes.js         # /api/tasks route definitions
│   ├── utils/
│   │   └── generateToken.js      # JWT signing helper
│   ├── scratch/
│   │   ├── verifyPhase3.js       # Database models verification script
│   │   ├── verifyPhase4.js       # Authentication verification script
│   │   ├── verifyPhase5.js       # Task CRUD & isolation verification script
│   │   ├── verifyPhase6.js       # Statistics API verification script
│   │   ├── verifyPhase7Master.js # 39-test master backend verification suite
│   │   └── verifyPhase9E2E.js    # Full-stack integration test script
│   ├── .env                      # Local server environment configuration (git-ignored)
│   ├── .env.example              # Public server environment template
│   ├── package.json              # Server dependencies and scripts
│   └── server.js                 # Express server bootstrap & route mounting
│
└── client/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── EmptyState.jsx    # Empty list placeholder component
    │   │   ├── ErrorMessage.jsx  # Dismissable error alert banner
    │   │   ├── LoadingState.jsx  # Spinner loading component
    │   │   ├── Navbar.jsx        # Navigation header with mobile menu
    │   │   ├── ProtectedRoute.jsx# Auth route guard redirecting to /login
    │   │   ├── StatsCard.jsx     # KPI metric display card
    │   │   ├── TaskCard.jsx      # Task item card with action buttons and badges
    │   │   └── TaskForm.jsx      # Reusable create/edit task form
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global auth state provider
    │   ├── hooks/
    │   │   └── useAuth.js        # Auth context hook
    │   ├── pages/
    │   │   ├── DashboardPage.jsx # Main workspace with stats, filters, task grid
    │   │   ├── LandingPage.jsx   # Public landing view with feature overview
    │   │   ├── LoginPage.jsx     # User login form
    │   │   ├── ProfilePage.jsx   # User profile and account activity summary
    │   │   ├── RegisterPage.jsx  # User registration form
    │   │   ├── TaskDetailPage.jsx# Single task full detail view
    │   │   └── TaskFormPage.jsx  # Dedicated create/edit task page
    │   ├── services/
    │   │   ├── api.js            # Axios instance with auth interceptor
    │   │   ├── authService.js    # Authentication API call wrappers
    │   │   └── taskService.js    # Task API call wrappers
    │   ├── App.jsx               # Route definitions and AuthProvider wrapper
    │   ├── index.css             # Tailwind base, components, and utilities
    │   └── main.jsx              # React DOM entry point
    ├── .env                      # Local client environment configuration (git-ignored)
    ├── .env.example              # Public client environment template
    ├── index.html                # HTML template
    ├── package.json              # Client dependencies and scripts
    ├── postcss.config.js         # PostCSS configuration
    ├── tailwind.config.js        # Tailwind CSS configuration
    └── vite.config.js            # Vite configuration with /api proxy
```

---

## Prerequisites

Before setting up the application, ensure the following are installed:

- **Node.js:** v18.0.0 or higher (tested with Node v24.18.0)
- **npm:** v9.0.0 or higher (tested with npm 11.16.0)
- **MongoDB:** A locally running MongoDB Community Server instance (`mongodb://127.0.0.1:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster connection URI.

---

## Installation and Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../client
npm install
```

---

## Environment Variables

Both the backend and frontend use environment files. Sample templates are provided in `.env.example` files.

### Backend (`server/.env`)
Create a `.env` file in the `server` directory:

```bash
# In server directory:
cp .env.example .env
```

Set the following variables:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=your_secure_jwt_random_secret_key_here
CLIENT_URL=http://localhost:5173
```

- `PORT`: Port on which the Express server listens (default: `5000`).
- `MONGO_URI`: MongoDB connection string. Use a local URI or your MongoDB Atlas URI.
- `JWT_SECRET`: Secret key used to sign and verify JSON Web Tokens.
- `CLIENT_URL`: URL of the frontend application allowed by CORS.

### Frontend (`client/.env`)
Create a `.env` file in the `client` directory:

```bash
# In client directory:
cp .env.example .env
```

Set the following variable:
```env
VITE_API_URL=http://localhost:5000/api
```

- `VITE_API_URL`: Base URL for the Express backend API.

---

## How to Run the Application

The application requires running the backend server and frontend client in two separate terminal windows.

### Terminal 1 — Start Backend Server
```bash
cd server
npm run dev
```
- Server URL: `http://localhost:5000`
- Health Check URL: `http://localhost:5000/api/health`

Alternatively, to run without auto-reload:
```bash
npm start
```

### Terminal 2 — Start Frontend Client
```bash
cd client
npm run dev
```
- Frontend Application URL: `http://localhost:5173`

### Stopping the Servers
Press `Ctrl + C` in each terminal window to stop the processes.

---

## Application Usage

1. **Visit Landing Page:** Navigate to `http://localhost:5173` to view the overview.
2. **Register an Account:** Click **Get Started** or visit `/register`. Provide a Name, valid Email address, and Password (minimum 6 characters).
3. **Login:** Log in with your registered credentials at `/login`. Upon authentication, you are redirected to the Dashboard.
4. **View Dashboard:** The dashboard displays real-time statistics cards (`Total`, `Todo`, `In Progress`, `Completed`, `High Priority`) and the task workspace.
5. **Create a Task:** Click **Create New Task** (`/tasks/new`). Enter a title, description, select a status (`TODO`, `IN_PROGRESS`, `COMPLETED`), priority (`LOW`, `MEDIUM`, `HIGH`), and optional due date.
6. **Search and Filter:**
   - Use the search bar to filter tasks by title or content in real time.
   - Use the status dropdown to filter by `TODO`, `IN_PROGRESS`, or `COMPLETED`.
   - Use the priority dropdown to filter by `LOW`, `MEDIUM`, or `HIGH`.
7. **View & Edit Task Details:** Click on any task card or click the **Details** / **Edit** icons to inspect or modify task properties.
8. **Delete Task:** Click the trash icon on a task card or details view. Confirm deletion to remove the task and automatically update statistics.
9. **Inspect Profile:** Visit `/profile` from the navigation bar to see your account details and total task activity breakdown.
10. **Sign Out:** Click **Logout** to invalidate your local session and redirect to `/login`. Direct navigation to `/dashboard` while logged out is blocked by `ProtectedRoute`.

---

## API Documentation

### Base URL
`http://localhost:5000/api`

### Health Check Endpoint
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Returns server health status, timestamp, and environment |

---

### Authentication Endpoints

#### 1. Register User
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "6ac87bf0f3969c27094d9f49",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2026-10-09T05:25:30.000Z"
    }
  }
  ```

#### 2. User Login
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "6ac87bf0f3969c27094d9f49",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2026-10-09T05:25:30.000Z"
    }
  }
  ```

#### 3. Get Current User Profile
- **Method:** `GET`
- **Endpoint:** `/api/auth/me`
- **Access:** Private (`Authorization: Bearer <token>`)
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "_id": "6ac87bf0f3969c27094d9f49",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2026-10-09T05:25:30.000Z",
      "updatedAt": "2026-10-09T05:25:30.000Z"
    }
  }
  ```

---

### Task Endpoints

*All task endpoints require an `Authorization: Bearer <token>` header.*

#### 4. Get All Tasks
- **Method:** `GET`
- **Endpoint:** `/api/tasks`
- **Access:** Private
- **Description:** Returns all tasks belonging to the authenticated user, sorted newest first.
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "6ac87bf0f3969c27094d9f4c",
        "title": "Complete hiring assessment",
        "description": "Finalize code and documentation",
        "status": "IN_PROGRESS",
        "priority": "HIGH",
        "dueDate": "2026-12-31T00:00:00.000Z",
        "user": "6ac87bf0f3969c27094d9f49",
        "createdAt": "2026-10-09T05:26:00.000Z",
        "updatedAt": "2026-10-09T05:26:00.000Z"
      }
    ]
  }
  ```

#### 5. Get Task by ID
- **Method:** `GET`
- **Endpoint:** `/api/tasks/:id`
- **Access:** Private
- **Success Response (200 OK):** Returns single task object if owned by user; returns `404 Not Found` if missing or owned by another user.

#### 6. Create Task
- **Method:** `POST`
- **Endpoint:** `/api/tasks`
- **Access:** Private
- **Request Body:**
  ```json
  {
    "title": "Build React Frontend",
    "description": "Construct UI components using Tailwind",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2026-11-15"
  }
  ```
- **Success Response (201 Created):** Returns created task object.

#### 7. Update Task
- **Method:** `PUT`
- **Endpoint:** `/api/tasks/:id`
- **Access:** Private
- **Request Body:**
  ```json
  {
    "title": "Build React Frontend (Updated)",
    "status": "COMPLETED",
    "priority": "MEDIUM"
  }
  ```
- **Success Response (200 OK):** Returns updated task object.

#### 8. Delete Task
- **Method:** `DELETE`
- **Endpoint:** `/api/tasks/:id`
- **Access:** Private
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Task deleted successfully"
  }
  ```

#### 9. Get Task Statistics
- **Method:** `GET`
- **Endpoint:** `/api/tasks/stats`
- **Access:** Private
- **Description:** Aggregates task counts for the authenticated user only.
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "total": 4,
      "todo": 2,
      "inProgress": 1,
      "completed": 1,
      "highPriority": 2
    }
  }
  ```

---

## Security

1. **Password Hashing:** Passwords are automatically hashed in the User schema pre-save hook using `bcryptjs` with 10 salt rounds. Plaintext passwords are never saved.
2. **Password Secrecy:** The `password` field in `User.js` is set to `select: false`. It is never returned in API payloads or serialized to the client.
3. **Stateless JWT Authorization:** Tokens signed with `process.env.JWT_SECRET` expire in 7 days (`7d`). The payload includes only the user's MongoDB `_id`.
4. **Server-Side Authorization:** The backend middleware verifies the Bearer token and attaches `req.user`. Task controllers bind all database operations to `req.user._id`. Frontend-supplied user IDs in request bodies are explicitly ignored.
5. **ID Enumeration Prevention:** Attempting to retrieve, update, or delete a task belonging to another user returns `404 Not Found` rather than `403 Forbidden`, preventing malicious users from discovering whether specific task IDs exist.
6. **Input Validation:** Required field checks, regex email validation, password length checks, and Mongoose enum restrictions (`TODO`, `IN_PROGRESS`, `COMPLETED` and `LOW`, `MEDIUM`, `HIGH`) protect database integrity.

---

## Testing

The application includes automated integration test suites for both backend functionality and end-to-end API workflows.

### 1. Master Backend Test Suite (`39 Tests`)
The master test suite (`server/scratch/verifyPhase7Master.js`) tests authentication, Task CRUD, authorization isolation, and statistics calculation:

- **Authentication (16 tests):** Valid registration, missing fields, invalid email format, duplicate email, password confirmation mismatch, valid login, incorrect password, non-existent user, missing credentials, valid token `/me`, missing token, invalid token, malformed authorization header, password concealment.
- **Task CRUD (14 tests):** Valid creation, missing title rejection, invalid status enum rejection, invalid priority enum rejection, unauthenticated rejection, user task listing, single task retrieval, invalid ObjectId formatting, non-existent task handling, own task updates, own task deletion.
- **Authorization & Data Isolation (4 tests):** Cross-user isolation verified between User A and User B. User B cannot read, update, or delete User A's tasks (`404 Not Found`). Body-injected user ID forging attempts are blocked.
- **Statistics API (3 tests):** Accuracy across 5 tasks for User A, accuracy across 10 tasks for User B, zero-leakage cross-user isolation, unauthenticated rejection.
- **Delete & Cleanup (2 tests):** Verified task removal and resource cleanup.

**Result:** 39 / 39 tests passed (100% success rate).

Run the master test suite:
```bash
cd server
npm test
```

### 2. End-to-End API Integration Suite
Tests the complete user journey (health check, user registration, token verification, task creation, stats verification, update, and deletion):

```bash
cd server
npm run test:e2e
```

### 3. Frontend Production Build Check
Verifies that the React + Vite frontend compiles cleanly for production:

```bash
cd client
npm run build
```
**Result:** Built cleanly (`0 errors`, 1667 modules transformed).

---

## Screenshots

<!-- Add screenshots of the running application below before submitting -->

### 1. Landing Page
*Placeholder for Landing Page screenshot*
*(Add screenshot image here: e.g., `![Landing Page](docs/screenshots/landing.png)`)*

### 2. User Authentication (Login & Register)
*Placeholder for Login and Register views*
*(Add screenshot image here: e.g., `![Login Page](docs/screenshots/login.png)`)*

### 3. Dashboard with Statistics & Filters
*Placeholder for Dashboard view with KPI cards, search bar, and task cards*
*(Add screenshot image here: e.g., `![Dashboard](docs/screenshots/dashboard.png)`)*

### 4. Create and Edit Task Form
*Placeholder for Task Form view*
*(Add screenshot image here: e.g., `![Task Form](docs/screenshots/task_form.png)`)*

### 5. Task Detail View
*Placeholder for Task Details view*
*(Add screenshot image here: e.g., `![Task Details](docs/screenshots/task_detail.png)`)*

### 6. User Profile Page
*Placeholder for User Profile view*
*(Add screenshot image here: e.g., `![Profile Page](docs/screenshots/profile.png)`)*

---

## AI Development Experience

### Primary Development Assistant: Google Antigravity IDE
The foundational implementation of TaskFlow was developed with assistance from Google Antigravity:
- **Architecture & System Design (Phases 1–2):** Structured the layered backend architecture, database schema design, and modular Vite/Tailwind frontend layout.
- **Backend & Authentication (Phases 3–6):** Implemented Mongoose schemas, JWT middleware, bcryptjs password hashing, Task CRUD controllers, and MongoDB aggregation pipelines.
- **Verification Suites (Phases 7 & 9):** Authored automated test scripts verifying 39 test cases across authentication, task operations, and cross-user data isolation.
- **Frontend Construction (Phase 8):** Implemented reusable React components (`Navbar`, `TaskCard`, `TaskForm`, `StatsCard`, `ProtectedRoute`), Axios service layer, and page views.

### Hiring Assessment Requirement: Kiro / Code0
The hiring assessment specifically requires the documented use of either **Kiro** or **Code0** for designated tasks:

> **Important Assessment Note:**  
> The candidate must separately utilize **Kiro** or **Code0** for designated development tasks prior to final assessment submission.
>
> **Designated Tasks for Kiro / Code0:**
> 1. Architecture review and assessment verification
> 2. Authentication code review & security audit
> 3. Frontend React component refactoring / accessibility review
> 4. Debugging and edge-case testing
>
> *(To be filled by candidate upon completion of Kiro/Code0 tasks: Record exact prompts, tool outputs, and code adjustments made using Kiro or Code0).*

---

## Challenges and Solutions

### 1. Strict Cross-User Authorization
- **Challenge:** Preventing malicious requests from accessing or modifying tasks belonging to other users if they discover or forge a task ID.
- **Solution:** Configured all database queries (`Task.findOne`, `Task.findOneAndDelete`) to require both `_id: req.params.id` and `user: req.user._id`. Non-matching queries return `404 Not Found` rather than `403 Forbidden` to prevent resource enumeration.

### 2. High-Performance Dashboard Statistics
- **Challenge:** Counting total, todo, in-progress, completed, and high-priority tasks without loading all user documents into Node.js server memory.
- **Solution:** Implemented a single-pass MongoDB aggregation pipeline (`Task.aggregate()`) using `$match` on user ID and `$group` with conditional sums (`$cond`), computing all counts on the database engine.

### 3. Express Parameter Route Precedence
- **Challenge:** In Express, defining `router.get('/:id', ...)` before `router.get('/stats', ...)` caused requests to `/api/tasks/stats` to be misidentified as `req.params.id = 'stats'`, triggering MongoDB ObjectId casting errors.
- **Solution:** Ordered the `/stats` route definition before the parameterized `/:id` route in `server/routes/taskRoutes.js`.

---

## Future Improvements

- **Pagination & Infinite Scrolling:** Implement cursor- or skip-based pagination for accounts with large task volumes.
- **Custom Tags & Categories:** Allow users to define custom labels and color codes for grouping tasks.
- **Due Date Reminders:** Add email or in-app notifications for tasks nearing their scheduled deadlines.
- **Refresh Token Rotation:** Enhance the stateless JWT implementation with HTTP-only refresh cookies and short-lived access tokens.

---

## Author

**Manoj**  
*Full-Stack MERN Developer*
