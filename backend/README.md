# Agent-to-Agent (A2A) Communication Demo

This project demonstrates communication between two agents using the Agent2Agent (A2A) protocol. The system consists of:

1. A Researcher Agent that provides context about prospects
2. An SDR Agent that generates personalized messages using the context

## System Architecture

The system uses a microservices architecture with two independent agents:

### Researcher Agent (Port 3000)
- Provides prospect information based on email addresses
- Maintains a sample database of prospect profiles
- Exposes an A2A API endpoint at `/api`

### SDR Agent (Port 3002)
- Receives prospect emails
- Communicates with the Researcher agent to get prospect information
- Generates personalized outreach messages
- Exposes an A2A API endpoint at `/api`

## Prerequisites

- Node.js v16 or higher
- npm (Node Package Manager)

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd agentkit-a2a-sample
```

2. Install dependencies:
```bash
npm install
cd researcher && npm install
cd ../sdr && npm install
```

3. Start the agents:
```bash
# Terminal 1 - Start Researcher Agent
cd researcher
npm start

# Terminal 2 - Start SDR Agent
cd sdr
npm start
```

## Testing the System

You can test the system using the provided test client:

```bash
# Run the test client
npx ts-node test-client.ts
```

The test client will:
1. Send a prospect email to the SDR agent
2. The SDR agent will request information from the Researcher agent
3. The Researcher agent will return the prospect's details
4. The SDR agent will generate a personalized message

## Sample Interaction Flow

1. Test client sends: `john@example.com`
2. SDR Agent receives the email and requests information from Researcher Agent
3. Researcher Agent looks up the prospect and returns:
   ```json
   {
     "name": "John Smith",
     "company": "TechCorp",
     "role": "CTO",
     "interests": ["AI", "Machine Learning", "Cloud Computing"],
     "recentActivity": ["implemented a new ML pipeline", "led cloud migration project"]
   }
   ```
4. SDR Agent generates a personalized message using this information

## Project Structure

```
.
├── README.md
├── package.json
├── test-client.ts           # Test client for the system
├── researcher/              # Researcher Agent
│   ├── agent.js            # Agent implementation
│   ├── launch.js           # Server setup
│   └── package.json
└── sdr/                    # SDR Agent
    ├── agent.js            # Agent implementation
    ├── launch.js           # Server setup
    └── package.json
```

## Dependencies

- `@artinet/sdk`: For A2A protocol implementation
- `express`: For HTTP server setup
- `typescript`: For type safety and modern JavaScript features

## Development

To modify the system:

1. Edit the prospect database in `researcher/agent.js`
2. Customize message generation in `sdr/agent.js`
3. Modify the test client in `test-client.ts`

## Logging

Both agents include detailed logging to track the flow of communication:
- Researcher Agent logs are prefixed with `[Researcher Agent]`
- SDR Agent logs are prefixed with `[SDR Agent]`

## License

[Your chosen license]

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 