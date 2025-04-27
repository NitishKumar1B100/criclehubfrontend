<body>
    <h1>CircleHub</h1>
    <p><strong>CircleHub</strong> is a free, real-time web platform where people can meet, connect, and communicate through public rooms, private friendships, and communities. Sign in with Google, join public rooms, chat with friends, or create your own community — all in one simple and powerful platform.</p>
    <p>🌐 <a class="link" href="https://circlehub-4520b.web.app/" target="_blank">Live Demo</a></p>
    <h2>Features</h2>
    <ul>
        <li>🔑 <strong>Google Sign-In</strong> for secure and easy login</li>
        <li>💬 <strong>Public Rooms</strong> — join and chat with everyone through text, voice, and video</li>
        <li>🤝 <strong>Private Friendships</strong> — follow each other to become friends and chat privately</li>
        <li>🏡 <strong>Communities</strong> — create or join groups for focused discussions</li>
        <li>🚀 <strong>Fast, clean, and mobile-friendly</strong> design</li>
        <li>💯 <strong>100% free</strong> with no hidden charges</li>
    </ul>
    <h2>Tech Stack</h2>
    <div class="tech-stack">
        <ul>
            <li><strong>Frontend</strong>: React.js, Vite, TailwindCSS, React-Icons, Socket.IO Client, Firebase</li>
            <li><strong>Backend</strong>: Node.js, Express.js, Firebase Admin SDK, Socket.IO Server, Agora Access Token Generator</li>
            <li><strong>Real-time Communication</strong>: Agora SDK</li>
        </ul>
    </div>
    <h2>Installation and Setup Instructions</h2>
    <h3>1. Clone the Repository</h3>
    <p class="install-steps">
        <code>git clone https://github.com/your-username/circlehub.git</code><br>
        <code>cd circlehub</code>
    </p>
    <h3>2. Install Dependencies</h3>
    <p><strong>For Frontend:</strong></p>
    <p class="install-steps">
        <code>cd frontend</code><br>
        <code>npm install</code>
    </p>
    <p><strong>For Backend:</strong></p>
    <p class="install-steps">
        <code>cd backend</code><br>
        <code>npm install</code>
    </p>
    <h3>3. Setup Environment Variables</h3>
    <p class="note">Create a <strong>.env</strong> file in the <strong>frontend</strong> directory with the following keys:</p>
    <p class="install-steps">
        <code>VITE_FIREBASE_API_KEY=your_firebase_api_key</code><br>
        <code>VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain</code><br>
        <code>VITE_FIREBASE_PROJECT_ID=your_firebase_project_id</code><br>
        <code>VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket</code><br>
        <code>VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id</code><br>
        <code>VITE_FIREBASE_APP_ID=your_firebase_app_id</code><br>
        <code>VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id</code><br>
        <code>VITE_AGORA_APP_ID=your_agora_app_id</code><br>
        <code>VITE_BASE_URL=your_backend_base_url</code>
    </p>
    <p class="note">Create a <strong>.env</strong> file in the <strong>backend</strong> directory with the following keys:</p>
    <p class="install-steps">
        <code>FIREBASE_PROJECT_ID=your_firebase_project_id</code><br>
        <code>FIREBASE_PRIVATE_KEY_ID=your_private_key_id</code><br>
        <code>FIREBASE_CLIENT_EMAIL=your_firebase_client_email</code><br>
        <code>FIREBASE_CLIENT_ID=your_firebase_client_id</code><br>
        <code>FIREBASE_AUTH_URL=https://accounts.google.com/o/oauth2/auth</code><br>
        <code>FIREBASE_TOKEN_URL=https://oauth2.googleapis.com/token</code><br>
        <code>FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs</code><br>
        <code>FIREBASE_CLIENT_CERT_URL=your_firebase_client_cert_url</code><br>
        <code>AGORA_APP_ID=your_agora_app_id</code><br>
        <code>AGORA_APP_CERTIFICATE=your_agora_app_certificate</code>
    </p>
    <h3>4. Running the Application</h3>
    <p><strong>Start the backend server:</strong></p>
    <p class="install-steps">
        <code>cd backend</code><br>
        <code>npm start</code>
    </p>
    <p><strong>Start the frontend development server:</strong></p>
    <p class="install-steps">
        <code>cd frontend</code><br>
        <code>npm run dev</code>
    </p>
    <h2>Usage</h2>
    <ul>
        <li><strong>Sign in</strong> with your Google account.</li>
        <li><strong>Join a public room</strong> and chat through text, voice, or video.</li>
        <li><strong>Follow users</strong> to become friends and <strong>chat privately</strong>.</li>
        <li><strong>Create communities</strong> to gather people around shared interests.</li>
    </ul>
    <h2>License</h2>
    <p>This project is licensed under the <a class="link" href="LICENSE" target="_blank">MIT License</a>.</p>
    <h2>Acknowledgements</h2>
    <ul>
        <li><a class="link" href="https://firebase.google.com/" target="_blank">Firebase</a></li>
        <li><a class="link" href="https://www.agora.io/" target="_blank">Agora</a></li>
        <li><a class="link" href="https://socket.io/" target="_blank">Socket.IO</a></li>
        <li><a class="link" href="https://tailwindcss.com/" target="_blank">TailwindCSS</a></li>
        <li><a class="link" href="https://react.dev/" target="_blank">React</a></li>
    </ul>
    <h3>🚀 Happy chatting with CircleHub!</h3>
</body>

