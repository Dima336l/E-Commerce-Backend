const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
let db;
let lessonsCollection;
let ordersCollection;

// MongoDB connection string - defaults to local MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

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
    ordersCollection = db.collection('orders');
    
    // Seed database with initial data if empty
    await seedDatabase();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('');
    console.log('🔧 Common solutions:');
    console.log('1. Check your internet connection');
    console.log('2. Verify the connection string in .env file');
    console.log('3. Ensure your IP is whitelisted in MongoDB Atlas');
    console.log('4. Check your MongoDB Atlas username and password');
    console.log('');
    console.log('💡 Run: node setup-database.js for help');
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
          subject: 'Mathematics',
          location: 'Golders Green',
          price: 95,
          space: 7,
          image: 'math-goldersgreen.jpg'
        },
        {
          subject: 'English Literature',
          location: 'Hendon',
          price: 85,
          space: 4,
          image: 'english-hendon.jpg'
        },
        {
          subject: 'English Literature',
          location: 'Colindale',
          price: 75,
          space: 3,
          image: 'english-colindale.jpg'
        },
        {
          subject: 'Science',
          location: 'Brent Cross',
          price: 110,
          space: 5,
          image: 'science-brentcross.jpg'
        },
        {
          subject: 'Science',
          location: 'Golders Green',
          price: 105,
          space: 6,
          image: 'science-goldersgreen.jpg'
        },
        {
          subject: 'Art',
          location: 'Hendon',
          price: 70,
          space: 8,
          image: 'art-hendon.jpg'
        },
        {
          subject: 'Music',
          location: 'Colindale',
          price: 90,
          space: 4,
          image: 'music-colindale.jpg'
        }
      ];
      
      await lessonsCollection.insertMany(lessons);
      console.log('✅ Database seeded with', lessons.length, 'lessons');
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Custom logger middleware (Required for coursework)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`);
  next();
});

// Morgan logger for detailed HTTP logs
app.use(morgan('combined'));

// Static file middleware (Required for coursework)
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Static file middleware with error handling for missing images
app.use('/images', (req, res, next) => {
  const imagePath = path.join(__dirname, 'public/images', req.path);
  const fs = require('fs');
  
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({
      error: 'Image not found',
      message: `The requested image ${req.path} does not exist`,
      timestamp: new Date().toISOString()
    });
  }
  next();
});

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

// GET /lessons - Get all lessons (Required for coursework)
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

// GET /search - Search lessons (Required for coursework - 10% search functionality)
app.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Search query parameter "q" is required'
      });
    }
    
    // Create text search index on multiple fields
    const searchRegex = new RegExp(q, 'i'); // Case-insensitive regex
    
    const lessons = await lessonsCollection.find({
      $or: [
        { subject: searchRegex },
        { location: searchRegex },
        { price: { $regex: q } },
        { space: { $regex: q } }
      ]
    }).toArray();
    
    res.json({
      query: q,
      results: lessons,
      count: lessons.length
    });
  } catch (error) {
    console.error('Error searching lessons:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to search lessons'
    });
  }
});

// POST /orders - Create a new order (Required for coursework)
app.post('/orders', async (req, res) => {
  try {
    const { name, phone, lessons } = req.body;
    
    // Validation
    if (!name || !phone || !lessons || !Array.isArray(lessons)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Name, phone, and lessons array are required'
      });
    }
    
    // Validate name (letters only)
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Name must contain only letters and spaces'
      });
    }
    
    // Validate phone (numbers only)
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Phone must contain only numbers'
      });
    }
    
    // Create order object
    const order = {
      name,
      phone,
      lessons,
      totalAmount: 0,
      createdAt: new Date(),
      status: 'confirmed'
    };
    
    // Calculate total amount and validate lesson availability
    let totalAmount = 0;
    for (const lessonOrder of lessons) {
      const lesson = await lessonsCollection.findOne({ _id: new ObjectId(lessonOrder.lessonId) });
      if (!lesson) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Lesson with ID ${lessonOrder.lessonId} not found`
        });
      }
      
      if (lesson.space < lessonOrder.quantity) {
        return res.status(400).json({
          error: 'Bad Request',
          message: `Not enough spaces available for ${lesson.subject} in ${lesson.location}`
        });
      }
      
      totalAmount += lesson.price * lessonOrder.quantity;
    }
    
    order.totalAmount = totalAmount;
    
    // Insert order
    const result = await ordersCollection.insertOne(order);
    
    // Update lesson spaces
    for (const lessonOrder of lessons) {
      await lessonsCollection.updateOne(
        { _id: new ObjectId(lessonOrder.lessonId) },
        { $inc: { space: -lessonOrder.quantity } }
      );
    }
    
    res.status(201).json({
      message: 'Order created successfully',
      orderId: result.insertedId,
      order: {
        ...order,
        _id: result.insertedId
      }
    });
    
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create order'
    });
  }
});

// PUT /lessons/:id - Update lesson (Required for coursework)
app.put('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid lesson ID format'
      });
    }
    
    // Remove _id from updates to prevent modification
    delete updates._id;
    
    // Validate numeric fields
    if (updates.price !== undefined && (isNaN(updates.price) || updates.price < 0)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Price must be a non-negative number'
      });
    }
    
    if (updates.space !== undefined && (isNaN(updates.space) || updates.space < 0)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Space must be a non-negative number'
      });
    }
    
    const result = await lessonsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Lesson not found'
      });
    }
    
    const updatedLesson = await lessonsCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      message: 'Lesson updated successfully',
      lesson: updatedLesson
    });
    
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update lesson'
    });
  }
});

// GET /orders - Get all orders (additional endpoint for testing)
app.get('/orders', async (req, res) => {
  try {
    const orders = await ordersCollection.find({}).toArray();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch orders'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: [
      'GET /health',
      'GET /lessons',
      'GET /search?q=query',
      'POST /orders',
      'PUT /lessons/:id',
      'GET /orders'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  });
});

// Start server
async function startServer() {
  try {
    await connectToMongoDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 EduMarket API Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 Lessons API: http://localhost:${PORT}/lessons`);
      console.log(`🔍 Search API: http://localhost:${PORT}/search?q=math`);
      console.log(`🛒 Orders API: http://localhost:${PORT}/orders`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();