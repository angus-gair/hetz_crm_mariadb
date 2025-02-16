#!/bin/bash

# Step 1: Test basic connectivity
echo "Testing basic connectivity..."
curl -I "${SUITECRM_URL}"

# Step 2: Check API module configuration
echo -e "\nChecking API module configuration..."
ls -la /bitnami/suitecrm/public/legacy/Api/V8/

# Step 3: Verify API .htaccess
echo -e "\nChecking API .htaccess configuration..."
cat /bitnami/suitecrm/public/legacy/Api/.htaccess

# Step 4: Check API routing in Apache
echo -e "\nChecking Apache configuration..."
apache2ctl -S

# Step 5: Test specific API endpoints
echo -e "\nTesting API endpoints..."
curl -I "${SUITECRM_URL}/Api/V8/meta/now"
curl -I "${SUITECRM_URL}/Api/V8/oauth2/token"

# Step 6: Check API logs
echo -e "\nChecking recent API related logs..."
tail -n 50 /opt/bitnami/apache/logs/error_log | grep -i "api"
