require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Checking environment variables...");
    console.log("Current working directory:", process.cwd());

    const envPath = path.join(process.cwd(), ".env");

    if (fs.existsSync(envPath)) {
        console.log("✅ .env file exists at:", envPath);
        const content = fs.readFileSync(envPath, "utf8");
        if (content.includes("PRIVATE_KEY=")) {
            console.log("✅ .env contains 'PRIVATE_KEY='");
            const lines = content.split('\n');
            const keyLine = lines.find(l => l.startsWith('PRIVATE_KEY='));
            if (keyLine && keyLine.length > 13) {
                console.log("✅ PRIVATE_KEY appears to have a value");
            } else {
                console.log("❌ PRIVATE_KEY appears empty");
            }
        } else {
            console.log("❌ .env does NOT contain 'PRIVATE_KEY='");
            console.log("Content preview:", content.substring(0, 50));
        }
    } else {
        console.log("❌ .env file NOT found at:", envPath);
    }

    const privateKey = process.env.PRIVATE_KEY;
    if (privateKey) {
        console.log("✅ PRIVATE_KEY is found in process.env");
        console.log("Length:", privateKey.length);
        console.log("Starts with:", privateKey.substring(0, 4) + "...");
    } else {
        console.log("❌ PRIVATE_KEY is NOT found in process.env");
    }

    const arcTestnet = hre.config.networks.arcTestnet;
    console.log("\nHardhat Config Network 'arcTestnet':");
    console.log("URL:", arcTestnet.url);
    console.log("Accounts loaded:", arcTestnet.accounts.length);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
