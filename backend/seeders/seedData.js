const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Book = require('../models/Book');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@library.com',
      password: 'password',
      role: 'admin',
      phone: '1234567890',
      address: '123 Admin Street, Admin City',
      isActive: true
    });

    // Create sample users
    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
        studentId: 'STU001',
        phone: '1234567891',
        address: '123 Student Street, Student City',
        role: 'user'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password',
        studentId: 'STU002',
        phone: '1234567892',
        address: '456 Student Avenue, Student City',
        role: 'user'
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'password',
        studentId: 'STU003',
        phone: '1234567893',
        address: '789 Student Boulevard, Student City',
        role: 'user'
      }
    ];

    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length + 1} users (including admin)`);
    
    return { adminUser, users: createdUsers };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

const seedBooks = async (adminUserId) => {
  try {
    // Clear existing books
    await Book.deleteMany({});

    const books = [
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '978-0-7432-7356-5',
        publisher: 'Scribner',
        publishedYear: 1925,
        category: 'Fiction',
        description: 'A classic American novel set in the Jazz Age.',
        totalCopies: 5,
        availableCopies: 5,
        language: 'English',
        pages: 180,
        location: { shelf: 'A1', section: 'A' },
        addedBy: adminUserId
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '978-0-06-112008-4',
        publisher: 'J.B. Lippincott & Co.',
        publishedYear: 1960,
        category: 'Fiction',
        description: 'A novel about racial injustice and childhood in the American South.',
        totalCopies: 3,
        availableCopies: 3,
        language: 'English',
        pages: 281,
        location: { shelf: 'A2', section: 'A' },
        addedBy: adminUserId
      },
      {
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        isbn: '978-0-262-03384-8',
        publisher: 'MIT Press',
        publishedYear: 2009,
        category: 'Technology',
        description: 'Comprehensive introduction to algorithms and data structures.',
        totalCopies: 4,
        availableCopies: 4,
        language: 'English',
        pages: 1312,
        location: { shelf: 'T1', section: 'T' },
        addedBy: adminUserId
      },
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        isbn: '978-0-553-38016-3',
        publisher: 'Bantam Books',
        publishedYear: 1988,
        category: 'Science',
        description: 'Popular science book about cosmology and the universe.',
        totalCopies: 2,
        availableCopies: 2,
        language: 'English',
        pages: 256,
        location: { shelf: 'S1', section: 'S' },
        addedBy: adminUserId
      },
      {
        title: 'The Art of War',
        author: 'Sun Tzu',
        isbn: '978-1-59030-963-7',
        publisher: 'Various',
        publishedYear: -500,
        category: 'Philosophy',
        description: 'Ancient Chinese military treatise on strategy and tactics.',
        totalCopies: 3,
        availableCopies: 3,
        language: 'English',
        pages: 273,
        location: { shelf: 'P1', section: 'P' },
        addedBy: adminUserId
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '978-0-13-235088-4',
        publisher: 'Prentice Hall',
        publishedYear: 2008,
        category: 'Technology',
        description: 'A handbook of agile software craftsmanship.',
        totalCopies: 4,
        availableCopies: 4,
        language: 'English',
        pages: 464,
        location: { shelf: 'T2', section: 'T' },
        addedBy: adminUserId
      },
      {
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        isbn: '978-0-06-231609-7',
        publisher: 'Harper',
        publishedYear: 2014,
        category: 'History',
        description: 'A brief history of humankind.',
        totalCopies: 3,
        availableCopies: 3,
        language: 'English',
        pages: 443,
        location: { shelf: 'H1', section: 'H' },
        addedBy: adminUserId
      },
      {
        title: 'The Lean Startup',
        author: 'Eric Ries',
        isbn: '978-0-307-88789-4',
        publisher: 'Crown Business',
        publishedYear: 2011,
        category: 'Business',
        description: 'How constant innovation creates radically successful businesses.',
        totalCopies: 2,
        availableCopies: 2,
        language: 'English',
        pages: 336,
        location: { shelf: 'B1', section: 'B' },
        addedBy: adminUserId
      }
    ];

    const createdBooks = await Book.create(books);
    console.log(`Created ${createdBooks.length} books`);
    
    return createdBooks;
  } catch (error) {
    console.error('Error seeding books:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('Starting database seeding...');
    
    const { adminUser, users } = await seedUsers();
    const books = await seedBooks(adminUser._id);
    
    console.log('Database seeding completed successfully!');
    console.log('\nSample login credentials:');
    console.log('Admin: admin@library.com / password');
    console.log('User: john@example.com / password');
    console.log('User: jane@example.com / password');
    console.log('User: bob@example.com / password');
    
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
