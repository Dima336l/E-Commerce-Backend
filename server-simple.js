const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory database (acts like MongoDB but without installation)
let lessons = [];
let orders = [];
let nextLessonId = 1;
let nextOrderId = 1;

// Initialize with sample data
function initializeData() {
  lessons = [
    {
      _id: nextLessonId++,
      subject: 'Mathematics',
      location: 'Hendon',
      price: 100,
      space: 5,
      image: 'math-hendon.jpg'
    },
    {
      _id: nextLessonId++,
      subject: 'Mathematics',
      location: 'Colindale',
      price: 80,
      space: 2,
      image: 'math-colindale.jpg'
    },
    {
      _id: nextLessonId++,
      subject: 'Mathematics',
      location: 'Brent Cross',
      price: 90,
      space: 6,
      image: 'math-brentcross.jpg'
    },
    {
      _id: nextLessonId++,
      subject: 'Mathematics',
      location: 'Golders Green',
      price: 95,
      space: 7,
      image: 'math-goldersgreen.jpg'
    },
    {
      _id: nextLessonId++,
      subject: 'English Literature',
      location: 'Hendon',
      price: 85,
      space: 4,
      image: 'english-hendon.jpg'
    },
    {
      _id: nextLessonId++,
      subject: 'English Literature',
      location: 'Colindale',
      price: 75,
      space: 3,
      image: 'english-colindale.jpg'
    },
    {
      _id: nextLessonId++,
      subject: 'Science',
      location: 'Brent Cross',
      price: 110,
      space: 5,
      image: 'science-brentcross.jpg'
    },
    {
      _id: nextLessonId++,
      subject: 'Science',
      location: 'Golders Green',
      price: 105,
      space: 6,
      image: 'science-goldersgreen.jpg'
    },
    {
      _id: nextLessonId++,
      subject: 'Art',
      location: 'Hendon',
      price: 70,
      space: 8,
      image: 'art-hendon.jpg'
    },
    {
      _id: nextLessonId++,
      subject: 'Music',
      location: 'Colindale',
      price: 90,
      space: 4,
      image: 'music-colindale.jpg'
    }
  ];
  
  console.log('✅ In-memory database initialized with', lessons.length, 'lessons');
}

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Security headers with CORS support for images
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
})); // Enable CORS for frontend
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
    message: 'EduMarket API is running (In-Memory Database)',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'In-Memory',
    lessonsCount: lessons.length,
    ordersCount: orders.length
  });
});

// GET /lessons - Get all lessons (Required for coursework)
app.get('/lessons', (req, res) => {
  try {
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
app.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Search query parameter "q" is required'
      });
    }
    
    // Search through lessons
    const searchTerm = q.toLowerCase();
    const results = lessons.filter(lesson => 
      lesson.subject.toLowerCase().includes(searchTerm) ||
      lesson.location.toLowerCase().includes(searchTerm) ||
      lesson.price.toString().includes(searchTerm) ||
      lesson.space.toString().includes(searchTerm)
    );
    
    res.json({
      query: q,
      results: results,
      count: results.length
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
app.post('/orders', (req, res) => {
  try {
    const { name, phone, lessons: orderLessons } = req.body;
    
    // Validation
    if (!name || !phone || !orderLessons || !Array.isArray(orderLessons)) {
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
    
    // Calculate total amount and validate lesson availability
    let totalAmount = 0;
    for (const lessonOrder of orderLessons) {
      const lesson = lessons.find(l => l._id == lessonOrder.lessonId);
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
    
    // Create order object
    const order = {
      _id: nextOrderId++,
      name,
      phone,
      lessons: orderLessons,
      totalAmount: totalAmount,
      createdAt: new Date(),
      status: 'confirmed'
    };
    
    // Add order to in-memory database
    orders.push(order);
    
    // Update lesson spaces
    for (const lessonOrder of orderLessons) {
      const lesson = lessons.find(l => l._id == lessonOrder.lessonId);
      if (lesson) {
        lesson.space -= lessonOrder.quantity;
      }
    }
    
    console.log('✅ Order created:', order._id, 'for', name, 'Total:', totalAmount);
    
    res.status(201).json({
      message: 'Order created successfully',
      orderId: order._id,
      order: order
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
app.put('/lessons/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Find lesson
    const lessonIndex = lessons.findIndex(l => l._id == id);
    
    if (lessonIndex === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Lesson not found'
      });
    }
    
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
    
    // Update lesson
    const lesson = lessons[lessonIndex];
    Object.assign(lesson, updates);
    
    console.log('✅ Lesson updated:', lesson.subject, 'in', lesson.location, 'now has', lesson.space, 'spaces');
    
    res.json({
      message: 'Lesson updated successfully',
      lesson: lesson
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
app.get('/orders', (req, res) => {
  try {
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
function startServer() {
  initializeData();
  
  app.listen(PORT, () => {
    console.log('🚀 EduMarket API Server running with In-Memory Database');
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 Lessons API: http://localhost:${PORT}/lessons`);
    console.log(`🔍 Search API: http://localhost:${PORT}/search?q=math`);
    console.log(`🛒 Orders API: http://localhost:${PORT}/orders`);
    console.log('');
    console.log('💡 This version uses in-memory storage - no database installation required!');
    console.log('💾 Data will reset when server restarts (perfect for development)');
  });
}

startServer();