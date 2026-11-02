# Deployment Guide

## 1. Backend Service
Build and run with Docker:
```bash
docker-compose -f infrastructure/docker/docker-compose.yml up --build
```
Or run directly with Node.js:
```bash
npm run build --workspace=@carromverse/backend
npm run start --workspace=@carromverse/backend
```

## 2. Frontend Mobile App
Using EAS (Expo Application Services):
```bash
cd apps/frontend
eas build --platform android --profile production
eas build --platform ios --profile production
```

## 3. Firebase Rules Deployment
Using Firebase CLI:
```bash
firebase deploy --only firestore:rules,storage
```
