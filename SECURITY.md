# 🔒 Security Guide - Shopping Planner

This document explains how Shopping Planner keeps your data secure and how to properly configure security features.

## Table of Contents
- [Security Model Overview](#security-model-overview)
- [Why Firebase Config is Public (And That's OK)](#why-firebase-config-is-public-and-thats-ok)
- [Firebase App Check Setup](#firebase-app-check-setup)
- [Firestore Security Rules](#firestore-security-rules)
- [Security Best Practices](#security-best-practices)
- [Monitoring & Abuse Prevention](#monitoring--abuse-prevention)
- [FAQ](#faq)

---

## Security Model Overview

Shopping Planner uses a **defense-in-depth** security model with multiple layers:

### Layer 1: Firebase Authentication
- ✅ Email/password authentication required
- ✅ No anonymous access
- ✅ Password requirements enforced
- ✅ Secure session management

### Layer 2: Firestore Security Rules
- ✅ User data isolation (users can only access their own data)
- ✅ Authentication required for all operations
- ✅ Server-side validation
- ✅ No client-side bypass possible

### Layer 3: Firebase App Check (Optional but Recommended)
- ✅ Prevents automated abuse
- ✅ Verifies requests come from your legitimate app
- ✅ Blocks bots and scrapers
- ✅ reCAPTCHA v3 integration

### Layer 4: Domain Authorization
- ✅ Only authorized domains can use your Firebase project
- ✅ Prevents unauthorized web apps from using your backend

---

## Why Firebase Config is Public (And That's OK)

### Your `firebase-config.js` Contains Public Information

The values in `firebase-config.js` are **NOT secrets**:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",              // Public - identifies your project
  authDomain: "...",                // Public - your auth domain
  projectId: "...",                 // Public - your project ID
  storageBucket: "...",             // Public - your storage bucket
  messagingSenderId: "...",         // Public - messaging ID
  appId: "...",                     // Public - your app ID
  appCheckSiteKey: "..."            // Public - reCAPTCHA site key
};
```

### Why These Values Can Be Public

1. **They're Already Public**
   - Anyone using your app can see these in browser DevTools (F12)
   - They're embedded in your client-side JavaScript
   - They're sent in network requests

2. **They Don't Grant Access**
   - These values identify your Firebase project
   - They don't provide authentication or authorization
   - They're like a "mailing address" - public but not a key

3. **Security Comes from Rules, Not Secrets**
   - Your security is enforced server-side by Firebase
   - Firestore Security Rules control data access
   - Authentication controls who can log in
   - App Check controls which apps can connect

### Real-World Analogy

Think of it like a restaurant:
- **Firebase Config** = The restaurant's address (public)
- **Authentication** = Showing ID at the door (who you are)
- **Security Rules** = Table assignments (what you can access)
- **App Check** = Dress code (preventing unwanted visitors)

The address being public doesn't mean anyone can eat your food!

---

## Firebase App Check Setup

App Check adds an extra security layer by verifying requests come from your legitimate app, not bots or malicious scripts.

### Step 1: Enable App Check in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **"App Check"** in the left sidebar
4. Click **"Get started"** or **"Apps"** tab
5. Find your Web app and click **"Manage"**
6. Select **"reCAPTCHA v3"** as the provider
7. Click **"Save"**

### Step 2: Get Your reCAPTCHA Site Key

After enabling App Check, you'll see:
- **Site Key** - This is public and goes in your code
- **Secret Key** - Keep this secret (Firebase manages it automatically)

**Copy the Site Key** - you'll need it for the next step.

### Step 3: Add Site Key to Your Config

Edit `firebase-config.js` in your repository:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",

  // Add this line with your App Check site key:
  appCheckSiteKey: "6Lc..." // Your actual reCAPTCHA v3 site key
};
```

### Step 4: Deploy and Test

1. Commit and push your changes to GitHub
2. Wait 30-60 seconds for GitHub Pages to rebuild
3. Visit your app - it should work normally
4. Check browser console (F12) - you should see:
   ```
   ✅ App Check initialized successfully
   ```

### Step 5: Enforce App Check (Optional - Recommended after testing)

Once verified working, enforce App Check in Firebase:

1. Firebase Console → **App Check**
2. Click **"APIs"** tab
3. For **Cloud Firestore**, click the menu (⋮)
4. Select **"Enforce"**

**⚠️ Important:** Only enforce after confirming App Check works, or legitimate users will be blocked!

### Troubleshooting App Check

**Error: "App Check token is invalid"**
- Solution: Check that your site key is correct in `firebase-config.js`
- Solution: Ensure your domain is registered in reCAPTCHA admin console

**Warning: "App Check site key not configured"**
- Solution: Add `appCheckSiteKey` to your `firebase-config.js`

**App works but no App Check message**
- Solution: Check browser console for errors
- Solution: Ensure you're using Firebase SDK v10.7.1 or later

---

## Firestore Security Rules

Your security rules are the **most critical** security component.

### Current Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### What These Rules Do

1. **`request.auth != null`**
   - Blocks all unauthenticated requests
   - Users must be logged in

2. **`request.auth.uid == userId`**
   - User ID must match the document path
   - Prevents users from accessing other users' data

3. **`{document=**}`**
   - Applies to all nested documents
   - Protects meals, categories, shopping lists, etc.

### With App Check Enforcement (Optional)

If you enforce App Check, update rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId
                         && request.app != null; // Requires App Check token
    }
  }
}
```

### Testing Security Rules

**Test 1: Unauthenticated Access (Should Fail)**
```javascript
// In browser console, without logging in:
firebase.firestore().collection('users').get()
// Expected: Permission denied error ✅
```

**Test 2: Cross-User Access (Should Fail)**
```javascript
// Logged in as user A, trying to access user B's data:
firebase.firestore().collection('users/USER_B_UID/meals').get()
// Expected: Permission denied error ✅
```

**Test 3: Own Data Access (Should Succeed)**
```javascript
// Logged in, accessing own data:
firebase.firestore().collection('users/YOUR_UID/meals').get()
// Expected: Returns your meals ✅
```

---

## Security Best Practices

### For Developers

1. **✅ Never Disable Security Rules**
   - Never use `allow read, write: if true;`
   - Always require authentication
   - Always validate user ownership

2. **✅ Keep Firebase SDK Updated**
   - Current version: 10.7.1
   - Check for security updates regularly

3. **✅ Monitor Firebase Console**
   - Check usage weekly
   - Look for unusual patterns
   - Review authentication logs

4. **✅ Use Strong Passwords**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols
   - Don't reuse passwords

5. **✅ Enable App Check**
   - Prevents automated abuse
   - Minimal performance impact
   - Free to use

### For Users

1. **✅ Use Strong, Unique Passwords**
   - Don't reuse passwords from other sites
   - Use a password manager

2. **✅ Don't Share Your Account**
   - Each person should have their own account
   - Data is private per user

3. **✅ Logout on Shared Devices**
   - Use the logout button
   - Clear browser data if needed

4. **✅ Regular Backups**
   - Export your data monthly
   - Store backups securely

---

## Monitoring & Abuse Prevention

### Usage Monitoring

**Check Firebase Console regularly:**

1. **Authentication Tab**
   - Number of users
   - Recent sign-ins
   - Failed login attempts

2. **Firestore Usage**
   - Document reads/writes
   - Storage used
   - Bandwidth consumed

3. **App Check (if enabled)**
   - Valid vs invalid requests
   - Token generation rate
   - Blocked attempts

### Firebase Free Tier Limits

**Firestore:**
- 1 GB stored data
- 50,000 reads per day
- 20,000 writes per day
- 20,000 deletes per day

**For personal use, these limits are very generous!**

### Signs of Abuse

Watch for:
- ⚠️ Sudden spike in user registrations
- ⚠️ Unusual read/write patterns
- ⚠️ Storage growing rapidly
- ⚠️ Many failed authentication attempts

### Preventing Abuse

**Option 1: Limit User Registration**
- Disable public signup
- Manually approve users
- Use invite codes

**Option 2: Enable App Check** (Recommended)
- Blocks bots automatically
- Minimal impact on legitimate users

**Option 3: Rate Limiting**
- Use Firebase Extensions
- Add custom rate limiting rules

---

## What Attackers CANNOT Do

Even with your public Firebase config, an attacker **CANNOT**:

- ❌ Read your meals or shopping lists
- ❌ Read other users' data
- ❌ Modify your data
- ❌ Delete your data
- ❌ Access your account without your password
- ❌ Bypass security rules
- ❌ Access the database without authentication
- ❌ Impersonate you
- ❌ Export your Firebase data
- ❌ View Firebase console
- ❌ Change security rules
- ❌ Access server-side resources

## What Attackers CAN Do (And How to Prevent It)

**✅ Create their own account**
- Impact: Uses your Firebase quota
- Prevention: Disable public registration or enable App Check
- Cost: Minimal for personal use

**✅ Make requests to your Firebase project**
- Impact: Uses your quota
- Prevention: Enable App Check enforcement
- Cost: Within free tier limits for normal use

---

## FAQ

### Q: Should I keep `firebase-config.js` in my public repository?

**A: Yes!** It's designed to be public. Your security comes from Firebase's server-side rules, not from hiding these values.

### Q: What if someone copies my Firebase config?

**A:** They still can't access your data. They would need:
1. Your password (which they don't have)
2. To bypass Firestore security rules (impossible)
3. Your authentication token (changes frequently)

### Q: Is App Check required?

**A:** No, but highly recommended. Your app is secure without it, but App Check prevents abuse and automated attacks.

### Q: Can I use a private repository instead?

**A:** Yes, but it doesn't add security for client-side Firebase apps. The config values are still visible in the browser.

### Q: What's the most important security measure?

**A:** Firestore Security Rules. These are enforced server-side and cannot be bypassed.

### Q: How do I know if my app is secure?

**A:** Run the security tests in this document. If they fail appropriately (deny unauthorized access), you're secure!

### Q: Should I rotate my Firebase API key?

**A:** Not necessary for client-side apps. Unlike server API keys, these are meant to be public.

### Q: What if I exceed Firebase free tier limits?

**A:** You'll be notified by email. You can:
- Upgrade to pay-as-you-go (Blaze plan)
- Investigate and block abuse
- Reduce usage

### Q: Can I see who's using my Firebase project?

**A:** Yes! Check Firebase Console → Authentication for user list and login history.

---

## Summary

**Your Shopping Planner is secure because:**

1. ✅ Firebase config values are public by design (not secrets)
2. ✅ Security rules enforce server-side authorization
3. ✅ Authentication required for all data access
4. ✅ User data is isolated (can't access other users)
5. ✅ App Check prevents automated abuse
6. ✅ Domain authorization controls which sites can use your backend

**The security model is:**
- **Public**: Firebase config, App Check site key, domain
- **Private**: User passwords, authentication tokens, data
- **Protected**: Firestore data via security rules

**To stay secure:**
- Monitor Firebase Console weekly
- Use strong passwords
- Enable App Check
- Keep security rules strict
- Regular backups

---

**Need help?** Check [SETUP.md](SETUP.md) for configuration details or open an issue on GitHub.

**Last Updated:** 2025-01-29
