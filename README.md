# Good List

A joyful, family-friendly Christmas list web app built with Next.js, Firebase Authentication, and Cloud Firestore. Kids can log good deeds, earn points, and build a wish list while parents guide approvals and budgets.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add environment variables in a `.env.local` file:

   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   OPENAI_API_KEY=...
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the app.

## Firebase Security Rules

Add the rules from `FIRESTORE_RULES` to your project to ensure users can only access their own data.
