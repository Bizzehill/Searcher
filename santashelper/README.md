# Santa's Helper (Good List)

A joyful, family-friendly Christmas list web app built with Next.js, Firebase Authentication, and Cloud Firestore. Kids can log
good deeds, earn points, and build a wish list while parents guide approvals and budgets.

## Step-by-step setup guide

### 1. Install dependencies

1. Ensure you have [Node.js 18+](https://nodejs.org/en/download) installed. The easiest way is to install via the official installer or
   use a version manager such as [nvm](https://github.com/nvm-sh/nvm).
2. Open a terminal in the project directory (where this README lives).
3. Install the project packages:

   ```bash
   npm install
   ```

   This downloads Next.js, Firebase, and all UI dependencies into `node_modules/`.

### 2. Configure environment variables

1. Duplicate `.env.local.example` if it exists or create a new `.env.local` file in the project root.
2. Paste the following keys and fill in the values from your Firebase project and OpenAI account:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   OPENAI_API_KEY=sk-your-openai-key
   ```

3. Keep `.env.local` out of version control—Git ignores it via `.gitignore`.

### 3. Prepare Firebase services

1. **Create a Firebase project** at [console.firebase.google.com](https://console.firebase.google.com/).
2. **Add a Web App** inside the project and copy the SDK configuration values into `.env.local`.
3. In the Firebase console, open **Build → Authentication → Sign-in method** and enable **Email/Password**.
4. Navigate to **Build → Firestore Database**, create a database in production mode, and choose a region.
5. Open the **Rules** tab and replace the default rules with the contents of [`FIRESTORE_RULES`](./FIRESTORE_RULES).
6. Deploy/publish the rules so they take effect.

### 4. Run the development server

1. Start the local dev server:

   ```bash
   npm run dev
   ```

2. Visit [http://localhost:3000](http://localhost:3000) in your browser.
3. Use the **Login** page to create an account (it will register with Firebase).
4. Explore the **Parent** and **Santa** dashboards to add children, log deeds, and manage wish lists.

### 5. Optional: moderate user-generated text

The `/api/moderate` route forwards text to OpenAI's moderation endpoint. To use it:

1. Ensure `OPENAI_API_KEY` is set in `.env.local`.
2. Call the route from the client or server via `fetch('/api/moderate', { method: 'POST', body: JSON.stringify({ text: '...' }) })`.

## Firebase Security Rules

Add the rules from [`FIRESTORE_RULES`](./FIRESTORE_RULES) to your project to ensure users can only access their own data.
