#!/bin/bash

# Step 1: Generate OAuth2 keys
echo "Step 1: Generating OAuth2 keys..."
cd /bitnami/suitecrm/public/legacy/Api/V8/OAuth2
openssl genrsa -out private.key 2048
openssl rsa -in private.key -pubout -out public.key

# Set proper permissions
chmod 600 private.key public.key
chown www-data:www-data private.key public.key

# Step 2: Generate OAuth2 encryption key
echo "Step 2: Generating encryption key..."
ENCRYPTION_KEY=$(php -r 'echo base64_encode(random_bytes(32)), PHP_EOL;')
echo "Generated encryption key: $ENCRYPTION_KEY"
echo "Add this to your config.php as 'oauth2_encryption_key'"

# Step 3: Create OAuth2 client (must be run from SuiteCRM root)
echo "Step 3: Instructions for creating OAuth2 client..."
echo "1. Log into SuiteCRM admin panel"
echo "2. Navigate to Admin > OAuth2 Clients"
echo "3. Click 'Create OAuth2 Client'"
echo "4. Note down the generated Client ID and Client Secret"

# Step 4: Verify API endpoint access
echo "Step 4: Testing API endpoint access..."
echo "After setting up the client, test the endpoint with:"
echo "curl -X POST http://your-suitecrm-url/Api/V8/oauth2/token \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Accept: application/vnd.api+json' \\"
echo "  -d '{\"grant_type\":\"client_credentials\",\"client_id\":\"YOUR_CLIENT_ID\",\"client_secret\":\"YOUR_CLIENT_SECRET\"}'"