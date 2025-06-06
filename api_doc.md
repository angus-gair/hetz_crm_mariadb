---
title: Available Grant Types
weight: 40
---
:imagesdir: /images/en/developer/


== Configure Authentication: Obtaining A Session

The SuiteCRM API requires that a client has an active session to consume
the API. Sessions are acquired by authenticating with the
http://oauth2.thephpleague.com/[OAuth 2 Server], using one of the
available grant types.

== Configure Grant Types
Before you can consume the API, you must first configure SuiteCRM to
grant access to a client. SuiteCRM 7.10 provides an administrative
panel, through which you can add clients and revoke tokens. To configure the grant types, select the admin panel, and then select OAuth2 Clients and Tokens:

image:Admin-OAuth2Clients-3.png[Configure SuiteCRM API]

== Available Grant Types

[width="50, cols="25,25",options="header",]
|=======================================
|SuiteCRM Version |Available Grant Types
|7.10.0 | Password Grant, Refresh Token Grant
|7.10.2 + | Password Grant, Client credentials Grant, Refresh Token Grant
|=======================================

image:Admin-OAuth2Clients-4.png[Create a new grant]

== Client Credentials Grant

A client credentials grant is the simplest of all of the grants types, this grant is used to authenticate a machine or service. Select new client credentials client:

image:Admin-OAuth2Clients-8.png[Create a new client credentials grant]

Begin configuring the grant:

image:Admin-OAuth2Clients-2.png[Create a new Client]

[cols="15,85",options="header"]
|=======================================================================
| Field| Description
|*Name* |This makes it easy to identify the client.
|*Secret* |Defines the *client_secret* which is posted to the server
during authentication.
|*Is Confidential* |A confidential client is an application that is
capable of keeping a client password confidential to the world.
|*Associated User* |Limits the client access to CRM, by associating the client with the security privileges of a user.
|=======================================================================


The 'secret' will be hashed when saved, and will not be accessible
later. The 'id' is created by SuiteCRM and will be visible once the
client is saved.

image:Admin-OAuth2Clients-5.png[View a Client Credentials Client]

== Authentication with Client Credentials

[source,php]
POST /Api/access_token

[[required-parameters]]
=== Required parameters

[width="40",cols="20,20",options="header",]
|======================================
|param |value
|grant_type |client_credentials
|client_id |*ExampleClientName*
|client_secret |*ExampleSecretPassword*
|======================================


.Example Request (PHP):
[source,php]
$ch = curl_init();
$header = array(
    'Content-type: application/vnd.api+json',
    'Accept: application/vnd.api+json',
 );
$postStr = json_encode(array(
    'grant_type' => 'client_credentials',
    'client_id' => '3D7f3fda97-d8e2-b9ad-eb89-5a2fe9b07650',
    'client_secret' => 'client_secret',
));
$url = 'https://path-to-instance/Api/access_token';
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_POSTFIELDS, $postStr);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
$output = curl_exec($ch);

.Example Response:
[source,php]
{
   "token_type":"Bearer",
   "expires_in":3600,
   "access_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjdkOTEyODNhMjc1NDdkNDRlMzNmOTc5ZjVmMGRkYzQwNzg1ZGY5NGFhMWI5MDVlZGNmMzg3NWIxYjJkZDMzNDljZWEyNjZhMTQ2OTE5OWIzIn0.eyJhdWQiOiJzdWl0ZWNybV9jbGllbnQiLCJqdGkiOiI3ZDkxMjgzYTI3NTQ3ZDQ0ZTMzZjk3OWY1ZjBkZGM0MDc4NWRmOTRhYTFiOTA1ZWRjZjM4NzViMWIyZGQzMzQ5Y2VhMjY2YTE0NjkxOTliMyIsImlhdCI6MTUxODE5NTEwMiwibmJmIjoxNTE4MTk1MTAyLCJleHAiOjE1MTgxOTg3MDIsInN1YiI6IjEiLCJzY29wZXMiOltdfQ.EVGuRisoMxSIZut3IWtgOYISw8lEFSZgCWYCwseLEfOuPJ8lRMYL4OZxhu9gxJoGF0nj3yc6SYDPxovrsoj8bMoX38h4krMMOHFQLoizU0k2wAceOjZG1tWKPhID7KPT4TwoCXbb7MqAsYtVPExH4li7gSphJ8wvcWbFdS5em89Ndtwqq3faFtIq6bv1R4t0x98HHuT7sweHUJU40K9WQjbAfIOk8f5Y6T2wassN2wMCBB8CC6eUxLi14n2D6khHvkYvtPbXLHpXSHZWvEhqhvjAeSR5MmMrAth9WDSWUx7alO-ppsZpi8U7-g9Be5p6MRatc25voyTI2iTYbx02FQ",
}


[cols="15,80"]
|=======================================================================
|*token_type* |the Bearer token value

|*expires_in* |an integer representing the TTL of the access token

|*access_token* |a https://tools.ietf.org/html/rfc7519[JWT] signed with
the authorization server’s private key. It is required that you include
this in the HTTP headers, each time you make a request to the API

|=======================================================================

You can store the bearer token in a database and use in your requests
like this:

.Example
[source,php]
$header = array(
   'Content-type: application/vnd.api+json',
   'Accept: application/vnd.api+json',
   'Authorization: Bearer ' . $your_saved_access_token
);

'''

== Password Grant

A password grant is used for allow users to log into SuiteCRM with a
username and a password. Select new password client:

image:Admin-OAuth2Clients-9.png[Create a Password Client]

Begin configuring grant:

image:Admin-OAuth2Clients-6.png[Create a new Client]

[cols="15,85", frame="none", grid="none"]
|=======================================================================
|*Name* |This makes it easy to identify the client.
|*Secret* |Defines the *client_secret* which is posted to the server
during authentication.
|*Is Confidential* |A confidential client is an application that is
capable of keeping a client password confidential to the world.
|=======================================================================


The 'secret' will be hashed when saved, and will not be accessible
later. The 'id' is created by SuiteCRM and will be visible once the
client is saved.

image:Admin-OAuth2Clients-7.png[View a password grant client]

=== Authentication with Password Grant

[source,php]
POST /Api/access_token

[[required-parameters-1]]
=== Required parameters

[width="40",cols="20,20",options="header",]
|======================================
|param |value
|grant_type |password
|client_id |*ExampleClientName*
|client_secret |*ExampleSecretPassword*
|username |*admin*
|password |*secret*
|======================================

Please change the values in bold to match your chosen authentication
details.

.Example Request (PHP):
[source,php]
$ch = curl_init();
$header = array(
    'Content-type: application/vnd.api+json',
    'Accept: application/vnd.api+json',
 );
$postStr = json_encode(array(
    'grant_type' => 'password',
    'client_id' => '3D7f3fda97-d8e2-b9ad-eb89-5a2fe9b07650',
    'client_secret' => 'client_secret',
    'username' => 'admin',
    'password' => 'admin',
));
$url = 'https://path-to-instance/Api/access_token';
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_POSTFIELDS, $postStr);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
$output = curl_exec($ch);

.Example Response:
[source,php]
{
   "token_type":"Bearer",
   "expires_in":3600,
   "access_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjdkOTEyODNhMjc1NDdkNDRlMzNmOTc5ZjVmMGRkYzQwNzg1ZGY5NGFhMWI5MDVlZGNmMzg3NWIxYjJkZDMzNDljZWEyNjZhMTQ2OTE5OWIzIn0.eyJhdWQiOiJzdWl0ZWNybV9jbGllbnQiLCJqdGkiOiI3ZDkxMjgzYTI3NTQ3ZDQ0ZTMzZjk3OWY1ZjBkZGM0MDc4NWRmOTRhYTFiOTA1ZWRjZjM4NzViMWIyZGQzMzQ5Y2VhMjY2YTE0NjkxOTliMyIsImlhdCI6MTUxODE5NTEwMiwibmJmIjoxNTE4MTk1MTAyLCJleHAiOjE1MTgxOTg3MDIsInN1YiI6IjEiLCJzY29wZXMiOltdfQ.EVGuRisoMxSIZut3IWtgOYISw8lEFSZgCWYCwseLEfOuPJ8lRMYL4OZxhu9gxJoGF0nj3yc6SYDPxovrsoj8bMoX38h4krMMOHFQLoizU0k2wAceOjZG1tWKPhID7KPT4TwoCXbb7MqAsYtVPExH4li7gSphJ8wvcWbFdS5em89Ndtwqq3faFtIq6bv1R4t0x98HHuT7sweHUJU40K9WQjbAfIOk8f5Y6T2wassN2wMCBB8CC6eUxLi14n2D6khHvkYvtPbXLHpXSHZWvEhqhvjAeSR5MmMrAth9WDSWUx7alO-ppsZpi8U7-g9Be5p6MRatc25voyTI2iTYbx02FQ",
   "refresh_token":"def50200d2fb757e4c01c333e96c827712dfd8f3e2c797db3e4e42734c8b4e7cba88a2dd8a9ce607358d634a51cadd7fa980d5acd692ab2c7a7da1d7a7f8246b22faf151dc11a758f9d8ea0b9aa3553f3cfd3751a927399ab964f219d086d36151d0f39c93aef4a846287e8467acea3dfde0bd2ac055ea7825dfb75aa5b8a084752de6d3976438631c3e539156a26bc10d0b7f057c092fce354bb10ff7ac2ab5fe6fd7af3ec7fa2599ec0f1e581837a6ca2441a80c01d997dac298e1f74573ac900dd4547d7a2a2807e9fb25438486c38f25be55d19cb8d72634d77c0a8dfaec80901c01745579d0f3822c717df21403440473c86277dc5590ce18acdb1222c1b95b516f3554c8b59255446bc15b457fdc17d5dcc0f06f7b2252581c810ca72b51618f820dbb2f414ea147add2658f8fbd5df20820843f98c22252dcffe127e6adb4a4cbe89ab0340f7ebe8d8177ef382569e2aa4a54d434adb797c5337bfdfffe27bd8d5cf4714054d4aef2372472ebb4"
}

[cols="15,80"]
|=======================================================================
|*token_type* |the Bearer token value

|*expires_in* |an integer representing the TTL of the access token

|*access_token* |a https://tools.ietf.org/html/rfc7519[JWT] signed with
the authorization server’s private key. It is required that you include
this in the HTTP headers, each time you make a request to the API

|*refresh_token* |an encrypted payload that can be used to refresh the
access token when it expires.
|=======================================================================

You can store the bearer token in a database and use in your requests
like this:

.Example
[source,php]
$header = array(
   'Content-type: application/vnd.api+json',
   'Accept: application/vnd.api+json',
   'Authorization: Bearer ' . $your_saved_access_token
);

== Refresh Token Grant

A refresh token grant is used if you already have a refresh token generated from password grant. It is used to get a new access token.

    "grant_type": "refresh_token",
    "client_id": "Client Id",
    "client_secret": "Client Secret",
    "refresh_token": "refresh token" (returned with password grant)
    
=== Getting Access Token using Refresh Grant

[source,php]
POST /Api/access_token

[[required-parameters-2]]
=== Required parameters

[width="40",cols="20,20",options="header",]
|======================================
|param |value
|grant_type |*refresh_token*
|client_id |*Client ID*
|client_secret |*Client Secret*
|refresh_token |*refresh token*
|======================================

Please change the values in bold to match your chosen authentication
details.
ß
.Example Request (PHP):
[source,php]
$ch = curl_init();
$header = array(
    'Content-type: application/vnd.api+json',
    'Accept: application/vnd.api+json',
 );
$postStr = json_encode(array(
    'grant_type' => 'refresh_token',
    'client_id' => '3D7f3fda97-d8e2-b9ad-eb89-5a2fe9b07650',
    'client_secret' => 'client_secret',
    'refresh_token' => 'refresh_token',
));
$url = 'https://path-to-instance/Api/access_token';
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_POSTFIELDS, $postStr);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
$output = curl_exec($ch);

.Example Response:
[source,php]
{
   "token_type":"Bearer",
   "expires_in":3600,
   "access_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjdkOTEyODNhMjc1NDdkNDRlMzNmOTc5ZjVmMGRkYzQwNzg1ZGY5NGFhMWI5MDVlZGNmMzg3NWIxYjJkZDMzNDljZWEyNjZhMTQ2OTE5OWIzIn0.eyJhdWQiOiJzdWl0ZWNybV9jbGllbnQiLCJqdGkiOiI3ZDkxMjgzYTI3NTQ3ZDQ0ZTMzZjk3OWY1ZjBkZGM0MDc4NWRmOTRhYTFiOTA1ZWRjZjM4NzViMWIyZGQzMzQ5Y2VhMjY2YTE0NjkxOTliMyIsImlhdCI6MTUxODE5NTEwMiwibmJmIjoxNTE4MTk1MTAyLCJleHAiOjE1MTgxOTg3MDIsInN1YiI6IjEiLCJzY29wZXMiOltdfQ.EVGuRisoMxSIZut3IWtgOYISw8lEFSZgCWYCwseLEfOuPJ8lRMYL4OZxhu9gxJoGF0nj3yc6SYDPxovrsoj8bMoX38h4krMMOHFQLoizU0k2wAceOjZG1tWKPhID7KPT4TwoCXbb7MqAsYtVPExH4li7gSphJ8wvcWbFdS5em89Ndtwqq3faFtIq6bv1R4t0x98HHuT7sweHUJU40K9WQjbAfIOk8f5Y6T2wassN2wMCBB8CC6eUxLi14n2D6khHvkYvtPbXLHpXSHZWvEhqhvjAeSR5MmMrAth9WDSWUx7alO-ppsZpi8U7-g9Be5p6MRatc25voyTI2iTYbx02FQ",
   "refresh_token":"def50200d2fb757e4c01c333e96c827712dfd8f3e2c797db3e4e42734c8b4e7cba88a2dd8a9ce607358d634a51cadd7fa980d5acd692ab2c7a7da1d7a7f8246b22faf151dc11a758f9d8ea0b9aa3553f3cfd3751a927399ab964f219d086d36151d0f39c93aef4a846287e8467acea3dfde0bd2ac055ea7825dfb75aa5b8a084752de6d3976438631c3e539156a26bc10d0b7f057c092fce354bb10ff7ac2ab5fe6fd7af3ec7fa2599ec0f1e581837a6ca2441a80c01d997dac298e1f74573ac900dd4547d7a2a2807e9fb25438486c38f25be55d19cb8d72634d77c0a8dfaec80901c01745579d0f3822c717df21403440473c86277dc5590ce18acdb1222c1b95b516f3554c8b59255446bc15b457fdc17d5dcc0f06f7b2252581c810ca72b51618f820dbb2f414ea147add2658f8fbd5df20820843f98c22252dcffe127e6adb4a4cbe89ab0340f7ebe8d8177ef382569e2aa4a54d434adb797c5337bfdfffe27bd8d5cf4714054d4aef2372472ebb4"
}

[cols="15,80"]
|=======================================================================
|*token_type* |the Bearer token value

|*expires_in* |an integer representing the TTL of the access token

|*access_token* |a https://tools.ietf.org/html/rfc7519[JWT] signed with
the authorization server’s private key. It is required that you include
this in the HTTP headers, each time you make a request to the API

|*refresh_token* |an encrypted payload that can be used to refresh the
access token when it expires.
|=======================================================================



---
title: Getting Available Resources
weight: 40
---

:imagesdir: /images/en/developer

== Swagger Documentation
To see what resources and authentication methods are available, you can
retrieve the https://swagger.io/specification/[swagger documentation] via 2 routes

On the server the documentation is located at

[source]
{{suitecrm.url}}/Api/docs/swagger/swagger.json

You can also retrieve the documentation via an API call:

[source]
GET {{suitecrm.url}}/Api/V8/meta/swagger.json

The swagger documentation is a JSON file that includes information on what the default API is capable of and how to structure an API call.

An example of one of the paths included is shown below.
[source]
  "paths": {
    "/module/{moduleName}/{id}": {
      "get": {
        "tags": [
          "Module"
        ],
        "description": "Returns a bean with the specific ID",
        "parameters": [
          {
            "name": "moduleName",
            "in": "path",
            "description": "Name of the module",
            "required": true,
            "schema": {
              "type": "string"
            },
            "example": "Contacts"
          },
          {
            "name": "id",
            "in": "path",
            "description": "ID of the module",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            },
            "example": "b13a39f8-1c24-c5d0-ba0d-5ab123d6e899"
          },
          {
            "name": "fields[Contacts]",
            "in": "query",
            "description": "Filtering attributes of the bean",
            "schema": {
              "type": "string"
            },
            "example": "name,account_type"
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "BAD REQUEST"
          }
        },
        "security": [
          {
            "oauth2": []
          }
        ]
      },
    },
  }

This will tell you everything you need to know about how to structure the API Request. A description of the array can be found below.

=== path

The path or URI of this api request i.e. "{{suitecrm.url}}/module/{moduleName}/{id}"

=== get

The type of request e.g. GET/POST/PATCH

=== description

Lets you know what this request is for.

=== parameters

Lets you know what can be included in the request.

* "name" is the name of the parameter or what it replaces in the path.
* "in" lets you know where this parameter should go.
** "path" means it replaces one of the varaiables in curly braces in the path.
** "query" means it should be included in the body of the request as a parameter.
* "required" lets you know if this parameter must be included for the API call to be successful.
* "schema" describes the type/format of the parameter.
* "example" provides an example of how the parameter is used in the API call.

=== responses

The http messages to expect with the API Response.

=== security

The required security for the API call.


---
title: SuiteCRM V8 API Set Up For Postman
weight: 40
---

:imagesdir: /images/en/developer/API-Images/

== Steps to Set Up V8 API on Postman

== Composer

Install composer packages with

[source,php]
composer install

== .htaccess rebuild

Go to Admin Panel -> Repair -> Rebuild .htaccess File

image:htaccess_rebuild.png[Rebuild of .htaccess]

== Import Collection File into Postman

1 - Click Import

image:import_Files.png[Import Collection File]

2 - Import collection file. You can find it in `Api/docs/postman`

{{% notice note %}}
If you can't find your collection file it may been in a directory that postman can't upload from -
Solution: Move collection file into `documents`.
{{% /notice %}}

=== Setup Environment

1 - Click Manage Environments -> Add

2 - Set Environment name - Example: SuiteCRM V8 API Environment

3 - Fill table out as shown below:

.Manage Environments
|===
|VARIABLE |INITIAL VALUE |CURRENT VALUE

|suitecrm.url
|\http://{{IP ADDRESS}}/{{Your Instance}}/Api
|\http://{{IP ADDRESS}}/{{Your Instance}}/Api

|token.url
|\http://{{IP ADDRESS}}/{{Your Instance}}/Api/access_token
|\http://{{IP ADDRESS}}/{{Your Instance}}/Api/access_token
|===

-> Add

4 - Click Environment from the Drop down

image:change_environment.png[Changing Environment]


---
title: Managing Tokens
weight: 50
---

:imagesdir: /images/en/developer


The OAuth 2 admin panel displays which session have been successfully
created.

image:Admin-OAuth2Clients-3.png[Admin-OAuth2Clients-3.png,title="Admin-OAuth2Clients-3.png"]

You can also revoke or end an active session by selected the session and
then selecting "revoke token" in the action or bulk actions menu.

image:Screenshot_20180215_130855.png[Screenshot_20180215_130855.png,title="Screenshot_20180215_130855.png"]
