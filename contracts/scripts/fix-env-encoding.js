const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

try {
    console.log('Reading .env file...');
    // Try reading as UTF-16LE first since we saw the BOM/spacing
    const content = fs.readFileSync(envPath, 'utf16le');

    console.log('Content length:', content.length);
    console.log('Preview:', content.substring(0, 50));

    // Clean up the content
    // Remove BOM if present (though utf16le read might handle it, sometimes it remains as char code 65279)
    let cleanContent = content.replace(/^\uFEFF/, '');

    // If it looks like it has null bytes or weird spacing, it might have been read wrong or is actually UTF-8 but with nulls?
    // Wait, if I read as utf16le and it was utf16le, it should look normal now.
    // If I read as utf8 and it was utf16le, it would look like "P R I V A T E"

    // Let's verify if it looks correct now
    if (cleanContent.includes('PRIVATE_KEY=')) {
        console.log('Successfully decoded as UTF-16LE. Converting to UTF-8...');
        fs.writeFileSync(envPath, cleanContent, 'utf8');
        console.log('✅ Converted .env to UTF-8');
    } else {
        // Fallback: maybe it was just UTF-8 with BOM?
        console.log('Could not validate content. Trying to read as buffer and detect...');
        const buffer = fs.readFileSync(envPath);

        // Check for UTF-16LE BOM
        if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
            console.log('Detected UTF-16LE BOM. converting...');
            const str = buffer.toString('utf16le');
            fs.writeFileSync(envPath, str, 'utf8');
            console.log('✅ Converted .env to UTF-8');
        } else {
            console.log('Unknown encoding or already UTF-8. No changes made.');
        }
    }
} catch (err) {
    console.error('Error fixing .env:', err);
}
