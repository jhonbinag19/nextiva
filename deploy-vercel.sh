#!/bin/bash

# Vercel Deployment Script
# This script helps deploy the latest changes to Vercel

echo "🚀 Vercel Deployment Script"
echo "=========================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📋 Deployment Steps:"
echo "1. Deploy current code to Vercel"
echo "2. Update the deployment with latest changes"
echo "3. Test the smart authentication system"
echo ""

# Prompt for confirmation
echo "⚠️  This will deploy the current code to Vercel."
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Deploying to Vercel..."
    
    # Deploy to Vercel
    vercel --prod
    
    echo "✅ Deployment completed!"
    echo ""
    echo "🧪 Next Steps:"
    echo "1. Run: node test-vercel-auth.js"
    echo "2. Test with cURL commands from VERCEL_TESTING_GUIDE.md"
    echo "3. Use Postman collection for comprehensive testing"
    echo ""
    echo "📖 For detailed testing instructions, see: VERCEL_TESTING_GUIDE.md"
else
    echo "❌ Deployment cancelled."
fi