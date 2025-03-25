Thanks! I’ll gather information on how to create a Meeting record using the RESTful API in SuiteCRM 8.x, including required endpoints, request structure, and how to optionally include participants like Contacts or Users.
I’ll update you shortly with the full details.

# Creating a Meeting via SuiteCRM 8.x REST API

## 1. REST Endpoint URL for Creating a Meeting  
In SuiteCRM 8's JSON API (version 8), each module has a REST endpoint for CRUD operations. To create a Meeting record, you send a **POST** request to the Meetings module endpoint. The correct URL pattern is:  

```
POST {YOUR_SUITECRM_URL}/Api/V8/modules/Meetings 
```  

For example, if your SuiteCRM is at `https://crm.example.com`, the endpoint would be:  
```
POST https://crm.example.com/Api/V8/modules/Meetings
```  
This endpoint corresponds to the Meetings module in SuiteCRM 8 ([JSON API :: Docs](https://schema--suitecrm-docs.netlify.app/developer/api/version-8/json-api/#:~:text=POST%20api%2Fv8%2Fmodules%2FMeetings)). (Note: In SuiteCRM 8, if you are using the new front-end UI, the API is often served under a `/legacy` path. In such cases, use `/legacy/Api/V8/modules/Meetings` as the endpoint ([SuiteCRM 8.3 API - GET request works but not POST -  General Discussion - SuiteCRM](https://community.suitecrm.com/t/suitecrm-8-3-api-get-request-works-but-not-post/89710#:~:text=curl%20,com%3A8443%2Flegacy%2FApi%2FV8%2Fmodule%2FMeetings)) ([Module Record Creation via API V8 - SuiteCRM 8.6.x - ‍ Development Help - SuiteCRM](https://community.suitecrm.com/t/module-record-creation-via-api-v8-suitecrm-8-6-x/93643#:~:text=1,Sample%20Payload)).) 

## 2. Authentication Requirements (OAuth2 and Session)  
**OAuth2 Bearer Token:** SuiteCRM 8’s API **requires an authenticated session**, typically obtained via OAuth2 ([SuiteCRM 8 API Getting Access Token - ‍ Development Help - SuiteCRM](https://community.suitecrm.com/t/suitecrm-8-api-getting-access-token/84669#:~:text=Configure%20Authentication%3A%20Obtaining%20A%20Session,Configure)). Before calling the Meetings endpoint, you must request an access token from the SuiteCRM OAuth2 server (e.g. by POSTing to `/Api/access_token` with your client credentials and user credentials, using a supported grant type). Once you obtain the token, include it in the **Authorization** header as a Bearer token on every API request. For example:  

```
Authorization: Bearer <access_token_value>
```  

Using OAuth2 is the recommended approach for tools like Postman or any external integration. In the community example below, the user includes an OAuth2 token in the header to successfully authenticate:  

> `-H "Authorization: Bearer secret"` ([SuiteCRM 8.3 API - GET request works but not POST -  General Discussion - SuiteCRM](https://community.suitecrm.com/t/suitecrm-8-3-api-get-request-works-but-not-post/89710#:~:text=curl%20,com%3A8443%2Flegacy%2FApi%2FV8%2Fmodule%2FMeetings))  

**Session + CSRF Token (Alternative):** Alternatively, if you are calling the API from an existing logged-in session (for example, from the SuiteCRM 8 front-end or a browser session), you must use the session cookie **and** provide a CSRF token. SuiteCRM 8 enforces CSRF protection on API calls when using session authentication – failing to include a valid `X-CSRF-Token` header will result in a 403 “Invalid CSRF token” error ([Invalid CSRF Token when calling /api endpoints  · Issue #295 · salesagility/SuiteCRM-Core · GitHub](https://github.com/salesagility/SuiteCRM-Core/issues/295#:~:text=)). In practice, this means you would need to: 

- Obtain the CSRF token (e.g. from the login page or an API call that returns it) and include it as an `X-CSRF-Token` header.  
- Include the session cookie (usually done automatically if you’re using the same session as the web UI).  

However, for testing with tools like Postman, using the OAuth2 Bearer token method is much simpler and is the **preferred method** ([SuiteCRM 8 API Getting Access Token - ‍ Development Help - SuiteCRM](https://community.suitecrm.com/t/suitecrm-8-api-getting-access-token/84669#:~:text=Configure%20Authentication%3A%20Obtaining%20A%20Session,Configure)). 

## 3. Required and Optional Fields in the POST Body (Meeting)  
When creating a Meeting via the REST API, the request body must be in **JSON:API format** – i.e., a JSON object with a `data` section containing `type`, `attributes`, and (optionally) `relationships`. The **minimum required fields** for a Meeting are: 

- **name:** The meeting subject or title (string).  
- **date_start:** The start date/time of the meeting. This should be in a valid date-time format. SuiteCRM accepts dates in ISO 8601 format (e.g. `"2025-03-26T10:00:00+00:00"`) or the typical SQL format (`"YYYY-MM-DD HH:MM:SS"`).  

In addition, you need to specify the meeting’s duration or end time. You can do this in one of two ways: 

- Provide **duration_hours** and **duration_minutes** (integers) to indicate how long the meeting lasts ([SuiteCRM 8.3 API - GET request works but not POST -  General Discussion - SuiteCRM](https://community.suitecrm.com/t/suitecrm-8-3-api-get-request-works-but-not-post/89710#:~:text=%E2%80%9Ctype%E2%80%9D%3A%20%E2%80%9CMeeting%E2%80%9D%2C%20%E2%80%9Cattributes%E2%80%9D%3A%20,14%2009%3A00%3A00%E2%80%9D)). The system will calculate the `date_end` based on `date_start + duration`. For example, `duration_hours: 1` and `duration_minutes: 15` means a 1 hour 15 minute meeting ([SuiteCRM 8.3 API - GET request works but not POST -  General Discussion - SuiteCRM](https://community.suitecrm.com/t/suitecrm-8-3-api-get-request-works-but-not-post/89710#:~:text=%E2%80%9Ctype%E2%80%9D%3A%20%E2%80%9CMeeting%E2%80%9D%2C%20%E2%80%9Cattributes%E2%80%9D%3A%20,14%2009%3A00%3A00%E2%80%9D)).  
- **OR** provide an explicit **date_end** timestamp. If `date_end` is given, the duration fields can be set to match that span (or left as `0`/empty) ([JSON API :: Docs](https://schema--suitecrm-docs.netlify.app/developer/api/version-8/json-api/#:~:text=,)).  

Other fields are optional but can be included as needed: 

- **description:** Text description of the meeting (optional).  
- **location:** Location of the meeting (optional).  
- **status:** Meeting status (e.g. "Planned", "Held", "Not Held"). If not provided, it defaults to "Planned".  
- **assigned_user_id:** The ID of the user to assign the meeting to. If omitted, the meeting will by default be assigned to the user whose credentials are used (the API will use the token’s user as the assigned user) ([JSON API :: Docs](https://schema--suitecrm-docs.netlify.app/developer/api/version-8/json-api/#:~:text=,%5B)). You can also include `assigned_user_name` for clarity, but the essential part is the ID.  
- **parent_type**, **parent_id** and **parent_name:** These fields link the meeting to another record (Account, Contact, etc.) as the "Related To" parent. They are optional. However, note that in SuiteCRM 8.6.x there was a bug where if a Call/Meeting/Email had no parent record set, the detail view in the UI would appear blank ([Module Record Creation via API V8 - SuiteCRM 8.6.x - ‍ Development Help - SuiteCRM](https://community.suitecrm.com/t/module-record-creation-via-api-v8-suitecrm-8-6-x/93643#:~:text=The%20issue%20stems%20from%20a,attribute)). As a precaution, if you intend the meeting to relate to another module, set `parent_type` (e.g. "Accounts") and the corresponding `parent_id` (and optionally `parent_name`) in the attributes ([Module Record Creation via API V8 - SuiteCRM 8.6.x - ‍ Development Help - SuiteCRM](https://community.suitecrm.com/t/module-record-creation-via-api-v8-suitecrm-8-6-x/93643#:~:text=A%20possible%20fix%20for%20this,linked%20to%20its%20parent%20record)). This ensures the meeting is properly linked and avoids any UI issues. (If the meeting isn’t related to any record, you can leave these out – just be aware of the mentioned bug in certain versions.)  

Finally, **invitee relationships (participants)** are not passed as simple ID fields in `attributes` – they must be handled via the `relationships` section (see next section). You do *not* need to include invitees just to create the meeting, but if you want to add participants (users/contacts) at creation time, you will include them under `relationships` instead of as flat fields. 

## 4. Example POST Request Body to Create a Basic Meeting  
Below is an example JSON body for a basic meeting creation. This example includes the minimum fields (name, start time, duration) and an optional description. It does **not** include participants yet, for simplicity. You can use this format in Postman or cURL (be sure to set the `Content-Type: application/json` header). 

```json
{
  "data": {
    "type": "Meetings",
    "attributes": {
      "name": "API Test Meeting",
      "date_start": "2025-03-26T10:00:00+00:00",
      "duration_hours": 0,
      "duration_minutes": 30,
      "description": "This meeting was created via API."
    }
  }
}
```  

A few things to note in this payload: 

- The top-level has a `data` object. Inside it, `"type": "Meetings"` specifies the module. The type **must** match the module name (in plural form) used in the URL ([JSON API :: Docs](https://schema--suitecrm-docs.netlify.app/developer/api/version-8/json-api/#:~:text=,1)). In SuiteCRM’s JSON API, module names are typically capitalized (as defined in the CRM). Here we use `"Meetings"` to match the Meetings module. (Using `"Meeting"` instead would not be recognized – ensure it’s the correct plural module name ([SuiteCRM 8.3 API - GET request works but not POST -  General Discussion - SuiteCRM](https://community.suitecrm.com/t/suitecrm-8-3-api-get-request-works-but-not-post/89710#:~:text=,14%2009%3A00%3A00%E2%80%9D)).)  
- Under `attributes`, we provide the fields for the meeting. We included `name`, `date_start`, `duration_hours`, `duration_minutes`, and `description`. As discussed, `name` and `date_start` are essential, and either duration or an end date should be provided. In this example, `duration_hours: 0` and `duration_minutes: 30` define a 30-minute meeting. The format for date/time is ISO 8601 with timezone (UTC in this case).  
- We did not include `id` in the data; if you do not provide an `id`, SuiteCRM will generate a new unique ID for the record (alternatively, you could include `"id": ""` or omit it entirely – an empty id is treated as "create new").  
- We also did not explicitly set `assigned_user_id` here. That means the meeting will be assigned to the user whose OAuth token is used. If you wanted to assign it to someone else, you would include `assigned_user_id` (and likely ensure your user has permission to assign to others). 

This JSON structure is what you would put in the **raw body** of your POST request. In a cURL example, it would be passed after `-d`, and in Postman you would select “Raw” body with type JSON and paste this in. Ensure the syntax is correct (for instance, no trailing commas and proper quoting). For reference, here is a sample cURL (from the SuiteCRM forums) showing a similar JSON payload being sent to create a meeting ([SuiteCRM 8.3 API - GET request works but not POST -  General Discussion - SuiteCRM](https://community.suitecrm.com/t/suitecrm-8-3-api-get-request-works-but-not-post/89710#:~:text=curl%20,Meeting%E2%80%9D%2C%20%E2%80%9Cduration_hours%E2%80%9D%3A%20%E2%80%9C1%E2%80%9D%2C%20%E2%80%9Cduration_minutes%E2%80%9D%3A%20%E2%80%9C15%E2%80%9D)):

> ```bash
> curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <TOKEN>" \  
> -d '{  
>   "data": {  
>     "type": "Meeting",  
>     "attributes": {  
>       "name": "Internal Meeting",  
>       "duration_hours": "1",  
>       "duration_minutes": "15",  
>       "date_start": "2023-07-14 09:00:00"  
>     }  
>   }  
> }' https://yourcrm/Api/V8/modules/Meetings
> ```  

*(Note: In the above example from the forum, the user originally had a minor JSON syntax error – a trailing comma – which we have omitted here. The corrected JSON format as shown will work ([SuiteCRM 8.3 API - GET request works but not POST -  General Discussion - SuiteCRM](https://community.suitecrm.com/t/suitecrm-8-3-api-get-request-works-but-not-post/89710#:~:text=Double%20check%20your%20token%20header,error%20comes%20from%20decoding%20JWT)).)*

## 5. Adding Participants (Users/Contacts) as Meeting Attendees  
If you want to invite other users or contacts to the meeting (i.e., make them participants/attendees), you should use the **relationships** section of the JSON payload. This can be done either at the time of creation (by including a `relationships` object in your POST data) or after creation (by making a separate API call to add relationships). The key is that invitations in SuiteCRM are represented as many-to-many relationships (Meetings ↔ Users, and Meetings ↔ Contacts), which include an **accept status** for each invitee. 

**Including invitees during creation:** You can add a `relationships` object in the same JSON POST when creating the meeting. For example: 

```json
{
  "data": {
    "type": "Meetings",
    "attributes": {
      "name": "Project Kickoff",
      "date_start": "2025-03-30T09:00:00+00:00",
      "duration_hours": 1,
      "duration_minutes": 0,
      "description": "Kickoff meeting with team and client."
    },
    "relationships": {
      "users": {
        "data": [
          {
            "id": "a1b2c3d4-e5f6-...-userGUID1",
            "type": "Users",
            "meta": {
              "middle_table": {
                "data": {
                  "type": "Link",
                  "attributes": {
                    "accept_status": "accept",
                    "user_id": "a1b2c3d4-e5f6-...-userGUID1"
                  }
                }
              }
            }
          }
        ]
      },
      "contacts": {
        "data": [
          {
            "id": "z9y8x7w6-v5u4-...-contactGUID1",
            "type": "Contacts",
            "meta": {
              "middle_table": {
                "data": {
                  "type": "Link",
                  "attributes": {
                    "accept_status": "none",
                    "contact_id": "z9y8x7w6-v5u4-...-contactGUID1"
                  }
                }
              }
            }
          }
        ]
      }
    }
  }
}
```  

In the above example, we added one user and one contact as invitees: 

- Under `relationships["users"]["data"]` we list user records to relate. Each entry has the user’s ID (`id`) and `"type": "Users"`. The `meta` section carries the relationship-specific data. In SuiteCRM, the **meetings_users** relationship table has an **accept_status** field (and also stores the meeting and user IDs). We therefore include a `"middle_table"` object with a `"data"` entry of type `"Link"`, where `attributes.accept_status` is set (e.g., "accept" for the user who is organizing or already accepted, or "none" if no response). We also include the `user_id` in that meta, which should match the user’s ID ([JSON API :: Docs](https://schema--suitecrm-docs.netlify.app/developer/api/version-8/json-api/#:~:text=,%7D)). (Including the `user_id` inside the meta may seem redundant, but the API requires it to properly create the link record.)  
- Similarly, under `relationships["contacts"]["data"]` we list any contacts to invite. We use `"type": "Contacts"` and in the meta’s attributes use `contact_id` with an accept_status. In this case we set `"accept_status": "none"` for the contact, indicating no response yet. 

You can invite multiple users or contacts by adding multiple objects in the respective arrays. The **accept_status** can typically be `"accept"`, `"none"`, `"tentative"`, or `"decline"` – use `"accept"` if the invitee has accepted or if you want to mark the assigned user as attending, and use `"none"` for new invitees who haven’t responded ([JSON API :: Docs](https://schema--suitecrm-docs.netlify.app/developer/api/version-8/json-api/#:~:text=,)) ([JSON API :: Docs](https://schema--suitecrm-docs.netlify.app/developer/api/version-8/json-api/#:~:text=,)). 

**Important:** When adding multiple invitees, ensure each one has its own `meta.middle_table` data with the correct IDs. The SuiteCRM docs note: *“Please ensure that you include the meta middle table in each link in the relationship; otherwise it will set all the middle table fields to the first meta object.”* ([JSON API :: Docs](https://schema--suitecrm-docs.netlify.app/developer/api/version-8/json-api/#:~:text=)) In other words, each invitee relationship needs its own accept status, or they might all inherit the same status accidentally. 

**Adding participants after creation:** Alternatively, you can first create the meeting (with no relationships in the initial payload), then add participants via the relationships API. SuiteCRM’s JSON API allows managing relationships with endpoints like:  

```
POST /Api/V8/modules/Meetings/{meeting_id}/relationships/users
``` 
```
POST /Api/V8/modules/Meetings/{meeting_id}/relationships/contacts
``` 

For instance, to add a user to an existing meeting, you would POST to `/Meetings/{id}/relationships/users` with a body containing that user’s ID and the `accept_status` meta. The payload format for that would be similar to one element of the array above, e.g.: 

```json
{
  "data": {
    "id": "a1b2c3d4...userGUID1",
    "type": "Users",
    "meta": {
      "middle_table": {
        "data": {
          "type": "Link",
          "attributes": {
            "accept_status": "accept",
            "user_id": "a1b2c3d4...userGUID1"
          }
        }
      }
    }
  }
}
``` 

This approach uses the **relationships sub-resource** as documented (the JSON API allows POSTing to a relationships URL to create a link ([JSON API :: Docs](https://schema--suitecrm-docs.netlify.app/developer/api/version-8/json-api/#:~:text=))). In practice, doing it in the initial create (as in the first example) or via a follow-up call achieves the same result in the database. Just remember to include the `meta` with `accept_status` either way, because simply linking a user without an accept status may not show up as expected in the UI ([How to add user to meeting using v8 JSON API -  General Discussion - SuiteCRM](https://community.suitecrm.com/t/how-to-add-user-to-meeting-using-v8-json-api/77826#:~:text=meeting%20%28V8%2Fmodule%2FMeetings%2Fxxx%2Frelationships%20,meetings_users%20with%20that%20meeting%20id)) ([How to add user to meeting using v8 JSON API -  General Discussion - SuiteCRM](https://community.suitecrm.com/t/how-to-add-user-to-meeting-using-v8-json-api/77826#:~:text=Somebody%20must%20know%20how%20to,add%20a%20user%20to%20a)). 

## 6. Headers, Request Format, and Postman Considerations  
When using the SuiteCRM 8 API, be mindful of the following headers and format requirements:

- **Content-Type:** Always set `Content-Type: application/json` for your POST (and PATCH) requests, as you’ll be sending JSON data ([SuiteCRM 8.3 API - GET request works but not POST -  General Discussion - SuiteCRM](https://community.suitecrm.com/t/suitecrm-8-3-api-get-request-works-but-not-post/89710#:~:text=curl%20,com%3A8443%2Flegacy%2FApi%2FV8%2Fmodule%2FMeetings)). In Postman, selecting “Body -> raw -> JSON” will typically add this header for you.  
- **Authorization:** If using OAuth2, include the `Authorization: Bearer <token>` header with your access token on **every** request ([SuiteCRM 8.3 API - GET request works but not POST -  General Discussion - SuiteCRM](https://community.suitecrm.com/t/suitecrm-8-3-api-get-request-works-but-not-post/89710#:~:text=curl%20,com%3A8443%2Flegacy%2FApi%2FV8%2Fmodule%2FMeetings)). (In Postman, you can store the token in an environment variable and use it in the header, or use the built-in OAuth2 feature to handle the token.)  
- **CSRF Token (if not using OAuth):** If you are using session authentication (not common for API testing, but possible in an integrated scenario), you must include an `X-CSRF-Token` header with the token value. Without it, the SuiteCRM backend will likely reject the request (even GETs) due to CSRF protection ([Invalid CSRF Token when calling /api endpoints  · Issue #295 · salesagility/SuiteCRM-Core · GitHub](https://github.com/salesagility/SuiteCRM-Core/issues/295#:~:text=)). Typically, you would retrieve the CSRF token by loading the login page or an endpoint that provides it and then use that for subsequent calls. For Postman usage, however, it’s easier to avoid this by using OAuth2.  
- **JSON:API format:** Remember that the API expects JSON:API formatted data. This means your POST body **must** be wrapped in the `data` object with `type` and `attributes`. Do not send the field JSON at the root level. For example, sending `{"name": "Meeting1", "date_start": "...", ...}` without the wrapping structure will not work. Always nest under `{"data": {"type": "Meetings", "attributes": {...} } }` ([SuiteCRM 8.3 API - GET request works but not POST -  General Discussion - SuiteCRM](https://community.suitecrm.com/t/suitecrm-8-3-api-get-request-works-but-not-post/89710#:~:text=,14%2009%3A00%3A00%E2%80%9D)). The examples above follow the correct format.  
- **Copy-paste readiness:** The examples provided are formatted in valid JSON. When testing in Postman, copy the JSON exactly as shown (adjusting values as needed). Ensure quotes are straight quotes (`"`), not fancy curly quotes (if copying from some sources). Also remove any trailing commas if you add or remove lines. Postman will highlight JSON syntax errors if something is off.  
- **Postman environment setup:** It can be helpful to set up a Postman environment with variables for your instance URL and authentication. For example, define a variable `base_url = https://yourdomain/legacy/Api` (or whatever your base API path is) and `access_token = <your_token>`. Then you can use `{{base_url}}/V8/modules/Meetings` in the request URL and `Bearer {{access_token}}` in the header. The official SuiteCRM documentation provides a Postman collection and environment template for the V8 API ([SuiteCRM 8 API Getting Access Token - ‍ Development Help - SuiteCRM](https://community.suitecrm.com/t/suitecrm-8-api-getting-access-token/84669#:~:text=Hi%2C%20Im%20new%20to%20API,on%20Api%2Fdocs%2Fpostman%20and%20the%20environments)), which can simplify setup. Just remember to update the variables with your actual URL, client ID/secret, user credentials, etc., and perform the OAuth token request first.  
- **SSL/Certificates:** If your SuiteCRM is using HTTPS with a self-signed certificate (common in dev environments), Postman may block the call. You can toggle “SSL certificate verification” off in Postman settings or add the certificate to trust store. This isn’t SuiteCRM-specific, but it’s a common hurdle when testing APIs.  
- **Response format:** The API will return JSON responses. On success, creating a record will usually return a 201 status and a JSON response containing the new record’s data. If something is wrong (authentication, CSRF, validation error), you will get an error JSON. For instance, an auth failure might return an `access_denied` error ([SuiteCRM 8.3 API - GET request works but not POST -  General Discussion - SuiteCRM](https://community.suitecrm.com/t/suitecrm-8-3-api-get-request-works-but-not-post/89710#:~:text=However%2C%20If%20I%20do%20a,meeting%2C%20I%20get%20an%20error)). Always check the response body for error messages if the status isn’t 2xx.  

By following the above guidelines and using the provided endpoint and JSON format, you should be able to successfully create Meeting records in SuiteCRM 8 via the REST API. The examples are ready to be used – you can plug in your actual data (e.g. replace the IDs, dates, etc.) and test in Postman or cURL. Make sure your OAuth token is valid and included, and you’ll get your new meeting record created in SuiteCRM 8. Good luck!

**Sources:** SuiteCRM 8 Developer Guide and JSON API documentation ([JSON API :: Docs](https://schema--suitecrm-docs.netlify.app/developer/api/version-8/json-api/#:~:text=POST%20api%2Fv8%2Fmodules%2FMeetings)) ([JSON API :: Docs](https://schema--suitecrm-docs.netlify.app/developer/api/version-8/json-api/#:~:text=,Link)), SuiteCRM Community Forum discussions on using the V8 API for Meetings ([SuiteCRM 8.3 API - GET request works but not POST -  General Discussion - SuiteCRM](https://community.suitecrm.com/t/suitecrm-8-3-api-get-request-works-but-not-post/89710#:~:text=curl%20,com%3A8443%2Flegacy%2FApi%2FV8%2Fmodule%2FMeetings)) ([Module Record Creation via API V8 - SuiteCRM 8.6.x - ‍ Development Help - SuiteCRM](https://community.suitecrm.com/t/module-record-creation-via-api-v8-suitecrm-8-6-x/93643#:~:text=The%20issue%20stems%20from%20a,attribute)).