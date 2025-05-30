import { A2AClient } from "@artinet/sdk";
import { createAgent, openai /*, anthropic*/ } from '@inngest/agent-kit';
import WebSocketClient from '../lib/websocket-client.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// if (!process.env.ANTHROPIC_API_KEY) {
//   throw new Error('ANTHROPIC_API_KEY environment variable is required');
// }

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

// WebSocket configuration
const WS_USER_ID = "system_bot_sdr";
const WS_CHANNEL_ID = "channel_amazon";

// Initialize WebSocket client
const wsClient = new WebSocketClient('ws://localhost:8080');

// Track the last message we sent to prevent processing our own messages
let lastSentMessage = null;

// Connect to WebSocket server immediately
console.log("[SDR Agent] Attempting to connect to WebSocket server...");
wsClient.connect().then(() => {
  console.log("[SDR Agent] Successfully connected to WebSocket server");
}).catch(error => {
  console.error("[SDR Agent] Failed to connect to WebSocket server:", error);
});

// Store the last generated message and context
let lastGeneratedMessage = null;
let lastMessageContext = null;

// Create the agent configuration
const sdrAgent = createAgent({
  name: 'Sales Development Representative',
  description: 'Generates personalized outreach messages based on prospect information',
  system: `You are a professional Sales Development Representative (SDR) agent that generates personalized outreach messages.
You receive prospect information and create engaging, personalized messages that reference the prospect's role, company, interests, and recent activities.
Your messages should be professional, concise, and focused on starting a conversation about potential business opportunities.`,
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

// Set up message handler
wsClient.onMessage = async (message) => {
  console.log("[SDR Agent] Received message:", message);
  try {
    if (typeof message !== 'object' || !message.senderId || !message.text) {
      console.log("[SDR Agent] Ignoring invalid message format:", message);
      return;
    }

    // Ignore messages from other system bots
    if (message.senderId.startsWith("system_bot_")) {
      console.log("[SDR Agent] Ignoring message from system bot:", message.senderId);
      return;
    }

    // Ignore our own messages
    if (message.senderId === WS_USER_ID) {
      console.log("[SDR Agent] Ignoring own message");
      return;
    }

    const trimmedMessage = message.text.trim();
    console.log("[SDR Agent] Processing message from", message.senderId + ":", trimmedMessage);

    // Use Claude to understand the user's intent
    const intentPrompt = `Analyze the following message and determine if the user wants to:
1. Start a new message generation process (e.g., "start", "generate", "create", "new message", etc.)
2. Rewrite/modify an existing message (e.g., "rewrite", "modify", "change", "update", etc.)
3. Something else

Message: "${trimmedMessage}"

IMPORTANT: Respond with ONLY a raw JSON object (no markdown formatting, no code blocks, no additional text).
The response must be valid JSON that can be parsed directly.

Required format:
{
  "intent": "start" | "rewrite" | "other",
  "context": "extracted context or email if present"
}`;

    const { output } = await sdrAgent.run(intentPrompt);
    let intentResult;
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = output[0].content.replace(/```json\n?|\n?```/g, '').trim();
      intentResult = JSON.parse(cleanedResponse);
      console.log("[SDR Agent] Intent analysis:", intentResult);
    } catch (error) {
      console.error("[SDR Agent] Error parsing intent analysis:", error);
      console.log("[SDR Agent] Raw response:", output[0].content);
      wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, "I'm having trouble understanding your request. Could you please try rephrasing it?");
      return;
    }

    if (intentResult.intent === "start") {
      console.log("[SDR Agent] Detected start intent");
      
      // Use the email from context or default
      const email = "john@example.com";
      console.log("[SDR Agent] Using email:", email);
      
      // Create a mock userMessage object similar to what the A2A server would send
      const userMessage = {
        role: "user",
        parts: [{ type: "text", text: email }],
      };

      // Create a mock isCancelled function
      const isCancelled = () => false;

      // Process the request using the handler
      try {
        console.log("[SDR Agent] Starting message generation process");
        for await (const response of handler({ userMessage, isCancelled })) {
          console.log("[SDR Agent] Handler response:", response);
          if (response.state === "completed") {
            // Store the generated message and context for potential rewrites
            lastGeneratedMessage = response.message.parts[0].text;
            console.log("[SDR Agent] Stored generated message:", lastGeneratedMessage);
            // Note: lastMessageContext is already set in the handler
          }
        }
      } catch (error) {
        console.error("[SDR Agent] Error processing start command:", error);
        wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, `Error processing request: ${error.message}`);
      }
      return;
    }

    if (intentResult.intent === "rewrite") {
      console.log("[SDR Agent] Detected rewrite intent");
      
      if (!lastGeneratedMessage || !lastMessageContext) {
        console.log("[SDR Agent] No previous message to rewrite");
        wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, "Error: No previous message to rewrite. Please generate a message first.");
        return;
      }
      
      // Use the context from intent analysis
      const context = intentResult.context || "No specific context provided";
      console.log("[SDR Agent] Using rewrite context:", context);
      
      // Prepare rewrite prompt with additional context
      const rewritePrompt = `Rewrite the following outreach message with the additional context provided.
      
Original Message:
${lastGeneratedMessage}

Additional Context:
${context}

Original Prospect Information:
- Name: ${lastMessageContext.prospect.name}
- Role: ${lastMessageContext.prospect.role}
- Company: ${lastMessageContext.prospect.company}
${lastMessageContext.prospect.interests ? `- Interests: ${lastMessageContext.prospect.interests.join(", ")}` : ""}
${lastMessageContext.prospect.recentActivity ? `- Recent Activity: ${lastMessageContext.prospect.recentActivity.join(", ")}` : ""}

Requirements:
1. Maintain the core message structure
2. Incorporate the new context naturally
3. Keep the message concise (max 3-4 paragraphs)
4. Maintain a professional but conversational tone
5. Ensure the call to action remains clear

Rewrite the message:`;

      console.log("[SDR Agent] Generating rewritten message...");
      const { output } = await sdrAgent.run(rewritePrompt);
      const rewrittenMessage = output[0].content;
      
      // Update the last generated message
      lastGeneratedMessage = rewrittenMessage;
      console.log("[SDR Agent] Stored rewritten message:", lastGeneratedMessage);
      
      // Send the rewritten message back through WebSocket
      wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, rewrittenMessage);
    } else {
      console.log("[SDR Agent] Unknown intent:", intentResult.intent);
      wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, "I'm not sure what you want me to do. You can ask me to generate a new message or rewrite the existing one.");
    }
  } catch (error) {
    console.error("[SDR Agent] Error handling WebSocket message:", error);
    wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, `Error handling message: ${error.message}`);
  }
};

// Modify the sendMessage function to track sent messages
const originalSendMessage = wsClient.sendMessage;
wsClient.sendMessage = function(userId, channelId, message) {
  lastSentMessage = message;
  return originalSendMessage.call(this, userId, channelId, message);
};

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
  wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, "Generating personalized message...");

  const prospectEmail = userMessage.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join(" ");

  console.log(`[SDR Agent] Received prospect email: ${prospectEmail}`);
  wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, `Processing request for prospect: ${prospectEmail}`);

  if (!prospectEmail) {
    console.log("[SDR Agent] Error: No prospect email provided");
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

  try {
    // Get prospect information from researcher agent
    console.log("[SDR Agent] Creating client to communicate with Researcher agent...");
    wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, "Fetching prospect information from Researcher agent...");
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
      wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, "Error: Failed to get prospect information");
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
      wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, "Error: Failed to parse prospect information");
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
    wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, "Successfully retrieved prospect information. Generating personalized message...");

    // Check for task cancellation
    if (isCancelled()) {
      console.log("[SDR Agent] Task was cancelled");
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

    // Store the context for potential rewrites
    lastMessageContext = messageContext;

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
    
    // Store the generated message for potential rewrites
    lastGeneratedMessage = personalizedMessage;
    
    console.log("[SDR Agent] Message generation completed");
    wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, personalizedMessage);

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
    wsClient.sendMessage(WS_USER_ID, WS_CHANNEL_ID, `Error generating message: ${error}`);
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
