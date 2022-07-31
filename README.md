## Getting Started

### 1. Create Firebase project.
### 2. Setup Firebase authentication methods.
`Google Client ID: 285842046610-d8fdce2jurfes2523nfotrn2k1ivg950.apps.googleusercontent.com`<br />
`Google Client Secret: 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`<br />
`Facebook App ID: 582863809850014`<br />
`Facebook App Secret: 8c40782eb810fe25105170abe5ee5986`<br />
### 3. Create default user in Firebase Authentication.
### 4. Create Firebase database.
`Create settings collection with 'main' and 'booking' doc's`<br />
`Update DB Rules: allow read, write: if request.auth.uid;`<br />
### 5. Setup static environment variables on Vercel project.
`NEXT_PUBLIC_PRODUCTION=true`<br />
`NEXT_GOOGLE_CLIENT_SECRET=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`<br />
`NEXT_PUBLIC_GOOGLE_CLIENT_ID=766102917114-n2dnvdieq2c6alrrnasrhuidtufcqr64.apps.googleusercontent.com`<br />
`NEXT_GOOGLE_API_KEY=AIzaSyC89dBUy8LxrKmMINw-YLLl3FbWhL6dcfs`<br />
### 6. Create Firebase Full-Schedule App and Admin Service Account SDK
`Put both in one line json in environment variables`<br />
`NEXT_ADMIN_FIREBASE_CONFIG=`<br />
`NEXT_PUBLIC_FIREBASE_CONFIG=`<br />