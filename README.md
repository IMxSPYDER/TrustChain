# TruChain - Decentralized Digital Identity Platform

## Overview
TruChain is a decentralized digital identity platform leveraging Self-Sovereign Identity (SSI) and Zero-Knowledge Proofs (ZKP). It enables users to securely register, create wallets, and generate verifiable tokens. Institutions and organizations can request access to user credentials for verification, and users have full control to grant, reject, or revoke access at any time, ensuring privacy protection. To enhance the user experience, TruChain integrates a Gemini-powered chatbot that guides users through the platform.

## Features
- **Decentralized Identity**: Users can create and manage their digital identities in a trustless environment.
- **Self-Sovereign Identity (SSI)**: Users have full control over their identity data.
- **Zero-Knowledge Proofs (ZKP)**: Ensures privacy-preserving identity verification.
- **Wallet Integration**: Supports MetaMask for secure transactions.
- **Verifiable Token Generation**: Users can create and manage verifiable tokens.
- **Credential Verification**: Institutions and organizations can request access to user credentials, and users can grant, reject, or revoke access.
- **Privacy Control**: Users can revoke access to their credentials at any time.
- **Gemini-Powered Chatbot**: Provides real-time assistance and platform guidance.

## Tech Stack
- **Frontend**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Backend**: Solidity (Smart Contracts)
- **Blockchain Integration**: Ethereum
- **Wallet Support**: MetaMask
- **Development & Testing**: Remix IDE
- **AI Chatbot**: Gemini AI

## Installation & Setup
### Prerequisites
Ensure you have the following installed:
- Node.js & npm
- MetaMask extension
- Remix IDE (for Solidity development)

### Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/truchain.git
   cd truchain
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. Deploy smart contracts via Remix IDE:
   - Open `contracts/TruChain.sol` in Remix IDE.
   - Compile and deploy the contract to a test network.
   - Copy the contract address and update it in the frontend.

## Usage
- Register and create your decentralized identity.
- Connect your MetaMask wallet.
- Generate and manage verifiable tokens.
- Request and grant/reject credential verification for institutions.
- Revoke access to credentials at any time for privacy control.
- Interact with the chatbot for guidance and information.

## Smart Contract Deployment
1. Open Remix IDE and load `TruChain.sol`.
2. Compile the contract and deploy it to a testnet.
3. Copy the deployed contract address and update your frontend configuration.

## Contributing
We welcome contributions! Feel free to open issues and submit pull requests.

## License
This project is licensed under the MIT License.
