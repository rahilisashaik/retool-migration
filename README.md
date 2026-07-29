# Retool Internal Engineering Platform

A unified internal engineering platform that consolidates 3 Retool apps (KYC review queue, refunds dashboard, and feature flag admin panel) into a single production-style web application. The platform includes shared authentication, shared components, and clean architecture with cross-domain context to reduce cost, centralize ownership, and enable AI-powered workflows.

Target users include Compliance/KYC Analysts (review identity documents), Support/Ops Agents (manage refund requests), Product/Engineering teams (configure feature flags), and Managers who can work cross-domain and execute follow-up actions across KYC, Refunds, and Feature Flags.

The objective is to enable this internal engineering platform to scale beyond a subset of workflows to enable internal operations at Bread AI. As a result, the efficiency gains are realized in real ROI, effectively amortizing the cost of Devin for development. 

## Local Development

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and configure environment variables
3. Setup database: `npm run db:push && npm run db:seed`
4. Start dev server: `npm run dev`

Open http://localhost:3000
