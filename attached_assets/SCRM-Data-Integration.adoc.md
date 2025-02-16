---
title: SuiteCRM Data Integration
weight: 20
---

:imagesdir: /images/en/admin

= SuiteCRM Data Integration

SuiteCRM Data Integration is an Extract, Transform and Load (ETL) solution that connects to an existing 
SuiteCRM installation to extract source data from the MySQL database and load that into the Data Warehouse, 
that has been optimised for analytical functions. SuiteCRM Data Integration can be installed as a stand-alone 
solution and can be used with other reporting tools if desired.

== Downloading & Installing SuiteCRM Data Integration

SuiteCRM Data Integration requires the following pre-requisites installed on your server

* Linux environment
* OpenJDK 8 JRE (Java)
* wget
* unzip
* zip
* Mysql server + an empty MySQL database

There are two ways of downloading the SuiteCRM Data Integration.

* https://suitecrm.com/resources/suitecrm-analytics-tool[Download from SuiteCRM website^]: a pre-built 
package containing installation scripts, web server and all the third party open source libraries required.
* Clone the SuiteCRM Data Integration repo: a script to build the SuiteCRM data integration package 
(generating the same available package via the SuiteCRM website).

=== Manually Build the package (cloning from repo)

Clone repo via terminal:

[source,bash]
----
git clone https://github.com/ivylabs/suitecrm-data-integration
----

Navigate into the newly clone repository's directory and run `build.sh`.

[source,bash]
----
./build.sh
----

This should output on your terminal all the files that the solution downloads and zips up into a package.
The end of the script will ask if you wish to delete the installation files.

[source,bash]
----
Would you like to remove the installation files? This will save disk space. [y/N] y

-------------------------------------------------------------

 Build is complete!

-------------------------------------------------------------
----

This will generate a package named `suitecrm-data-integration-server.zip` within the root of your directory. 
This is the same package available via the SuiteCRM website.

=== Configuring SuiteCRM Data Integration

After downloading or generating the `suitecrm-data-integration-server.zip` file, **Upload** and **extract** this 
file on a hosted web server.

Navigate into the newly extracted `suitecrm-data-integration-server` folder and edit the `install.properties`.

[source,bash]
----
# Java Virtual Memory allocation
JVM_SIZE=1024
# SuiteCRM Source Database Connection Details
SUITECRM_HOST=127.0.0.1
SUITECRM_PORT=3306
SUITECRM_DATABASE=suitecrm_testdata
SUITECRM_USERNAME=suitecrmrootuser
SUITECRM_PASSWORD=suitecrmrootuserpassword
# SuiteCRM Analytis Target Database Connection
SUITECRM_ANALYTICS_HOST=127.0.0.1
SUITECRM_ANALYTICS_PORT=3306
SUITECRM_ANALYTICS_DATABASE=suitecrm_dwh
SUITECRM_ANALYTICS_USERNAME=suitecrmrootuser
SUITECRM_ANALYTICS_PASSWORD=suitecrmrootuserpassword
# Enable SMTP email functionality
SMTP_ENABLED=0
# SMTP Server Details
SMTP_HOSTNAME=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_AUTHENTICATION=1
SMTP_USERNAME=user@suitecrm-analytics.co.uk
SMTP_PASSWORD=password
#SMTP_SECURE_AUTHENTICATION=
#SMTP_SECURE_AUTHENTICATION=SSL
SMTP_SECURE_AUTHENTICATION=TLS
# Email address that SuiteCRM Analytics sends from
SMTP_FROM_EMAIL_ADDRESS=donotreply@suitecrm-analytics.co.uk
SMTP_FROM_EMAIL_NAME=SuiteCRM Analytics
# Email addresses seperated by spaces that error emails are delivered to
SMTP_SEND_ERROR_EMAILS_TO=user@suitecrm-analytics.co.uk
# Set this to 1 or zero. Setting it to 1 means that you will get an email for every sucessful run on the ETL
SMTP_SEND_SUCCESS_EMAILS=1
# Email addresses seperated by spaces that success emails are delivered to
SMTP_SEND_SUCCESS_EMAILS_TO=user@suitecrm-analytics.co.uk user123@suitecrm-analytics.co.uk

----

These config variables define the connection to your SuiteCRM database to extract information from.

[source,bash]
----
# SuiteCRM Source Database Connection Details
SUITECRM_HOST=127.0.0.1
SUITECRM_PORT=3306
SUITECRM_DATABASE=suitecrm_testdata
SUITECRM_USERNAME=suitecrmrootuser
SUITECRM_PASSWORD=suitecrmrootuserpassword
----

These config variables define the connection to your SuiteCRM Data Integration to transform and load 
the extracted SuiteCRM data into.

{{% notice note %}}
Remember to create a new MySQL database for the SuiteCRM Data Integration data warehouse.
{{% /notice %}}

[source,bash]
----
# SuiteCRM Analytis Target Database Connection
SUITECRM_ANALYTICS_HOST=127.0.0.1
SUITECRM_ANALYTICS_PORT=3306
SUITECRM_ANALYTICS_DATABASE=suitecrm_dwh
SUITECRM_ANALYTICS_USERNAME=suitecrmrootuser
SUITECRM_ANALYTICS_PASSWORD=suitecrmrootuserpassword
----

The SMTP config variables will define the connection to an email mail client to send out notifications 
on the status of the extraction script (success or failure). These are optional.

== Installing SuiteCRM Data Integration

Once the configuration has been defined, now run the setup script within the same root directory of 
your `suitecrm-data-integration`.

[source,bash]
----
./setup-suitecrm-data-integration.sh
----

This will check the connection of your databases and create the tables required to extract your SuiteCRM data.

Then you can run the SuiteCRM Data Integration script to extract and transform your data.

[source,bash]
----
./run-suitecrm-data-integration.sh
----

This should output on your terminal all logging referring to the extracting, transforming and loading data 
into the data warehouse tables.

The solution currently extracts data from the following modules:

* Accounts
* Campaigns
* Cases
* Contacts
* Invoices
* Leads
* Opportunities
* Products/Product Categories
* Users
* Custom Fields from Cases,Leads

This is the end of the SuiteCRM Data Integration installation. If you wish to know more about Pentaho ETL 
solutions you can visit the https://wiki.pentaho.com/display/EAI/Spoon+User+Guide[Spoon user guide^].
This solution includes a pre-packaged spoon client that you can run via terminal.

[source,bash]
----
./data-integration-client.sh
----



---
title: SuiteCRM Web Analytics
weight: 30
---

:imagesdir: /images/en/admin

= SuiteCRM Web Analytics

SuiteCRM Web Analytics is a web based analysis and reporting frontend that allows users to explore data 
in the Data Warehouse that has been extracted from SuiteCRM and third party data sources.

Users are able to log into the web portal to run, filter data or schedule reports. The web portal provides 
the ability to import new reports and dashboards created using Pentaho powerful CTools and Report Designer. 
Reports can support a number of different visual charts and output types such as HTML, PDF and Excel.

== Downloading & Installing SuiteCRM Web Analytics

SuiteCRM Web Analytics requires the following pre-requisites installed on your server

* Linux environment
* OpenJDK 8 JRE (Java)
* wget
* unzip
* zip

{{% notice note %}}
SuiteCRM Web Analytics requires the SuiteCRM Data Integration solution pre-installed and executed.
{{% /notice %}}

There are two ways of downloading the SuiteCRM Web Analytics.

* https://suitecrm.com/resources/suitecrm-analytics-tool[Download from SuiteCRM website^]: a pre-built 
package containing installation scripts, web server and all the third party open source libraries required.
* Clone the SuiteCRM Web Analytics repo: a script to build the SuiteCRM web analytics package 
(generating the same available package via the SuiteCRM website).

=== Manually Build the package (cloning from repo)

Clone repo via terminal:

[source,bash]
----
git clone https://github.com/ivylabs/suitecrm-analytics
----

Navigate into the newly cloned repository's directory and run build.sh

[source,bash]
----
./build.sh
----

This should output on your terminal all the files that the solution downloads and zips up into a package.
The end of the script will ask if you wish to delete the installation files.

[source,bash]
----
Would you like to remove the installation files? This will save disk space. [y/N] y

-------------------------------------------------------------

 Build is complete!

-------------------------------------------------------------
----

This will generate a package named **suitecrm-analytics-server.zip** within the root of your directory. 
This is the same package available via the SuiteCRM website.


=== Configuring SuiteCRM Data Integration

After downloading or generating the `suitecrm-analytics-server.zip´ file, **Upload** and **extract** this 
file on a hosted web server.

Navigate into the newly extracted `suitecrm-analytics-server` folder and edit the `install.properties`.

[source,bash]
----
JVM_SIZE=1024
SUITECRM_HOST=127.0.0.1
SUITECRM_PORT=3306
SUITECRM_DATABASE=suitecrm_testdata
SUITECRM_USERNAME=suitecrmrootuser
SUITECRM_PASSWORD=suitecrmrootuserpassword
SUITECRM_ANALYTICS_HOST=127.0.0.1
SUITECRM_ANALYTICS_PORT=3306
SUITECRM_ANALYTICS_DATABASE=suitecrm_dwh
SUITECRM_ANALYTICS_USERNAME=suitecrmrootuser
SUITECRM_ANALYTICS_PASSWORD=suitecrmrootuserpassword
# DO NOT CHANGE FROM PORT 8080! There is a bug with uploading the solution when the port is changed
SUITECRM_ANALYTICS_WEBAPP_PORT=8080
----

These config variables define the connection to your SuiteCRM database to extract information from.

[source,bash]
----
# SuiteCRM Source Database Connection Details
SUITECRM_HOST=127.0.0.1
SUITECRM_PORT=3306
SUITECRM_DATABASE=suitecrm_testdata
SUITECRM_USERNAME=suitecrmrootuser
SUITECRM_PASSWORD=suitecrmrootuserpassword
----

These config variables define the connection to your SuiteCRM data warehouse (created by the 
SuiteCRM Data Integration solution) to retrieve your transformed SuiteCRM data.

[source,bash]
----
# SuiteCRM Analytis Target Database Connection
SUITECRM_ANALYTICS_HOST=127.0.0.1
SUITECRM_ANALYTICS_PORT=3306
SUITECRM_ANALYTICS_DATABASE=suitecrm_dwh
SUITECRM_ANALYTICS_USERNAME=suitecrmrootuser
SUITECRM_ANALYTICS_PASSWORD=suitecrmrootuserpassword
----

=== Installing SuiteCRM Web Analytics

Once the configuration has been defined, now run the setup script within the same root directory of 
your suitecrm-analytics-server.

[source,bash]
----
./setup-suitecrm-analytics.sh
----

This will check that the web server can successfully run and the database connections are successful.

Then you can run the SuiteCRM Web Analytics web server to access the application.

[source,bash]
----
./start-suitecrm-analytics.sh
----

This should output on your terminal that the tomcat server has started.

To follow the web server logs you can run this command:

[source,bash]
----
tail -f tomcat/logs/catalina.out
----

To confirm the server has successfully started look for the following line in the above log file 
with `N` as a dynamic number depending on how quickly the server initialised.

[source,bash]
----
org.apache.catalina.startup.Catalina.start Server startup in N ms
----

Once the server has initialised you can log into the SuiteCRM Analytics Web Application by navigating 
to the hostname or IP address of the server in your web browser.
By default the web application is listening on port `8080` so for example, your server may be 
available on `http://localhost:8080/suitecrmanalytics`.

Check out the link:../../../user/suitecrm-analytics/1.1/scrm-analytics-getting-started[SuiteCRM Analytics User Guide] for 
more information on the application.







