import { config } from 'dotenv';
import { handler } from './agent.js';

// Load environment variables from .env file
config();

// Validate required environment variables
const requiredEnvVars = ['APIFY_TOKEN', 'ANTHROPIC_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`- ${envVar}`));
  console.error('\nPlease create a .env file with these variables or set them in your environment.');
  process.exit(1);
}

// Test context for the handler
const testContext = {
  userMessage: {
    parts: [
      { type: 'text', text: 'john@example.com' }
    ]
  },
  isCancelled: () => false
};

// Run the test
async function runTest() {
  console.log('Starting researcher agent test...');
  console.log('Environment variables loaded successfully.');
  
  try {
    for await (const response of handler(testContext)) {
      console.log('\nResponse state:', response.state);
      console.log('Response message:', JSON.stringify(response.message, null, 2));
    }
  } catch (error) {
    console.error('Error running test:', error);
  }
}

// Execute the test
runTest(); 