# 🚀 Deployment Guide - Host Your Meal Planner

## Quick Comparison of Free Hosting Options

| Platform | Difficulty | Speed | Best For |
|----------|-----------|-------|----------|
| **Netlify** | ⭐ Easiest | Instant | Beginners - just drag & drop |
| **GitHub Pages** | ⭐⭐ Easy | 2 minutes | Familiar with git |
| **Vercel** | ⭐⭐ Easy | Instant | Want custom domain later |

All are 100% free with no credit card required!

---

## Option 1: Netlify (RECOMMENDED - EASIEST)

### Steps:
1. Go to [netlify.com](https://netlify.com)
2. Click "Sign up" (use email, GitHub, or GitLab)
3. After signing in, you'll see a big drag-and-drop area
4. **Drag the entire `meal-planner` folder** onto the page
5. Done! Your site is live immediately

### Your URL will be:
`https://random-name-123456.netlify.app`

### To customize the URL:
1. Click "Site settings"
2. Click "Change site name"
3. Enter your preferred name: `my-meal-planner`
4. Your new URL: `https://my-meal-planner.netlify.app`

### To update the app later:
1. Go to your site in Netlify dashboard
2. Click "Deploys"
3. Drag the updated folder to deploy new version

---

## Option 2: GitHub Pages

### Prerequisites:
- Free GitHub account ([signup here](https://github.com/signup))

### Steps:
1. **Create a new repository**
   - Go to github.com
   - Click "+" → "New repository"
   - Name it: `meal-planner`
   - Make it Public
   - Click "Create repository"

2. **Upload files**
   - Click "uploading an existing file"
   - Drag all files from the `meal-planner` folder
   - Scroll down and click "Commit changes"

3. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Under "Source", select "main" branch
   - Click "Save"
   - Wait 1-2 minutes

### Your URL will be:
`https://YOUR-USERNAME.github.io/meal-planner/`

### To update the app later:
1. Go to your repository
2. Click on the file you want to update
3. Click the pencil icon (edit)
4. Make changes and commit

---

## Option 3: Vercel

### Steps:
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign up" (use GitHub, GitLab, or email)
3. Click "Add New..." → "Project"
4. Either:
   - Connect your GitHub repository (if using GitHub)
   - Or use "Deploy without Git" and drag folder

### Your URL will be:
`https://meal-planner-abc123.vercel.app`

### Benefits:
- Automatic HTTPS
- Very fast global CDN
- Easy custom domains later

---

## Testing Your Deployed App

After deployment, test these features:

1. ✅ Open the URL in Safari on your iPhone
2. ✅ Try adding a meal in Database
3. ✅ Select it in Meals tab
4. ✅ Check Shopping list populates
5. ✅ Add to Home Screen works

---

## Adding to iPhone Home Screen

Once your app is live:

1. **Open in Safari** (must be Safari, not Chrome)
2. **Tap the Share button** (square with arrow pointing up)
3. **Scroll down** and tap "Add to Home Screen"
4. **Edit the name** if you want (e.g., "Meals")
5. **Tap "Add"**

The app icon will appear on your home screen!

---

## Troubleshooting

### "Icons not showing"
- Add icon files (see `icon-instructions.txt`)
- Icons need to be named exactly: `icon-192.png` and `icon-512.png`

### "App not updating on phone"
- Delete the app from home screen
- Clear Safari cache
- Visit the URL again
- Re-add to home screen

### "Data disappeared"
- Data is stored per-browser
- If you clear Safari data, the app data is cleared too
- Use the Export button regularly to backup

### "Can't add to home screen"
- Make sure you're using **Safari**, not Chrome or other browsers
- Some features only work when hosted online, not when opened locally

---

## Next Steps After Deployment

1. **Import your meals** using `import.html`
2. **Set up categories** for your shopping patterns
3. **Export a backup** from Database tab
4. **Customize** if needed (I can help!)

---

## Custom Domain (Optional)

All three platforms support custom domains for free:

### Netlify:
1. Go to Domain settings
2. Add custom domain
3. Follow DNS instructions

### GitHub Pages:
1. Buy domain from any registrar
2. Add CNAME file to repo
3. Update DNS settings

### Vercel:
1. Go to Project settings
2. Add domain
3. Follow DNS setup

---

## Need Help?

If you run into any issues:
1. Check the console (F12 in browser)
2. Let me know what error you see
3. I'll help you fix it!

---

## Files Needed for Deployment

Make sure your folder contains:
- ✅ index.html
- ✅ app.js
- ✅ styles.css
- ✅ manifest.json
- ✅ import.html
- ✅ convert.html
- ⚠️ icon-192.png (recommended but optional)
- ⚠️ icon-512.png (recommended but optional)

---

🎉 Once deployed, you'll have a fully functional meal planning app accessible anywhere!
