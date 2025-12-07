# Firebase Authentication Setup Guide

## Error: auth/configuration-not-found

This error means that **Firebase Authentication is not enabled** in your Firebase project.

## How to Fix:

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com/
2. Select your project: **style-decor-47d8f**

### Step 2: Enable Authentication
1. In the left sidebar, click on **"Authentication"**
2. If you see "Get started" button, click it
3. If Authentication is already enabled, you'll see the dashboard

### Step 3: Enable Sign-in Methods
1. Click on the **"Sign-in method"** tab
2. You'll see a list of sign-in providers

### Step 4: Enable Email/Password
1. Click on **"Email/Password"**
2. Toggle **"Enable"** to ON
3. Click **"Save"**

### Step 5: Enable Google Sign-in (Optional but Recommended)
1. Click on **"Google"**
2. Toggle **"Enable"** to ON
3. Enter a **Project support email** (your email)
4. Click **"Save"**

### Step 6: Verify
1. After enabling, wait a few seconds
2. Refresh your application
3. The error should be gone

## Common Issues:

### Issue: "Authentication" option is missing
- **Solution**: Make sure you're using the correct Firebase project
- Check that you have the right permissions (Owner or Editor role)

### Issue: Still getting errors after enabling
- **Solution**: 
  1. Clear your browser cache
  2. Restart your dev server: `npm run dev`
  3. Wait 1-2 minutes for changes to propagate

### Issue: Can't find the project
- **Solution**: 
  1. Check your `.env` file has the correct `VITE_FIREBASE_PROJECT_ID`
  2. Make sure you're logged into the correct Google account in Firebase Console

## Verification Checklist:
- [ ] Authentication is enabled in Firebase Console
- [ ] Email/Password sign-in method is enabled
- [ ] Google sign-in method is enabled (optional)
- [ ] Dev server has been restarted
- [ ] Browser cache has been cleared

## Still Having Issues?

If you continue to see the error after following these steps:
1. Double-check that you're in the correct Firebase project
2. Verify all environment variables in `.env` are correct
3. Check the browser console for more specific error messages
4. Try creating a new Firebase project and updating your `.env` file

