/**
 * Researcher Agent Example
 *
 * This example demonstrates how to create a researcher agent
 * that provides prospect information using AgentKit and Apify's website crawler.
 */

import { createAgent, anthropic } from '@inngest/agent-kit';
import { crawlWebsite, initializeMCPClient } from './apify-client.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

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

// Create the agent configuration
const researcherAgent = createAgent({
  name: 'Researcher',
  description: 'Provides detailed prospect information and research',
  system: `You are a professional researcher agent that provides detailed information about prospects.
You have access to a prospect database and can look up information about specific prospects using their email addresses.
You can also crawl prospect websites to gather additional information about their company and recent activities.
You should provide comprehensive information about prospects including their name, company, role, interests, recent activities, and insights from their website.
Always verify that the prospect exists in the database before providing information.`,
  model: anthropic({
    model: 'claude-sonnet-4-20250514',
    defaultParameters: {
      max_tokens: 1000,
    },
  }),
});

console.log('[Researcher Agent] Agent configuration created');

// Initialize Apify MCP client
console.log('[Researcher Agent] Initializing Apify MCP client...');
initializeMCPClient(process.env.APIFY_TOKEN);
console.log('[Researcher Agent] Apify MCP client initialized');

// Export the handler function that A2A server expects
export async function* handler(context) {
  console.log("\n[Researcher Agent] Starting to process new request...");
  
  // Extract the user's message (expecting an email)
  const prospectEmail = context.userMessage.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join(" ");

  console.log(`[Researcher Agent] Received prospect email: ${prospectEmail}`);

  yield {
    state: "working",
    message: {
      role: "agent",
      parts: [{ text: "Looking up prospect information...", type: "text" }],
    },
  };

  if (!prospectEmail) {
    console.log("[Researcher Agent] Error: No prospect email provided");
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

  // Check for task cancellation
  if (context.isCancelled()) {
    console.log("[Researcher Agent] Task was cancelled");
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
      yield {
        state: "working",
        message: {
          role: "agent",
          parts: [{ text: "Crawling prospect's website for additional information...", type: "text" }],
        },
      };
      
      websiteData = await crawlWebsite(prospectInfo.website);
      console.log("[Researcher Agent] Website crawl completed successfully");
      
      // Process and structure the website data
      console.log("[Researcher Agent] Processing website data...");
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
  console.log("[Researcher Agent] Sending combined prospect info back to SDR agent");
  
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
}

