import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const newAddresses = {
    NEXT_PUBLIC_MARKET_FACTORY_ADDRESS: "0x7B661633B83Cb0FfCE227b3F498Be904429917a3",
    NEXT_PUBLIC_OUTCOME_TOKEN_ADDRESS: "0xE652e73b0c98d3A6d14F3e29aB5879130fc471De",
    NEXT_PUBLIC_ORACLE_ADDRESS: "0x6174dd78631FE0c01f06Cb0036f4245d212Be3dB",
    NEXT_PUBLIC_USDC_ADDRESS: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"
};

function updateEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let lines = content.split('\n');
    let newLines = [];

    // Track which keys we've updated
    const updatedKeys = new Set();

    lines.forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            if (newAddresses[key]) {
                newLines.push(`${key}=${newAddresses[key]}`);
                updatedKeys.add(key);
                console.log(`Updated ${key} in ${path.basename(filePath)}`);
            } else {
                newLines.push(line);
            }
        } else {
            newLines.push(line);
        }
    });

    // Append missing keys
    Object.keys(newAddresses).forEach(key => {
        if (!updatedKeys.has(key)) {
            newLines.push(`${key}=${newAddresses[key]}`);
            console.log(`Added ${key} to ${path.basename(filePath)}`);
        }
    });

    fs.writeFileSync(filePath, newLines.join('\n'));
}

const contractsEnvPath = path.join(__dirname, '..', '.env');
const frontendEnvPath = path.join(__dirname, '..', '..', 'frontend', '.env.local');

console.log('Updating contracts/.env...');
updateEnvFile(contractsEnvPath);

console.log('\nUpdating frontend/.env.local...');
updateEnvFile(frontendEnvPath);
