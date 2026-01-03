# Firebase Deployment Guide

This project is configured to deploy to Firebase Hosting.

## Prerequisites

1. **Firebase CLI** - Will be installed as a dev dependency
2. **Firebase Account** - You need to be logged in to Firebase
3. **Project Access** - Ensure you have access to the Firebase project: `schadennetzwerk-7dc39`

## Setup Steps

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

This will install `firebase-tools` as a dev dependency.

### 2. Login to Firebase

```bash
npx firebase login
```

This will open a browser window for you to authenticate with your Google account.

### 3. Verify Firebase Project

Check that you're connected to the correct project:

```bash
npx firebase projects:list
```

The project `schadennetzwerk-7dc39` should be listed.

## Deployment

### Deploy to Production

```bash
npm run deploy
# or
yarn deploy
```

This will:
1. Build your project (`npm run build`)
2. Deploy to Firebase Hosting

### Deploy to Preview Channel (Optional)

```bash
npm run deploy:preview
```

This creates a preview URL for testing before deploying to production.

### Manual Deployment Steps

If you prefer to run commands manually:

```bash
# 1. Build the project
npm run build

# 2. Deploy to Firebase
npx firebase deploy --only hosting
```

## Firebase Configuration

- **Build Output**: `dist/` (configured in `firebase.json`)
- **Project ID**: `schadennetzwerk-7dc39` (configured in `.firebaserc`)
- **Hosting**: Single Page Application (SPA) with all routes redirecting to `index.html`

## Troubleshooting

### If deployment fails:

1. **Check Firebase login**:
   ```bash
   npx firebase login:list
   ```

2. **Verify project access**:
   ```bash
   npx firebase use
   ```

3. **Check build output**:
   Ensure `dist/` folder exists after running `npm run build`

4. **View deployment logs**:
   Check the Firebase Console: https://console.firebase.google.com/

### Common Issues

- **"Permission denied"**: Make sure you have access to the Firebase project
- **"Build failed"**: Check TypeScript and linting errors with `npm run lint`
- **"No dist folder"**: Run `npm run build` first

## Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

