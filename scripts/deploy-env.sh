#!/bin/bash

# Vercel Environment Variable Deployment Script
# This script removes all existing environment variables and replaces them with .env.production values

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Vercel Environment Variable Deployment Script${NC}"
echo -e "${BLUE}================================================${NC}"

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

echo -e "${YELLOW}📋 Step 1: Getting current environment variables...${NC}"

# Get current environment variables
CURRENT_ENVS=$(vercel env ls --environment=production --format=json 2>/dev/null | jq -r '.[].name' 2>/dev/null || echo "")

if [ -n "$CURRENT_ENVS" ]; then
    echo -e "${YELLOW}🗑️  Step 2: Removing existing environment variables...${NC}"
    
    # Remove existing environment variables
    while read -r env_name; do
        if [ -n "$env_name" ]; then
            echo -e "   Removing: ${env_name}"
            vercel env rm "$env_name" --environment=production --yes || echo -e "${RED}   Failed to remove $env_name${NC}"
        fi
    done <<< "$CURRENT_ENVS"
else
    echo -e "${GREEN}✅ No existing environment variables found${NC}"
fi

echo -e "${YELLOW}📤 Step 3: Adding new environment variables from .env.production...${NC}"

# Read and process .env.production file
while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines and comments
    if [[ -n "$line" && ! "$line" =~ ^[[:space:]]*# ]]; then
        # Extract key and value
        if [[ "$line" =~ ^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"
            
            echo -e "   Adding: ${GREEN}${key}${NC}"
            
            # Add environment variable to Vercel
            echo "$value" | vercel env add "$key" --environment=production --stdin || {
                echo -e "${RED}   Failed to add $key${NC}"
            }
        fi
    fi
done < .env.production

echo -e "${GREEN}✅ Step 4: Environment variables deployment completed!${NC}"

echo -e "${YELLOW}🔄 Step 5: Triggering redeploy...${NC}"

# Trigger redeploy
vercel --prod || echo -e "${RED}❌ Redeploy failed. You may need to trigger it manually.${NC}"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📍 Your site: https://pita-melt-v2-tud6.vercel.app${NC}"

echo -e "\n${YELLOW}🧪 Test your environment variables:${NC}"
echo -e "   Visit: ${BLUE}https://pita-melt-v2-tud6.vercel.app/api/debug-env${NC}"

echo -e "\n${YELLOW}📋 Next steps:${NC}"
echo -e "   1. Wait for deployment to complete"
echo -e "   2. Test the debug endpoint above"
echo -e "   3. Try a payment on your site"
echo -e "   4. Remove the debug endpoint when done: ${RED}rm src/app/api/debug-env/route.ts${NC}"