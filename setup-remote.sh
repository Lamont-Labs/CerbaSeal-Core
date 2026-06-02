#!/bin/bash
TOKEN="PASTE_YOUR_TOKEN_HERE"
git remote set-url origin https://$TOKEN@github.com/Lamont-Labs/CerbaSeal-Core.git
git push origin main
rm -- "$0"
