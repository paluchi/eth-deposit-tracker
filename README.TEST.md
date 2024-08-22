# Ethereum (ETH) Deposit Tracker

## Objective

The goal of this project is to develop a robust and efficient Ethereum Deposit Tracker that monitors and records ETH deposits on the Beacon Deposit Contract.

## Table of Contents

- [Objective](#objective)
- [Examples of Deposits](#examples-of-deposits)
- [Project Components](#project-components)
  - [Language](#language)
  - [RPC Integration](#rpc-integration)
  - [Deposit Tracking Logic](#deposit-tracking-logic)
  - [Alerting and Notifications](#alerting-and-notifications)
  - [Error Handling and Logging](#error-handling-and-logging)
  - [Documentation](#documentation)
- [Schema of Deposit](#schema-of-deposit)
- [Deliverables](#deliverables)
- [Setup Development Environment](#setup-development-environment)
- [Usage Instructions](#usage-instructions)

## Examples of Deposits

- **Normal Transaction:** `0x1391be19259f10e01336a383217cf35344dd7aa157e95030f46235448ef5e5d6`
- **Internal Transaction:** `0x53c98c3371014fd54275ebc90a6e42dffa2eee427915cab5f80f1e3e9c64eba4`

## Project Components

### Language

- **TypeScript (TS)**: The project will be developed using TypeScript to leverage static typing and improve code reliability.

### RPC Integration

- Establish an RPC connection to an Ethereum node using providers like Infura, Alchemy, or a local node.
- Develop functions that utilize Ethereum RPC methods to fetch transaction data.
- Parse and filter transactions to identify ETH deposits.
- Ensure the system handles real-time data fetching and processing.

### Deposit Tracking Logic

- Implement logic to monitor the Beacon Deposit Contract address `0x00000000219ab540356cBB839Cbe05303d7705Fa` for incoming ETH deposits.
- Develop functions to record and store deposit details (amount, sender address, timestamp, etc.).
- Handle multiple deposits made in a single transaction, including internal transactions.

### Alerting and Notifications

- Integrate alerting mechanisms to notify when new deposits are detected.
- Set up a Grafana dashboard to visualize deposit data and system metrics.
- Implement Telegram notifications to alert users of new deposits.

### Error Handling and Logging

- Implement comprehensive error handling for API calls and RPC interactions.
- Add logging mechanisms to track errors and important events.

### Documentation

- Document the setup process, including environment configuration and dependency installation.
- Provide detailed usage instructions for the ETH deposit tracker.
- Include comments in the codebase for better readability and maintenance.

## Schema of Deposit

```typescript
Deposit {
    blockNumber: number;
    blockTimestamp: number;
    fee?: number;
    hash?: string;
    pubkey: string;
}
```

## Deliverables

- A TypeScript-based ETH deposit tracker application.
- A repository with the complete source code, properly structured and documented.
- A comprehensive README file with setup, usage instructions, and examples.
- Error handling and logging mechanisms integrated into the application.
- Alerting system with Grafana dashboard and Telegram notifications.

## Setup Development Environment

1. Install and configure Node.js and TypeScript.
2. Set up a project repository and initialize it with a `package.json` file.
3. Install necessary dependencies (e.g., `ethers`, `axios`).

## Usage Instructions

1. Clone the repository and navigate to the project directory.
2. Install dependencies using `npm install`.
3. Configure the Ethereum RPC provider (e.g., Infura, Alchemy) in the project settings.
4. Run the application using `npm start`.
5. Monitor the Grafana dashboard for real-time updates on ETH deposits.