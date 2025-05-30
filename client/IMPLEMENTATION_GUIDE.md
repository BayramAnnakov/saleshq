# Language-Agnostic WebSocket Chat Client Implementation Guide

## Overview

This document provides complete technical specifications for implementing a WebSocket-based chat client that can connect to sales team communication servers. The implementation is language-agnostic and can be built using any technology stack (Python, Rust, JavaScript, Go, Java, etc.) or even as an MCP (Model Context Protocol) server.

## Core Functional Requirements

### 1. WebSocket Connection Management
The client must establish and maintain a persistent WebSocket connection to a chat server.

**Connection Parameters:**
- **URL Format**: `ws://hostname:port` or `wss://hostname:port` (secure)
- **Default URL**: `ws://localhost:8080`
- **Protocol**: Standard WebSocket protocol (RFC 6455)
- **Reconnection**: Manual reconnection on connection loss

**Connection States:**
```
DISCONNECTED -> CONNECTING -> CONNECTED -> DISCONNECTED
```

### 2. User Identity Management
Each client instance must identify itself with a unique user identifier.

**User ID Requirements:**
- **Format**: String, no spaces, alphanumeric + underscore
- **Example**: `user_sales_john`, `user_client_default`
- **Persistence**: Session-based (not persistent across app restarts)

### 3. Channel-Based Communication
The client supports multiple communication channels for different purposes.

**Predefined Channels:**
```json
[
  {"id": "channel_prospector", "name": "ProspectorBot"},
  {"id": "channel_researcher", "name": "ResearcherBot"},
  {"id": "channel_bayram", "name": "Bayram"},
  {"id": "channel_merdan", "name": "Merdan"},
  {"id": "channel_sdrbot", "name": "SDRBot"}
]
```

## WebSocket Protocol Specification

### Message Format
All WebSocket messages use JSON format with UTF-8 encoding.

### Client-to-Server Messages

#### Send Message
```json
{
  "type": "sendMessage",
  "payload": {
    "userId": "user_sales_john",
    "channelId": "channel_prospector",
    "text": "New lead from ABC Corp"
  }
}
```

**Field Specifications:**
- `type`: Always `"sendMessage"` (string, required)
- `payload.userId`: Sender's user identifier (string, required)
- `payload.channelId`: Target channel ID (string, required)  
- `payload.text`: Message content (string, required, 1-2000 chars)

### Server-to-Client Messages

#### New Message
```json
{
  "type": "newMessage",
  "payload": {
    "id": "9155e49f-fc84-4e5d-8995-e31329cb34e3",
    "userId": "user_sales_john",
    "channelId": "channel_prospector",
    "text": "New lead from ABC Corp",
    "timestamp": 1748559500625
  }
}
```

**Alternative Format** (some servers use `senderId` instead of `userId`):
```json
{
  "type": "newMessage",
  "payload": {
    "id": "9155e49f-fc84-4e5d-8995-e31329cb34e3",
    "senderId": "user_sales_john",
    "channelId": "channel_prospector", 
    "text": "New lead from ABC Corp",
    "timestamp": 1748559500625
  }
}
```

**Field Specifications:**
- `type`: Always `"newMessage"` (string, required)
- `payload.id`: Unique message identifier (string, required)
- `payload.userId` OR `payload.senderId`: Sender identifier (string, required)
- `payload.channelId`: Channel where message was sent (string, required)
- `payload.text`: Message content (string, required)
- `payload.timestamp`: Unix timestamp in milliseconds (number, required)

#### Error Message
```json
{
  "type": "error",
  "payload": {
    "message": "Invalid channel ID"
  }
}
```

**Field Specifications:**
- `type`: Always `"error"` (string, required)
- `payload.message`: Error description (string, required)

## Core Implementation Components

### 1. WebSocket Client Manager

**Responsibilities:**
- Establish WebSocket connections
- Handle connection state changes
- Send/receive messages
- Parse JSON messages
- Manage reconnection logic

**Required Methods/Functions:**
```
connect(url: string, userId: string) -> void
disconnect() -> void
sendMessage(channelId: string, text: string) -> void
onMessage(callback: function) -> void
onConnectionStateChange(callback: function) -> void
onError(callback: function) -> void
```

**State Properties:**
```
isConnected: boolean
currentUserId: string
connectionError: string | null
```

### 2. Message Store

**Responsibilities:**
- Store received messages in memory
- Provide message filtering by channel
- Handle message deduplication
- Manage optimistic updates

**Data Structure:**
```json
{
  "id": "string",
  "userId": "string", 
  "channelId": "string",
  "text": "string",
  "timestamp": "number",
  "isOptimistic": "boolean (optional)"
}
```

**Required Operations:**
```
addMessage(message) -> void
getMessages() -> array
getMessagesByChannel(channelId) -> array
removeMessage(messageId) -> void
clear() -> void
```

### 3. User Interface Components

#### Connection Form
**Purpose**: Allow user to configure connection settings

**Required Fields:**
- WebSocket URL input (text field)
- User ID input (text field)  
- Connect button
- Connection status indicator

**Validation Rules:**
- URL must be valid WebSocket format (`ws://` or `wss://`)
- User ID must be non-empty string
- Both fields required before connection

#### Channel Selector
**Purpose**: Allow switching between chat channels

**Implementation:**
- Dropdown/select component with predefined channels
- Show channel name as display text
- Use channel ID as value
- Default to first channel on load

#### Message List
**Purpose**: Display messages for current channel

**Display Requirements:**
- Show messages chronologically (oldest to newest)
- Distinguish between own messages and others
- Display: sender name, timestamp, message text
- Auto-scroll to newest message
- Empty state when no messages

**Message Styling:**
- Own messages: Right-aligned, distinct background color
- Other messages: Left-aligned, different background color
- Timestamps: Small, muted text
- Sender names: Bold or highlighted text

#### Message Input
**Purpose**: Compose and send new messages

**Components:**
- Text input field with placeholder
- Send button
- Form submission handling (Enter key + button click)
- Auto-clear input after sending

#### Status Indicator
**Purpose**: Show current connection state

**States:**
- Connected: Green indicator + "Connected" text
- Disconnected: Red indicator + "Disconnected" text  
- Connecting: Yellow indicator + "Connecting..." text
- Error: Red indicator + error message

## State Management Patterns

### Application State Structure
```json
{
  "connection": {
    "url": "ws://localhost:8080",
    "userId": "user_client_default", 
    "isConnected": false,
    "error": null
  },
  "ui": {
    "currentChannel": "channel_prospector"
  },
  "messages": [
    {
      "id": "msg-123",
      "userId": "user_sales_john",
      "channelId": "channel_prospector", 
      "text": "Hello world",
      "timestamp": 1748559500625
    }
  ]
}
```

### State Update Patterns

#### Connection State Updates
```
User clicks connect -> Set connecting state -> WebSocket attempt
-> On success: Set connected = true, error = null
-> On failure: Set connected = false, error = message
```

#### Message State Updates
```
User sends message -> Add optimistic message -> Send to server
-> On server response: Keep message (or replace with server version)
-> On send failure: Remove optimistic message

Receive from server -> Validate format -> Check for duplicates 
-> Add to message store -> Trigger UI update
```

## Implementation Examples

### HTTP Testing with curl
You can test WebSocket server compatibility using curl for HTTP upgrade:

```bash
# Test WebSocket handshake
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" \
  http://localhost:8080
```

### Message Validation Logic

**Incoming Message Validation:**
```python
def validate_incoming_message(data):
    try:
        message = json.loads(data)
        
        # Check required top-level fields
        if 'type' not in message or 'payload' not in message:
            return False, "Missing type or payload"
            
        if message['type'] == 'newMessage':
            payload = message['payload']
            required_fields = ['id', 'channelId', 'text', 'timestamp']
            
            # Check for userId OR senderId
            has_user_id = 'userId' in payload or 'senderId' in payload
            if not has_user_id:
                return False, "Missing userId or senderId"
                
            # Check other required fields
            for field in required_fields:
                if field not in payload:
                    return False, f"Missing field: {field}"
                    
            # Type validation
            if not isinstance(payload['timestamp'], (int, float)):
                return False, "timestamp must be number"
                
            return True, "Valid message"
            
        elif message['type'] == 'error':
            if 'message' not in message['payload']:
                return False, "Error payload missing message"
            return True, "Valid error"
            
        else:
            return False, f"Unknown message type: {message['type']}"
            
    except json.JSONDecodeError:
        return False, "Invalid JSON"
```

**Outgoing Message Construction:**
```python
def create_send_message(user_id, channel_id, text):
    return json.dumps({
        "type": "sendMessage",
        "payload": {
            "userId": user_id,
            "channelId": channel_id,
            "text": text
        }
    })
```

### Optimistic Updates Implementation

**Pattern**: Add message to local state immediately when sending, remove if send fails.

```python
def send_message_optimistic(channel_id, text):
    # Create optimistic message
    optimistic_msg = {
        "id": f"temp-{timestamp()}-{random()}",
        "userId": current_user_id,
        "channelId": channel_id,
        "text": text,
        "timestamp": current_timestamp(),
        "isOptimistic": True
    }
    
    # Add to local state immediately
    message_store.add_message(optimistic_msg)
    
    # Send to server
    try:
        websocket.send(create_send_message(current_user_id, channel_id, text))
    except Exception as e:
        # Remove optimistic message on failure
        message_store.remove_message(optimistic_msg["id"])
        show_error("Failed to send message")
```

## Error Handling Specifications

### WebSocket Connection Errors

**Connection Failed:**
- Display: "Failed to connect to server. Check URL and server status."
- Technical: Handle WebSocket connection rejection
- Retry: Manual retry only (don't auto-reconnect)

**Connection Lost:**
- Display: "Connection lost. Click reconnect to restore."
- Technical: Handle WebSocket close events
- Cleanup: Clear connection state, keep messages

**Invalid URL:**
- Display: "Invalid WebSocket URL. Use ws:// or wss://"
- Technical: Validate URL format before connection attempt
- Prevention: Input validation on connection form

### Message Processing Errors

**Invalid JSON:**
- Display: "Received malformed data from server"
- Technical: Handle JSON.parse() exceptions
- Logging: Log raw data for debugging

**Unknown Message Type:**
- Display: "Received unknown message type from server"
- Technical: Handle unexpected message.type values  
- Logging: Log full message for debugging

**Missing Required Fields:**
- Display: "Received invalid message format from server"
- Technical: Validate message structure
- Logging: Log validation errors with details

### User Input Errors

**Empty Message:**
- Behavior: Disable send button, ignore send attempts
- No error display needed (prevent rather than handle)

**Connection Fields Empty:**
- Display: Field-specific validation messages
- Behavior: Disable connect button until valid

**Network Timeout:**
- Display: "Connection timeout. Check network and try again."
- Technical: Handle WebSocket timeout events

## Testing Specifications

### Unit Tests Required

1. **Message Validation:**
   - Valid newMessage format
   - Valid error format  
   - Invalid JSON handling
   - Missing field handling
   - Type validation

2. **State Management:**
   - Message store operations
   - Channel filtering
   - Optimistic update flow
   - Duplicate detection

3. **WebSocket Handling:**
   - Connection state changes
   - Message parsing
   - Error event handling
   - Reconnection logic

### Integration Tests Required

1. **End-to-End Message Flow:**
   - Send message -> Receive echo
   - Multi-channel messaging
   - User identification
   - Timestamp validation

2. **Error Scenarios:**
   - Server disconnection handling
   - Invalid server responses
   - Network failure recovery

### Manual Testing Scenarios

1. **Basic Flow:**
   - Connect to server
   - Switch channels
   - Send/receive messages
   - Disconnect gracefully

2. **Error Conditions:**
   - Invalid server URL
   - Server shutdown during use
   - Malformed server messages
   - Network interruption

## Performance Requirements

### Message Handling:
- Support 1000+ messages in memory
- Smooth scrolling with 100+ messages visible
- Sub-100ms message display latency

### Connection Management:
- Connect within 5 seconds on good network
- Graceful degradation on poor network
- Immediate UI feedback for all actions

### Memory Usage:
- Reasonable memory growth with message history
- Optional message cleanup for long sessions

## Security Considerations

### Input Validation:
- Sanitize all user inputs
- Validate message length limits
- Prevent XSS in message display

### WebSocket Security:
- Support WSS (secure WebSocket) connections
- Validate server certificates in production
- Handle authentication if required by server

### Data Handling:
- No persistent storage of sensitive data
- Clear connection credentials on disconnect
- Secure handling of user identifiers

## Deployment Considerations

### Environment Configuration:
- Configurable WebSocket URL (environment variable)
- Configurable default user ID
- Channel configuration flexibility

### Build Requirements:
- WebSocket client library
- JSON parsing capability
- UI framework appropriate for target platform
- HTTP client for initial testing

### Browser Compatibility (for web implementations):
- Modern browsers with WebSocket support
- Fallback messaging for unsupported browsers
- Mobile browser considerations

This implementation guide provides all necessary specifications for building a compatible WebSocket chat client in any programming language or technology stack.