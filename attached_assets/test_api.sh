#!/bin/bash

# Configuration
BASE_URL="https://157.180.44.137"
CLIENT_ID="b61a3ede-0d51-ebe4-f0d1-67e261f5692e"
CLIENT_SECRET="Jamfinnarc1776!"
USERNAME="admin"
PASSWORD="Admin123"
SESSION_ID="oo5j9pb7qbt880eoq1ejp3q1rl"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to print section headers
print_header() {
    echo -e "\n${GREEN}=== $1 ===${NC}"
}

# Function to check command result
check_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Success${NC}"
    else
        echo -e "${RED}✗ Failed${NC}"
    fi
}

# Test 1: Authentication
print_header "Test 1: Authentication"
TOKEN_RESPONSE=$(curl -k -s -X POST "${BASE_URL}/legacy/Api/access_token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -H "Cookie: SCRMSESSID=${SESSION_ID}" \
    -d "grant_type=password" \
    -d "client_id=${CLIENT_ID}" \
    -d "client_secret=${CLIENT_SECRET}" \
    -d "username=${USERNAME}" \
    -d "password=${PASSWORD}")

echo "Response: $TOKEN_RESPONSE"
ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
check_result

# Test 2: List Available Modules
print_header "Test 2: List Available Modules"
MODULE_RESPONSE=$(curl -k -s -X GET "${BASE_URL}/legacy/Api/V8/meta/modules" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -H "Cookie: SCRMSESSID=${SESSION_ID}")

echo "Response: $MODULE_RESPONSE"
check_result

# Test 3: Create Contact
print_header "Test 3: Create Contact"
CONTACT_DATA='{
  "data": {
    "type": "Contact",
    "attributes": {
      "first_name": "Jane",
      "last_name": "Smith",
      "email1": "jane.smith@example.com",
      "title": "CEO",
      "phone_work": "123-456-7890"
    }
  }
}'

CREATE_CONTACT_RESPONSE=$(curl -k -s -X POST "${BASE_URL}/legacy/Api/V8/module" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Cookie: SCRMSESSID=${SESSION_ID}" \
    -d "${CONTACT_DATA}")

echo "Response: $CREATE_CONTACT_RESPONSE"
CONTACT_ID=$(echo $CREATE_CONTACT_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
check_result

# Test 4: Update Contact
print_header "Test 4: Update Contact"
UPDATE_DATA='{
  "data": {
    "type": "Contact",
    "id": "'${CONTACT_ID}'",
    "attributes": {
      "description": "Updated contact information",
      "phone_mobile": "987-654-3210"
    }
  }
}'

UPDATE_RESPONSE=$(curl -k -s -X PUT "${BASE_URL}/legacy/Api/V8/module" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Cookie: SCRMSESSID=${SESSION_ID}" \
    -d "${UPDATE_DATA}")

echo "Response: $UPDATE_RESPONSE"
check_result

# Test 5: Search Contacts
print_header "Test 5: Search Contacts"
SEARCH_DATA='{
  "data": {
    "type": "Contact",
    "attributes": {
      "first_name": "Jane"
    }
  }
}'

SEARCH_RESPONSE=$(curl -k -s -X GET "${BASE_URL}/legacy/Api/V8/module/Contacts" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Cookie: SCRMSESSID=${SESSION_ID}")

echo "Response: $SEARCH_RESPONSE"
check_result

# Test 6: Get Contact Relationships
print_header "Test 6: Get Contact Relationships"
RELATIONSHIPS_RESPONSE=$(curl -k -s -X GET "${BASE_URL}/legacy/Api/V8/module/Contacts/${CONTACT_ID}/relationships" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Cookie: SCRMSESSID=${SESSION_ID}")

echo "Response: $RELATIONSHIPS_RESPONSE"
check_result

# Test 7: Delete Contact
print_header "Test 7: Delete Contact"
DELETE_DATA='{
  "data": {
    "type": "Contact",
    "id": "'${CONTACT_ID}'"
  }
}'

DELETE_RESPONSE=$(curl -k -s -X POST "${BASE_URL}/legacy/Api/V8/module/Contacts/${CONTACT_ID}/delete" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Cookie: SCRMSESSID=${SESSION_ID}" \
    -d "${DELETE_DATA}")

echo "Response: $DELETE_RESPONSE"
check_result

# Test 8: Create Lead
print_header "Test 8: Create Lead"
LEAD_DATA='{
  "data": {
    "type": "Lead",
    "attributes": {
      "first_name": "John",
      "last_name": "Doe",
      "email1": "john.doe@example.com",
      "title": "Sales Manager",
      "phone_work": "555-123-4567",
      "account_name": "Acme Corporation",
      "lead_source": "Web Site",
      "status": "New",
      "description": "Interested in our enterprise solution",
      "primary_address_street": "123 Business Ave",
      "primary_address_city": "San Francisco",
      "primary_address_state": "CA",
      "primary_address_postalcode": "94105",
      "primary_address_country": "USA"
    }
  }
}'

CREATE_LEAD_RESPONSE=$(curl -k -s -X POST "${BASE_URL}/legacy/Api/V8/module" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Cookie: SCRMSESSID=${SESSION_ID}" \
    -d "${LEAD_DATA}")

echo "Response: $CREATE_LEAD_RESPONSE"
LEAD_ID=$(echo $CREATE_LEAD_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
check_result

echo -e "\n${GREEN}All tests completed!${NC}" 