# Application Reuse & Cloning Guide

This document outlines the steps to create a new application based on the existing Navigation App codebase.

## 1. Preparation
Choose a name for your new application (e.g., `MyNewApp`) and a location on your computer.

## 2. Copying the Codebase
You have two main options to copy the code:

### Option A: Clone and Clean (Recommended)
1.  Copy the entire `NavigationApp` folder and paste it to your desired location.
2.  Rename the folder to your new app name (e.g., `MyNewApp`).
3.  **Delete** the following folders/files from the new directory to ensure a clean slate:
    *   `node_modules/` (Dependencies will be re-installed)
    *   `dist/` (Old build artifacts)
    *   `.git/` (If you want to start a fresh Git history)
    *   `tsconfig.tsbuildinfo` (Build cache)

### Option B: Selective Copy
Create a new folder and copy **only** these files and directories:
*   `src/`
*   `public/`
*   `index.html`
*   `package.json`
*   `tsconfig.json`
*   `vite.config.js`
*   `eslint.config.js`
*   `.gitignore`
*   `README.md` (Optional)

## 3. Configuration Updates
Before running the new app, update the following files:

### `package.json`
Open `package.json` and change the `name` field:
```json
{
  "name": "my-new-app",
  ...
}
```

### `index.html`
Open `index.html` and update the title tag:
```html
<title>My New App</title>
```

### Firebase Configuration (`src/firebase.ts`)
If this new app requires a **separate** database/backend:
1.  Create a new project in the Firebase Console.
2.  Get the new configuration object.
3.  Update `src/firebase.ts` with the new keys.

If you intend to **share** the same backend:
*   You can leave `src/firebase.ts` as is, but be aware that both apps will read/write to the same data.

## 4. Installation
Open a terminal in your new application folder and run:

```bash
npm install
```

This will download all necessary dependencies.

## 5. Running the App
Start the development server:

```bash
npm run dev
```

## 6. Git Initialization (Optional)
If you want to track changes for this new app:

```bash
git init
git add .
git commit -m "Initial commit from NavigationApp template"
```

## 7. Handling Database Data
When you create a new Firebase project, your database (Firestore) will be **empty**. You have two main strategies to handle this:

### Strategy A: Manual Setup (For small amounts of data)
If your app relies on "default" data (e.g., a list of default categories, global settings), you will need to recreate them in the new Firebase Console:
1.  Go to **Firestore Database**.
2.  Manually add the collections and documents required for the app to start (e.g., `settings`, `categories`).

### Strategy B: Data Export/Import (For large datasets)
If you want to copy **all** existing data from the old app to the new one:
1.  Go to the **Google Cloud Console** associated with your *old* Firebase project.
2.  Use the **Firestore Export** feature to save data to a Cloud Storage bucket.
3.  Switch to the *new* project's Cloud Console.
4.  **Import** that data from the bucket.
*(Note: This is an advanced step and requires billing to be enabled on Google Cloud).*

### Strategy C: Create a Seed Script (Recommended for Developers)
If you frequently create new apps with the same baseline data, it is best to write a "seed script".
1.  Create a file (e.g., `seed.ts`) in your project.
2.  Write a function that connects to Firebase and writes the default documents if they don't exist.
3.  Run this script once when setting up the new application.

