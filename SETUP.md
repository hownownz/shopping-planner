# Shopping Planner - Complete Setup Guide

This guide will walk you through deploying your own instance of the Shopping Planner app on GitHub Pages with Firebase backend.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start (15 minutes)](#quick-start-15-minutes)
- [Detailed Setup Instructions](#detailed-setup-instructions)
- [Project Structure](#project-structure)
- [Deployment Workflow](#deployment-workflow)
- [Common Issues & Solutions](#common-issues--solutions)

---

## Prerequisites

Before you begin, make sure you have:

- [ ] A **GitHub account** (free) - [Sign up here](https://github.com/join)
- [ ] A **Google/Firebase account** (free) - [Get started](https://firebase.google.com/)
- [ ] A **modern web browser** (Chrome, Firefox, Safari, or Edge)
- [ ] **Basic computer skills** (copy/paste, upload files)
- [ ] **15 minutes** of your time

**No coding experience required!**

---

## Quick Start (15 minutes)

### Step 1: Create Firebase Project (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "My Shopping Planner")
4. Disable Google Analytics (not needed) or keep it enabled
5. Click **"Create project"** and wait for it to finish

### Step 2: Set Up Firebase Authentication (3 minutes)

1. In your Firebase project, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Click on **"Email/Password"** under Sign-in providers
4. **Enable** the Email/Password toggle
5. Click **"Save"**

### Step 3: Set Up Firestore Database (3 minutes)

1. Click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose a location closest to you (e.g., us-central, europe-west, asia-southeast)
5. Click **"Enable"**

**Set up security rules:**
1. Click on the **"Rules"** tab
2. Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

### Step 4: Get Firebase Configuration (2 minutes)

1. Click the **gear icon** ⚙️ next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"**
4. Click the **Web icon** `</>` (if no apps exist)
5. Enter an app nickname (e.g., "Shopping Planner Web")
6. **Do NOT** check "Firebase Hosting"
7. Click **"Register app"**
8. Copy the **`firebaseConfig`** object (you'll see something like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

9. **Keep this tab open** - you'll need these values!

### Step 5: Deploy to GitHub (2 minutes)

**Option A: Upload files directly (easier for beginners)**

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon in the top right, select **"New repository"**
3. Repository name: `shopping-planner` (or any name you like)
4. Select **"Public"**
5. Click **"Create repository"**
6. Click **"uploading an existing file"**
7. **Download** or **copy** all files from this project to your computer
8. **Drag and drop** all files into the GitHub upload area
9. Scroll down and click **"Commit changes"**

**Option B: Using Git (if you're familiar with Git)**

```bash
git clone https://github.com/YOUR-USERNAME/shopping-planner.git
cd shopping-planner
# Copy all project files here
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 6: Configure Firebase in Your Code (1 minute)

1. In your GitHub repository, click on **`firebase-config.js`**
2. Click the **pencil icon** ✏️ to edit
3. Replace the existing values with YOUR Firebase config (from Step 4):

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

4. Scroll down and click **"Commit changes"**
5. Click **"Commit changes"** again in the popup

### Step 7: Enable GitHub Pages (1 minute)

1. In your repository, click **"Settings"**
2. Click **"Pages"** in the left sidebar
3. Under "Branch", select **"main"** and **"/ (root)"**
4. Click **"Save"**
5. Wait 30-60 seconds for deployment
6. Your site URL will appear: `https://YOUR-USERNAME.github.io/shopping-planner/`

### Step 8: Authorize Your Domain in Firebase (1 minute)

1. Go back to your **Firebase Console**
2. Click **"Authentication"**
3. Click the **"Settings"** tab
4. Scroll to **"Authorized domains"**
5. Click **"Add domain"**
6. Add your GitHub Pages URL (without `https://`):
   - Format: `YOUR-USERNAME.github.io`
7. Click **"Add"**

### Step 9: Test Your App!

1. Visit your GitHub Pages URL
2. Click **"Create Account"** on the login page
3. Enter an email and password (minimum 6 characters)
4. You should be redirected to the app!

**🎉 Congratulations! Your shopping planner is live!**

---

## Detailed Setup Instructions

### Understanding the File Structure

```
shopping-planner/
├── index.html              # Main app interface
├── login.html              # Authentication page
├── import.html             # Data import tool
├── convert.html            # Google Sheets converter (standalone)
├── app-firebase.js         # Core application logic + Firebase integration
├── firebase-service.js     # Firebase API wrapper
├── firebase-config.js      # 🔑 YOUR Firebase credentials (EDIT THIS!)
├── styles.css              # Application styling
├── manifest.json           # PWA configuration
├── SETUP.md                # This file
├── README.md               # Project overview
└── .gitignore              # Git ignore rules
```

### Files You MUST Edit

**1. `firebase-config.js`** - This is the ONLY file you need to modify with your Firebase credentials.

### Files You CAN Customize

**1. `styles.css`** - Customize colors, fonts, spacing
**2. `manifest.json`** - Change app name, theme color, icons
**3. `index.html`** - Modify category names in the dropdowns (lines 61-78, 145-162)

### Files You Should NOT Edit

All other JavaScript files (`app-firebase.js`, `firebase-service.js`) contain the core logic and should not be modified unless you know what you're doing.

---

## Firebase Security Rules Explained

The security rules ensure:
- Users can only access their own data
- Authentication is required for all operations
- No one can read or modify another user's meals/shopping lists

**Your Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

This means:
- `request.auth != null` → User must be logged in
- `request.auth.uid == userId` → User ID must match the document path

---

## Project Structure

### Data Storage Architecture

**Firebase Firestore Structure:**
```
users/
  {userId}/
    meals/
      {mealId}/
        - name: "Spaghetti Bolognese"
        - ingredients: ["500g beef mince", "1 onion", ...]
        - updatedAt: "2025-01-15T10:30:00Z"

    categories/
      {categoryId}/
        - name: "Kids Food"
        - icon: "👶"
        - aisle: "Breakfast/Condiments"
        - items: ["Weetbix", "Up n Go", ...]
        - updatedAt: "2025-01-15T10:30:00Z"

    data/
      shopping/
        - items: [{text: "Milk", category: "Meat/Chilled", checked: false}, ...]
        - updatedAt: "2025-01-15T10:30:00Z"

      selected/
        - meals: ["mealId1", "mealId2", ...]
        - updatedAt: "2025-01-15T10:30:00Z"
```

### How Real-Time Sync Works

1. User makes a change (adds meal, checks item, etc.)
2. Change is saved to **localStorage** (for offline support)
3. Change is synced to **Firebase Firestore**
4. Firebase notifies all connected devices
5. Other devices update automatically

**Benefits:**
- Works offline
- Syncs across all your devices
- Real-time updates
- Data persists even if you close the browser

---

## Deployment Workflow

### Making Updates

**Option 1: GitHub Web Interface (Easiest)**

1. Go to your repository on GitHub
2. Navigate to the file you want to edit
3. Click the **pencil icon** ✏️
4. Make your changes
5. Scroll down and click **"Commit changes"**
6. Wait 30-60 seconds for GitHub Pages to rebuild
7. Refresh your app to see changes

**Option 2: Git Command Line**

```bash
# Clone your repository (first time only)
git clone https://github.com/YOUR-USERNAME/shopping-planner.git
cd shopping-planner

# Make your changes to files

# Stage changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push origin main

# Wait 30-60 seconds, then refresh your app
```

### Adding Custom Categories

1. Open `index.html` in the GitHub editor
2. Find the category dropdowns (lines 61-78 and 145-162)
3. Add/remove/modify `<option>` tags:

```html
<option value="Your Category Name">Your Category Name</option>
```

4. Commit changes
5. The new category will appear in both dropdowns

### Customizing Colors

Edit `styles.css`:

```css
/* Primary color (blue) - used for buttons, nav items */
--primary-color: #2563eb;  /* Change to your color */

/* Gradient background on login page */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

---

## Common Issues & Solutions

### Issue 1: "Failed to connect to Firebase"

**Symptoms:** Error message on login page, can't sign in

**Solutions:**
1. **Check internet connection** - Firebase requires internet
2. **Verify firebase-config.js** - Make sure all values are correct (no typos)
3. **Check Firebase Console** - Ensure Authentication and Firestore are enabled
4. **Open browser console** (F12) - Look for specific error messages

### Issue 2: Login Loop (keeps redirecting back to login)

**Symptoms:** After logging in, you're sent back to login page

**Solutions:**
1. **Clear browser cache and cookies**
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Settings → Privacy → Clear Data
2. **Check Authorized Domains in Firebase**
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Make sure your GitHub Pages domain is listed
3. **Try incognito/private browsing mode**
4. **Check browser console** for errors (F12 → Console tab)

### Issue 3: Data Not Syncing Across Devices

**Symptoms:** Changes on one device don't appear on another

**Solutions:**
1. **Verify you're logged in with the same account** on both devices
2. **Check internet connection** on both devices
3. **Refresh the page** on both devices
4. **Check Firestore rules** in Firebase Console (see setup instructions)
5. **Look for errors** in browser console (F12)

### Issue 4: Import Not Working

**Symptoms:** Clicking "Import to Firebase" does nothing or shows error

**Solutions:**
1. **Check format** - Make sure data follows the format:
   ```
   Meal Name | ingredient1, ingredient2, ingredient3
   ```
2. **Check authentication** - Must be logged in first
3. **Try smaller batches** - Import 10-20 meals at a time
4. **Check browser console** for specific errors

### Issue 5: GitHub Pages Shows 404

**Symptoms:** Your GitHub Pages URL shows "404 Not Found"

**Solutions:**
1. **Wait 1-2 minutes** - GitHub Pages can take time to build
2. **Check GitHub Pages settings**
   - Go to Settings → Pages
   - Verify "main" branch is selected
   - Verify "/ (root)" folder is selected
3. **Check file names** - Must have `index.html` (lowercase)
4. **Force rebuild** - Make a small change and commit

### Issue 6: PWA Not Installing on Mobile

**Symptoms:** "Add to Home Screen" doesn't appear

**Solutions:**
1. **Requires HTTPS** - GitHub Pages provides this automatically
2. **Visit the site a few times** - Browser needs to trust it
3. **Check manifest.json** - Ensure it's valid JSON
4. **Check for icon files** - manifest.json references icon-192.png and icon-512.png
5. **Try different browser** - Works best on Chrome/Safari mobile

### Issue 7: "Permission Denied" in Firestore

**Symptoms:** Errors about permissions when trying to save data

**Solutions:**
1. **Check Firestore Rules** (see Step 3 in Quick Start)
2. **Verify you're logged in** - Check Authentication tab in Firebase
3. **Clear browser data** and log in again
4. **Re-publish Firestore rules** - Go to Firestore → Rules → Publish

---

## Advanced Topics

### Custom Domain Setup

Instead of `username.github.io/shopping-planner`, use `shopping.yoursite.com`:

1. Buy a domain (Namecheap, Google Domains, etc.)
2. In GitHub repo: Settings → Pages → Custom domain
3. Enter your domain (e.g., `shopping.yoursite.com`)
4. Save
5. In your domain registrar, add a CNAME record:
   - Host: `shopping` (or `@` for root domain)
   - Value: `YOUR-USERNAME.github.io`
6. Wait 24-48 hours for DNS propagation
7. Update Firebase Authorized Domains with new domain

### Backing Up Your Data

**Export from the app:**
1. Open your shopping planner
2. Go to "Database" tab
3. Click "Export"
4. Two files download: `.json` (full backup) and `.csv` (for spreadsheets)

**Restore from backup:**
1. Go to `import.html`
2. Use "Import from Backup File" section
3. Select your `.json` file
4. Click "Import Backup"

### Running Locally for Development

```bash
# Clone repository
git clone https://github.com/YOUR-USERNAME/shopping-planner.git
cd shopping-planner

# Install a local server (choose one):

# Option 1: Python 3
python -m http.server 8000

# Option 2: Node.js (npx)
npx http-server -p 8000

# Option 3: PHP
php -S localhost:8000

# Open browser to:
# http://localhost:8000
```

**Note:** You'll need to add `localhost` to Firebase Authorized Domains for authentication to work locally.

---

## Security Best Practices

1. **Never share your Firebase config** - While the config values are not secret, don't share them publicly as they're tied to your project
2. **Use strong passwords** - Minimum 12 characters, mix of letters/numbers/symbols
3. **Monitor Firebase Console** - Check Authentication tab regularly for suspicious activity
4. **Review Firestore Rules** - Ensure rules are properly restricting access
5. **Enable Firebase App Check** (advanced) - Prevents API abuse
6. **Regular backups** - Export your data monthly

---

## Testing Checklist

After setup, test these features:

- [ ] **Account Creation** - Can create new account
- [ ] **Login** - Can log in with created account
- [ ] **Add Meal** - Can add a meal in Database tab
- [ ] **Select Meal** - Can select meal in Meals tab
- [ ] **Shopping List** - Selected meal ingredients appear in Shopping tab
- [ ] **Check Item** - Can check off items in shopping list
- [ ] **Manual Item** - Can add manual items to shopping list
- [ ] **Categories** - Can quick-add category items
- [ ] **Sync Test** - Changes sync to another device/browser (log in with same account)
- [ ] **Offline Test** - Disconnect internet, app still loads (won't sync until reconnected)
- [ ] **Export** - Can export data as JSON and CSV
- [ ] **Import** - Can import meals via import.html
- [ ] **Logout** - Can logout successfully

---

## Getting Help

**Before asking for help:**
1. Check this SETUP.md thoroughly
2. Review [Common Issues & Solutions](#common-issues--solutions)
3. Check browser console (F12) for error messages
4. Try in incognito/private mode
5. Try a different browser

**Where to get help:**
- Create an issue on the GitHub repository
- Check Firebase documentation: https://firebase.google.com/docs
- Check GitHub Pages docs: https://pages.github.com

**Include in your help request:**
1. What you're trying to do
2. What happens instead
3. Browser console errors (F12 → Console)
4. Steps to reproduce
5. Browser and device info

---

## Next Steps After Setup

1. **Import your meals** - Use `import.html` or `convert.html` (for Google Sheets)
2. **Customize categories** - Edit the dropdown lists in `index.html`
3. **Set up on mobile** - Visit on phone, add to home screen (PWA)
4. **Customize appearance** - Modify colors in `styles.css`
5. **Share with family** - Give them the URL and have them create accounts
6. **Regular backups** - Export data monthly

---

## Frequently Asked Questions

**Q: Is my data private?**
A: Yes! Each user has their own isolated data. No one can see your meals or shopping lists.

**Q: Can I share meals with family members?**
A: Not automatically. Each account is separate. You can export and share the JSON file, which they can import.

**Q: Does this cost money?**
A: No! Firebase free tier is generous:
- 1 GB stored data
- 10 GB/month bandwidth
- 50,000 reads/day, 20,000 writes/day
This is more than enough for personal use.

**Q: Can I use this offline?**
A: Yes! The app uses localStorage for offline support. Changes sync when you're back online.

**Q: Can I customize the aisle categories?**
A: Yes! Edit the `<option>` tags in `index.html` (two places: manual add dropdown and category modal).

**Q: What if I want to reset everything?**
A: In Firebase Console, go to Firestore Database, select all documents under your user ID, and delete them. Or delete and recreate the entire Firebase project.

**Q: Can I migrate from localStorage to Firebase?**
A: Yes! When you first sign up, the app automatically imports any existing localStorage data.

---

**Last Updated:** 2025-01-29

**Version:** 1.0.0
