#!/usr/bin/env node

const fs = require('fs');
const { spawn } = require('child_process');

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

function addEnvVar(key, value) {
  return new Promise((resolve, reject) => {
    // Use the format: echo "value" | vercel env add key production
    const echoProcess = spawn('echo', [value]);
    const vercelProcess = spawn('vercel', ['env', 'add', key, 'production'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Pipe echo output to vercel input
    echoProcess.stdout.pipe(vercelProcess.stdin);

    let output = '';
    let errorOutput = '';

    vercelProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    vercelProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    vercelProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output });
      } else {
        resolve({ success: false, error: errorOutput || output });
      }
    });

    vercelProcess.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });
  });
}

async function main() {
  log('blue', '🚀 Automated Vercel Environment Variable Deployment');
  log('blue', '==================================================');

  const envFile = '.env.production';
  
  if (!fs.existsSync(envFile)) {
    log('red', '❌ .env.production file not found!');
    process.exit(1);
  }

  log('yellow', '📤 Reading environment variables from .env.production...');
  
  const envVars = parseEnvFile(envFile);
  const keys = Object.keys(envVars);
  
  log('yellow', `📋 Found ${keys.length} environment variables`);

  // Add variables one by one
  let successCount = 0;
  let failCount = 0;

  for (const key of keys) {
    const value = envVars[key];
    log('blue', `   Processing: ${key}`);
    
    const result = await addEnvVar(key, value);
    
    if (result.success) {
      log('green', `   ✅ Successfully added ${key}`);
      successCount++;
    } else {
      log('red', `   ❌ Failed to add ${key}: ${result.error}`);
      failCount++;
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  log('blue', '================================================');
  log('green', `✅ Successfully added: ${successCount} variables`);
  if (failCount > 0) {
    log('red', `❌ Failed to add: ${failCount} variables`);
  }

  if (successCount > 0) {
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
        log('yellow', '\n💳 Test payment functionality after deployment completes');
      } else {
        log('red', '❌ Deployment failed. You may need to trigger it manually.');
      }
    });
  } else {
    log('red', '❌ No variables were added successfully. Please check your setup.');
  }
}

main().catch(console.error);