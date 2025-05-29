
# React Sales Chat Dashboard

This is a React application designed for a sales platform. It features a dashboard highlighting key sales metrics that require attention and a multi-channel chat interface for team communication and notifications. It connects to a WebSocket server for real-time messaging.

Built with React, TypeScript, Tailwind CSS, and React Router. It uses Vite for development.

## Features

- **Dashboard Overview:** Displays 4 key sales KPIs (New Leads, Follow-Ups Due, Active Proposals, Critical Alerts) with unread notification counts.
- **Direct Navigation:** Clicking a KPI card on the dashboard navigates to the relevant chat channel.
- **Multi-Channel Chat:** Supports multiple chat channels, each corresponding to a sales KPI.
- **Real-time WebSocket Messaging:** Connects to a WebSocket server to send and receive messages in real-time.
- **Connection Status Indicator:** Displays the current status of the WebSocket connection at the top of the app.
- **User-Specific Views:** Messages are displayed differently for the current user versus other users.
- **Responsive Design:** Adapts to different screen sizes.
- **URL-based Channel Navigation:** Chat channels can be accessed directly via URL (e.g., `/chat/channel_leads`).

## Key Sales KPIs / Chat Channels

1.  **New Leads (`channel_leads`):** For tracking and discussing new incoming leads.
2.  **Follow-Ups Due (`channel_followups`):** For reminders and coordination on scheduled follow-ups.
3.  **Active Proposals (`channel_proposals`):** For discussions around proposals sent, feedback, and revisions.
4.  **Critical Alerts (`channel_alerts`):** For urgent issues, support requests, or deals at risk.

## Simulated Users (Sales Team)

The application uses the following predefined sales team members. When connected to a WebSocket server, the server will determine the sender IDs. `CURRENT_USER_ID` is used by this client when sending messages.

- `user_current_app_user`: You (the person using this dashboard)
- `user_sales_sarah`: Sarah Miller (Sales Rep)
- `user_sales_john`: John Davis (Sales Manager)
- `user_sales_emily`: Emily Carter (Account Executive)
- `user_sales_michael`: Michael Chen (Sales Ops)
- `user_system_bot`: SalesBot (Automated System Messages)

The `CURRENT_USER_ID` in this application (used for sending messages) is `user_current_app_user`.

## Running the Application

This project uses Vite as its development server and build tool.

1.  **Prerequisites:**
    *   Node.js and npm (or yarn) installed. You can download them from [nodejs.org](https://nodejs.org/).
    *   A running WebSocket server that adheres to the communication protocol outlined below.

2.  **Setup:**
    *   Clone this repository or download and extract the source files into a project directory.
    *   Navigate to the project directory in your terminal:
        ```bash
        cd /path/to/your/mas-chat-dashboard
        ```
    *   Create a `hooks` directory in the `src` (or root, next to `components`, `pages`) directory if it doesn't exist. Place `useAppWebSocket.ts` there.
    *   Install the necessary dependencies:
        ```bash
        npm install
        ```
        (or `yarn install` if you prefer yarn)

3.  **Configure WebSocket Server URL (Optional):**
    *   The application attempts to connect to the WebSocket server defined by `WEBSOCKET_SERVER_URL` in `App.tsx`.
    *   By default, this is `ws://localhost:8080`.
    *   For local development with Vite, you can override this using an environment variable. Create a `.env` file in the project root:
        ```
        VITE_WEBSOCKET_URL=ws://your-websocket-server-address
        ```
        The application will then use `import.meta.env.VITE_WEBSOCKET_URL`.
    *   **Never commit `.env` files containing sensitive information to version control.** Add `.env` to your `.gitignore` file.

4.  **Run the Development Server:**
    *   Start the Vite development server:
        ```bash
        npm run dev
        ```
        (or `yarn dev`)
    *   Vite will compile the application and provide you with a local URL (usually `http://localhost:5173`). Open this URL in your web browser. Ensure your WebSocket server is running and accessible at the configured URL.

5.  **API Key (Gemini API - Placeholder for future use):**
    *   This application currently does *not* use the Gemini API. If integrated, the API key should be managed as an environment variable `process.env.API_KEY`.
    *   For local development with Vite and Gemini, you can add `VITE_API_KEY=your_actual_key_here` to your `.env` file. Access it via `import.meta.env.VITE_API_KEY`.

## WebSocket Server Integration

This application acts as a WebSocket client. **A dedicated backend WebSocket server is required.** This server handles real-time communication, manages client connections, and routes messages.
  
### Quickstart: Local WebSocket Server
  
We provide a simple Node.js WebSocket server in `ws-server.js`. To run it:
  
```bash
# Install all dependencies (if not already done)
npm install
# Start the WebSocket server (default port 8080)
npm run start:server
```

Alternatively, to run **both** the WebSocket server and the UI concurrently:

```bash
# Install all dependencies (if not already done)
npm install
# Start server + UI
npm run start
```
  
You can override the listening port by setting the `PORT` environment variable:
  
```bash
PORT=9000 npm run start:server
```
  
This server will broadcast incoming chat messages to all connected clients according to the protocol below.

**Communication Protocol:**

The WebSocket server should adhere to the following JSON message formats:

**1. Client-to-Server Messages:**
   When this dashboard (or any other client) sends a message to a channel, it sends:

   ```json
   {
     "type": "sendMessage",
     "payload": {
       "userId": "client_user_id_string", // e.g., "user_current_app_user" from this app
       "channelId": "target_channel_id_string",
       "text": "Message content string"
     }
   }
   ```

**2. Server-to-Client Messages:**

   **a. New Message Notification:**
      When the server broadcasts a new message:

      ```json
      {
        "type": "newMessage",
        "payload": { // This structure matches the 'Message' type in types.ts
          "id": "unique_message_id_string",
          "userId": "original_sender_user_id_string", // becomes senderId in the app
          "channelId": "target_channel_id_string",
          "text": "Content of the message",
          "timestamp": 1678886400000 // Unix timestamp (milliseconds)
        }
      }
      ```

   **b. Error Notification (Optional but Recommended):**
      If the server sends an error:

      ```json
      {
        "type": "error",
        "payload": {
          "message": "Descriptive error message from the server"
        }
      }
      ```

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

-   **Robust Error Handling & Reconnection:** Improve WebSocket error handling and implement more sophisticated automatic reconnection logic.
-   **User Authentication:** Implement proper user login and authentication for WebSocket connections.
-   **Message Persistence:** Ensure messages are stored in a database on the backend.
-   **Gemini API Integration:** Use the Gemini API for AI-powered sales assistance.
-   **Advanced Notifications:** Implement browser push notifications.
-   **Message Editing/Deletion:** Add features for users to edit or delete their messages.
-   **File Attachments:** Allow users to share files in chats.

This application provides a client-side foundation for a real-time sales chat and notification system.


```bash
npm run start
```
