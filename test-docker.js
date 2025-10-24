#!/usr/bin/env node

/**
 * Docker Setup Test Script
 * Tests if the Docker containers are running correctly
 */

const http = require('http');
const { exec } = require('child_process');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkService(url, name) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      if (res.statusCode === 200) {
        log(`✅ ${name} is running (${res.statusCode})`, 'green');
        resolve(true);
      } else {
        log(`⚠️  ${name} responded with status ${res.statusCode}`, 'yellow');
        resolve(false);
      }
    });

    req.on('error', (err) => {
      log(`❌ ${name} is not accessible: ${err.message}`, 'red');
      resolve(false);
    });

    req.setTimeout(5000, () => {
      log(`⏰ ${name} request timed out`, 'yellow');
      resolve(false);
    });
  });
}

async function checkDockerContainers() {
  log('\n🐳 Checking Docker Containers...', 'blue');
  
  return new Promise((resolve) => {
    exec('docker-compose ps', (error, stdout, stderr) => {
      if (error) {
        log('❌ Docker Compose not running or not found', 'red');
        log('Make sure to run: docker-compose up -d', 'yellow');
        resolve(false);
        return;
      }

      const lines = stdout.split('\n');
      const containers = lines.filter(line => 
        line.includes('student_marking') && 
        !line.includes('NAME')
      );

      if (containers.length >= 3) {
        log(`✅ Found ${containers.length} containers running`, 'green');
        containers.forEach(container => {
          const parts = container.split(/\s+/);
          const name = parts[0];
          const status = parts[1];
          log(`   ${name}: ${status}`, 'green');
        });
        resolve(true);
      } else {
        log(`⚠️  Only ${containers.length} containers found (expected 3)`, 'yellow');
        resolve(false);
      }
    });
  });
}

async function main() {
  log('🚀 Docker Setup Test', 'bold');
  log('==================', 'bold');

  // Check if Docker is running
  const dockerRunning = await checkDockerContainers();
  
  if (!dockerRunning) {
    log('\n❌ Docker setup incomplete', 'red');
    log('\nTo fix this:', 'yellow');
    log('1. Make sure Docker is installed and running', 'yellow');
    log('2. Run: docker-compose up -d', 'yellow');
    log('3. Wait for containers to start (about 30-60 seconds)', 'yellow');
    process.exit(1);
  }

  // Test services
  log('\n🔍 Testing Services...', 'blue');
  
  const services = [
    { url: 'http://localhost:5000/health', name: 'Backend API' },
    { url: 'http://localhost:3000', name: 'Frontend' }
  ];

  const results = await Promise.all(
    services.map(service => checkService(service.url, service.name))
  );

  const allRunning = results.every(result => result);

  if (allRunning) {
    log('\n🎉 All services are running successfully!', 'green');
    log('\nAccess your application:', 'blue');
    log('• Frontend: http://localhost:3000', 'blue');
    log('• Backend API: http://localhost:5000', 'blue');
    log('• Health Check: http://localhost:5000/health', 'blue');
    log('\nTest credentials:', 'blue');
    log('• Username: admin', 'blue');
    log('• Password: admin123', 'blue');
  } else {
    log('\n⚠️  Some services are not responding', 'yellow');
    log('Check the logs with: docker-compose logs', 'yellow');
  }
}

main().catch(console.error);
