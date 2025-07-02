#!/bin/bash

echo "🎓 Attendance Management System Deployment Script"
echo "=================================================="

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check if user is logged in
if ! wrangler whoami &> /dev/null; then
    echo "🔐 Please login to Cloudflare first:"
    wrangler login
fi

echo "📊 Creating D1 database..."
DB_OUTPUT=$(wrangler d1 create attendance-db 2>&1)
DB_ID=$(echo "$DB_OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)

if [ -n "$DB_ID" ]; then
    echo "✅ Database created with ID: $DB_ID"
    
    # Update wrangler.toml with the actual database ID
    sed -i.bak "s/your-database-id-here/$DB_ID/g" wrangler.toml
    echo "✅ Updated wrangler.toml with database ID"
else
    echo "⚠️  Database may already exist. Please check manually."
fi

echo "🗄️  Initializing database schema..."
wrangler d1 execute attendance-db --file=./database/schema.sql

echo "🔧 Installing frontend dependencies..."
npm install

echo "🔧 Installing backend dependencies..."
cd backend
npm install
cd ..

echo "🚀 Deploying backend worker..."
cd backend
wrangler deploy
cd ..

echo "🏗️  Building frontend..."
npm run build

echo "🌐 Deploying frontend to Cloudflare Pages..."
wrangler pages deploy dist --project-name attendance-system

echo ""
echo "🎉 Deployment Complete!"
echo "========================"
echo ""
echo "📝 Next Steps:"
echo "1. Update the API URL in src/api/index.js with your worker URL"
echo "2. Redeploy frontend if needed: wrangler pages deploy dist"
echo ""
echo "🔑 Default Login Credentials:"
echo "   Admin: admin / admin123"
echo "   Teacher: teacher / teacher123"
echo ""
echo "📖 Check README.md for detailed instructions"
echo ""
echo "🔗 Your app will be available at:"
echo "   https://attendance-system.pages.dev (or similar)" 