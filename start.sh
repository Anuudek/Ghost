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
# Cloudron injects CLOUDRON_APP_ORIGIN (full URL) and CLOUDRON_APP_DOMAIN
ORIGIN="${CLOUDRON_APP_ORIGIN:-}"
DOMAIN="${CLOUDRON_APP_DOMAIN:-}"
if [ -n "$ORIGIN" ]; then
    export url="$ORIGIN"
elif [ -n "$DOMAIN" ]; then
    export url="https://${DOMAIN}"
fi

export database__client=sqlite3
export database__connection__filename=/app/data/ghost.db
export paths__contentPath=/app/data/content
export logging__path=/app/data/content/logs

# Mail config — Cloudron email addon
# CLOUDRON_EMAIL_SMTP_SERVER=mail is the internal unauthenticated relay (port 2525, plain SMTP)
# CLOUDRON_MAIL_* vars are set when a real SMTP addon (Mailgun etc.) is configured
SMTP_SERVER="${CLOUDRON_MAIL_SMTP_SERVER:-${CLOUDRON_EMAIL_SMTP_SERVER:-}}"
if [ -n "$SMTP_SERVER" ]; then
    export mail__transport=SMTP
    export mail__from="${CLOUDRON_MAIL_FROM:-noreply@${DOMAIN:-localhost}}"
    export mail__options__host="$SMTP_SERVER"
    SMTP_USER="${CLOUDRON_MAIL_USERNAME:-}"
    if [ -n "$SMTP_USER" ]; then
        # External SMTP with credentials (Mailgun, SendGrid, etc.)
        export mail__options__port="${CLOUDRON_MAIL_SUBMISSION_PORT:-587}"
        export mail__options__secure=false
        export mail__options__auth__user="$SMTP_USER"
        export mail__options__auth__pass="${CLOUDRON_MAIL_PASSWORD:-}"
    else
        # Cloudron internal relay — plain SMTP, no auth, no TLS upgrade
        export mail__options__port="${CLOUDRON_EMAIL_SMTP_PORT:-2525}"
        export mail__options__secure=false
        export mail__options__ignoreTLS=true
    fi
fi

# Drop to ghost user and run Ghost
exec gosu ghost node index.js
