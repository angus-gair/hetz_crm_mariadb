FROM bitnami/suitecrm:latest

# Create the directory for the API keys with correct path, then generate keys and set permissions
RUN mkdir -p /bitnami/suitecrm/public/legacy/Api/V8/OAuth2 && \
    openssl genrsa -out /bitnami/suitecrm/public/legacy/Api/V8/OAuth2/private.key 2048 && \
    openssl rsa -in /bitnami/suitecrm/public/legacy/Api/V8/OAuth2/private.key -pubout -out /bitnami/suitecrm/public/legacy/Api/V8/OAuth2/public.key && \
    chmod 640 /bitnami/suitecrm/public/legacy/Api/V8/OAuth2/private.key && \
    chown daemon:daemon /bitnami/suitecrm/public/legacy/Api/V8/OAuth2/private.key /bitnami/suitecrm/public/legacy/Api/V8/OAuth2/public.key

# Add cache cleanup to resolve class loading issues
RUN rm -rf /bitnami/suitecrm/cache/* && \
    mkdir -p /bitnami/suitecrm/cache && \
    chown -R daemon:daemon /bitnami/suitecrm/cache

## Set Apache ports
ENV APACHE_HTTP_PORT_NUMBER=8080
ENV APACHE_HTTPS_PORT_NUMBER=8443

EXPOSE 8080 8443
