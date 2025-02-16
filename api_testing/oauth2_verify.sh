#!/bin/bash

# Check OAuth2 key files
echo "Checking OAuth2 key files..."
ls -la /bitnami/suitecrm/public/legacy/Api/V8/OAuth2/

# Check encryption key in config
echo "Checking if oauth2_encryption_key exists in config..."
grep "oauth2_encryption_key" /bitnami/suitecrm/public/config.php

# Check API endpoint accessibility
echo "Testing API endpoint..."
curl -I http://localhost:8080/Api/V8/meta/now

# Check OAuth2 client configuration
echo "Checking OAuth2 clients table..."
mysql -u root suitecrm -e "SELECT * FROM oauth2_clients;"