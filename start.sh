#!/bin/bash

# Runs as root — create /app/data dirs and chown to ghost before dropping privileges
mkdir -p /app/data/content/images \
         /app/data/content/themes \
         /app/data/content/files \
         /app/data/content/media \
         /app/data/content/logs
chown -R ghost:ghost /app/data

# Copy default themes if not present (non-fatal)
if [ ! -d /app/data/content/themes/casper ] && [ -d /home/ghost/base_content/themes/casper ]; then
    cp -r /home/ghost/base_content/themes/casper /app/data/content/themes/casper
    chown -R ghost:ghost /app/data/content/themes/casper
fi
if [ ! -d /app/data/content/themes/source ] && [ -d /home/ghost/base_content/themes/source ]; then
    cp -r /home/ghost/base_content/themes/source /app/data/content/themes/source
    chown -R ghost:ghost /app/data/content/themes/source
fi

# Ghost config via environment variables (__ = nested key separator)
FQDN="${CLOUDRON_APP_FQDN:-}"
if [ -n "$FQDN" ]; then
    export url="https://${FQDN}"
fi

# Write production config — overrides Ghost's default server.host=127.0.0.1
# (env var server__host alone is unreliable due to nconf object-merge semantics)
cat > /home/ghost/config.production.json << 'GHOSTCONFIG'
{
    "server": {
        "host": "0.0.0.0",
        "port": 2368
    },
    "logging": {
        "transports": ["stdout", "file"]
    }
}
GHOSTCONFIG

export server__host=0.0.0.0
export database__client=sqlite3
export database__connection__filename=/app/data/ghost.db
export paths__contentPath=/app/data/content
export logging__path=/app/data/content/logs

# Mail config from Cloudron email addon (all optional — Ghost starts without email)
SMTP_SERVER="${CLOUDRON_MAIL_SMTP_SERVER:-}"
if [ -n "$SMTP_SERVER" ]; then
    export mail__transport=SMTP
    export mail__from="${CLOUDRON_MAIL_FROM:-noreply@${FQDN:-localhost}}"
    export mail__options__host="$SMTP_SERVER"
    export mail__options__port="${CLOUDRON_MAIL_SUBMISSION_PORT:-587}"
    export mail__options__auth__user="${CLOUDRON_MAIL_USERNAME:-}"
    export mail__options__auth__pass="${CLOUDRON_MAIL_PASSWORD:-}"
    export mail__options__secure=false
fi

# Drop to ghost user and run Ghost
exec gosu ghost node index.js
