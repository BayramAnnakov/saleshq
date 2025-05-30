 # Deployment Guide

 This document outlines how to publish your **MAS Chat Dashboard** project and make it accessible on the public internet. We cover two main options:

 1. **Local Tunneling** with Ngrok (for quick demos)
 2. **Firebase** (static front-end hosting + WebSocket server on Cloud Run)

 ---

 ## 1. Local Tunneling with Ngrok

 ### Prerequisites
 - Node.js & npm installed
 - Ngrok installed (e.g. `brew install ngrok` or download from https://ngrok.com)

 ### Steps

 1. **Start the WebSocket server**
    ```bash
    npm install
    npm run start:server    # runs ws-server.js on port 8080
    ```

 2. **Tunnel the WebSocket port**
    ```bash
    ngrok http 8080
    ```
    Copy the forwarding URL (e.g. `https://abcd1234.ngrok.io`).

 3. **Configure and start the front-end**
    - Create or update `.env` in the project root:
      ```ini
      VITE_WEBSOCKET_URL=ws://abcd1234.ngrok.io
      ```
    - Start Vite dev server:
      ```bash
      npm run dev
      ```

 4. **Access your app**
    - Open the Vite URL (by default `http://localhost:5173`) in the browser.
    - The front-end will connect to your tunneled WebSocket endpoint.

 *Note*: If you need the entire site tunneled (so you see your front-end publicly), run:
   ```bash
   ngrok http 5173
   ```
   and adjust `VITE_WEBSOCKET_URL` accordingly.

 ---

 ## 2. Production with Firebase

 > **Overview**: Host the React front-end on Firebase Hosting (global CDN), and run the WebSocket server on Google Cloud Run.

 ### 2.1. Install toolchains
 ```bash
 npm install -g firebase-tools
 gcloud components install beta
 ```

 ### 2.2. Authenticate
 ```bash
 firebase login
 gcloud auth login
 gcloud config set project YOUR_FIREBASE_PROJECT_ID
 ```

 ### 2.3. Dockerize the WebSocket server
 Create a file `Dockerfile` next to `ws-server.js`:
 ```dockerfile
 FROM node:18-alpine
 WORKDIR /app
 COPY package*.json ws-server.js ./
 RUN npm install --production
 CMD ["node", "ws-server.js"]
 ```

 ### 2.4. Build & deploy to Cloud Run
 ```bash
 gcloud builds submit --tag gcr.io/$GOOGLE_CLOUD_PROJECT/ws-server
 gcloud run deploy ws-server \
   --image gcr.io/$GOOGLE_CLOUD_PROJECT/ws-server \
   --platform managed --region us-central1 \
   --allow-unauthenticated --port 8080
 ```
 Note the service URL (e.g. `https://ws-server-xxxx.a.run.app`).

 ### 2.5. Build the front-end
 ```bash
 npm run build    # outputs to `dist/`
 ```

 ### 2.6. Initialize Firebase Hosting
 ```bash
 firebase init hosting
 ```
 - Select your project
 - Set **public directory** to `dist`
 - Configure as single-page app? **Yes**

 ### 2.7. Configure rewrites for Cloud Run in `firebase.json`
 ```json
 {
   "hosting": {
     "public": "dist",
     "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
     "rewrites": [
       {
         "source": "/socket",
         "run": { "serviceId": "ws-server", "region": "us-central1" }
       },
       { "source": "**", "destination": "/index.html" }
     ]
   }
 }
 ```

 ### 2.8. Update WebSocket URL for production
 In `.env.production` (or via your build pipeline):
 ```ini
 VITE_WEBSOCKET_URL=wss://<YOUR_FIREBASE_PROJECT_ID>.web.app/socket
 ```

 ### 2.9. Deploy to Firebase
 ```bash
 firebase deploy --only hosting
 ```
 Your app is live at `https://<YOUR_FIREBASE_PROJECT_ID>.web.app`.

 ---

 ## 3. Additional Options
 - **Heroku** / **Railway.app**: Quick Node.js & static site hosting with free tiers.
 - **Vercel**: Ideal for static front-ends; pair with a separate WebSocket backend service.

Choose the workflow that fits your needs and scale.