FROM bitnami/suitecrm:latest

# Add cache cleanup to resolve class loading issues
RUN rm -rf /bitnami/suitecrm/cache/* && \
    rm -rf /bitnami/suitecrm/public/legacy/cache/* && \
    mkdir -p /bitnami/suitecrm/cache /bitnami/suitecrm/public/legacy/cache && \
    chown -R daemon:daemon /bitnami/suitecrm/cache /bitnami/suitecrm/public/legacy/cache && \
    chmod -R 775 /bitnami/suitecrm/cache /bitnami/suitecrm/public/legacy/cache

# Create OAuth directory with correct permissions
RUN mkdir -p /bitnami/suitecrm/public/legacy/Api/V8/OAuth2 && \
    chown -R daemon:daemon /bitnami/suitecrm/public/legacy/Api/V8/OAuth2 && \
    chmod -R 775 /bitnami/suitecrm/public/legacy/Api/V8/OAuth2

# Set Apache ports
ENV APACHE_HTTP_PORT_NUMBER=8080
ENV APACHE_HTTPS_PORT_NUMBER=8443

EXPOSE 8080 8443