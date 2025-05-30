import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');

console.log('Current directory:', __dirname);
console.log('Looking for .env file at:', envPath);

// Check if .env file exists
if (existsSync(envPath)) {
  console.log('.env file exists');
  try {
    const envContent = readFileSync(envPath, 'utf8');
  } catch (err) {
    console.error('Error reading .env file:', err);
  }
} else {
  console.error('.env file does not exist at:', envPath);
}

const result = config({ path: envPath });
if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('Successfully loaded .env file');
  console.log('APIFY_TOKEN present:', !!process.env.APIFY_TOKEN);
  console.log('APIFY_TOKEN length:', process.env.APIFY_TOKEN?.length || 0);
}

// Export environment variables
export const APIFY_TOKEN = process.env.APIFY_TOKEN; 