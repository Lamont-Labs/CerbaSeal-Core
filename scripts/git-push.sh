#!/bin/sh
# One-time push helper — uses the GITHUB_TOKEN Replit secret
# Run from the Shell tab: sh scripts/git-push.sh

TOKEN=$(printenv GITHUB_TOKEN)

if [ -z "$TOKEN" ]; then
  echo "ERROR: GITHUB_TOKEN is not set in this shell session."
  echo "Open the Replit Secrets panel, confirm GITHUB_TOKEN exists, then try again."
  exit 1
fi

echo "Token found. Updating remote and pushing..."

git remote set-url origin "https://${TOKEN}@github.com/Lamont-Labs/CerbaSeal-Core.git"
git push origin main

echo "Done."
