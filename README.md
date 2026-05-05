 # 📌 Team Task Management System (MERN Stack)

A full-stack Team Task Management Web Application built using the MERN stack.
This application allows users to create projects, assign tasks, collaborate with team members, and track progress using a clean dashboard and Kanban-style board.

# 🚀 Features
 #🔐 Authentication
. User Signup & Login
. JWT-based authentication
. Protected routes

# 📊 Dashboard
Overview of total tasks
Task status breakdown (To Do, In Progress, Done)
Overdue task tracking
Personalized “My Tasks” section

# 📁 Project Management
Create projects
Add team members via email
Role-based access (Admin / Member)
View project details

# ✅ Task Management
Create tasks (Admin only)
Assign tasks to members
Set priority (Low / Medium / High)
Set due dates
Update task status
Delete tasks

# 📌 Kanban Board
Tasks organized into:
To Do
In Progress
Done

# 🛠️ Tech Stack
Frontend
React.js
React Router DOM
Axios
CSS (Custom Styled UI)

# Backend
Node.js
Express.js

# Database
MongoDB (Mongoose)
Authentication
JSON Web Tokens (JWT)

# File Structure
src/ <br>
│   <br>
├── Component/  <br>
│   ├── Login/  <br>
│   │   ├── Login.jsx/Login.css  <br>
│   │   └── Signup.jsx/Singup.css <br>
│   │            <br>
│   ├── Dashboard/ <br>
│   │   └── Dashboard.jsx/Dashboard.css <br>
│   │<br>
│   ├── Project/ <br>
│   │   ├── Project.jsx/Project.css <br>
│   │   └── ProjectDetails.jsx/ProjectDetails.css <br>
│   │  <br>
│   ├── Task/ <br>
│   │   └── Task.jsx/Task.css <br>
│   <br>
├── App.jsx <br>
├── api.js <br>


# 🔄 Application Flow
1. User logs in / signs up
2. Redirected to Dashboard
3. User creates or joins projects
4. Admin can:
Add members
Create tasks
5. Tasks are:
Assigned to members
Managed via Kanban board
6. Users track progress in Dashboard

# ⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/Ram-Bhatt08/task_manager_frontend.git
cd team-task-manager

2️⃣ Install dependencies
Frontend
cd frontend
npm install

Backend
cd backend
npm install

3️⃣ Setup Environment Variables

Create a .env file in backend:
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key

4️⃣ Run the project

start backend
node server.js

start frontend
npm run dev

# 👨‍💻 Author

 <b>Ram Bhatt </b>
 <I>Software Developer </I>
<I> Problem Solver </I>
































