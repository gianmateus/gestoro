const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Build personalizado iniciando...');

try {
  console.log('Compilando TypeScript...');
  execSync('npx tsc', { stdio: 'inherit' });
  console.log('Build concluído!');
} catch (error) {
  console.error('Erro:', error.message);
  process.exit(1);
}