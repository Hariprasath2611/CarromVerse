# Firebase Setup & Configuration Guide — CarromVerse

This guide provides step-by-step instructions for establishing the Firebase backend infrastructure for **CarromVerse**.

> [!IMPORTANT]
> The steps marked with **[MANUAL ACTION REQUIRED]** must be completed by you in the [Firebase Console](https://console.firebase.google.com/). The client codebase has been pre-configured and will automatically connect once your project credentials are added to `.env`.

---

## 1. Create a Firebase Project [MANUAL ACTION REQUIRED]

1. Navigate to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Name your project (e.g., `carromverse` or `carromverse-prod`).
4. Choose whether to enable Google Analytics (Recommended for user telemetry).
5. Click **Create project** and wait for provisioning to finish.

---

## 2. Register Client Applications [MANUAL ACTION REQUIRED]

### A. Register Web App (Required for Expo Client)
1. On the project overview page, click the **Web icon** (`</>`) to add a Web App.
2. Enter App nickname: `CarromVerse Mobile`.
3. Do NOT check "Also set up Firebase Hosting".
4. Click **Register app**.
5. Keep the screen open showing `firebaseConfig` keys (`apiKey`, `authDomain`, `projectId`, etc.).

### B. Register Android App (For Production Native Builds)
1. Click **Add app** -> **Android icon**.
2. Android package name: `com.carromverse.mobile` (matches `app.json`).
3. App nickname: `CarromVerse Android`.
4. Register app and download `google-services.json` (save for Phase 1.5 EAS Build).

### C. Register iOS App (For Production Native Builds)
1. Click **Add app** -> **iOS icon**.
2. iOS bundle ID: `com.carromverse.mobile` (matches `app.json`).
3. App nickname: `CarromVerse iOS`.
4. Register app and download `GoogleService-Info.plist` (save for Phase 1.5 EAS Build).

---

## 3. Configure Environment Variables

1. In the project root, open `.env` (or copy `.env.example` to `.env`):
   ```bash
   cp .env.example .env
   ```
2. Populate the keys using the values from your Firebase Web App configuration:
   ```env
   EXPO_PUBLIC_APP_ENV=development
   EXPO_PUBLIC_APP_VERSION=1.0.0

   EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...YourKey...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=carromverse-xxxx.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=carromverse-xxxx
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=carromverse-xxxx.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
3. Verify that `.env` is listed in `.gitignore` so secrets are never pushed to git.

---

## 4. Enable Firebase Authentication [MANUAL ACTION REQUIRED]

1. In Firebase Console, go to **Build** -> **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, select **Email/Password**.
4. Toggle **Enable** for Email/Password (leave Email link passwordless disabled).
5. Click **Save**.
6. *(Optional future extension)* Google sign-in can be enabled in Phase 2.

---

## 5. Create Cloud Firestore Database [MANUAL ACTION REQUIRED]

1. In Firebase Console, go to **Build** -> **Firestore Database**.
2. Click **Create database**.
3. Choose a Database location close to your primary audience (e.g., `asia-south1` or `us-central1`).
4. Choose **Start in production mode** (we will supply strict security rules below).
5. Click **Create**.

---

## 6. Configure Cloud Firestore Security Rules [MANUAL ACTION REQUIRED]

1. In Firestore, click the **Rules** tab.
2. Copy the entire contents of `firestore.rules` located in the root of this project:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       function isAuthenticated() { return request.auth != null; }
       function isOwner(userId) { return isAuthenticated() && request.auth.uid == userId; }

       match /users/{userId} {
         allow read: if isAuthenticated();
         allow create: if isOwner(userId) && request.resource.data.userId == userId;
         allow update: if isOwner(userId) && request.resource.data.userId == userId;
         allow delete: if false;
       }

       match /gameStatistics/{userId} {
         allow read: if isAuthenticated();
         allow create, update: if isOwner(userId) && request.resource.data.userId == userId;
         allow delete: if false;
       }

       match /matches/{matchId} {
         allow read: if isAuthenticated() && (
           resource.data.userId == request.auth.uid ||
           request.auth.uid in resource.data.playerIds
         );
         allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
         allow update, delete: if false;
       }

       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```
3. Click **Publish**.

---

## 7. Enable Firebase Storage [MANUAL ACTION REQUIRED]

1. In Firebase Console, go to **Build** -> **Storage**.
2. Click **Get Started**.
3. Choose **Start in production mode**.
4. Select the Cloud Storage location (matching Firestore).
5. Click **Done**.

---

## 8. Configure Firebase Storage Security Rules [MANUAL ACTION REQUIRED]

1. In Firebase Storage, click the **Rules** tab.
2. Copy the contents of `storage.rules` located in the root of this project:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       function isAuthenticated() { return request.auth != null; }
       function isOwner(userId) { return isAuthenticated() && request.auth.uid == userId; }
       function isValidImage() {
         return request.resource.contentType.matches('image/(jpeg|png|webp)')
           && request.resource.size < 5 * 1024 * 1024;
       }

       match /profiles/{userId}/{fileName} {
         allow read: if isAuthenticated();
         allow write: if isOwner(userId) && isValidImage();
         allow delete: if isOwner(userId);
       }

       match /game-assets/{allPaths=**} {
         allow read: if isAuthenticated();
         allow write: if false;
       }

       match /profile-assets/{allPaths=**} {
         allow read: if isAuthenticated();
         allow write: if false;
       }

       match /{allPaths=**} {
         allow read, write: if false;
       }
     }
   }
   ```
3. Click **Publish**.

---

## 9. Testing & Verifying Connectivity

1. Start the mobile app:
   ```bash
   npm start
   ```
2. Navigate to **Sign In** -> click **Sign Up**.
3. Create an account with an email (e.g., `test@carromverse.com`) and password (`password123`).
4. In Firebase Console:
   - Check **Authentication** -> verify user appears in Users table.
   - Check **Firestore** -> verify `users/{userId}` document exists with username, email, level 1.
   - Check `gameStatistics/{userId}` document initialized.
5. In the app:
   - Navigate to **Settings** -> Click **Sign Out** -> Verify clean logout.
   - Log back in with the same credentials -> Verify session restored.
   - Force quit and reopen app -> Verify session persists via AsyncStorage.

