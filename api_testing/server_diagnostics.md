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