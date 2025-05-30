import { testDeployment } from "@artinet/sdk";
import { deployment } from "./lib/deployment.js";

const testTask = {
  method: "tasks/send",
  params: {
    id: `task-${Date.now()}`,
    message: {
      role: "user",
      parts: [
        {
          type: "text",
          text: "john@example.com",  // Using one of our test prospect emails
        },
      ],
    },
  },
};

console.log("Testing SDR workflow with prospect email:", testTask.params.message.parts[0].text);

for await (const result of testDeployment(deployment, [testTask])) {
  console.log(
    "testDeployment",
    "Received result:",
    JSON.stringify(result, null, 2),
    "\n"
  );
}
