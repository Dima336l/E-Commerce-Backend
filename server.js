const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
let db;
let lessonsCollection;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

// Basic middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'EduMarket API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes

// GET /lessons - Get all lessons
app.get('/lessons', async (req, res) => {
  try {
    const lessons = await lessonsCollection.find({}).toArray();
    res.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch lessons'
    });
  }
});

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 Connection URI:', MONGODB_URI);
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!');
    
    db = client.db('ecommerce');
    lessonsCollection = db.collection('lessons');
    
    // Seed database with initial data if empty
    await seedDatabase();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

// Seed database with initial lesson data
async function seedDatabase() {
  try {
    const count = await lessonsCollection.countDocuments();
    if (count === 0) {
      console.log('📚 Seeding database with initial lesson data...');
      
      const lessons = [
        {
          subject: 'Mathematics',
          location: 'Hendon',
          price: 100,
          space: 5,
          image: 'math-hendon.jpg'
        },
        {
          subject: 'Mathematics',
          location: 'Colindale',
          price: 80,
          space: 2,
          image: 'math-colindale.jpg'
        },
        {
          subject: 'Mathematics',
          location: 'Brent Cross',
          price: 90,
          space: 6,
          image: 'math-brentcross.jpg'
        },
        {
          subject: 'English Literature',
          location: 'Hendon',
          price: 85,
          space: 4,
          image: 'english-hendon.jpg'
        },
        {
          subject: 'Science',
          location: 'Brent Cross',
          price: 110,
          space: 5,
          image: 'science-brentcross.jpg'
        }
      ];
      
      await lessonsCollection.insertMany(lessons);
      console.log('✅ Database seeded with', lessons.length, 'lessons');
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Start server
async function startServer() {
  try {
    await connectToMongoDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 EduMarket API Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 Lessons API: http://localhost:${PORT}/lessons`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();