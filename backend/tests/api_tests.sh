#!/bin/bash

# A simple API test script for the SmartCV backend.

# --- Configuration ---
BASE_URL="http://localhost:3000/api/v1"
TEST_EMAIL="testuser_$(date +%s)@example.com"
TEST_USERNAME="testuser_$(date +%s)"
TEST_PASSWORD="Password123!"
# A dummy Gemini API key for testing purposes. It won't be validated by this script,
# but the endpoint requires it to be present.
TEST_GEMINI_KEY="dummy_gemini_api_key_for_testing"

ACCESS_TOKEN=""
REFRESH_TOKEN=""
DOCUMENT_ID=""

# --- Helper Functions ---
function print_header {
    echo ""
    echo "--- $1 ---"
}

function print_result {
    echo "Response:"
    echo "$1"
    echo ""
}

# Simple JSON value extractor using grep and sed to avoid jq dependency.
# It's not a full JSON parser but works for the simple keys we need.
function get_json_value {
    local json="$1"
    local key="$2"
    # Extracts a value (string or number) for a given key from a JSON string.
    # Works by finding the key, then grabbing everything until the next comma or brace.
    # It's fragile but sufficient for this script's purpose.
    local value_part=$(echo "$json" | grep -o "\"$key\":[^,}]*")
    local value=$(echo "$value_part" | sed -e 's/.*://' -e 's/"//g' -e 's/ //g')
    echo "$value"
}


# --- Tests ---

# 1. Register a new user
print_header "Test 1: Register a new user"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "'$TEST_EMAIL'",
        "username": "'$TEST_USERNAME'",
        "password": "'$TEST_PASSWORD'",
        "password_confirm": "'$TEST_PASSWORD'"
    }')
print_result "$RESPONSE"
# Save tokens for later
ACCESS_TOKEN=$(get_json_value "$RESPONSE" "access_token")
REFRESH_TOKEN=$(get_json_value "$RESPONSE" "refresh_token")


# 2. Fail to register with a duplicate email
print_header "Test 2: Fail to register with a duplicate email"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "'$TEST_EMAIL'",
        "username": "anotheruser",
        "password": "'$TEST_PASSWORD'",
        "password_confirm": "'$TEST_PASSWORD'"
    }')
print_result "$RESPONSE"


# 3. Log in with the new user
print_header "Test 3: Log in with the new user"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "'$TEST_EMAIL'",
        "password": "'$TEST_PASSWORD'"
    }')
print_result "$LOGIN_RESPONSE"
ACCESS_TOKEN=$(get_json_value "$LOGIN_RESPONSE" "access_token") # Update token


# 4. Fail to log in with incorrect password
print_header "Test 4: Fail to log in with incorrect password"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "'$TEST_EMAIL'",
        "password": "WrongPassword!"
    }')
print_result "$RESPONSE"


# 5. Refresh access token
print_header "Test 5: Refresh access token"
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
    -H "Content-Type: application/json" \
    -d '{
        "refresh_token": "'$REFRESH_TOKEN'"
    }')
print_result "$REFRESH_RESPONSE"
ACCESS_TOKEN=$(get_json_value "$REFRESH_RESPONSE" "access_token") # Update token


# 6. Get current user profile
print_header "Test 6: Get current user profile"
RESPONSE=$(curl -s -X GET "$BASE_URL/users/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
print_result "$RESPONSE"


# 7. Update user profile
print_header "Test 7: Update user profile"
NEW_USERNAME="updated_${TEST_USERNAME}"
RESPONSE=$(curl -s -X PUT "$BASE_URL/users/me" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{
        "username": "'$NEW_USERNAME'"
    }')
print_result "$RESPONSE"


# 8. Set Gemini API Key
print_header "Test 8: Set Gemini API Key"
# Note: The response is 204 No Content on success
RESPONSE=$(curl -s -w "\nHTTP_STATUS_CODE:%{http_code}" -X POST "$BASE_URL/users/me/gemini-api-key" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{
        "api_key": "'$TEST_GEMINI_KEY'"
    }')
print_result "$RESPONSE"


# 9. Create a new document
print_header "Test 9: Create a new CV document"
# This test depends on having a Gemini Key set (Test 8)
DOC_RESPONSE=$(curl -s -X POST "$BASE_URL/documents" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{
        "doc_type": "cv",
        "title": "My First CV",
        "template_code": "default",
        "user_data": {
            "personal_info": { "full_name": "Test User" },
            "summary": "A dedicated and professional test user."
        }
    }')
print_result "$DOC_RESPONSE"
DOCUMENT_ID=$(get_json_value "$DOC_RESPONSE" "id")


# 10. Get user's documents
print_header "Test 10: Get user's documents"
RESPONSE=$(curl -s -X GET "$BASE_URL/documents" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
print_result "$RESPONSE"


# 11. Get a specific document
if [ -z "$DOCUMENT_ID" ] || [ "$DOCUMENT_ID" == "null" ]; then
    print_header "Test 11: SKIPPED - Get specific document (no DOCUMENT_ID from previous test)"
else
    print_header "Test 11: Get the created document by ID"
    RESPONSE=$(curl -s -X GET "$BASE_URL/documents/$DOCUMENT_ID" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    print_result "$RESPONSE"
fi


# 12. Delete a document
if [ -z "$DOCUMENT_ID" ] || [ "$DOCUMENT_ID" == "null" ]; then
    print_header "Test 12: SKIPPED - Delete document (no DOCUMENT_ID from previous test)"
else
    print_header "Test 12: Delete the created document"
    # Note: The response is 204 No Content on success
    RESPONSE=$(curl -s -w "\nHTTP_STATUS_CODE:%{http_code}" -X DELETE "$BASE_URL/documents/$DOCUMENT_ID" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    print_result "$RESPONSE"
fi


# 13. Delete Gemini API Key
print_header "Test 13: Delete Gemini API Key"
# Note: The response is 204 No Content on success
RESPONSE=$(curl -s -w "\nHTTP_STATUS_CODE:%{http_code}" -X DELETE "$BASE_URL/users/me/gemini-api-key" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
print_result "$RESPONSE"

echo "--- All tests finished ---"
