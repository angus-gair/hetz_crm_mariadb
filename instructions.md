Below is a concise, step‑by‑step guide to resolve the **"Invalid key supplied"** fatal error related to the OAuth2/CryptKey in SuiteCRM. Essentially, SuiteCRM 8 (and SuiteCRM 7.x with the new OAuth2 engine) requires valid RSA keys for its V8 API endpoints. If these keys are missing, not readable, or incorrectly configured, you will get the *Invalid key supplied* error from `League\OAuth2\Server\CryptKey`.

* * *

## 1. Verify or Create Your RSA Private and Public Keys

SuiteCRM’s V8 API expects private and public keys in the correct location with correct permissions. If you do not already have valid RSA keys, create them as follows:

### 1.1 SSH into Your Server

```bash
ssh youruser@yourserver.com
```

### 1.2 Change to SuiteCRM Directory

```bash
cd /bitnami/suitecrm
```

*The exact path can differ depending on your setup (e.g., `/opt/bitnami/suitecrm` or another directory).*

### 1.3 Generate the Private Key

Create an **unencrypted** private key so that the application can read it without prompting for a passphrase. For a 2048‑bit RSA key:

```bash
openssl genrsa -out private.key 2048
```

(If you prefer a stronger key, you can use `4096` instead of `2048`.)

### 1.4 Generate the Public Key

Extract the public key from the newly created private key:

```bash
openssl rsa -in private.key -pubout -out public.key
```

You should now have:

```bash
private.key
public.key
```

in the current directory.

* * *

## 2. Move Keys to the SuiteCRM OAuth2 Folder

By default, SuiteCRM typically looks for keys in:

```bash
public/legacy/Api/V8/OAuth2/
```

(You may see references to `/Api/V8/OAuth2/private.key` or a similar path.)

Move or copy your newly generated keys:

```bash
mv private.key public.key /bitnami/suitecrm/public/legacy/Api/V8/OAuth2/
```

Confirm that your final structure looks like this (or similar):

```bash
/bitnami/suitecrm/public/legacy/Api/V8/OAuth2/private.key
/bitnami/suitecrm/public/legacy/Api/V8/OAuth2/public.key
```

* * *

## 3. Set Correct File Permissions

The web server needs to read the keys. The exact user depends on your setup:
- For Apache: Usually `www-data` or `apache`
- For Nginx: Usually `nginx` or `www-data`
- For Docker/Bitnami: Check your container's web server user with `ps aux | grep apache` or `nginx`

Ensure the web server (often the `bitnami`, `www-data`, or `apache` user) can read the keys. For simplicity, do:

```bash
cd /bitnami/suitecrm/public/legacy/Api/V8/OAuth2/
sudo chown bitnami:bitnami private.key public.key
sudo chmod 640 private.key
sudo chmod 640 public.key
```

- `chown bitnami:bitnami`: Adjust to the correct user/group for your server.
- `chmod 640`: Owner can read/write, group can read, others have no access.

* * *

## 4. Verify SuiteCRM Configuration

Depending on the SuiteCRM 8 deployment, you might have environment variables or config in `config_override.php` or `.env` that specify these key paths. Typically, you will see something like:

```php
// config_override.php
$suite_config['api']['oauth2']['privateKey'] = '/bitnami/suitecrm/public/legacy/Api/V8/OAuth2/private.key';
$suite_config['api']['oauth2']['publicKey'] = '/bitnami/suitecrm/public/legacy/Api/V8/OAuth2/public.key';
```

or inside your `.env`:

```env
OAUTH2_PRIVATE_KEY=/bitnami/suitecrm/public/legacy/Api/V8/OAuth2/private.key
OAUTH2_PUBLIC_KEY=/bitnami/suitecrm/public/legacy/Api/V8/OAuth2/public.key
```

Make sure these paths match exactly where your keys are stored. If they are missing entirely, add them.

* * *

## 5. Clear/Reset Caches

In SuiteCRM 8 or 7.x (with the new OAuth2 engine), it’s often helpful to do a quick cache reset or run the “Quick Repair and Rebuild” from the Admin panel. You can also manually remove or rename the cache directory. Typical steps:

1. **From the Admin Panel**: Choose **Repair** → **Quick Repair and Rebuild**.
2. Optionally, ensure file permissions are correct.
3. If you continue to see issues, remove or rename the `cache` directory temporarily (SuiteCRM will rebuild it).

* * *

## 6. Test Access to the V8 API

Once the keys are properly placed and recognized, the **Invalid key supplied** error in the logs should disappear. You can test with:

- Navigating to `<your-CRM-URL>/legacy/Api/access_token` or
- Using an OAuth2 client (Postman or cURL) to request a token from the V8 endpoint.

If the keys are correct, you should no longer see the `PHP Fatal error: Uncaught LogicException: Invalid key supplied` in the logs.

* * *

## 7. (Optional) Address the Smarty Deprecation Warnings

You may have also seen lines like:

> 
> **PHP Deprecated: Using unregistered function "strval" in a template is deprecated…**

This will not break SuiteCRM but is a deprecation notice from Smarty in SuiteCRM 8 or from a future PHP version. If it is bothersome, you can:

1. **Register the function** in a custom Smarty plugin file, or
2. **Remove** the direct usage of `strval`, `is_string`, etc., from any custom `.tpl` file.

But this is not critical for the OAuth2 key issue. It’s merely a warning that in future releases, Smarty might strictly enforce plugin registration for PHP functions.

* * *

# Summary

1. **Create** or locate valid RSA keys (unencrypted).
2. **Place** them in `public/legacy/Api/V8/OAuth2/` (or your SuiteCRM OAuth2 folder).
3. **Adjust** file ownership/permissions.
4. **Confirm** the SuiteCRM config points to the correct private/public key paths.
5. **Rebuild** the SuiteCRM cache and test.

After these steps, the *“Invalid key supplied”* fatal errors in `CryptKey.php` should be resolved, and you will be able to use SuiteCRM’s OAuth2 endpoints without crashing.