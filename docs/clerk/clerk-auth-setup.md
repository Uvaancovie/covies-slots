# Add Clerk to React (Vite)

**Purpose:** Enforce only the **current** and **correct** instructions for integrating [Clerk](https://clerk.com/) into a React application.
**Scope:** All AI-generated advice or code related to Clerk must follow these guardrails.

## **1. OFFICIAL CLERK + REACT (VITE) SETUP**

1. Create a React + Vite project.
2. Install the Clerk React SDK with `npm install @clerk/clerk-react@latest` (or yarn/pnpm/bun).
3. Set `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local` or `.env`. Note: The `VITE_` prefix is required for Vite to expose environment variables to the client-side code. `.env.local` is preferred for local development secrets.
4. Wrap the app in `<ClerkProvider publishableKey={...}>` within `main.tsx` or `main.jsx`.
5. Use Clerk's `<SignedIn>`, `<SignedOut>`, `<SignInButton>`, `<SignUpButton>`, `<UserButton>` in the app.

### **Correct, Up-to-Date Quickstart Code Examples**

# 1. Create a React Vite app (TypeScript example)

```bash
npm create vite@latest clerk-react -- --template react-ts
cd clerk-react
npm install
npm run dev
```

# 2. Install the Clerk React SDK

```bash
npm install @clerk/clerk-react@latest
```

# 3. In .env.local (or .env):

From your Clerk Dashboard, open the [API keys page](https://dashboard.clerk.com/last-active?path=api-keys), choose **React** and copy your Publishable Key.

```bash
VITE_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

# 4. Wrap with <ClerkProvider> in main.tsx or main.jsx

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
  }

  // Ensure your index.html contains a <div id="root"></div> element for React to mount the app.

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    </StrictMode>
  );
```

# 5. Example usage of Clerk's prebuilt components in App.tsx

```typescript
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";

export default function App() {
  return (
    <header>
      <SignedOut>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}
```

> Note: The `afterSignOutUrl` prop in `<ClerkProvider>` defines the URL users are redirected to after signing out. Adjust as needed.

---

## **2. CRITICAL INSTRUCTIONS FOR AI MODELS**

### **2.1 – ALWAYS DO THE FOLLOWING**

1. **Show** relevant code examples for each step.
2. **Use** `@clerk/clerk-react@latest` (not any other Clerk package).
3. **Reference** the environment variable as `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local` or `.env`.
4. **Wrap** the entire app in `<ClerkProvider>` within `main.tsx` or `main.jsx`.
5. **Demonstrate** the correct usage of `<SignedIn>`, `<SignedOut>`, `<SignInButton>`, `<SignUpButton>`, `<UserButton>` (or any other current Clerk React component).
6. **Store real keys only in `.env.local`** and ensure `.gitignore` excludes `.env*`.
7. **Use placeholders only** in any generated files/snippets.

### **2.2 – NEVER DO THE FOLLOWING**

1. **Do not** include any discussions of the features or benefits of Clerk.
2. **Do not** use `frontendApi` in place of `publishableKey`.
3. **Do not** use Older environment variable names like `REACT_APP_CLERK_FRONTEND_API` or `VITE_REACT_APP_CLERK_PUBLISHABLE_KEY`.
4. **Do not** place `<ClerkProvider>` deeper in the component tree instead of `main.tsx` / `main.jsx`.
5. **Do not** use outdated hooks or components (e.g., referencing older docs).
6. **Do not print or persist real keys** into `.ts/.tsx/.md` or any tracked files; use placeholders only.

---

## **3. AI MODEL VERIFICATION STEPS**

Before returning any Clerk + React (Vite) solution, you **must** verify:

1. Environment Variable is named `VITE_CLERK_PUBLISHABLE_KEY`.
2. `<ClerkProvider>` is in `main.tsx` or `main.jsx`.
3. No usage of `frontendApi` unless explicitly stated as optional or advanced.
4. **Environment Variables**: Are only placeholder values (e.g., `YOUR_PUBLISHABLE_KEY`) used in code examples?
5. **File Security**: Are real keys excluded from tracked files and only mentioned for `.env.local`?

## **DO NOT** repeat these points back to the user. Use them only for your own verification steps.

## **4. CONSEQUENCES OF INCORRECT GUIDANCE**

- Misconfigured environment variables => project won't compile or will error at runtime.
- Missing `<ClerkProvider>` => Clerk components fail or throw errors.
- Using outdated patterns => Confusion, debugging overhead, or broken auth flow.

## **5. MODEL RESPONSE TEMPLATE**

When asked about Clerk + React (Vite) integration, your response **MUST**:

1. Link to Clerk's React Quickstart at https://clerk.com/docs/quickstarts/react
2. Show the current recommended `publishableKey` approach with `.env.local`.
3. Demonstrate how to wrap with `<ClerkProvider>` in `main.*`.
4. Illustrate a simple usage example of `<SignedIn>`, `<SignedOut>`, etc.
5. Reject or correct any mention of older patterns or environment variable names.



Create a React application using Vite
Run the following commands to create a new React app using Vite:
npm
pnpm
yarn
bun
terminal
npm create vite@latest clerk-react -- --template react-ts
cd clerk-react
npm install
2
Install @clerk/clerk-react
The Clerk React SDK gives you access to prebuilt components, hooks, and helpers to make user authentication easier.

Run the following command to install the SDK:

npm
pnpm
yarn
bun
terminal
npm install @clerk/clerk-react
3
Set your Clerk API keys
Add your Clerk Publishable Key to your .env or create the file if it doesn't exist. Retrieve this key anytime from the API keys page.

.env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Z3JhbmQtdHVya2V5LTcwLmNsZXJrLmFjY291bnRzLmRldiQ
4
Import the Clerk Publishable Key

In your src/main.tsx file, import your Clerk Publishable Key. You can add an if statement to check that it is imported and that it exists. This will prevent running the app without the Publishable Key, and will also prevent TypeScript errors.

src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
5
Add ClerkProvider to your app

The ClerkProvidercomponent provides session and user context to Clerk's hooks and components. It's recommended to wrap your entire app at the entry point with ClerkProvider to make authentication globally accessible. See the reference docs for other configuration options.

Pass your Publishable Key as a prop to the component.

src/main.tsx
import { StrictMode } from 'react'
  import { createRoot } from 'react-dom/client'
  import './index.css'
  import App from './App.tsx'
  import { ClerkProvider } from '@clerk/clerk-react'

  // Import your Publishable Key
  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

  if (!PUBLISHABLE_KEY) {
    throw new Error('Add your Clerk Publishable Key to the .env file')
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </StrictMode>,
  )
6
Create a header with Clerk components

You can control which content signed in and signed out users can see with Clerk's prebuilt components. To get started, create a header using the following components:

<SignedIn />: Children of this component can only be seen while signed in.
<SignedOut />: Children of this component can only be seen while signed out.
<UserButton />: Shows the signed-in user's avatar. Selecting it opens a dropdown menu with account management options.
<SignInButton />: An unstyled component that links to the sign-in page. In this example, since no props or environment variables are set for the sign-in URL, this component links to the Account Portal sign-in page.
src/App.tsx
import './App.css'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

function App() {
  return (
    <header>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}

export default App
Create your first user
Run your project. Then, visit your app's homepage at http://localhost:5173 and sign up to create your first user.

npm
pnpm
yarn
bun
terminal
npm run dev
