# LedgerCore Frontend Application

LedgerCore Frontend is a client-side user interface built to interact with the LedgerCore banking engine. It provides secure account management, transaction history visualization, and a protected fund transfer interface equipped with idempotency tracking to prevent duplicate execution during network latency or multiple form submissions.

## Features

* User Authentication: Forms for registration and login handling JWT tokens stored securely to maintain authenticated sessions.
* Interactive Dashboard: Clean layout summarizing account profiles, tracking real-time account balances, and listing categorized transaction histories.
* Safe Fund Transfers: Form interfaces enforcing dynamic client-side validation (bounds checking for negative numbers, zero, or missing accounts) before generating and passing unique tracking tokens to the ledger service.
* Error Management: Graceful interceptors translating explicit backend error states (e.g., unauthorized access, invalid credentials, duplicate transactions) into clear UI feedback components.

---

## Tech Stack

* Framework: React (Vite-powered environment for fast building and HMR)
* State Management: Standard React Context API / React Hooks
* HTTP Client: Axios (configured with automated request interceptors for token inclusion)
* Styling: CSS Variables / Basic styling architecture optimized for layout scannability

---

## Project Structure

```text
ledgercore-frontend/
├── public/               # Static assets
├── src/
│   ├── assets/           # Global styles and branding assets
│   ├── components/       # Reusable layout elements (Buttons, Inputs, Modals)
│   ├── context/          # Auth context handling JWT state and login/logout flows
│   ├── hooks/            # Custom hooks for fetching data or handling API logic
│   ├── views/            # Main layout screens (Login, Register, Dashboard)
│   ├── app.jsx           # Root application router and route protections
│   ├── main.jsx          # DOM rendering entry point
│   └── services/
│       └── api.js        # Axios instance configured with base API configuration
├── .gitignore            # File tracking exemptions
├── index.html            # Core entry template
├── package.json          # Node dependencies and build script listings
└── vite.config.js        # Build optimization configuration
