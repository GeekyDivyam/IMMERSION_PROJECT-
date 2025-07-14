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
      },
      // Recently Added Books (2023-2024)
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        isbn: '978-0-7352-1129-2',
        publisher: 'Avery',
        publishedYear: 2018,
        category: 'Self-Help',
        description: 'An easy and proven way to build good habits and break bad ones.',
        totalCopies: 5,
        availableCopies: 5,
        language: 'English',
        pages: 320,
        location: { shelf: 'SH1', section: 'SH' },
        addedBy: adminUserId
      },
      {
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        isbn: '978-0-85719-996-8',
        publisher: 'Harriman House',
        publishedYear: 2020,
        category: 'Business',
        description: 'Timeless lessons on wealth, greed, and happiness.',
        totalCopies: 4,
        availableCopies: 4,
        language: 'English',
        pages: 256,
        location: { shelf: 'B2', section: 'B' },
        addedBy: adminUserId
      },
      {
        title: 'Dune',
        author: 'Frank Herbert',
        isbn: '978-0-441-17271-9',
        publisher: 'Ace Books',
        publishedYear: 1965,
        category: 'Fiction',
        description: 'Epic science fiction novel set on the desert planet Arrakis.',
        totalCopies: 6,
        availableCopies: 6,
        language: 'English',
        pages: 688,
        location: { shelf: 'F1', section: 'F' },
        addedBy: adminUserId
      },
      {
        title: 'The Midnight Library',
        author: 'Matt Haig',
        isbn: '978-0-525-55948-1',
        publisher: 'Viking',
        publishedYear: 2020,
        category: 'Fiction',
        description: 'A novel about life, death, and all the other lives you might have lived.',
        totalCopies: 4,
        availableCopies: 4,
        language: 'English',
        pages: 288,
        location: { shelf: 'F2', section: 'F' },
        addedBy: adminUserId
      },
      {
        title: 'Educated',
        author: 'Tara Westover',
        isbn: '978-0-399-59050-4',
        publisher: 'Random House',
        publishedYear: 2018,
        category: 'Biography',
        description: 'A memoir about education, family, and the struggle for self-invention.',
        totalCopies: 3,
        availableCopies: 3,
        language: 'English',
        pages: 334,
        location: { shelf: 'BIO1', section: 'BIO' },
        addedBy: adminUserId
      },
      {
        title: 'The Seven Husbands of Evelyn Hugo',
        author: 'Taylor Jenkins Reid',
        isbn: '978-1-5011-3981-2',
        publisher: 'Atria Books',
        publishedYear: 2017,
        category: 'Fiction',
        description: 'A reclusive Hollywood icon finally tells her story.',
        totalCopies: 5,
        availableCopies: 5,
        language: 'English',
        pages: 400,
        location: { shelf: 'F3', section: 'F' },
        addedBy: adminUserId
      },
      {
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        isbn: '978-0-374-53355-7',
        publisher: 'Farrar, Straus and Giroux',
        publishedYear: 2011,
        category: 'Psychology',
        description: 'A groundbreaking tour of the mind and explains the two systems that drive the way we think.',
        totalCopies: 3,
        availableCopies: 3,
        language: 'English',
        pages: 499,
        location: { shelf: 'PSY1', section: 'PSY' },
        addedBy: adminUserId
      },
      {
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        isbn: '978-0-06-231500-7',
        publisher: 'HarperOne',
        publishedYear: 1988,
        category: 'Fiction',
        description: 'A magical story about following your dreams.',
        totalCopies: 4,
        availableCopies: 4,
        language: 'English',
        pages: 163,
        location: { shelf: 'F4', section: 'F' },
        addedBy: adminUserId
      },
      {
        title: 'Becoming',
        author: 'Michelle Obama',
        isbn: '978-1-5247-6313-8',
        publisher: 'Crown',
        publishedYear: 2018,
        category: 'Biography',
        description: 'An intimate, powerful, and inspiring memoir by the former First Lady.',
        totalCopies: 4,
        availableCopies: 4,
        language: 'English',
        pages: 448,
        location: { shelf: 'BIO2', section: 'BIO' },
        addedBy: adminUserId
      },
      // Technology & Programming
      {
        title: 'JavaScript: The Good Parts',
        author: 'Douglas Crockford',
        isbn: '978-0-596-51774-8',
        publisher: "O'Reilly Media",
        publishedYear: 2008,
        category: 'Technology',
        description: 'A deep dive into the good parts of JavaScript.',
        totalCopies: 3,
        availableCopies: 3,
        language: 'English',
        pages: 176,
        location: { shelf: 'T3', section: 'T' },
        addedBy: adminUserId
      },
      {
        title: 'Design Patterns',
        author: 'Gang of Four',
        isbn: '978-0-201-63361-0',
        publisher: 'Addison-Wesley',
        publishedYear: 1994,
        category: 'Technology',
        description: 'Elements of reusable object-oriented software.',
        totalCopies: 2,
        availableCopies: 2,
        language: 'English',
        pages: 395,
        location: { shelf: 'T4', section: 'T' },
        addedBy: adminUserId
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'David Thomas',
        isbn: '978-0-201-61622-4',
        publisher: 'Addison-Wesley',
        publishedYear: 1999,
        category: 'Technology',
        description: 'From journeyman to master.',
        totalCopies: 4,
        availableCopies: 4,
        language: 'English',
        pages: 352,
        location: { shelf: 'T5', section: 'T' },
        addedBy: adminUserId
      },
      // Science & Nature
      {
        title: 'Cosmos',
        author: 'Carl Sagan',
        isbn: '978-0-345-33135-9',
        publisher: 'Random House',
        publishedYear: 1980,
        category: 'Science',
        description: 'A personal voyage through the universe.',
        totalCopies: 3,
        availableCopies: 3,
        language: 'English',
        pages: 365,
        location: { shelf: 'S2', section: 'S' },
        addedBy: adminUserId
      },
      {
        title: 'The Origin of Species',
        author: 'Charles Darwin',
        isbn: '978-0-14-043205-1',
        publisher: 'Penguin Classics',
        publishedYear: 1859,
        category: 'Science',
        description: 'On the origin of species by means of natural selection.',
        totalCopies: 2,
        availableCopies: 2,
        language: 'English',
        pages: 432,
        location: { shelf: 'S3', section: 'S' },
        addedBy: adminUserId
      },
      {
        title: 'Astrophysics for People in a Hurry',
        author: 'Neil deGrasse Tyson',
        isbn: '978-0-393-60939-4',
        publisher: 'W. W. Norton & Company',
        publishedYear: 2017,
        category: 'Science',
        description: 'The universe in a nutshell.',
        totalCopies: 4,
        availableCopies: 4,
        language: 'English',
        pages: 224,
        location: { shelf: 'S4', section: 'S' },
        addedBy: adminUserId
      },
      // Literature & Classics
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '978-0-452-28423-4',
        publisher: 'Plume',
        publishedYear: 1949,
        category: 'Fiction',
        description: 'A dystopian social science fiction novel.',
        totalCopies: 5,
        availableCopies: 5,
        language: 'English',
        pages: 328,
        location: { shelf: 'F5', section: 'F' },
        addedBy: adminUserId
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        isbn: '978-0-14-143951-8',
        publisher: 'Penguin Classics',
        publishedYear: 1813,
        category: 'Fiction',
        description: 'A romantic novel of manners.',
        totalCopies: 3,
        availableCopies: 3,
        language: 'English',
        pages: 432,
        location: { shelf: 'F6', section: 'F' },
        addedBy: adminUserId
      },
      {
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        isbn: '978-0-316-76948-0',
        publisher: 'Little, Brown and Company',
        publishedYear: 1951,
        category: 'Fiction',
        description: 'A controversial novel about teenage rebellion.',
        totalCopies: 4,
        availableCopies: 4,
        language: 'English',
        pages: 277,
        location: { shelf: 'F7', section: 'F' },
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
