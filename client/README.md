# WebSocket Chat Client

This React application serves as a client for a WebSocket-based chat server. It allows users to connect to a specified server, set their user ID, choose a chat channel, send messages, and receive real-time messages from other users or system events on subscribed channels.

Built with React, TypeScript, and Tailwind CSS. It can be run with Vite for an enhanced development experience or served statically.

## Features

-   **WebSocket Connectivity:** Connect to any WebSocket server by providing its URL.
-   **User Identification:** Assign a custom User ID for your session.
-   **Channel Selection:** Choose from a predefined list of channels to send messages to.
-   **Send Messages:** Compose and send text messages to the selected channel.
-   **Receive Messages:** Display incoming messages from the server in real-time.
-   **Connection Status:** Visual indicator for connection status (Connected, Disconnected, Error).
-   **Message Log:** Displays all received messages, with differentiation for user's own messages.
-   **Responsive Design:** Adapts to different screen sizes.
-   **Clean UI:** Modern and intuitive interface styled with Tailwind CSS.

## How It Works

This application establishes a WebSocket connection to a server. Once connected:

1.  **Sending Messages:** When you type a message and hit "Send":
    *   The client constructs a JSON object with your `userId`, the selected `channelId`, and the `text`.
    *   This JSON object is sent to the WebSocket server.
    *   **Client to Server Message Format:**
        ```json
        {
          "type": "sendMessage",
          "payload": {
            "userId": "your_chosen_user_id",
            "channelId": "selected_channel_id",
            "text": "Your message content"
          }
        }
        ```

2.  **Receiving Messages:** The client listens for messages from the WebSocket server.
    *   It expects the server to send JSON objects for new messages.
    *   Received messages are displayed in the chat interface, attributed to their original sender and channel.
    *   **Server to Client Message Format (for new messages):**
        ```json
        {
          "type": "newMessage",
          "payload": {
            "id": "unique_message_id_from_server",
            "userId": "original_sender_user_id",
            "channelId": "target_channel_id",
            "text": "Content of the message",
            "timestamp": 1678886400000 // Unix timestamp (milliseconds)
          }
        }
        ```
    *   **Server to Client Message Format (for errors from server logic):**
        ```json
        {
          "type": "error",
          "payload": {
            "message": "Description of the error from server"
          }
        }
        ```

**Important:** This client application *requires* a WebSocket server that is running and configured to understand the message formats described above. This project *does not* include the WebSocket server itself.

## Available Channels

The client is pre-configured with the following channels (inspired by the "Main Chat App" context):

-   `channel_general`: General Discussion
-   `channel_prospector`: ProspectorBot
-   `channel_researcher`: ResearcherBot
-   `channel_bayram`: Bayram
-   `channel_merdan`: Merdan
-   `channel_sdrbot`: SDRBot
    
The server is responsible for routing messages based on `channelId`.

## Running the Application

### Prerequisites

*   Node.js (v18 or later recommended) and npm (or yarn).
*   A compatible WebSocket server running and accessible.

### Option 1: Using Vite (Recommended for Development)

1.  **Clone/Download:**
    *   Clone this repository or ensure all project files are in a local directory.
2.  **Install Dependencies:**
    *   Navigate to the project directory in your terminal.
    *   Run `npm install` (or `yarn install`). This will install Vite, React, and other necessary packages.
3.  **Start the Development Server:**
    *   Run `npm run dev` (or `yarn dev`).
    *   Vite will start a development server (usually at `http://localhost:3000` or the next available port) and automatically open it in your browser.
    *   You'll benefit from Hot Module Replacement (HMR) for faster updates during development.

### Option 2: Using a Simple HTTP Server (Static Serving)

This method uses the ES modules and CDN links directly from `index.html` without a build step.

1.  **Serve `index.html`:**
    *   Navigate to the project directory in your terminal.
    *   Use a live server extension in your code editor (like "Live Server" in VS Code). Right-click `index.html` and choose "Open with Live Server".
    *   Alternatively, use a simple HTTP server. If you have Python installed:
        ```bash
        # For Python 3
        python -m http.server
        ```
        Then open `http://localhost:8000` (or the port shown) in your browser.

## How to Use the Client

1.  **Open the Application:** Launch the application using one of the methods above.

2.  **Connect to Server:**
    *   You'll see input fields for "WebSocket Server URL" and "Your User ID".
    *   **WebSocket Server URL:** Enter the full URL of your WebSocket server (e.g., `ws://localhost:8080` or `wss://your-chat-server.com`).
    *   **Your User ID:** Enter a unique identifier for yourself (e.g., `user_alice`, `sales_rep_1`). This ID will be associated with the messages you send.
    *   Click the "Connect" button.

3.  **Connection Status:**
    *   Above the form, a status indicator will show:
        *   **Green "Connected"**: Successful connection.
        *   **Red "Disconnected"**: Not connected.
        *   **Yellow "Error: [message]"**: A connection error occurred or a server-side error message was received. Check the browser console for more details.

4.  **Chat Interface (If Connected):**
    *   **Select Channel:** Use the dropdown menu to choose the channel you want to interact with.
    *   **Message List:** Displays incoming messages for the selected channel.
    *   **Type Message:** Use the input field at the bottom to type your message.
    *   **Send Message:** Click the "Send" button or press Enter.

5.  **Receiving Messages:**
    *   Messages appear in the "All Received Messages Log" and, if relevant, in the selected channel's view.

6.  **Disconnect:**
    *   Click the "Disconnect" button to close the WebSocket connection.

## Troubleshooting

-   **Cannot Connect / Vite Issues:**
    *   Ensure you've run `npm install`.
    *   Verify the WebSocket server URL is correct and the server is running.
    *   Check your browser's developer console (usually F12) for error messages.
    *   Ensure no firewall or network issues block WebSockets or the Vite dev server port.
-   **Messages Not Sending/Receiving:**
    *   Ensure you are connected.
    *   Check browser console for errors.
    *   Verify your WebSocket server handles the defined JSON structures correctly.
-   **"Received malformed message from server." Error:**
    *   The server sent data that isn't valid JSON or doesn't match `ServerToClientMessage`. Check server logs.

## Future Enhancements (Conceptual)

-   User Authentication
-   Dynamic Channel Subscription
-   Private Messaging
-   Typing Indicators & Read Receipts
-   Browser Notifications
-   Automatic Reconnection

This client provides a functional interface for interacting with a WebSocket chat server.
