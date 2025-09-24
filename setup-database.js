const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');
    console.log('📍 Connection URI:', MONGODB_URI);
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('ecommerce');
    const lessonsCollection = db.collection('lessons');
    
    // Clear existing data
    await lessonsCollection.deleteMany({});
    console.log('🗑️  Cleared existing lesson data');
    
    // Insert sample lessons
    const lessons = [
      { subject: 'Mathematics', location: 'Hendon', price: 100, space: 5, image: 'math-hendon.jpg' },
      { subject: 'Mathematics', location: 'Colindale', price: 80, space: 2, image: 'math-colindale.jpg' },
      { subject: 'Mathematics', location: 'Brent Cross', price: 90, space: 6, image: 'math-brentcross.jpg' },
      { subject: 'English Literature', location: 'Hendon', price: 85, space: 4, image: 'english-hendon.jpg' },
      { subject: 'Science', location: 'Brent Cross', price: 110, space: 5, image: 'science-brentcross.jpg' },
      { subject: 'Art', location: 'Hendon', price: 70, space: 8, image: 'art-hendon.jpg' },
      { subject: 'Music', location: 'Colindale', price: 90, space: 4, image: 'music-colindale.jpg' }
    ];
    
    await lessonsCollection.insertMany(lessons);
    console.log(`✅ Database setup complete! Inserted ${lessons.length} lessons`);
    
    await client.close();
    console.log('🔒 Database connection closed');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };