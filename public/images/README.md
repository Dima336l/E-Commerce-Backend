# Lesson Images

This directory contains images for the lessons. The static file middleware will serve these images and return a 404 error with a proper JSON response if an image is not found.

## Available Images:
- math-hendon.jpg
- math-colindale.jpg
- math-brentcross.jpg
- math-goldersgreen.jpg
- english-hendon.jpg
- english-colindale.jpg
- science-brentcross.jpg
- science-goldersgreen.jpg
- art-hendon.jpg
- music-colindale.jpg

## Accessing Images:
GET /images/math-hendon.jpg

## Error Response:
If an image is not found, the server returns:
```json
{
  "error": "Image not found",
  "message": "The requested image /filename.jpg does not exist",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
