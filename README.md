
# React Sales Chat Dashboard

This is a proof-of-concept React application designed for a sales platform. It features a dashboard highlighting key sales metrics that require attention and a multi-channel chat interface for team communication and notifications related to these metrics.

Built with React, TypeScript, Tailwind CSS, and React Router. It uses Vite for development and can be bundled for production.

## Features

- **Dashboard Overview:** Displays 4 key sales KPIs (New Leads, Follow-Ups Due, Active Proposals, Critical Alerts) with unread notification counts.
- **Direct Navigation:** Clicking a KPI card on the dashboard navigates to the relevant chat channel.
- **Multi-Channel Chat:** Supports multiple chat channels, each corresponding to a sales KPI.
- **Real-time Message Simulation (Toggleable):** Simulates new messages arriving from various sales team members into different channels. This simulation mimics the behavior of a WebSocket-based system and can be turned on/off for development.
- **User-Specific Views:** Messages are displayed differently for the current user versus other users.
- **Responsive Design:** Adapts to different screen sizes.
- **URL-based Channel Navigation:** Chat channels can be accessed directly via URL (e.g., `/chat/channel_leads`).

## Key Sales KPIs / Chat Channels

1.  **New Leads (`channel_leads`):** For tracking and discussing new incoming leads.
2.  **Follow-Ups Due (`channel_followups`):** For reminders and coordination on scheduled follow-ups.
3.  **Active Proposals (`channel_proposals`):** For discussions around proposals sent, feedback, and revisions.
4.  **Critical Alerts (`channel_alerts`):** For urgent issues, support requests, or deals at risk.

## Simulated Users (Sales Team)

The application simulates messages from the following predefined sales team members:

- `user_current_app_user`: You (the person using this dashboard)
- `user_sales_sarah`: Sarah Miller (Sales Rep)
- `user_sales_john`: John Davis (Sales Manager)
- `user_sales_emily`: Emily Carter (Account Executive)
- `user_sales_michael`: Michael Chen (Sales Ops)
- `user_system_bot`: SalesBot (Automated System Messages)

The `CURRENT_USER_ID` in the application is `user_current_app_user`.

## Running the Application

This project uses Vite as its development server and build tool.

1.  **Prerequisites:**
    *   Node.js and npm (or yarn) installed. You can download them from [nodejs.org](https://nodejs.org/).

2.  **Setup:**
    *   Clone this repository or download and extract the source files into a project directory.
    *   Navigate to the project directory in your terminal:
        ```bash
        cd /path/to/your/mas-chat-dashboard
        ```
    *   Install the necessary dependencies:
        ```bash
        npm install
        ```
        (or `yarn install` if you prefer yarn)

3.  **Run the Development Server:**
    *   Start the Vite development server:
        ```bash
        npm run dev
        ```
        (or `yarn dev`)
    *   Vite will compile the application and provide you with a local URL (usually `http://localhost:5173`). Open this URL in your web browser.

4.  **Alternative (Simple Static Server - Not Recommended for this Project):**
    *   While you *can* serve the `dist` folder (after running `npm run build`) with a simple HTTP server like Python's, this is **not recommended for development** as it lacks hot reloading and doesn't serve the source files correctly.
    *   The `python -m http.server` method is **not suitable for running this project in development mode** because it does not transpile TypeScript/JSX or handle module resolution as Vite does.

5.  **API Key (Gemini API - Placeholder for future use):**
    *   This application currently does *not* use the Gemini API. However, if you were to integrate it, the API key should be managed as an environment variable `process.env.API_KEY`.
    *   For local development with Vite, you can create a `.env` file in the project root and add `VITE_API_KEY=your_actual_key_here`. You would then access it in your code as `import.meta.env.VITE_API_KEY`. **Never commit API keys or `.env` files containing sensitive keys to version control.** Add `.env` to your `.gitignore` file.

## How Simulated Messages Work

-   **Toggleable Simulation:** The automatic message simulation can be enabled or disabled by changing the `ENABLE_MESSAGE_SIMULATION` constant at the top of `App.tsx`. By default, it is set to `false` (off).
-   **Automatic Simulation (if enabled):** If `ENABLE_MESSAGE_SIMULATION` is `true`, the `App.tsx` component includes a `useEffect` hook with a `setInterval` function. Every 15-20 seconds, this function:
    1.  Randomly selects one of the "Sales Team" users (excluding the `CURRENT_USER_ID`).
    2.  Randomly selects one of the 4 KPI-specific chat channels.
    3.  Generates a contextually relevant sample message.
    4.  Adds this new message to the application's state, updating the UI (including unread counts and last message previews). The structure of this simulated message (`id`, `channelId`, `senderId` as `userId`, `text`, `timestamp`) is consistent with what a WebSocket server would send (see "WebSocket Server Integration" below).
-   This simulation mimics how a real-time backend system (using WebSockets) would push new messages or notifications to connected clients.

## WebSocket Server Integration (Conceptual)

To enable true real-time communication and allow external clients (like the "WebSocket Chat Client" described in a separate README) to connect and interact, a **dedicated backend WebSocket server is required.** This Sales Dashboard application, in such a setup, would also act as a client to this backend server.

The backend server would be responsible for:
- Managing WebSocket connections from multiple clients.
- Authenticating users/clients.
- Receiving messages, processing them (e.g., saving to a database, applying business logic).
- Broadcasting messages to the appropriate clients subscribed to specific channels.

**Communication Protocol:**

The WebSocket server should adhere to the following JSON message formats:

**1. Client-to-Server Messages:**
   When a client (including this dashboard or an external client) sends a message to a channel, it should send a JSON object structured as follows:

   ```json
   {
     "type": "sendMessage",
     "payload": {
       "userId": "client_user_id_string",
       "channelId": "target_channel_id_string",
       "text": "Message content string"
     }
   }
   ```
   - `userId`: The ID of the user sending the message.
   - `channelId`: The ID of the channel the message is intended for.
   - `text`: The actual text content of the message.

**2. Server-to-Client Messages:**

   **a. New Message Notification:**
      When the server broadcasts a new message to clients subscribed to a channel, it should send:

      ```json
      {
        "type": "newMessage",
        "payload": {
          "id": "unique_message_id_string",
          "userId": "original_sender_user_id_string",
          "channelId": "target_channel_id_string",
          "text": "Content of the message",
          "timestamp": 1678886400000
        }
      }
      ```
      - `id`: A unique ID for the message, generated by the server.
      - `userId`: The ID of the user who originally sent the message.
      - `channelId`: The channel this message belongs to.
      - `text`: The message content.
      - `timestamp`: A Unix timestamp (in milliseconds) indicating when the message was processed/sent by the server.
      *(The current simulation in `App.tsx` generates messages that align with this `payload` structure, with `senderId` mapping to `userId`.)*

   **b. Error Notification (Optional but Recommended):**
      If the server needs to send an error message to a client (e.g., due to invalid input, permissions issues):

      ```json
      {
        "type": "error",
        "payload": {
          "message": "Descriptive error message from the server"
        }
      }
      ```

**Integration with this Sales Dashboard:**
-   If a real backend WebSocket server is implemented following this protocol:
    -   The message simulation logic in `App.tsx` would be replaced with actual WebSocket client code (`new WebSocket(...)`) to connect to the server.
    -   The dashboard would listen for `newMessage` events from the server to display incoming messages.
    -   When the dashboard user sends a message via the UI, `handleSendMessage` would send a `sendMessage` type message to the WebSocket server instead of updating local state directly.

## Simulating API Posts (Conceptual Backend Integration for other actions)

While WebSockets handle real-time chat, other interactions (like creating a lead from an external system that then triggers a WebSocket message) would involve standard HTTP API endpoints on your backend.

**Example `curl` command for an external system to post data that *might then trigger* a WebSocket notification via the backend:**

```bash
curl -X POST -H "Content-Type: application/json" \
-d '{
  "sourceSystem": "CRM",
  "eventType": "newLeadCreated",
  "leadDetails": {
    "companyName": "Globex Corp",
    "contactPerson": "John Doe",
    "value": 50000
  },
  "notifyChannel": "channel_leads"
}' YOUR_BACKEND_API_URL/api/events
```

**Backend Process:**
1. The backend receives this HTTP request.
2. Processes the event (e.g., creates a lead in the database).
3. If applicable, constructs a `newMessage` payload (e.g., "SalesBot: New lead 'Globex Corp' created via CRM.") and broadcasts it via WebSockets to clients subscribed to the `channel_leads` channel.

## Future Enhancements (Conceptual)

-   **Real Backend & WebSocket Implementation:** Build the dedicated backend server.
-   **User Authentication:** Implement proper user login and authentication for both the dashboard and any WebSocket connections.
-   **Message Persistence:** Store messages in a database on the backend.
-   **Gemini API Integration:** Use the Gemini API for AI-powered sales assistance.
-   **Advanced Notifications:** Implement push notifications.
-   **Message Editing/Deletion:** Add features for users to edit or delete their messages (requires backend support).
-   **File Attachments:** Allow users to share files in chats (requires backend support).

This PoC provides a solid foundation and a clear protocol for building a more comprehensive sales chat and notification system with real-time capabilities.
