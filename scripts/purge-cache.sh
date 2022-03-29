#!/bin/bash
echo "Current time: $(date +%T)"
echo "Sleep 5s"
sleep 5
echo "Start purge cache"
curl "https://purge.jsdelivr.net/npm/altair-graphql-plugin-github-sync@latest/dist/style.css"
curl "https://purge.jsdelivr.net/npm/altair-graphql-plugin-github-sync@latest/dist/github-sync.umd.js"
curl "https://purge.jsdelivr.net/npm/altair-graphql-plugin-github-sync@latest/package.json"
curl "https://purge.jsdelivr.net/npm/altair-graphql-plugin-github-sync@latest/manifest.json"
curl "https://purge.jsdelivr.net/npm/altair-graphql-plugin-github-sync@latest/package-lock.json"
echo ""
echo "Caching purged"
