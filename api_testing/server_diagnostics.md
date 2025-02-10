# Check PHP error logs
tail -f /opt/bitnami/php/logs/error.log

"""root@5dd383ab50bd:/# tail -f /opt/bitnami/php/logs/error.log
tail: cannot open '/opt/bitnami/php/logs/error.log' for reading: No such file or directory
tail: no files remaining"""


# Check Apache error logs
tail -f /opt/bitnami/apache/logs/error_log
"""root@5dd383ab50bd:/# tail -f /opt/bitnami/apache/logs/error_log
^C"""  -- hanging

# LOGS FROM VM
"""142.93.166.65 - - [10/Feb/2025:15:50:16 +0000] "GET / HTTP/1.1" 200 2448
193.68.89.10 - - [10/Feb/2025:15:50:38 +0000] "GET / HTTP/1.1" 200 2448
119.18.2.76 - - [10/Feb/2025:15:50:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:15:50:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:15:51:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:15:51:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:15:52:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:15:52:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:15:53:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:15:53:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:15:54:42 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:15:54:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:15:55:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:15:56:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:15:56:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:15:57:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:15:57:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:15:58:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:15:58:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:15:59:42 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:15:59:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:00:42 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:00:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:01:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:01:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:02:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:02:47 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:02:52 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:03:42 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:04:34 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:04:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:05:42 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:05:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:06:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:06:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:07:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:07:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:08:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:08:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:09:24 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:10:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:11:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:11:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
[10-Feb-2025 16:12:30 UTC] PHP Fatal error:  Uncaught LogicException: Invalid key supplied in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php:67
Stack trace:
#0 /bitnami/suitecrm/public/legacy/Api/V8/Config/services/middlewares.php(48): League\OAuth2\Server\CryptKey->__construct()
#1 /bitnami/suitecrm/vendor/pimple/pimple/src/Pimple/Container.php(122): Api\Core\Resolver\ConfigResolver::{closure}()
#2 /bitnami/suitecrm/vendor/slim/slim/Slim/Container.php(109): Pimple\Container->offsetGet()
#3 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(17): Slim\Container->get()
#4 /bitnami/suitecrm/vendor/slim/slim/Slim/RouteGroup.php(25): Api\Core\Loader\RouteLoader->{closure}()
#5 /bitnami/suitecrm/vendor/slim/slim/Slim/App.php(272): Slim\RouteGroup->__invoke()
#6 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(132): Slim\App->group()
#7 /bitnami/suitecrm/public/legacy/Api/Core/Loader/RouteLoader.php(22): require('...')
#8 /bitnami/suitecrm/public/legacy/Api/Core/app.php(26): Api\Core\Loader\RouteLoader->configureRoutes()
#9 /bitnami/suitecrm/public/legacy/Api/index.php(11): require_once('...')
#10 /bitnami/suitecrm/vendor/autoload_runtime.php(67): require('...')
#11 /bitnami/suitecrm/public/index.php(5): require_once('...')
#12 {main}
  thrown in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php on line 67
34.75.152.217 - - [10/Feb/2025:16:12:30 +0000] "GET /Api/access/token HTTP/1.1" 500 -
[10-Feb-2025 16:12:31 UTC] PHP Fatal error:  Cannot declare class LanguageManager, because the name is already in use in /bitnami/suitecrm/public/legacy/include/SugarObjects/LanguageManager.php on line 50
34.75.152.217 - - [10/Feb/2025:16:12:31 +0000] "GET /service/v4_1/rest.php HTTP/1.1" 500 -
119.18.2.76 - - [10/Feb/2025:16:12:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:12:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:13:43 +0000] "-" 408 -
[10-Feb-2025 16:13:46 UTC] PHP Fatal error:  Uncaught LogicException: Invalid key supplied in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php:67
Stack trace:
#0 /bitnami/suitecrm/public/legacy/Api/V8/Config/services/middlewares.php(48): League\OAuth2\Server\CryptKey->__construct()
#1 /bitnami/suitecrm/vendor/pimple/pimple/src/Pimple/Container.php(122): Api\Core\Resolver\ConfigResolver::{closure}()
#2 /bitnami/suitecrm/vendor/slim/slim/Slim/Container.php(109): Pimple\Container->offsetGet()
#3 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(17): Slim\Container->get()
#4 /bitnami/suitecrm/vendor/slim/slim/Slim/RouteGroup.php(25): Api\Core\Loader\RouteLoader->{closure}()
#5 /bitnami/suitecrm/vendor/slim/slim/Slim/App.php(272): Slim\RouteGroup->__invoke()
#6 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(132): Slim\App->group()
#7 /bitnami/suitecrm/public/legacy/Api/Core/Loader/RouteLoader.php(22): require('...')
#8 /bitnami/suitecrm/public/legacy/Api/Core/app.php(26): Api\Core\Loader\RouteLoader->configureRoutes()
#9 /bitnami/suitecrm/public/legacy/Api/index.php(11): require_once('...')
#10 /bitnami/suitecrm/vendor/autoload_runtime.php(67): require('...')
#11 /bitnami/suitecrm/public/index.php(5): require_once('...')
#12 {main}
  thrown in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php on line 67
34.75.152.217 - - [10/Feb/2025:16:13:46 +0000] "POST /Api/V8/oauth2/token HTTP/1.1" 500 -
[10-Feb-2025 16:13:46 UTC] PHP Fatal error:  Cannot declare class LanguageManager, because the name is already in use in /bitnami/suitecrm/public/legacy/include/SugarObjects/LanguageManager.php on line 50
34.75.152.217 - - [10/Feb/2025:16:13:46 +0000] "POST /service/v4_1/rest.php HTTP/1.1" 500 -
[10-Feb-2025 16:13:46 UTC] PHP Fatal error:  Uncaught LogicException: Invalid key supplied in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php:67
Stack trace:
#0 /bitnami/suitecrm/public/legacy/Api/V8/Config/services/middlewares.php(48): League\OAuth2\Server\CryptKey->__construct()
#1 /bitnami/suitecrm/vendor/pimple/pimple/src/Pimple/Container.php(122): Api\Core\Resolver\ConfigResolver::{closure}()
#2 /bitnami/suitecrm/vendor/slim/slim/Slim/Container.php(109): Pimple\Container->offsetGet()
#3 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(17): Slim\Container->get()
#4 /bitnami/suitecrm/vendor/slim/slim/Slim/RouteGroup.php(25): Api\Core\Loader\RouteLoader->{closure}()
#5 /bitnami/suitecrm/vendor/slim/slim/Slim/App.php(272): Slim\RouteGroup->__invoke()
#6 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(132): Slim\App->group()
#7 /bitnami/suitecrm/public/legacy/Api/Core/Loader/RouteLoader.php(22): require('...')
#8 /bitnami/suitecrm/public/legacy/Api/Core/app.php(26): Api\Core\Loader\RouteLoader->configureRoutes()
#9 /bitnami/suitecrm/public/legacy/Api/index.php(11): require_once('...')
#10 /bitnami/suitecrm/vendor/autoload_runtime.php(67): require('...')
#11 /bitnami/suitecrm/public/index.php(5): require_once('...')
#12 {main}
  thrown in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php on line 67
34.75.152.217 - - [10/Feb/2025:16:13:46 +0000] "GET /Api/access/token HTTP/1.1" 500 -
119.18.2.76 - - [10/Feb/2025:16:13:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:14:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:14:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
[10-Feb-2025 16:15:06 UTC] PHP Fatal error:  Uncaught LogicException: Invalid key supplied in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php:67
Stack trace:
#0 /bitnami/suitecrm/public/legacy/Api/V8/Config/services/middlewares.php(48): League\OAuth2\Server\CryptKey->__construct()
#1 /bitnami/suitecrm/vendor/pimple/pimple/src/Pimple/Container.php(122): Api\Core\Resolver\ConfigResolver::{closure}()
#2 /bitnami/suitecrm/vendor/slim/slim/Slim/Container.php(109): Pimple\Container->offsetGet()
#3 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(17): Slim\Container->get()
#4 /bitnami/suitecrm/vendor/slim/slim/Slim/RouteGroup.php(25): Api\Core\Loader\RouteLoader->{closure}()
#5 /bitnami/suitecrm/vendor/slim/slim/Slim/App.php(272): Slim\RouteGroup->__invoke()
#6 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(132): Slim\App->group()
#7 /bitnami/suitecrm/public/legacy/Api/Core/Loader/RouteLoader.php(22): require('...')
#8 /bitnami/suitecrm/public/legacy/Api/Core/app.php(26): Api\Core\Loader\RouteLoader->configureRoutes()
#9 /bitnami/suitecrm/public/legacy/Api/index.php(11): require_once('...')
#10 /bitnami/suitecrm/vendor/autoload_runtime.php(67): require('...')
#11 /bitnami/suitecrm/public/index.php(5): require_once('...')
#12 {main}
  thrown in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php on line 67
34.75.152.217 - - [10/Feb/2025:16:15:06 +0000] "GET /Api/access/token HTTP/1.1" 500 -
[10-Feb-2025 16:15:06 UTC] PHP Fatal error:  Cannot declare class LanguageManager, because the name is already in use in /bitnami/suitecrm/public/legacy/include/SugarObjects/LanguageManager.php on line 50
34.75.152.217 - - [10/Feb/2025:16:15:06 +0000] "POST /service/v4_1/rest.php HTTP/1.1" 500 -
[10-Feb-2025 16:15:06 UTC] PHP Fatal error:  Uncaught LogicException: Invalid key supplied in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php:67
Stack trace:
#0 /bitnami/suitecrm/public/legacy/Api/V8/Config/services/middlewares.php(48): League\OAuth2\Server\CryptKey->__construct()
#1 /bitnami/suitecrm/vendor/pimple/pimple/src/Pimple/Container.php(122): Api\Core\Resolver\ConfigResolver::{closure}()
#2 /bitnami/suitecrm/vendor/slim/slim/Slim/Container.php(109): Pimple\Container->offsetGet()
#3 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(17): Slim\Container->get()
#4 /bitnami/suitecrm/vendor/slim/slim/Slim/RouteGroup.php(25): Api\Core\Loader\RouteLoader->{closure}()
#5 /bitnami/suitecrm/vendor/slim/slim/Slim/App.php(272): Slim\RouteGroup->__invoke()
#6 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(132): Slim\App->group()
#7 /bitnami/suitecrm/public/legacy/Api/Core/Loader/RouteLoader.php(22): require('...')
#8 /bitnami/suitecrm/public/legacy/Api/Core/app.php(26): Api\Core\Loader\RouteLoader->configureRoutes()
#9 /bitnami/suitecrm/public/legacy/Api/index.php(11): require_once('...')
#10 /bitnami/suitecrm/vendor/autoload_runtime.php(67): require('...')
#11 /bitnami/suitecrm/public/index.php(5): require_once('...')
#12 {main}
  thrown in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php on line 67
34.75.152.217 - - [10/Feb/2025:16:15:06 +0000] "POST /Api/V8/oauth2/token HTTP/1.1" 500 -
34.75.152.217 - - [10/Feb/2025:16:15:06 +0000] "GET /about HTTP/1.1" 404 -
34.75.152.217 - - [10/Feb/2025:16:15:06 +0000] "GET /rest/v10/ping HTTP/1.1" 404 -
[10-Feb-2025 16:15:06 UTC] PHP Fatal error:  Cannot declare class LanguageManager, because the name is already in use in /bitnami/suitecrm/public/legacy/include/SugarObjects/LanguageManager.php on line 50
34.75.152.217 - - [10/Feb/2025:16:15:06 +0000] "POST /service/v4_1/rest.php HTTP/1.1" 500 -
119.18.2.76 - - [10/Feb/2025:16:15:42 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:15:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:16:01 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:16:46 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:17:38 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:17:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:18:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:18:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
34.75.152.217 - admin [10/Feb/2025:16:19:36 +0000] "GET /legacy/index.php HTTP/1.1" 301 -
34.75.152.217 - admin [10/Feb/2025:16:19:36 +0000] "GET /about HTTP/1.1" 404 -
[10-Feb-2025 16:19:37 UTC] PHP Fatal error:  Uncaught LogicException: Invalid key supplied in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php:67
Stack trace:
#0 /bitnami/suitecrm/public/legacy/Api/V8/Config/services/middlewares.php(48): League\OAuth2\Server\CryptKey->__construct()
#1 /bitnami/suitecrm/vendor/pimple/pimple/src/Pimple/Container.php(122): Api\Core\Resolver\ConfigResolver::{closure}()
#2 /bitnami/suitecrm/vendor/slim/slim/Slim/Container.php(109): Pimple\Container->offsetGet()
#3 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(17): Slim\Container->get()
#4 /bitnami/suitecrm/vendor/slim/slim/Slim/RouteGroup.php(25): Api\Core\Loader\RouteLoader->{closure}()
#5 /bitnami/suitecrm/vendor/slim/slim/Slim/App.php(272): Slim\RouteGroup->__invoke()
#6 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(132): Slim\App->group()
#7 /bitnami/suitecrm/public/legacy/Api/Core/Loader/RouteLoader.php(22): require('...')
#8 /bitnami/suitecrm/public/legacy/Api/Core/app.php(26): Api\Core\Loader\RouteLoader->configureRoutes()
#9 /bitnami/suitecrm/public/legacy/Api/index.php(11): require_once('...')
#10 /bitnami/suitecrm/vendor/autoload_runtime.php(67): require('...')
#11 /bitnami/suitecrm/public/index.php(5): require_once('...')
#12 {main}
  thrown in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php on line 67
34.75.152.217 - admin [10/Feb/2025:16:19:36 +0000] "POST /Api/V8/oauth2/token HTTP/1.1" 500 -
[10-Feb-2025 16:19:37 UTC] PHP Fatal error:  Cannot declare class LanguageManager, because the name is already in use in /bitnami/suitecrm/public/legacy/include/SugarObjects/LanguageManager.php on line 50
34.75.152.217 - admin [10/Feb/2025:16:19:36 +0000] "POST /service/v4_1/rest.php HTTP/1.1" 500 -
[10-Feb-2025 16:19:37 UTC] PHP Fatal error:  Uncaught LogicException: Invalid key supplied in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php:67
Stack trace:
#0 /bitnami/suitecrm/public/legacy/Api/V8/Config/services/middlewares.php(48): League\OAuth2\Server\CryptKey->__construct()
#1 /bitnami/suitecrm/vendor/pimple/pimple/src/Pimple/Container.php(122): Api\Core\Resolver\ConfigResolver::{closure}()
#2 /bitnami/suitecrm/vendor/slim/slim/Slim/Container.php(109): Pimple\Container->offsetGet()
#3 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(17): Slim\Container->get()
#4 /bitnami/suitecrm/vendor/slim/slim/Slim/RouteGroup.php(25): Api\Core\Loader\RouteLoader->{closure}()
#5 /bitnami/suitecrm/vendor/slim/slim/Slim/App.php(272): Slim\RouteGroup->__invoke()
#6 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(132): Slim\App->group()
#7 /bitnami/suitecrm/public/legacy/Api/Core/Loader/RouteLoader.php(22): require('...')
#8 /bitnami/suitecrm/public/legacy/Api/Core/app.php(26): Api\Core\Loader\RouteLoader->configureRoutes()
#9 /bitnami/suitecrm/public/legacy/Api/index.php(11): require_once('...')
#10 /bitnami/suitecrm/vendor/autoload_runtime.php(67): require('...')
#11 /bitnami/suitecrm/public/index.php(5): require_once('...')
#12 {main}
  thrown in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php on line 67
34.75.152.217 - admin [10/Feb/2025:16:19:36 +0000] "GET /Api/access/token HTTP/1.1" 500 -
34.75.152.217 - admin [10/Feb/2025:16:19:36 +0000] "HEAD / HTTP/1.1" 200 -
[10-Feb-2025 16:19:37 UTC] PHP Fatal error:  Cannot declare class LanguageManager, because the name is already in use in /bitnami/suitecrm/public/legacy/include/SugarObjects/LanguageManager.php on line 50
[10-Feb-2025 16:19:37 UTC] PHP Fatal error:  Uncaught LogicException: Invalid key supplied in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php:67
Stack trace:
#0 /bitnami/suitecrm/public/legacy/Api/V8/Config/services/middlewares.php(48): League\OAuth2\Server\CryptKey->__construct()
#1 /bitnami/suitecrm/vendor/pimple/pimple/src/Pimple/Container.php(122): Api\Core\Resolver\ConfigResolver::{closure}()
#2 /bitnami/suitecrm/vendor/slim/slim/Slim/Container.php(109): Pimple\Container->offsetGet()
#3 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(17): Slim\Container->get()
#4 /bitnami/suitecrm/vendor/slim/slim/Slim/RouteGroup.php(25): Api\Core\Loader\RouteLoader->{closure}()
#5 /bitnami/suitecrm/vendor/slim/slim/Slim/App.php(272): Slim\RouteGroup->__invoke()
#6 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(132): Slim\App->group()
#7 /bitnami/suitecrm/public/legacy/Api/Core/Loader/RouteLoader.php(22): require('...')
#8 /bitnami/suitecrm/public/legacy/Api/Core/app.php(26): Api\Core\Loader\RouteLoader->configureRoutes()
#9 /bitnami/suitecrm/public/legacy/Api/index.php(11): require_once('...')
#10 /bitnami/suitecrm/vendor/autoload_runtime.php(67): require('...')
#11 /bitnami/suitecrm/public/index.php(5): require_once('...')
#12 {main}
  thrown in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php on line 67
34.75.152.217 - admin [10/Feb/2025:16:19:36 +0000] "OPTIONS /Api/access/token HTTP/1.1" 500 -
34.75.152.217 - admin [10/Feb/2025:16:19:36 +0000] "POST /service/v4_1/rest.php HTTP/1.1" 500 -
34.75.152.217 - admin [10/Feb/2025:16:19:36 +0000] "GET /rest/v10/ping HTTP/1.1" 404 -
34.75.152.217 - admin [10/Feb/2025:16:19:37 +0000] "GET /legacy/index.php?action=Login&module=Users HTTP/1.1" 200 3305
119.18.2.76 - - [10/Feb/2025:16:19:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:19:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:20:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:20:51 +0000] "POST /api/graphql HTTP/1.1" 200 272
119.18.2.76 - - [10/Feb/2025:16:21:39 +0000] "POST /api/graphql HTTP/1.1" 200 272
suitecrm 16:28:56.90 INFO  ==> 
suitecrm 16:28:56.91 INFO  ==> Welcome to the Bitnami suitecrm container
suitecrm 16:28:56.91 INFO  ==> Subscribe to project updates by watching https://github.com/bitnami/containers
suitecrm 16:28:56.91 INFO  ==> Did you know there are enterprise versions of the Bitnami catalog? For enhanced secure software supply chain features, unlimited pulls from Docker, LTS support, or application customization, see Bitnami Premium or Tanzu Application Catalog. See https://www.arrow.com/globalecs/na/vendors/bitnami/ for more information.
suitecrm 16:28:56.92 INFO  ==> 
suitecrm 16:28:56.92 INFO  ==> ** Starting SuiteCRM setup **
realpath: /bitnami/apache/conf: No such file or directory
suitecrm 16:28:57.07 INFO  ==> Configuring the HTTP port
suitecrm 16:28:57.09 INFO  ==> Configuring the HTTPS port
suitecrm 16:28:57.11 INFO  ==> Configuring Apache ServerTokens directive
suitecrm 16:28:57.20 INFO  ==> Configuring PHP options
suitecrm 16:28:57.22 INFO  ==> Setting PHP expose_php option
suitecrm 16:28:57.25 INFO  ==> Setting PHP output_buffering option
suitecrm 16:28:57.32 INFO  ==> Validating settings in MYSQL_CLIENT_* env vars
suitecrm 16:28:57.51 INFO  ==> Restoring persisted SuiteCRM installation
suitecrm 16:28:57.56 INFO  ==> Trying to connect to the database server
suitecrm 16:29:08.21 INFO  ==> ** SuiteCRM setup finished! **

suitecrm 16:29:08.23 INFO  ==> ** Starting cron **
suitecrm 16:29:08.28 INFO  ==> ** Starting Apache **
[Mon Feb 10 16:29:08.477958 2025] [core:warn] [pid 1:tid 1] AH00098: pid file /opt/bitnami/apache/var/run/httpd.pid overwritten -- Unclean shutdown of previous Apache run?
[Mon Feb 10 16:29:08.483466 2025] [mpm_prefork:notice] [pid 1:tid 1] AH00163: Apache/2.4.63 (Unix) OpenSSL/3.0.15 configured -- resuming normal operations
[Mon Feb 10 16:29:08.483528 2025] [core:notice] [pid 1:tid 1] AH00094: Command line: '/opt/bitnami/apache/bin/httpd -f /opt/bitnami/apache/conf/httpd.conf -D FOREGROUND'
119.18.2.76 - - [10/Feb/2025:16:29:51 +0000] "POST /api/graphql HTTP/1.1" 200 271
34.75.152.217 - admin [10/Feb/2025:16:29:52 +0000] "GET /rest/v10/ping HTTP/1.1" 404 -
[10-Feb-2025 16:29:52 UTC] PHP Fatal error:  Cannot declare class LanguageManager, because the name is already in use in /bitnami/suitecrm/public/legacy/include/SugarObjects/LanguageManager.php on line 50
[10-Feb-2025 16:29:52 UTC] PHP Fatal error:  Uncaught LogicException: Invalid key supplied in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php:67
Stack trace:
#0 /bitnami/suitecrm/public/legacy/Api/V8/Config/services/middlewares.php(48): League\OAuth2\Server\CryptKey->__construct()
#1 /bitnami/suitecrm/vendor/pimple/pimple/src/Pimple/Container.php(122): Api\Core\Resolver\ConfigResolver::{closure}()
#2 /bitnami/suitecrm/vendor/slim/slim/Slim/Container.php(109): Pimple\Container->offsetGet()
#3 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(17): Slim\Container->get()
#4 /bitnami/suitecrm/vendor/slim/slim/Slim/RouteGroup.php(25): Api\Core\Loader\RouteLoader->{closure}()
#5 /bitnami/suitecrm/vendor/slim/slim/Slim/App.php(272): Slim\RouteGroup->__invoke()
#6 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(132): Slim\App->group()
#7 /bitnami/suitecrm/public/legacy/Api/Core/Loader/RouteLoader.php(22): require('...')
#8 /bitnami/suitecrm/public/legacy/Api/Core/app.php(26): Api\Core\Loader\RouteLoader->configureRoutes()
#9 /bitnami/suitecrm/public/legacy/Api/index.php(11): require_once('...')
#10 /bitnami/suitecrm/vendor/autoload_runtime.php(67): require('...')
#11 /bitnami/suitecrm/public/index.php(5): require_once('...')
#12 {main}
  thrown in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php on line 67
[10-Feb-2025 16:29:52 UTC] PHP Fatal error:  Uncaught LogicException: Invalid key supplied in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php:67
Stack trace:
#0 /bitnami/suitecrm/public/legacy/Api/V8/Config/services/middlewares.php(48): League\OAuth2\Server\CryptKey->__construct()
#1 /bitnami/suitecrm/vendor/pimple/pimple/src/Pimple/Container.php(122): Api\Core\Resolver\ConfigResolver::{closure}()
#2 /bitnami/suitecrm/vendor/slim/slim/Slim/Container.php(109): Pimple\Container->offsetGet()
#3 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(17): Slim\Container->get()
#4 /bitnami/suitecrm/vendor/slim/slim/Slim/RouteGroup.php(25): Api\Core\Loader\RouteLoader->{closure}()
#5 /bitnami/suitecrm/vendor/slim/slim/Slim/App.php(272): Slim\RouteGroup->__invoke()
#6 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(132): Slim\App->group()
#7 /bitnami/suitecrm/public/legacy/Api/Core/Loader/RouteLoader.php(22): require('...')
#8 /bitnami/suitecrm/public/legacy/Api/Core/app.php(26): Api\Core\Loader\RouteLoader->configureRoutes()
#9 /bitnami/suitecrm/public/legacy/Api/index.php(11): require_once('...')
#10 /bitnami/suitecrm/vendor/autoload_runtime.php(67): require('...')
#11 /bitnami/suitecrm/public/index.php(5): require_once('...')
#12 {main}
  thrown in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php on line 67
34.75.152.217 - admin [10/Feb/2025:16:29:52 +0000] "POST /service/v4_1/rest.php HTTP/1.1" 500 -
34.75.152.217 - admin [10/Feb/2025:16:29:52 +0000] "GET /Api/access/token HTTP/1.1" 500 -
34.75.152.217 - admin [10/Feb/2025:16:29:52 +0000] "OPTIONS /Api/access/token HTTP/1.1" 500 -
[10-Feb-2025 16:29:53 UTC] PHP Fatal error:  Uncaught LogicException: Invalid key supplied in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php:67
Stack trace:
#0 /bitnami/suitecrm/public/legacy/Api/V8/Config/services/middlewares.php(48): League\OAuth2\Server\CryptKey->__construct()
#1 /bitnami/suitecrm/vendor/pimple/pimple/src/Pimple/Container.php(122): Api\Core\Resolver\ConfigResolver::{closure}()
#2 /bitnami/suitecrm/vendor/slim/slim/Slim/Container.php(109): Pimple\Container->offsetGet()
#3 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(17): Slim\Container->get()
#4 /bitnami/suitecrm/vendor/slim/slim/Slim/RouteGroup.php(25): Api\Core\Loader\RouteLoader->{closure}()
#5 /bitnami/suitecrm/vendor/slim/slim/Slim/App.php(272): Slim\RouteGroup->__invoke()
#6 /bitnami/suitecrm/public/legacy/Api/V8/Config/routes.php(132): Slim\App->group()
#7 /bitnami/suitecrm/public/legacy/Api/Core/Loader/RouteLoader.php(22): require('...')
#8 /bitnami/suitecrm/public/legacy/Api/Core/app.php(26): Api\Core\Loader\RouteLoader->configureRoutes()
#9 /bitnami/suitecrm/public/legacy/Api/index.php(11): require_once('...')
#10 /bitnami/suitecrm/vendor/autoload_runtime.php(67): require('...')
#11 /bitnami/suitecrm/public/index.php(5): require_once('...')
#12 {main}
  thrown in /bitnami/suitecrm/vendor/league/oauth2-server/src/CryptKey.php on line 67
34.75.152.217 - admin [10/Feb/2025:16:29:52 +0000] "POST /Api/V8/oauth2/token HTTP/1.1" 500 -
34.75.152.217 - admin [10/Feb/2025:16:29:53 +0000] "GET /legacy/index.php HTTP/1.1" 301 -
[10-Feb-2025 16:29:53 UTC] PHP Fatal error:  Cannot declare class LanguageManager, because the name is already in use in /bitnami/suitecrm/public/legacy/include/SugarObjects/LanguageManager.php on line 50
34.75.152.217 - admin [10/Feb/2025:16:29:53 +0000] "POST /service/v4_1/rest.php HTTP/1.1" 500 -
34.75.152.217 - admin [10/Feb/2025:16:29:53 +0000] "GET /about HTTP/1.1" 404 -
34.75.152.217 - admin [10/Feb/2025:16:29:53 +0000] "HEAD / HTTP/1.1" 200 -
34.75.152.217 - admin [10/Feb/2025:16:29:53 +0000] "GET /legacy/index.php?action=Login&module=Users HTTP/1.1" 200 3305
119.18.2.76 - - [10/Feb/2025:16:30:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:30:51 +0000] "POST /api/graphql HTTP/1.1" 200 271
119.18.2.76 - - [10/Feb/2025:16:31:42 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:31:51 +0000] "POST /api/graphql HTTP/1.1" 200 271
119.18.2.76 - - [10/Feb/2025:16:32:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:32:51 +0000] "POST /api/graphql HTTP/1.1" 200 271
119.18.2.76 - - [10/Feb/2025:16:33:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:33:51 +0000] "POST /api/graphql HTTP/1.1" 200 271
119.18.2.76 - - [10/Feb/2025:16:34:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:34:51 +0000] "POST /api/graphql HTTP/1.1" 200 271
119.18.2.76 - - [10/Feb/2025:16:35:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:35:51 +0000] "POST /api/graphql HTTP/1.1" 200 271
119.18.2.76 - - [10/Feb/2025:16:36:42 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:36:51 +0000] "POST /api/graphql HTTP/1.1" 200 271
119.18.2.76 - - [10/Feb/2025:16:37:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:37:51 +0000] "POST /api/graphql HTTP/1.1" 200 271
119.18.2.76 - - [10/Feb/2025:16:38:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:38:51 +0000] "POST /api/graphql HTTP/1.1" 200 271
119.18.2.76 - - [10/Feb/2025:16:39:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:39:51 +0000] "POST /api/graphql HTTP/1.1" 200 271
119.18.2.76 - - [10/Feb/2025:16:40:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:40:51 +0000] "POST /api/graphql HTTP/1.1" 200 271
119.18.2.76 - - [10/Feb/2025:16:41:43 +0000] "-" 408 -
119.18.2.76 - - [10/Feb/2025:16:41:51 +0000] "POST /api/graphql HTTP/1.1" 200 271"""


# Verify SuiteCRM API module status
php -r "print_r(get_loaded_extensions());
"""root@5dd383ab50bd:/# php -r "print_r(get_loaded_extensions());"
Array
(
    [0] => Core
    [1] => date
    [2] => libxml
    [3] => openssl
    [4] => pcre
    [5] => sqlite3
    [6] => zlib
    [7] => bcmath
    [8] => bz2
    [9] => calendar
    [10] => ctype
    [11] => curl
    [12] => dom
    [13] => hash
    [14] => fileinfo
    [15] => filter
    [16] => ftp
    [17] => gd
    [18] => gettext
    [19] => gmp
    [20] => json
    [21] => iconv
    [22] => intl
    [23] => SPL
    [24] => ldap
    [25] => mbstring
    [26] => session
    [27] => standard
    [28] => pcntl
    [29] => exif
    [30] => mysqlnd
    [31] => PDO
    [32] => pdo_mysql
    [33] => pdo_sqlite
    [34] => Phar
    [35] => posix
    [36] => readline
    [37] => Reflection
    [38] => mysqli
    [39] => SimpleXML
    [40] => soap
    [41] => sockets
    [42] => sodium
    [43] => tidy
    [44] => tokenizer
    [45] => xml
    [46] => xmlreader
    [47] => xmlwriter
    [48] => xsl
    [49] => zip
    [50] => Zend OPcache
)"""

# Check SuiteCRM config and permissions
ls -la /opt/bitnami/suitecrm/public/Api ## NOTE THAT THE PATH IS WRONG. SHOULD BE "\bitnami\suitecrm\public\legacy\Api\index.php"
"""root@5dd383ab50bd:/# ls /bitnami/suitecrm/public/legacy/Api/
Core  V8  docs  index.php"""

cat /opt/bitnami/suitecrm/public/.htaccess
"""root@5dd383ab50bd:/# cat /opt/bitnami/suitecrm/public/.htaccess
# Use the front controller as index file. It serves as a fallback solution when
# every other rewrite/redirect fails (e.g. in an aliased environment without
# mod_rewrite). Additionally, this reduces the matching process for the
# start page (path "/") because otherwise Apache will apply the rewriting rules
# to each configured DirectoryIndex file (e.g. index.php, index.html, index.pl).
DirectoryIndex index.php

# By default, Apache does not evaluate symbolic links if you did not enable this
# feature in your server configuration. Uncomment the following line if you
# install assets as symlinks or if you experience problems related to symlinks
# when compiling LESS/Sass/CoffeScript assets.
# Options FollowSymlinks

# Disabling MultiViews prevents unwanted negotiation, e.g. "/index" should not resolve
# to the front controller "/index.php" but be rewritten to "/index.php/index".
<IfModule mod_negotiation.c>
    Options -MultiViews
</IfModule>

<IfModule mod_rewrite.c>
    RewriteEngine On

    RewriteRule ^index.php.*$ - [L,NC]

    # Determine the RewriteBase automatically and set it as environment variable.
    # If you are using Apache aliases to do mass virtual hosting or installed the
    # project in a subdirectory, the base path will be prepended to allow proper
    # resolution of the index.php file and to redirect to the correct URI. It will
    # work in environments without path prefix as well, providing a safe, one-size
    # fits all solution. But as you do not need it in this case, you can comment
    # the following 2 lines to eliminate the overhead.
    RewriteCond %{REQUEST_URI}::$0 ^(/.+)/(.*)::\2$
    RewriteRule .* - [E=BASE:%1]

    # Sets the HTTP_AUTHORIZATION header removed by Apache
    RewriteCond %{HTTP:Authorization} .+
    RewriteRule ^ - [E=HTTP_AUTHORIZATION:%0]

    # Redirect to URI without front controller to prevent duplicate content
    # (with and without `/index.php`). Only do this redirect on the initial
    # rewrite by Apache and not on subsequent cycles. Otherwise we would get an
    # endless redirect loop (request -> rewrite to front controller ->
    # redirect -> request -> ...).
    # So in case you get a "too many redirects" error or you always get redirected
    # to the start page because your Apache does not expose the REDIRECT_STATUS
    # environment variable, you have 2 choices:
    # - disable this feature by commenting the following 2 lines or
    # - use Apache >= 2.3.9 and replace all L flags by END flags and remove the
    #   following RewriteCond (best solution)
    RewriteCond %{ENV:REDIRECT_STATUS} =""
    RewriteRule ^index\.php(?:/(.*)|$) %{ENV:BASE}/$1 [R=301,L]

    # If the requested filename exists, simply serve it.
    # We only want to let Apache serve files and not directories.
    # Rewrite all other queries to the front controller.
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ %{ENV:BASE}/index.php [L]
</IfModule>

<IfModule !mod_rewrite.c>
    <IfModule mod_alias.c>
        # When mod_rewrite is not available, we instruct a temporary redirect of
        # the start page to the front controller explicitly so that the website
        # and the generated links can still be used.
        RedirectMatch 307 ^/$ /index.php/
        # RedirectTemp cannot be used instead
    </IfModule>
</IfModule>
root@5dd383ab50bd:/# """

## config_override is in a different location

## here is \bitnami\suitecrm\public\legacy\config.php
"""<?php
// created: 2025-02-09 16:57:43
$sugar_config = array (
  'addAjaxBannedModules' => 
  array (
    0 => 'SecurityGroups',
  ),
  'admin_access_control' => false,
  'admin_export_only' => false,
  'allowed_preview' => 
  array (
    0 => 'gif',
    1 => 'png',
    2 => 'jpeg',
    3 => 'jpg',
  ),
  'anti_malware_scanners' => 
  array (
    'SuiteCRM\\Utility\\AntiMalware\\Providers\\ClamTCP' => 
    array (
      'name' => 'ClamAntiVirus TCP',
      'support_page' => 'https://www.clamav.net/',
      'enabled' => false,
      'path' => NULL,
      'options' => 
      array (
        'ip' => '127.0.0.1',
        'port' => 3310,
        'type' => 'local',
      ),
    ),
    'SuiteCRM\\Utility\\AntiMalware\\Providers\\Sophos' => 
    array (
      'name' => 'Sophos Anti Virus (Linux)',
      'support_page' => 'https://www.sophos.com/en-us/products/free-tools/sophos-antivirus-for-linux.aspx',
      'enabled' => false,
      'path' => '/opt/sophos-av/bin/savscan',
      'options' => '-ss',
    ),
  ),
  'aop' => 
  array (
    'distribution_method' => 'roundRobin',
    'case_closure_email_template_id' => 'ea7bae3b-14d5-277d-e873-67a8debdd3b2',
    'joomla_account_creation_email_template_id' => 'ec9ef996-16d5-23bb-531c-67a8dead5fb0',
    'case_creation_email_template_id' => 'efc92442-d68d-757d-60ff-67a8de043930',
    'contact_email_template_id' => 'f2bb3331-35b4-8fe4-854f-67a8debe0315',
    'user_email_template_id' => '1bcc0e62-c0c7-a00b-37ae-67a8de11fecf',
  ),
  'aos' => 
  array (
    'version' => '5.3.3',
    'contracts' => 
    array (
      'renewalReminderPeriod' => '14',
    ),
    'lineItems' => 
    array (
      'totalTax' => false,
      'enableGroups' => true,
    ),
    'invoices' => 
    array (
      'initialNumber' => '1',
    ),
    'quotes' => 
    array (
      'initialNumber' => '1',
    ),
  ),
  'cache_dir' => 'cache/',
  'calculate_response_time' => true,
  'calendar' => 
  array (
    'default_view' => 'week',
    'show_calls_by_default' => true,
    'show_tasks_by_default' => true,
    'show_completed_by_default' => true,
    'editview_width' => 990,
    'editview_height' => 485,
    'day_timestep' => 15,
    'week_timestep' => 30,
    'items_draggable' => true,
    'items_resizable' => true,
    'enable_repeat' => true,
    'max_repeat_count' => 1000,
  ),
  'chartEngine' => 'Jit',
  'common_ml_dir' => '',
  'create_default_user' => false,
  'cron' => 
  array (
    'max_cron_jobs' => 10,
    'max_cron_runtime' => 30,
    'min_cron_interval' => 30,
  ),
  'dashlet_auto_refresh_min' => 30,
  'dashlet_display_row_options' => 
  array (
    0 => '1',
    1 => '3',
    2 => '5',
    3 => '10',
  ),
  'date_formats' => 
  array (
    'Y-m-d' => '2010-12-23',
    'm-d-Y' => '12-23-2010',
    'd-m-Y' => '23-12-2010',
    'Y/m/d' => '2010/12/23',
    'm/d/Y' => '12/23/2010',
    'd/m/Y' => '23/12/2010',
    'Y.m.d' => '2010.12.23',
    'd.m.Y' => '23.12.2010',
    'm.d.Y' => '12.23.2010',
  ),
  'datef' => 'm/d/Y',
  'dbconfig' => 
  array (
    'db_host_name' => 'mariadb',
    'db_host_instance' => '',
    'db_user_name' => 'bn_suitecrm',
    'db_password' => 'bitnami',
    'db_name' => 'bitnami_suitecrm',
    'db_type' => 'mysql',
    'db_port' => '3306',
    'db_manager' => 'MysqliManager',
    'collation' => NULL,
    'charset' => NULL,
  ),
  'dbconfigoption' => 
  array (
    'persistent' => true,
    'autofree' => false,
    'debug' => 0,
    'ssl' => false,
  ),
  'default_action' => 'index',
  'default_charset' => NULL,
  'default_currency_iso4217' => 'USD',
  'default_currency_name' => 'US Dollar',
  'default_currency_significant_digits' => '2',
  'default_currency_symbol' => '$',
  'default_date_format' => 'Y-m-d',
  'default_decimal_seperator' => '.',
  'default_email_charset' => 'UTF-8',
  'default_email_client' => 'sugar',
  'default_email_editor' => 'html',
  'default_export_charset' => 'ISO-8859-1',
  'default_language' => 'en_us',
  'default_locale_name_format' => 's f l',
  'default_max_tabs' => 8,
  'default_module' => 'Home',
  'default_module_access' => 
  array (
    'SecurityGroups' => false,
    'AOW_WorkFlow' => false,
  ),
  'default_module_favicon' => false,
  'default_navigation_paradigm' => 'm',
  'default_number_grouping_seperator' => ',',
  'default_password' => '',
  'default_permissions' => 
  array (
    'dir_mode' => 1528,
    'file_mode' => 493,
    'user' => '',
    'group' => '',
  ),
  'default_subpanel_links' => false,
  'default_subpanel_tabs' => true,
  'default_swap_last_viewed' => false,
  'default_swap_shortcuts' => false,
  'default_theme' => 'suite8',
  'default_time_format' => 'H:i',
  'default_user_is_admin' => false,
  'default_user_name' => '',
  'demoData' => 'no',
  'developerMode' => false,
  'disableAjaxUI' => true,
  'disable_convert_lead' => false,
  'disable_export' => false,
  'disable_persistent_connections' => false,
  'display_email_template_variable_chooser' => false,
  'display_inbound_email_buttons' => false,
  'dump_slow_queries' => false,
  'email_address_separator' => ',',
  'email_confirm_opt_in_email_template_id' => 'd9d6f549-9141-9e6a-d593-67a8de86ccd0',
  'email_default_client' => 'sugar',
  'email_default_delete_attachments' => true,
  'email_default_editor' => 'html',
  'email_enable_auto_send_opt_in' => false,
  'email_enable_confirm_opt_in' => 'not-opt-in',
  'email_warning_notifications' => true,
  'enable_action_menu' => true,
  'enable_line_editing_detail' => true,
  'enable_line_editing_list' => true,
  'enable_record_pagination' => true,
  'export_delimiter' => ',',
  'export_excel_compatible' => false,
  'filter_module_fields' => 
  array (
    'Users' => 
    array (
      0 => 'show_on_employees',
      1 => 'portal_only',
      2 => 'is_group',
      3 => 'system_generated_password',
      4 => 'external_auth_only',
      5 => 'sugar_login',
      6 => 'authenticate_id',
      7 => 'pwd_last_changed',
      8 => 'is_admin',
      9 => 'user_name',
      10 => 'user_hash',
      11 => 'password',
      12 => 'last_login',
      13 => 'oauth_tokens',
    ),
    'Employees' => 
    array (
      0 => 'show_on_employees',
      1 => 'portal_only',
      2 => 'is_group',
      3 => 'system_generated_password',
      4 => 'external_auth_only',
      5 => 'sugar_login',
      6 => 'authenticate_id',
      7 => 'pwd_last_changed',
      8 => 'is_admin',
      9 => 'user_name',
      10 => 'user_hash',
      11 => 'password',
      12 => 'last_login',
      13 => 'oauth_tokens',
    ),
  ),
  'google_auth_json' => '',
  'hide_subpanels' => true,
  'history_max_viewed' => 50,
  'host_name' => 'localhost',
  'id_validation_pattern' => '/^[a-zA-Z0-9_-]*$/i',
  'imap_test' => false,
  'import_max_execution_time' => 3600,
  'import_max_records_per_file' => 100,
  'import_max_records_total_limit' => '',
  'installed' => true,
  'installer_locked' => true,
  'jobs' => 
  array (
    'min_retry_interval' => 30,
    'max_retries' => 5,
    'timeout' => 86400,
  ),
  'js_custom_version' => 1,
  'js_lang_version' => 1,
  'languages' => 
  array (
    'en_us' => 'English (US)',
  ),
  'large_scale_test' => false,
  'lead_conv_activity_opt' => 'donothing',
  'legacy_email_behaviour' => false,
  'list_max_entries_per_modal' => 10,
  'list_max_entries_per_page' => 20,
  'list_max_entries_per_subpanel' => 10,
  'listview_max_height' => 0,
  'listview_pagination_type' => 'pagination',
  'lock_default_user_name' => false,
  'lock_homepage' => false,
  'lock_subpanels' => false,
  'log_dir' => '../../logs/legacy',
  'log_file' => 'suitecrm.log',
  'log_memory_usage' => false,
  'logger' => 
  array (
    'level' => 'fatal',
    'file' => 
    array (
      'ext' => '.log',
      'name' => 'suitecrm',
      'dateFormat' => '%c',
      'maxSize' => '10MB',
      'maxLogs' => 10,
      'suffix' => '',
    ),
  ),
  'login_language' => true,
  'max_dashlets_homepage' => '15',
  'name_formats' => 
  array (
    's f l' => 's f l',
    'f l' => 'f l',
    's l' => 's l',
    'l, s f' => 'l, s f',
    'l, f' => 'l, f',
    's l, f' => 's l, f',
    'l s f' => 'l s f',
    'l f s' => 'l f s',
  ),
  'oauth2_encryption_key' => 'LeWV48dmPhjFz/es2xWeUIXPhAlZy5FOr77BGWsp0A0=',
  'passwordsetting' => 
  array (
    'SystemGeneratedPasswordON' => '',
    'generatepasswordtmpl' => 'ccd8258f-0f4a-e557-87dd-67a8dee191aa',
    'lostpasswordtmpl' => 'cfafb1e1-111a-ffc0-fd4f-67a8de9c3deb',
    'factoremailtmpl' => 'd200b805-f0b9-34b2-e5af-67a8ded41587',
    'forgotpasswordON' => false,
    'linkexpiration' => '1',
    'linkexpirationtime' => '30',
    'linkexpirationtype' => '1',
    'systexpiration' => '1',
    'systexpirationtime' => '7',
    'systexpirationtype' => '1',
    'systexpirationlogin' => '',
  ),
  'pdf' => 
  array (
    'defaultEngine' => 'TCPDFEngine',
  ),
  'portal_view' => 'single_user',
  'record_modal_pagination_type' => 'pagination',
  'require_accounts' => true,
  'resource_management' => 
  array (
    'special_query_limit' => 50000,
    'special_query_modules' => 
    array (
      0 => 'AOR_Reports',
      1 => 'Export',
      2 => 'Import',
      3 => 'Administration',
      4 => 'Sync',
    ),
    'default_limit' => 20000,
  ),
  'rss_cache_time' => '10800',
  'save_query' => 'all',
  'search' => 
  array (
    'controller' => 'UnifiedSearch',
    'defaultEngine' => 'BasicSearchEngine',
    'pagination' => 
    array (
      'min' => 10,
      'max' => 50,
      'step' => 10,
    ),
    'ElasticSearch' => 
    array (
      'enabled' => false,
      'host' => 'localhost',
      'user' => '',
      'pass' => '',
      'index' => 'da3f7a4e44a346ad77e1cb2ae028a513',
      'search_wildcard_char' => '%',
      'search_wildcard_infront' => true,
    ),
  ),
  'search_wildcard_char' => '%',
  'search_wildcard_infront' => false,
  'securitysuite_additive' => true,
  'securitysuite_filter_user_list' => false,
  'securitysuite_inherit_assigned' => true,
  'securitysuite_inherit_creator' => true,
  'securitysuite_inherit_parent' => true,
  'securitysuite_popup_select' => false,
  'securitysuite_strict_rights' => false,
  'securitysuite_user_popup' => true,
  'securitysuite_user_role_precedence' => true,
  'securitysuite_version' => '6.5.17',
  'session_dir' => '',
  'session_gc' => 
  array (
    'enable' => true,
    'gc_probability' => 1,
    'gc_divisor' => 100,
  ),
  'showDetailData' => true,
  'showThemePicker' => true,
  'site_url' => 'http://localhost:8080',
  'slow_query_time_msec' => '100',
  'snooze_alert_timer' => 600,
  'stackTrace' => false,
  'stack_trace_errors' => false,
  'strict_id_validation' => false,
  'subpanel_max_height' => 620,
  'subpanel_pagination_type' => 'pagination',
  'sugar_version' => NULL,
  'sugarbeet' => false,
  'suitecrm_version' => NULL,
  'system_email_templates' => 
  array (
    'confirm_opt_in_template_id' => 'd9d6f549-9141-9e6a-d593-67a8de86ccd0',
  ),
  'system_name' => 'SuiteCRM',
  'time_formats' => 
  array (
    'H:i' => '23:00',
    'h:ia' => '11:00pm',
    'h:iA' => '11:00PM',
    'h:i a' => '11:00 pm',
    'h:i A' => '11:00 PM',
    'H.i' => '23.00',
    'h.ia' => '11.00pm',
    'h.iA' => '11.00PM',
    'h.i a' => '11.00 pm',
    'h.i A' => '11.00 PM',
  ),
  'timef' => 'H:i',
  'tmp_dir' => 'cache/xml/',
  'tracker_max_display_length' => 15,
  'translation_string_prefix' => false,
  'trusted_hosts' => 
  array (
  ),
  'unique_key' => 'da3f7a4e44a346ad77e1cb2ae028a513',
  'upload_badext' => 
  array (
    0 => 'php',
    1 => 'php3',
    2 => 'php4',
    3 => 'php5',
    4 => 'php6',
    5 => 'php7',
    6 => 'php8',
    7 => 'pl',
    8 => 'cgi',
    9 => 'py',
    10 => 'asp',
    11 => 'cfm',
    12 => 'js',
    13 => 'vbs',
    14 => 'html',
    15 => 'htm',
    16 => 'phtml',
    17 => 'phar',
  ),
  'upload_dir' => 'upload/',
  'upload_maxsize' => 30000000,
  'use_common_ml_dir' => false,
  'use_real_names' => true,
  'valid_image_ext' => 
  array (
    0 => 'gif',
    1 => 'png',
    2 => 'jpg',
    3 => 'jpeg',
    4 => 'svg',
    5 => 'bmp',
  ),
  'valid_imap_ports' => 
  array (
    0 => '110',
    1 => '143',
    2 => '993',
    3 => '995',
  ),
  'vcal_time' => '2',
  'verify_client_ip' => true,
  'web_to_lead_allowed_redirect_hosts' => 
  array (
  ),
);"""


## location of config_override.php "\bitnami\suitecrm\public\legacy\config_override.php"

"""<?php
/***CONFIGURATOR***/
$sugar_config['default_export_charset'] = 'ISO-8859-1';
/***CONFIGURATOR***/"""