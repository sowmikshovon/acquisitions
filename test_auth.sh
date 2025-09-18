#!/bin/bash

BASE_URL="http://localhost:3000"
USER_AGENT="Mozilla/5.0 (Testing Script)"

echo "🧪 Testing Authentication Workflow"
echo "=================================="

# Test 1: Sign up
echo
echo "1️⃣  Testing Sign-up..."
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/sign-up" \
  -H "Content-Type: application/json" \
  -H "User-Agent: $USER_AGENT" \
  -c cookies_test.txt \
  -d '{
    "name": "API Test User",
    "email": "apitest@example.com", 
    "password": "apitest123",
    "role": "user"
  }')

echo "Sign-up Response: $SIGNUP_RESPONSE"

# Wait to avoid rate limiting
echo "⏳ Waiting 5 seconds to avoid rate limiting..."
sleep 5

# Test 2: Sign in with the new route
echo
echo "2️⃣  Testing Sign-in at /api/sign-in..."
SIGNIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/sign-in" \
  -H "Content-Type: application/json" \
  -H "User-Agent: $USER_AGENT" \
  -c cookies_test.txt \
  -d '{
    "email": "apitest@example.com",
    "password": "apitest123"
  }')

echo "Sign-in Response: $SIGNIN_RESPONSE"

# Wait to avoid rate limiting  
echo "⏳ Waiting 5 seconds to avoid rate limiting..."
sleep 5

# Test 3: Access protected route
echo
echo "3️⃣  Testing Protected Route (GET /api/users)..."
USERS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/users" \
  -H "User-Agent: $USER_AGENT" \
  -b cookies_test.txt)

echo "Users Response: $USERS_RESPONSE"

# Cleanup
rm -f cookies_test.txt

echo
echo "✅ Test completed!"