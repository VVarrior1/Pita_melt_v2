#!/usr/bin/env node

const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function parseEnvFile(filePath) {
  const envVars = {};
  const content = fs.readFileSync(filePath, 'utf8');
  
  content.split('\n').forEach(line => {
    line = line.trim();
    // Skip empty lines and comments
    if (line && !line.startsWith('#')) {
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (match) {
        envVars[match[1]] = match[2];
      }
    }
  });
  
  return envVars;
}

async function addEnvVar(key, value) {
  return new Promise((resolve) => {
    const child = spawn('vercel', ['env', 'add', key, 'production'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      resolve({ code, output, errorOutput });
    });

    // Send the value when prompted
    setTimeout(() => {
      child.stdin.write(value + '\n');
      child.stdin.end();
    }, 1000);
  });
}

async function main() {
  log('blue', '🚀 Node.js Vercel Environment Variable Deployment');
  log('blue', '=================================================');

  const envFile = '.env.production';
  
  if (!fs.existsSync(envFile)) {
    log('red', '❌ .env.production file not found!');
    process.exit(1);
  }

  log('yellow', '📤 Reading environment variables from .env.production...');
  
  const envVars = parseEnvFile(envFile);
  const keys = Object.keys(envVars);
  
  log('yellow', `📋 Found ${keys.length} environment variables`);

  for (const key of keys) {
    const value = envVars[key];
    log('green', `   Adding/Updating: ${key}`);
    
    const result = await addEnvVar(key, value);
    
    if (result.code !== 0) {
      log('red', `   ❌ Failed to add ${key}: ${result.errorOutput}`);
    } else {
      log('green', `   ✅ Successfully added ${key}`);
    }
  }

  log('green', '✅ Environment variables deployment completed!');
  
  log('yellow', '🔄 Triggering redeploy...');
  
  // Trigger redeploy
  const deployProcess = spawn('vercel', ['--prod'], {
    stdio: 'inherit'
  });
  
  deployProcess.on('close', (code) => {
    if (code === 0) {
      log('green', '🎉 Deployment completed successfully!');
      log('blue', '📍 Your site: https://pita-melt-v2-tud6.vercel.app');
      log('yellow', '\n🧪 Test your environment variables:');
      log('blue', '   Visit: https://pita-melt-v2-tud6.vercel.app/api/debug-env');
    } else {
      log('red', '❌ Deployment failed. You may need to trigger it manually.');
    }
  });
}

main().catch(console.error);