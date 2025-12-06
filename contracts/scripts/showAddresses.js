// Check what address is being read from environment
import dotenv from 'dotenv';
dotenv.config();

console.log('\n📋 Current .env Configuration:\n');
console.log('NEXT_PUBLIC_MARKET_FACTORY_ADDRESS:', process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS);
console.log('NEXT_PUBLIC_ORACLE_ADDRESS:', process.env.NEXT_PUBLIC_ORACLE_ADDRESS);
console.log('NEXT_PUBLIC_OUTCOME_TOKEN_ADDRESS:', process.env.NEXT_PUBLIC_OUTCOME_TOKEN_ADDRESS);
console.log('NEXT_PUBLIC_USDC_ADDRESS:', process.env.NEXT_PUBLIC_USDC_ADDRESS);

console.log('\n\n✅ CORRECT Addresses (from deployment):');
console.log('NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=0xa52e6618a12E5932256cC0C9EAc5Efd2C34C70Af');
console.log('NEXT_PUBLIC_ORACLE_ADDRESS=0xf9f08F485363B603Ce021CEEF7B4C2f0bc180ac9');
console.log('NEXT_PUBLIC_OUTCOME_TOKEN_ADDRESS=0x83C754b59cEa49F441602DfF046806f273675b20');
console.log('NEXT_PUBLIC_USDC_ADDRESS=0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d');

console.log('\n\n⚠️  ACTION REQUIRED:');
console.log('Please update contracts/.env file with the CORRECT addresses above.');
console.log('Remove ALL duplicate entries and keep only ONE set of addresses.\n');
