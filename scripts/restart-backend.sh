#!/bin/bash
pm2 restart hpo-backend
echo "✅ Backend reiniciado com correção ORCID!"
pm2 status
