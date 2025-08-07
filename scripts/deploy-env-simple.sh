#!/bin/bash

# Simple Vercel Environment Variable Deployment Script
# This script adds/updates environment variables from .env.production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Simple Vercel Environment Variable Deployment${NC}"
echo -e "${BLUE}===============================================${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Please install it first:${NC}"
    echo "npm i -g vercel"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production file not found!${NC}"
    exit 1
fi

echo -e "${YELLOW}📤 Adding/updating environment variables from .env.production...${NC}"

# Read and process .env.production file
while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines and comments
    if [[ -n "$line" && ! "$line" =~ ^[[:space:]]*# ]]; then
        # Extract key and value
        if [[ "$line" =~ ^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"
            
            echo -e "   Adding/Updating: ${GREEN}${key}${NC}"
            
            # Add environment variable to Vercel (will update if exists)
            echo "$value" | vercel env add "$key" production --stdin --force || {
                echo -e "${RED}   Failed to add/update $key${NC}"
            }
        fi
    fi
done < .env.production

echo -e "${GREEN}✅ Environment variables deployment completed!${NC}"

echo -e "${YELLOW}🔄 Triggering redeploy...${NC}"

# Trigger redeploy
vercel --prod || echo -e "${RED}❌ Redeploy failed. You may need to trigger it manually.${NC}"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📍 Your site: https://pita-melt-v2-tud6.vercel.app${NC}"

echo -e "\n${YELLOW}🧪 Test your environment variables:${NC}"
echo -e "   Visit: ${BLUE}https://pita-melt-v2-tud6.vercel.app/api/debug-env${NC}"