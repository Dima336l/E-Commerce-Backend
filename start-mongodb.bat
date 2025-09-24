@echo off
echo 🗄️ Starting Local MongoDB...
echo.

REM Create data directory if it doesn't exist
if not exist "data" mkdir data

echo 📁 Data directory: %cd%\data
echo 🚀 Starting MongoDB on port 27017...
echo.
echo ⚠️  Keep this window open while using the application
echo ❌ Press Ctrl+C to stop MongoDB
echo.

mongod --dbpath ./data --port 27017
