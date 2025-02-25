<?php
/**
 * Fix #1: Update the core file includes in api-proxy.php
 */

// CHANGE FROM:
require_once(__DIR__ . '/core/database.php');
require_once(__DIR__ . '/core/auth.php');
require_once(__DIR__ . '/core/response.php');
require_once(__DIR__ . '/utils/validation.php');

// CHANGE TO:
require_once(__DIR__ . '/core/database-file.php');
require_once(__DIR__ . '/core/auth-file.php');
require_once(__DIR__ . '/core/response-file.php');
require_once(__DIR__ . '/utils/validation-file.php');


/**
 * Fix #2: Update the module routing in api-proxy.php switch statement
 */

// CHANGE FROM:
case 'contacts':
    require_once(__DIR__ . '/modules/contacts/routes.php');
    $handler = new ContactsRoutes($db, $config);
    break;

case 'meetings':
    require_once(__DIR__ . '/modules/meetings/routes.php');
    $handler = new MeetingsRoutes($db, $config);
    break;

// CHANGE TO:
case 'contacts':
    require_once(__DIR__ . '/modules/contacts/contacts-routes.php');
    $handler = new ContactsRoutes($db, $config);
    break;

case 'meetings':
    require_once(__DIR__ . '/modules/meetings/meetings-routes.php');
    $handler = new MeetingsRoutes($db, $config);
    break;


/**
 * Fix #3: Update module file includes in contacts-routes.php
 */

// CHANGE FROM:
require_once(__DIR__ . '/create.php');
require_once(__DIR__ . '/search.php');

// CHANGE TO:
require_once(__DIR__ . '/contact-create.php');
require_once(__DIR__ . '/contact-search.php');


/**
 * Fix #4: Update module file includes in meetings-routes.php
 */

// CHANGE FROM:
require_once(__DIR__ . '/available.php');
require_once(__DIR__ . '/book.php');

// CHANGE TO:
require_once(__DIR__ . '/meetings-available.php');
require_once(__DIR__ . '/meetings-book.php');


/**
 * Fix #5: Update any utility file includes
 */

// CHANGE FROM (if exists):
require_once(__DIR__ . '/utils/logger.php');
require_once(__DIR__ . '/utils/formatter.php');
require_once(__DIR__ . '/utils/error.php');

// CHANGE TO:
require_once(__DIR__ . '/utils/logger-utility.php');
require_once(__DIR__ . '/utils/formatter-utility.php');
require_once(__DIR__ . '/utils/error-utility.php');
