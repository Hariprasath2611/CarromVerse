# Development Setup Guide

This guide walks you through setting up a complete CarromVerse development environment on Windows, macOS, or Linux.

## Prerequisites
- **Node.js**: v20 or v22 LTS
- **npm**: v10+
- **Expo CLI**: `npm install -g expo-cli`
- **Git**
- Optional: **Docker Desktop** (for backend PostgreSQL and Redis services)

## Monorepo Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-org/CarromVerse.git
   cd CarromVerse
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   ```

3. **Build shared packages**:
   ```bash
   npm run build
   ```

4. **Verify TypeScript compilation**:
   ```bash
   npm run typecheck
   ```

5. **Run test suites**:
   ```bash
   npm run test
   ```

## Starting Frontend (Mobile)
```bash
# Start Metro bundler with Expo
npm run start --workspace=@carromverse/frontend

# Or launch directly in browser
npm run web --workspace=@carromverse/frontend
```

## Starting Backend (Server)
```bash
# Start Express backend
npm run backend
```
Access `http://localhost:4000/health` to verify the backend is online.

