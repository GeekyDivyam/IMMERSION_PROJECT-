# 📚 E-Library Management System

A comprehensive library management system built with the MERN stack (MongoDB, Express.js, React, Node.js) that allows users to browse, borrow, and manage books in a digital library environment.

## 🚀 Features

### For Users
- **User Registration & Authentication** - Secure signup and login system
- **Browse Books** - Search and filter through the book catalog
- **Book Details** - View comprehensive information about each book
- **Borrow Books** - Request to borrow available books
- **Return Books** - Return borrowed books
- **Profile Management** - Update personal information
- **Borrowing History** - Track borrowed and returned books

### For Administrators
- **User Management** - View and manage user accounts
- **Book Management** - Add, edit, and remove books from the catalog
- **Borrowing Management** - Approve/deny borrowing requests
- **Analytics Dashboard** - View library statistics and reports
- **Inventory Control** - Track book availability and location

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **React Bootstrap** - Responsive UI components
- **Axios** - HTTP client for API calls
- **React Toastify** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

### Security & Middleware
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API rate limiting
- **Input Validation** - Server-side validation

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/GeekyDivyam/IMMERSION_PROJECT-.git
cd IMMERSION_PROJECT-
```

### 2. Install Dependencies
```bash
# Install all dependencies (backend + frontend)
npm run install-all

# Or install separately
npm run install-server  # Backend dependencies
npm run install-client  # Frontend dependencies
```

### 3. Environment Configuration
Create a `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/elibrary
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=30d
```

### 4. Database Setup
```bash
# Start MongoDB service (Windows)
net start MongoDB

# Seed the database with sample data
npm run seed
```

### 5. Run the Application
```bash
# Run both frontend and backend concurrently
npm run dev

# Or run separately
npm run server  # Backend only (port 5000)
npm run client  # Frontend only (port 3000)
```

## 🎯 Usage

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### Default Login Credentials

**Administrator Account:**
- Email: `admin@library.com`
- Password: `password`

**Sample User Accounts:**
- Email: `john@example.com` / Password: `password`
- Email: `jane@example.com` / Password: `password`
- Email: `bob@example.com` / Password: `password`

## 📁 Project Structure

```
E-LIBRARY-PROJECT/
├── backend/
│   ├── middleware/          # Custom middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── seeders/            # Database seeders
│   ├── server.js           # Main server file
│   └── package.json
├── frontend/
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context
│   │   └── App.js
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Add new book (Admin)
- `PUT /api/books/:id` - Update book (Admin)
- `DELETE /api/books/:id` - Delete book (Admin)

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Borrowing
- `POST /api/borrow` - Borrow a book
- `PUT /api/borrow/:id/return` - Return a book
- `GET /api/borrow/user/:userId` - Get user's borrowing history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Divyam** - [GeekyDivyam](https://github.com/GeekyDivyam)

## 🙏 Acknowledgments

- React Bootstrap for UI components
- MongoDB for database solutions
- Express.js for backend framework
- All contributors and supporters of this project

---

⭐ **Star this repository if you found it helpful!**
