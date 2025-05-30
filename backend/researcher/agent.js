/**
 * Researcher Agent Example
 *
 * This example demonstrates how to create a researcher agent
 * that provides prospect information using AgentKit and Apify's website crawler.
 */

import { createAgent, openai /*, anthropic*/ } from '@inngest/agent-kit';
import { crawlWebsite, initializeMCPClient } from './apify-client.js';
import WebSocketClient from '../lib/websocket-client.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const USE_MOCK_WEBSITE_DATA = true; // Set to false to use real Apify website crawling

// Mock website data for testing
const mockWebsiteData = {
  companyInfo: {
    description: "A leading technology company specializing in AI and machine learning solutions",
    technologies: ["Python", "TensorFlow", "AWS", "Docker"],
    socialLinks: {
      linkedin: "https://linkedin.com/company/example",
      twitter: "https://twitter.com/example"
    },
    recentUpdates: [
      "Launched new AI product line",
      "Expanded to European market",
      "Partnered with major cloud provider"
    ]
  },
  insights: {
    companySize: "100-500 employees",
    funding: "Series B",
    keyProducts: [
      "AI-powered analytics platform",
      "Machine learning automation suite",
      "Cloud-native solutions"
    ],
    teamInfo: {
      leadership: ["John Doe - CEO", "Jane Smith - CTO"],
      departments: ["Engineering", "Product", "Sales", "Marketing"]
    }
  }
};

// if (!process.env.ANTHROPIC_API_KEY) {
//   throw new Error('ANTHROPIC_API_KEY environment variable is required');
// }

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

// WebSocket configuration
const WS_USER_ID = "system_bot_researcher";
const WS_CHANNEL_ID = "Amazon";

// Initialize WebSocket client
const wsClient = new WebSocketClient('ws://localhost:8080');

// Track the last message we sent to prevent processing our own messages
let lastSentMessage = null;

console.log('[Researcher Agent] Initializing...');

// Sample prospect database
const prospectDatabase = new Map([
  ["john@example.com", {
    name: "John Smith",
    company: "TechCorp",
    role: "CTO",
    website: "https://www.onsa.ai",
    interests: ["AI", "Machine Learning", "Cloud Computing"],
    recentActivity: ["implemented a new ML pipeline", "led cloud migration project"]
  }],
  ["sarah@example.com", {
    name: "Sarah Johnson",
    company: "DataFlow",
    role: "Data Science Lead",
    website: "https://www.mindshare.chat",
    interests: ["Data Analytics", "Big Data", "Python"],
    recentActivity: ["optimized data processing pipeline", "published research paper"]
  }]
]);

console.log('[Researcher Agent] Prospect database initialized with', prospectDatabase.size, 'entries');

// Modify the sendMessage function to track sent messages
const originalSendMessage = wsClient.sendMessage;
wsClient.sendMessage = function(userId, channelId, message) {
  lastSentMessage = message;
  return originalSendMessage.call(this, userId, channelId, message);
};

// Create the agent configuration
const researcherAgent = createAgent({
  name: 'Researcher',
  description: 'Provides detailed prospect information and research',
  system: `You are a professional researcher agent that provides detailed information about prospects.
You have access to a prospect database and can look up information about specific prospects using their email addresses.
You can also crawl prospect websites to gather additional information about their company and recent activities.
You should provide comprehensive information about prospects including their name, company, role, interests, recent activities, and insights from their website.
Always verify that the prospect exists in the database before providing information.`,
  model: openai({
    model: 'gpt-4.1-nano',
    defaultParameters: {
      max_tokens: 1000,
    },
  }),
  // model: anthropic({
  //   model: 'claude-sonnet-4-20250514',
  //   defaultParameters: {
  //     max_tokens: 1000,
  //   },
  // }),
});

console.log('[Researcher Agent] Agent configuration created');

// Initialize Apify MCP client
console.log('[Researcher Agent] Initializing Apify MCP client...');
initializeMCPClient(process.env.APIFY_TOKEN);
console.log('[Researcher Agent] Apify MCP client initialized');

// Export the handler function that A2A server expects
export async function* handler(context) {
  console.log("\n[Researcher Agent] Starting to process new request...");
  
  // Connect to WebSocket server
  try {
    await wsClient.connect();
  } catch (error) {
    console.error("[Researcher Agent] Failed to connect to WebSocket server:", error);
  }
  
  // Extract the user's message (expecting an email)
  const prospectEmail = context.userMessage.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join(" ");

  // Ignore messages from other system bots
  if (context.userMessage.senderId && context.userMessage.senderId.startsWith("system_bot_")) {
    console.log("[Researcher Agent] Ignoring message from system bot:", context.userMessage.senderId);
    return;
  }

  // Ignore our own messages
  if (context.userMessage.senderId === WS_USER_ID) {
    console.log("[Researcher Agent] Ignoring own message");
    return;
  }

  console.log(`[Researcher Agent] Received prospect email from ${context.userMessage.senderId || 'unknown'}: ${prospectEmail}`);
  wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, `Processing request for prospect: ${prospectEmail}`);

  yield {
    state: "working",
    message: {
      role: "agent",
      parts: [{ text: "Looking up prospect information...", type: "text" }],
    },
  };

  if (!prospectEmail) {
    console.log("[Researcher Agent] Error: No prospect email provided");
    wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, "Error: No prospect email provided");
    yield {
      state: "failed",
      message: {
        role: "agent",
        parts: [{ text: "No prospect email provided", type: "text" }],
      },
    };
    return;
  }

  const prospectInfo = prospectDatabase.get(prospectEmail);

  if (!prospectInfo) {
    console.log(`[Researcher Agent] Error: No information found for prospect: ${prospectEmail}`);
    wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, `Error: No information found for prospect: ${prospectEmail}`);
    yield {
      state: "failed",
      message: {
        role: "agent",
        parts: [{ text: `No information found for prospect: ${prospectEmail}`, type: "text" }],
      },
    };
    return;
  }

  console.log("[Researcher Agent] Found prospect info:", JSON.stringify(prospectInfo, null, 2));
  wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, "Found prospect information. Gathering additional details...");

  // Check for task cancellation
  if (context.isCancelled()) {
    console.log("[Researcher Agent] Task was cancelled");
    wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, "Processing has been cancelled.");
    yield {
      state: "canceled",
      message: {
        role: "agent",
        parts: [{ text: "Processing has been cancelled.", type: "text" }],
      },
    };
    return;
  }

  // Crawl the prospect's website if available
  let websiteData = null;
  if (prospectInfo.website) {
    try {
      console.log(`[Researcher Agent] Starting website crawl for: ${prospectInfo.website}`);
      wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, `Crawling website: ${prospectInfo.website}`);
      yield {
        state: "working",
        message: {
          role: "agent",
          parts: [{ text: "Crawling prospect's website for additional information...", type: "text" }],
        },
      };
      
      if (USE_MOCK_WEBSITE_DATA) {
        console.log("[Researcher Agent] Using mock website data");
        websiteData = mockWebsiteData;
      } else {
        websiteData = await crawlWebsite(prospectInfo.website);
      }
      
      console.log("[Researcher Agent] Website data retrieval completed successfully");
      wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, "Website data retrieval completed successfully");
      
      // Process and structure the website data
      console.log("[Researcher Agent] Processing website data...");
      wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, "Processing website data...");
      const processedData = {
        companyInfo: {
          description: websiteData.description || "No description available",
          technologies: websiteData.technologies || [],
          socialLinks: websiteData.socialLinks || {},
          recentUpdates: websiteData.recentUpdates || []
        },
        insights: {
          companySize: websiteData.companySize,
          funding: websiteData.funding,
          keyProducts: websiteData.products || [],
          teamInfo: websiteData.team || {}
        },
        rawData: websiteData // Keep raw data for reference
      };
      
      console.log("[Researcher Agent] Website data processed successfully");
      websiteData = processedData;
    } catch (error) {
      console.error("[Researcher Agent] Error crawling website:", error);
      wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, `Error crawling website: ${error.message}`);
      console.error("[Researcher Agent] Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      websiteData = { 
        error: "Failed to crawl website",
        details: error.message
      };
    }
  }

  // Combine prospect info with website data
  console.log("[Researcher Agent] Combining prospect and website data...");
  wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, "Combining all prospect information...");
  const combinedData = {
    prospect: {
      ...prospectInfo,
      lastUpdated: new Date().toISOString()
    },
    website: websiteData,
    summary: {
      keyPoints: [
        ...(prospectInfo.interests || []),
        ...(websiteData?.insights?.keyProducts || []),
        ...(prospectInfo.recentActivity || [])
      ],
      companyFocus: websiteData?.companyInfo?.description || "No company description available"
    }
  };

  console.log("[Researcher Agent] Data combination completed");
  wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, "Research completed successfully");
  
  // Yield a completed status with combined information
  yield {
    state: "completed",
    message: {
      role: "agent",
      parts: [{ 
        type: "data", 
        data: combinedData
      }],
    },
  };
  
  console.log("[Researcher Agent] Request processing completed");
  
  // Disconnect from WebSocket server
  wsClient.disconnect();
}

