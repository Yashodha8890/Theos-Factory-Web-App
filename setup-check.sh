#!/bin/bash

echo "Checking Theo's Factory Web App Setup..."
echo ""

# Check Node.js
echo " Node.js version:"
node --version
echo ""

# Check npm
echo "npm version:"
npm --version
echo ""

# Check Backend
echo "Backend Dependencies:"
if [ -d "backend/node_modules" ]; then
  echo "Backend dependencies installed"
else
  echo "✗ Backend dependencies NOT installed. Run: cd backend && npm install"
fi
echo ""

# Check Frontend
echo "Frontend Dependencies:"
if [ -d "frontend/node_modules" ]; then
  echo "Frontend dependencies installed"
else
  echo "Frontend dependencies NOT installed. Run: cd frontend && npm install"
fi
echo ""

# Check Environment Files
echo "Environment Files:"
if [ -f "backend/.env" ]; then
  echo "Backend .env exists"
else
  echo "Backend .env missing. Copy from .env.example"
fi

if [ -f "frontend/.env" ]; then
  echo "Frontend .env exists"
else
  echo "Frontend .env missing. Copy from .env.example"
fi
echo ""

echo "Setup check complete!"
echo ""
echo "Next steps:"
echo "1. Start MongoDB: brew services start mongodb-community"
echo "2. Seed database: cd backend && npm run seed"
echo "3. Run backend: cd backend && npm run dev"
echo "4. Run frontend (new terminal): cd frontend && npm run dev"
