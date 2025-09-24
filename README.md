# E-Commerce Backend API

Express.js backend for after-school classes e-commerce application with MongoDB integration.

## Features

- **RESTful API**: Complete CRUD operations for lessons and orders
- **MongoDB Integration**: Persistent data storage with automatic seeding
- **Input Validation**: Comprehensive form validation (name: letters only, phone: numbers only)
- **Search Functionality**: Advanced search across multiple fields
- **Security**: Helmet security headers, CORS support
- **Logging**: Custom request logging and Morgan HTTP logs
- **Error Handling**: Comprehensive error responses

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or MongoDB Atlas)

### Installation

```bash
npm install
```

### Configuration

1. Copy `config.example.env` to `.env`
2. Update MongoDB connection string if needed

### Running the Server

```bash
# Production
npm start

# Development with auto-restart
npm run dev

# Database setup (optional)
node setup-database.js
```

## API Endpoints

### Core Endpoints
- `GET /health` - Health check and server status
- `GET /lessons` - Get all available lessons
- `GET /search?q=query` - Search lessons by subject, location, or price
- `POST /orders` - Create new order with validation
- `PUT /lessons/:id` - Update lesson details

### Static Files
- `GET /images/*` - Serve lesson images

## Request/Response Examples

### Get All Lessons
```bash
curl http://localhost:3000/lessons
```

### Search Lessons
```bash
curl "http://localhost:3000/search?q=math"
```

### Create Order
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "phone": "1234567890",
    "lessons": [
      {"lessonId": "lesson_id_here", "quantity": 1}
    ]
  }'
```

## Data Models

### Lesson
```javascript
{
  "_id": "ObjectId",
  "subject": "Mathematics",
  "location": "Hendon", 
  "price": 100,
  "space": 5,
  "image": "math-hendon.jpg"
}
```

### Order
```javascript
{
  "_id": "ObjectId",
  "name": "John Smith",
  "phone": "1234567890", 
  "lessons": [{"lessonId": "ObjectId", "quantity": 1}],
  "totalAmount": 100,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "status": "confirmed"
}
```

## Development

The server includes:
- Automatic database seeding on first run
- Hot reloading with nodemon
- Detailed request/response logging
- Input validation with helpful error messages
- CORS enabled for frontend integration