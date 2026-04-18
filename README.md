# ⚙️ MemoryBook – Backend

The backend of **MemoryBook**, powering a collaborative digital memory platform where users create and manage shared scrapbook-style memory books.

🔗 **Frontend Repo:** https://github.com/thejas68/memorybook-frontend

🔗 **Live App:** https://memorybook-frontend.vercel.app/

---

## 🧠 Concept
The backend serves as the **core engine** of MemoryBook, handling:

* Memory storage
* Book collaboration
* User access control
* Activity tracking

It ensures that every memory added becomes part of a **secure, structured, and meaningful timeline**.

---

## 🚀 Features

* 📡 RESTful API architecture
* 🗄️ Memory storage & retrieval
* 🔄 Full CRUD operations for pages
* 👥 User collaboration system
* 🔐 Controlled access permissions
* 🌐 Secure frontend-backend communication

---

## 📜 Activity Log System

Inspired by systems like GitHub,
MemoryBook tracks every action inside a book:

* Page creation
* Edits
* Reactions
* Media uploads
* Member invitations

👉 This creates a **transparent history of the memory book**

---

## 🧩 Core Responsibilities

* Manage memory books and pages
* Handle user invitations and roles
* Store structured memory data
* Maintain chronological logs
* Support future AI integrations

---

## 🤖 AI Capabilities (Planned)

* Emotional title generation
* Smart tagging of memories
* Memory resurfacing (time-based insights)

---

## 🛠️ Tech Stack

* Runtime: Node.js
* Framework: Express.js
* Database: MongoDB
* Deployment: Render

---

## 🔗 Request Flow

1. Frontend sends API request
2. Routes handle endpoint
3. Controllers process logic
4. Database is updated or queried
5. Response returned to frontend

---

## 📂 Project Structure

```id="b99"
memorybook-backend/
│── controllers/
│── models/
│── routes/
│── config/
│── server.js
│── package.json
```

---

## ⚙️ Setup

```id="b100"
git clone https://github.com/thejas68/memorybook-backend.git
cd memorybook-backend
npm install
npm start
```

---

## 🔐 Environment Variables

```id="b101"
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=https://memorybook-frontend.vercel.app
```

---

## 📡 API Overview

```id="b102"
GET     /api/memories
POST    /api/memories
PUT     /api/memories/:id
DELETE  /api/memories/:id
```

---

## 🚀 Future Enhancements

* 🔑 JWT Authentication
* 📸 Media storage (Cloudinary)
* 🔒 Page-level access control
* 📊 Logging & monitoring
* ⚡ Scalable microservices architecture

---

## 🎯 Goal

To build a backend that supports **emotion-driven collaboration**,
not just data storage — but a **timeline of meaningful human experiences**.

---

## 👨‍💻 Author

**Thejas**
AIML Engineering Student

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
