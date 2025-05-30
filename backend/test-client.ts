import { A2AClient, Message } from "@artinet/sdk";

async function runSDRResearcherTask() {
  // Initialize A2A client
  const client = new A2AClient("http://localhost:3002/api");

  // Create a test prospect message
  const message: Message = {
    role: "user",
    parts: [
      {
        type: "text",
        text: "john@example.com", // Test prospect email
      },
    ],
  };

  try {
    // Send task to SDR agent
    console.log("Sending task to SDR agent...");
    const task = await client.sendTask({
      id: `sdr-task-${Date.now()}`,
      message,
    });

    console.log("Task completed:", JSON.stringify(task, null, 2));
  } catch (error) {
    console.error("Error running task:", error);
  }
}

// Run the test
runSDRResearcherTask().catch(console.error); 