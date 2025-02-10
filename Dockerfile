FROM bitnami/suitecrm:latest

# Create the directory for the API keys with correct path, then generate keys and set permissions
RUN mkdir -p /bitnami/suitecrm/public/legacy/Api/V8/OAuth2 && \
    openssl genrsa -out /bitnami/suitecrm/public/legacy/Api/V8/OAuth2/private.key 2048 && \
    openssl rsa -in /bitnami/suitecrm/public/legacy/Api/V8/OAuth2/private.key -pubout -out /bitnami/suitecrm/public/legacy/Api/V8/OAuth2/public.key && \
    chmod 640 /bitnami/suitecrm/public/legacy/Api/V8/OAuth2/private.key && \
    chmod 644 /bitnami/suitecrm/public/legacy/Api/V8/OAuth2/public.key && \
    chown -R daemon:daemon /bitnami/suitecrm/public/legacy/Api/V8/OAuth2

# Add cache cleanup to resolve class loading issues
RUN rm -rf /bitnami/suitecrm/cache/* && \
    rm -rf /bitnami/suitecrm/public/legacy/cache/* && \
    mkdir -p /bitnami/suitecrm/cache /bitnami/suitecrm/public/legacy/cache && \
    chown -R daemon:daemon /bitnami/suitecrm/cache /bitnami/suitecrm/public/legacy/cache && \
    chmod -R 775 /bitnami/suitecrm/cache /bitnami/suitecrm/public/legacy/cache

# Set Apache ports
ENV APACHE_HTTP_PORT_NUMBER=8080
ENV APACHE_HTTPS_PORT_NUMBER=8443

EXPOSE 8080 8443