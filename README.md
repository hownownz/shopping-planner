# 🍽️ Shopping Planner

> A modern, offline-capable Progressive Web App for meal planning and smart shopping lists with real-time cloud sync

[![Deploy Status](https://img.shields.io/badge/deploy-GitHub%20Pages-success)](https://pages.github.com)
[![Firebase](https://img.shields.io/badge/backend-Firebase-orange)](https://firebase.google.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-ready-blueviolet)](https://web.dev/progressive-web-apps/)

Plan your meals, generate organized shopping lists by aisle, and sync seamlessly across all your devices. Works offline and installs as a native-like app on your phone or desktop.

---

## ✨ Features

**📱 Progressive Web App**
- Install on any device (iOS, Android, Desktop)
- Works offline with localStorage fallback
- Native app-like experience
- Add to home screen capability

**🔄 Real-Time Sync**
- Automatic sync across all your devices
- Firebase Firestore backend
- Instant updates when data changes
- Secure, private user authentication

**🔒 Security & Privacy**
- User data isolation (your data is private)
- Firebase App Check protection (prevents abuse)
- Server-side security rules (cannot be bypassed)
- No data sharing between users

**🛒 Smart Shopping Lists**
- Automatically organized by store aisle
- Collapsible aisles with progress tracking (e.g., "5/12")
- Check off items as you shop
- Uncheck All button for quick reset
- Manually add extra items with autocomplete
- Remove checked items with one tap
- Change item category on the fly
- Quantity counter (×2 if item in multiple meals)
- Category-based quick-add (e.g., "Kids Food", "Pet Supplies")

**🍕 Meal Management**
- Build your personal meal database
- Checkbox-based ingredient selection from master product list
- Easy meal selection for the week
- Search and filter meals
- Drag-and-drop meal reordering
- Edit and delete meals anytime
- Import meals in bulk
- Ingredient consolidation tool with fuzzy matching

**🛍️ Master Product List**
- 180+ pre-populated products organized by aisle
- Search and filter products
- Sort alphabetically or by usage frequency
- Collapse/Expand All controls
- Auto-expand aisles when searching
- Duplicate detection when adding products
- See which meals use each product
- Edit product names and aisles
- Recently Used section (top 15 products)
- Export/Import product list (JSON)
- Undo last deletion

**📊 Data Control**
- Export your data (JSON + CSV formats)
- Import from backup files
- Import from Google Sheets
- Migration tool from localStorage
- Reset usage statistics
- No vendor lock-in

---

## 🚀 Quick Start

**Want to use this app for yourself? Follow these 3 steps:**

1. **Fork/Clone this repository** to your GitHub account
2. **Set up Firebase** (free tier - see [SETUP.md](SETUP.md))
3. **Enable GitHub Pages** in repository settings

**⏱️ Total time: ~15 minutes**

👉 **[Read the Complete Setup Guide](SETUP.md)** for step-by-step instructions

🔒 **[Security Guide](SECURITY.md)** - Learn about Firebase App Check, security rules, and data protection

---

## 🎮 Demo

**Live Demo:** *(Add your GitHub Pages URL here after deployment)*

```
https://YOUR-USERNAME.github.io/shopping-planner/
```

**Test Account:** Create your own! The app uses Firebase Authentication - each user gets their own private account.

### Screenshots

**Main App Interface:**
- 🍽️ **Meals Tab** - Select meals for the week
- 🛒 **Shopping Tab** - Auto-generated, organized by aisle
- 📦 **Categories Tab** - Quick-add common items
- 📚 **Database Tab** - Manage your meal collection

---

## 🛠️ Technology Stack

**Frontend:**
- HTML5 + CSS3
- Vanilla JavaScript (ES6 modules)
- No frameworks - lightweight and fast
- PWA with Service Worker ready

**Backend:**
- Firebase Authentication (email/password)
- Firebase Firestore (NoSQL database)
- Firebase App Check (reCAPTCHA v3)
- Real-time listeners for live updates
- Secure user-isolated data with security rules

**Hosting:**
- GitHub Pages (free static hosting)
- HTTPS enabled by default
- Global CDN delivery

**Key Features:**
- Offline-first architecture
- localStorage for offline support
- Real-time synchronization
- Responsive design (mobile & desktop)

---

## 📋 Usage

### Creating Your First Meal

1. Go to the **Database** tab
2. Click **"+ Add Meal"**
3. Enter meal name (e.g., "Spaghetti Bolognese")
4. Add ingredients (one per line):
   ```
   500g beef mince
   1 onion
   2 cans tomatoes
   400g spaghetti
   ```
5. Click **"Save"**

### Selecting Meals & Generating Shopping List

1. Go to the **Meals** tab
2. Tap meals you want to cook this week
3. Switch to **Shopping** tab
4. Your shopping list is auto-generated and organized by aisle!

### Using Category Quick-Add

1. Go to **Categories** tab
2. Tap a category (e.g., "Kids Food", "Pet Supplies")
3. All items from that category are added to your shopping list
4. Create custom categories by clicking **"Manage"**

### Shopping Mode

1. Open **Shopping** tab
2. Walk through the store aisle by aisle
3. Tap items to check them off
4. Click **"Clear Checked"** when done shopping

### Importing Meals

**From Text:**
1. Open `import.html` in your deployed app
2. Paste meal data in format: `Meal Name | ingredient1, ingredient2`
3. Click **"Import to Firebase"**

**From Google Sheets:**
1. Open `convert.html`
2. Copy data from Google Sheets (2 columns: name, ingredients)
3. Paste and convert
4. Copy output to `import.html`

**From Backup:**
1. Open `import.html`
2. Use "Import from Backup File" section
3. Select your `.json` backup file
4. Click "Import Backup"

---

## ⚙️ Configuration

### Firebase Setup (Required)

**Edit `firebase-config.js` with your credentials:**

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",

  // App Check (optional but recommended)
  appCheckSiteKey: "YOUR_RECAPTCHA_V3_SITE_KEY"
};
```

**How to get these values:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project
3. Add a Web app
4. Copy the config object
5. (Optional) Enable App Check and get reCAPTCHA site key

👉 **See [SETUP.md](SETUP.md) for detailed Firebase setup instructions**

🔒 **See [SECURITY.md](SECURITY.md) for App Check setup and security best practices**

### Customizing Aisle Categories

Edit the `<select>` dropdowns in `index.html` (lines 61-78 and 145-162):

```html
<option value="Your Category">Your Category</option>
```

### Customizing Colors

Edit `styles.css`:

```css
/* Change the primary blue color */
--primary-color: #2563eb;

/* Change login page gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

---

## 📁 Project Structure

```
shopping-planner/
├── index.html              # Main application UI
├── login.html              # Authentication page
├── app-firebase.js         # Core app logic + Firebase integration
├── firebase-service.js     # Firebase API wrapper
├── firebase-config.js      # 🔑 YOUR Firebase credentials (EDIT THIS!)
├── styles.css              # Application styling
├── manifest.json           # PWA configuration
├── import.html             # Bulk meal import tool
├── convert.html            # Google Sheets converter (standalone)
├── SETUP.md                # Complete setup guide
├── README.md               # This file
├── LICENSE                 # MIT License
└── .gitignore              # Git ignore rules
```

**Key Files:**
- **`firebase-config.js`** - The ONLY file you need to edit (your Firebase credentials)
- **`firebase-service.js`** - Firebase integration (includes App Check)
- **`index.html`** - Main app, can customize category names
- **`styles.css`** - Customize colors and styling
- **`import.html`** - Bulk import tool (works independently)
- **`convert.html`** - Utility for Google Sheets (no dependencies)
- **`SECURITY.md`** - Security guide and App Check setup

---

## 💻 Development

### Running Locally

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/shopping-planner.git
cd shopping-planner

# Start a local server (choose one):

# Python 3
python -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000

# Open browser to:
# http://localhost:8000
```

**Important:** Add `localhost` to Firebase Authorized Domains:
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add `localhost`

### Making Changes

```bash
# Make your edits to files

# Stage changes
git add .

# Commit
git commit -m "Description of changes"

# Push to GitHub
git push origin main

# GitHub Pages will auto-deploy in 30-60 seconds
```

### Testing

Run through the [Testing Checklist](SETUP.md#testing-checklist) in SETUP.md after making changes.

---

## 🤝 Contributing

This is a personal project, but contributions are welcome!

**How to contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Guidelines:**
- Keep it simple - vanilla JS, no frameworks
- Maintain offline-first architecture
- Test on mobile and desktop
- Update documentation if needed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**Summary:** You can use, modify, and distribute this code freely. No warranty provided.

---

## 🙏 Acknowledgments

**Built with:**
- [Firebase](https://firebase.google.com/) - Backend infrastructure
- [GitHub Pages](https://pages.github.com/) - Free hosting
- Vanilla JavaScript - No framework overhead
- Modern web standards (PWA, ES6 modules)

**Inspired by:**
- The need for a simple, privacy-focused meal planning app
- Frustration with bloated, ad-filled alternatives
- The power of modern web technologies

---

## 🆘 Support

**Having issues?**

1. Check [SETUP.md](SETUP.md) - especially [Common Issues & Solutions](SETUP.md#common-issues--solutions)
2. Search existing [GitHub Issues](https://github.com/YOUR-USERNAME/shopping-planner/issues)
3. Open a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Browser console errors (F12 → Console)
   - Browser and device info

---

## 🎯 Roadmap

**Completed:**
- [x] Dark mode
- [x] Master product list with full CRUD
- [x] Checkbox-based meal creation
- [x] Ingredient name consolidation
- [x] Usage frequency tracking
- [x] Undo functionality

**High Priority:**
- [ ] Keyboard shortcuts (Enter, Escape)
- [ ] "Add All from Aisle" button
- [ ] Product notes/variants (e.g., "Milk (Anchor Blue Top 2L)")

**Future Enhancements:**
- [ ] Meal tags/categories (vegetarian, quick, etc.)
- [ ] Shopping list templates
- [ ] Recipe instructions (not just ingredients)
- [ ] Recipe images/photos
- [ ] Meal calendar view
- [ ] Nutritional information
- [ ] Share meals with other users
- [ ] Recipe ratings and notes
- [ ] Integration with recipe websites

**Want to contribute? Pick an item from the roadmap and submit a PR!**

---

## ❓ FAQ

**Q: Is this free?**
A: Yes! GitHub Pages and Firebase (free tier) are both free. Firebase limits are very generous for personal use.

**Q: Is my data private?**
A: Yes! Each user's data is isolated in Firebase. Firestore security rules ensure no one can see your meals or shopping lists. See [SECURITY.md](SECURITY.md) for details.

**Q: Can I use this with my family?**
A: Each person needs their own account. Data is not shared between accounts. You can export/import to share meals.

**Q: Does it work offline?**
A: Yes! Uses localStorage for offline support. Changes sync when you reconnect.

**Q: Can I export my data?**
A: Yes! Export to JSON (full backup) and CSV (for spreadsheets) from the Database tab.

**Q: What happens if Firebase changes their pricing?**
A: You can export your data anytime. The free tier is very generous (1GB storage, 50K reads/day).

**Q: Can I self-host without Firebase?**
A: The app is designed for Firebase, but you could modify it to use any backend API. You'd need to rewrite `firebase-service.js`.

**Q: Is it safe to have `firebase-config.js` in a public repository?**
A: Yes! These values are meant to be public (they're already visible in your browser). Your security comes from Firebase Authentication and Firestore Security Rules, not from hiding these values. Read [SECURITY.md](SECURITY.md) for a detailed explanation.

**Q: What is Firebase App Check and do I need it?**
A: App Check prevents bots and automated abuse by verifying requests come from your legitimate app. It's optional but recommended. See [SECURITY.md](SECURITY.md) for setup instructions.

---

## 📞 Contact

**Project Creator:** *(Add your name/contact)*

**Project Link:** `https://github.com/YOUR-USERNAME/shopping-planner`

**Live Demo:** `https://YOUR-USERNAME.github.io/shopping-planner/`

---

<div align="center">

**Made with ❤️ for home cooks everywhere**

**Star ⭐ this repo if you find it useful!**

[Report Bug](https://github.com/YOUR-USERNAME/shopping-planner/issues) · [Request Feature](https://github.com/YOUR-USERNAME/shopping-planner/issues)

</div>
