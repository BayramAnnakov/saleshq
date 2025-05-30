import { A2AClient } from "@artinet/sdk";
import { createAgent, anthropic } from '@inngest/agent-kit';
import WebSocketClient from './lib/websocket-client.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

// Initialize WebSocket client
const wsClient = new WebSocketClient('ws://localhost:8080');

// Create the agent configuration
const sdrAgent = createAgent({
  name: 'Sales Development Representative',
  description: 'Generates personalized outreach messages based on prospect information',
  system: `You are a professional Sales Development Representative (SDR) agent that generates personalized outreach messages.
You receive prospect information and create engaging, personalized messages that reference the prospect's role, company, interests, and recent activities.
Your messages should be professional, concise, and focused on starting a conversation about potential business opportunities.`,
  model: anthropic({
    model: 'claude-sonnet-4-20250514',
    defaultParameters: {
      max_tokens: 1000,
    },
  }),
});

// Export the handler function that A2A server expects
export async function* handler({ userMessage, isCancelled }) {
  console.log("\n[SDR Agent] Starting to process new request...");
  
  // Connect to WebSocket server
  try {
    await wsClient.connect();
  } catch (error) {
    console.error("[SDR Agent] Failed to connect to WebSocket server:", error);
  }
  
  yield {
    state: "working",
    message: {
      role: "agent",
      parts: [{ text: "Generating personalized message...", type: "text" }],
    },
  };

  // Send status update to WebSocket
  wsClient.sendMessage("Generating personalized message...");

  const prospectEmail = userMessage.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join(" ");

  console.log(`[SDR Agent] Received prospect email: ${prospectEmail}`);
  wsClient.sendMessage(`Processing request for prospect: ${prospectEmail}`);

  if (!prospectEmail) {
    console.log("[SDR Agent] Error: No prospect email provided");
    wsClient.sendMessage("Error: No prospect email provided");
    yield {
      state: "failed",
      message: {
        role: "agent",
        parts: [{ text: "No prospect email provided", type: "text" }],
      },
    };
    return;
  }

  try {
    // Get prospect information from researcher agent
    console.log("[SDR Agent] Creating client to communicate with Researcher agent...");
    wsClient.sendMessage("Fetching prospect information from Researcher agent...");
    const researcherClient = new A2AClient("http://localhost:3000/api");

    console.log("[SDR Agent] Sending request to Researcher agent...");
    const researcherTask = await researcherClient.sendTask({
      id: Date.now().toString(),
      message: {
        role: "user",
        parts: [{ type: "text", text: prospectEmail }],
      },
    });

    console.log("[SDR Agent] Received response from Researcher agent:", JSON.stringify(researcherTask, null, 2));

    if (!researcherTask || researcherTask.status.state === "failed") {
      console.log("[SDR Agent] Error: Failed to get prospect info from Researcher agent");
      wsClient.sendMessage("Error: Failed to get prospect information");
      yield {
        state: "failed",
        message: {
          role: "agent",
          parts: [{
            type: "text",
            text: `Failed to get prospect info: ${researcherTask?.status.message?.parts[0]?.type === "text" ? researcherTask.status.message.parts[0].text : "Unknown error"}`
          }],
        },
      };
      return;
    }

    // Parse the new response structure
    const researcherData = researcherTask.status.message?.parts[0]?.type === "data"
      ? researcherTask.status.message.parts[0].data
      : null;

    if (!researcherData || !researcherData.prospect) {
      console.log("[SDR Agent] Error: Failed to parse prospect information");
      console.log("[SDR Agent] Received data:", JSON.stringify(researcherData, null, 2));
      wsClient.sendMessage("Error: Failed to parse prospect information");
      yield {
        state: "failed",
        message: {
          role: "agent",
          parts: [{ text: "Failed to parse prospect information", type: "text" }],
        },
      };
      return;
    }

    const prospectInfo = researcherData.prospect;
    console.log("[SDR Agent] Successfully received prospect info:", JSON.stringify(prospectInfo, null, 2));
    wsClient.sendMessage("Successfully retrieved prospect information. Generating personalized message...");

    // Check for task cancellation
    if (isCancelled()) {
      console.log("[SDR Agent] Task was cancelled");
      wsClient.sendMessage("Processing has been cancelled.");
      yield {
        state: "canceled",
        message: {
          role: "agent",
          parts: [{ text: "Processing has been cancelled.", type: "text" }],
        },
      };
      return;
    }

    // Generate personalized message using the new data structure
    const { name, company, role, interests, recentActivity } = prospectInfo;
    const websiteInfo = researcherData.website;
    const summary = researcherData.summary;

    console.log("[SDR Agent] Generating personalized message...");
    
    // Prepare context for Claude
    const messageContext = {
      prospect: {
        name,
        company,
        role,
        interests,
        recentActivity
      },
      company: {
        description: summary?.companyFocus,
        products: websiteInfo?.insights?.keyProducts,
        technologies: websiteInfo?.companyInfo?.technologies
      }
    };

    // Use Claude to generate the message
    const messagePrompt = `Generate a personalized outreach message for a sales development representative.
    
Prospect Information:
- Name: ${name}
- Role: ${role}
- Company: ${company}
${interests ? `- Interests: ${interests.join(", ")}` : ""}
${recentActivity ? `- Recent Activity: ${recentActivity.join(", ")}` : ""}
${summary?.companyFocus ? `- Company Focus: ${summary.companyFocus}` : ""}
${websiteInfo?.insights?.keyProducts ? `- Key Products: ${websiteInfo.insights.keyProducts.join(", ")}` : ""}

Requirements:
1. Start with a personalized greeting
2. Reference their role and company
3. Mention specific interests or recent activities that are relevant
4. Include a clear value proposition
5. End with a specific call to action
6. Keep the message concise (max 3-4 paragraphs)
7. Maintain a professional but conversational tone

Generate the message:`;

    const { output } = await sdrAgent.run(messagePrompt);
    const personalizedMessage = output[0].content;
    
    console.log("[SDR Agent] Message generation completed");
    wsClient.sendMessage(personalizedMessage);

    // Yield a completed status with the personalized message
    yield {
      state: "completed",
      message: {
        role: "agent",
        parts: [{ text: personalizedMessage, type: "text" }],
      },
    };
  } catch (error) {
    console.error("[SDR Agent] Error generating message:", error);
    wsClient.sendMessage(`Error generating message: ${error}`);
    yield {
      state: "failed",
      message: {
        role: "agent",
        parts: [{ text: `Error generating message: ${error}`, type: "text" }],
      },
    };
  } finally {
    // Disconnect from WebSocket server
    wsClient.disconnect();
  }
}

export { sdrAgent as demoAgent };
