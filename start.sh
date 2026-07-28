#!/bin/bash
set -eu

# Runs as root — create /app/data dirs and chown to ghost before dropping privileges
mkdir -p /app/data/content/images \
         /app/data/content/themes \
         /app/data/content/files \
         /app/data/content/media \
         /app/data/content/logs
chown -R ghost:ghost /app/data

# Copy default themes if not present
if [ ! -d /app/data/content/themes/casper ]; then
    cp -r /home/ghost/base_content/themes/casper /app/data/content/themes/casper
    chown -R ghost:ghost /app/data/content/themes/casper
fi
if [ -d /home/ghost/base_content/themes/source ] && [ ! -d /app/data/content/themes/source ]; then
    cp -r /home/ghost/base_content/themes/source /app/data/content/themes/source
    chown -R ghost:ghost /app/data/content/themes/source
fi

# Ghost config via environment variables (__ = nested key separator)
export url="https://${CLOUDRON_APP_FQDN}"
export database__client=sqlite3
export database__connection__filename=/app/data/ghost.db
export paths__contentPath=/app/data/content
export logging__path=/app/data/content/logs

# Mail config from Cloudron email addon
export mail__transport=SMTP
export mail__from="${CLOUDRON_MAIL_FROM:-noreply@${CLOUDRON_APP_FQDN}}"
export mail__options__host="${CLOUDRON_MAIL_SMTP_SERVER:-localhost}"
export mail__options__port="${CLOUDRON_MAIL_SUBMISSION_PORT:-587}"
export mail__options__auth__user="${CLOUDRON_MAIL_USERNAME:-}"
export mail__options__auth__pass="${CLOUDRON_MAIL_PASSWORD:-}"
export mail__options__secure=false

# Drop to ghost user and run Ghost
exec gosu ghost node index.js
