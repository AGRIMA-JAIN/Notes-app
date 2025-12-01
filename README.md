# Notes-app
A simple, elegant full-stack Notes application built using React, Node.js, and MongoDB, supporting user authentication, admin panel, and role-based permissions.

#Features

Regular Users
-Create, edit, and delete personal notes

-Notes persist between logins

-Cannot access admin panel

Admin Users
-Cannot create notes

-Can view all notes from all users in a dedicated Admin Panel

-Route is protected by role-based authorization

#Architecture Overview
The project is structured as two separate apps inside one folder:

Notes-app/
│
├── continuum-api       # Backend (Node.js, Express, MongoDB)
│   ├── src
│   │   ├── models      # Mongoose models
│   │   ├── routes      # API routes
│   │   └── middleware  # Auth & admin protection
│   └── server.js       # App entry point
│
└── continuum-notes     # Frontend (React)
    ├── src/pages       # Login, Signup, Notes, Admin
    ├── src/auth        # Handles localStorage + user helpers
    └── package.json

#Floew

Frontend sends login/signup requests → /api/auth

Backend returns JWT + user details

Frontend stores JWT in localStorage

Notes CRUD happens through /api/notes

Admin-only route /api/admin/all-notes requires:

    Valid token

    role: "admin"

#Admin Credentials
| Email              | Password    | Role  |
| ------------------ | ----------- | ----- |
| `admin1@gmail.com` | `Admin@123` | admin |
| `admin2@gmail.com` | `Admin@123` | admin |

#How to Run the App Locally
Clone the Repository:-
git clone <your-repo-url>
cd Notes-app

Option A — Install MongoDB on macOS
#Install Homebrew (skip if you already have it)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

#Install MongoDB Community Edition
Run:-
brew tap mongodb/brew
brew install mongodb-community@7.0

#Start MongoDB Service
brew services start mongodb-community@7.0

#Verify MongoDB is running
brew services list

#Open Mongo Shell
mongosh
You should see:
test>

#Switch to your database:-
use continuum

#PART 2 — Insert Admin Users in MongoDB
BEFORE INSERTING — You MUST hash the password using bcrypt.
Your admin password: Admin@123

#Run this inside Node REPL:
#Generate bcrypt hash
In terminal:
node

#Inside the Node shell:
const bcrypt = require("bcryptjs");
bcrypt.hash("Admin@123", 10).then(h => console.log(h));

#It prints something like:
$2b$10$-------5gLfKvWXwkSPIfGLy

#Insert Admin 1 in MongoDB
Back in mongosh:
use continuum

#Then insert:
db.users.insertOne({
  name: "Admin One",
  email: "admin1@gmail.com",
  passwordHash: "$2b$10$E-------5gLfKvWXwkSPIfGLy",
  role: "admin"
})

Should return:
acknowledged: true

#Do the same for admin2

#Verify both admins were created
db.users.find().pretty()

#If using MongoDB Compass, ensure it runs on:
mongodb://127.0.0.1:27017/continuum

#Option B — Run WITHOUT MongoDB

If you don’t want to install MongoDB:

The backend includes fallback logic to store notes in-memory (non-persistent)
No installation required
Notes will reset when you restart the server

#To enable mock mode, in .env:
MONGO_URI=local

#Run backend:
npm run dev

#Backend Setup
cd continuum-api
npm install

Create .env:
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/continuum
JWT_SECRET=yourStrongSecretKeyHere

Start backend:
npm run dev

#Frontend Setup
In another terminal run:
cd continuum-notes
npm install
npm start

#Frontend runs at:
http://localhost:3000


#Technologies Used
#Frontend

React (Hooks, Router)
Context-based auth helpers
Responsive mobile-first UI

#Backend

Node.js + Express
MongoDB + Mongoose
JWT Authentication
Role-based Authorization Middleware

#Why These Choices?

React → fast, clean UI with reusable components
Node.js/Express → simple REST API layer
MongoDB → flexible schema ideal for notes
JWT → lightweight and secure auth
Role-based middleware → clean separation between user/admin permissions

#Decisions & Tradeoffs

MongoDB chosen over SQL for faster prototyping, flexible schema.
LocalStorage used for tokens (simple, fast) instead of cookies.
Frontend built mobile-first to match a notes app UI.
Backend kept minimal for clarity and extensibility.

Deployed Link
https://notes-app-tii2.onrender.com/login












