#!/bin/sh
set -eu

RETAIN_DAYS=14
TARGET_HOUR=1

while true; do
  now_epoch=$(date +%s)
  next_epoch=$(date -d "today ${TARGET_HOUR}:00" +%s 2>/dev/null || true)
  if [ -z "${next_epoch}" ] || [ "${next_epoch}" -le "${now_epoch}" ]; then
    next_epoch=$(date -d "tomorrow ${TARGET_HOUR}:00" +%s)
  fi
  sleep $((next_epoch - now_epoch))

  stamp=$(date +%F)
  pg_dump -Fc -h db -U lkps -d lkps -f "/backups/lkps-${stamp}.dump"
  tar -czf "/backups/uploads-${stamp}.tar.gz" -C /data/uploads .
  find /backups -type f -mtime "+${RETAIN_DAYS}" -delete
done
