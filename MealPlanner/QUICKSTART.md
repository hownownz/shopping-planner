# 🍽️ Meal Planner App - Quick Start

## ✅ What I've Built For You

A mobile-optimized Progressive Web App with:
- **Meal Database**: Store unlimited meals with ingredients
- **Meal Selector**: Tap to select meals for the week
- **Smart Shopping List**: Auto-generates from selected meals, organized by your supermarket aisle order
- **Quick Categories**: One-tap to add "Kids Food", "Pet Supplies", "Cleaning" etc.
- **Manual Control**: Add/remove individual items anytime
- **Offline Ready**: Works without internet after first load
- **100% Free**: No API costs, no subscriptions

## 🚀 Getting Started (3 Steps)

### Step 1: Test It Locally (Right Now!)
1. Download the `meal-planner` folder
2. Open `index.html` in your browser
3. Try adding a meal in the Database tab
4. Select it in the Meals tab
5. See it appear in your Shopping list!

### Step 2: Import Your Existing Meals
1. Open `import.html` 
2. Copy this format from your Google Sheet: `Meal Name | ingredient1, ingredient2, ingredient3`
3. Paste and click "Import Meals"
4. Done! Your meals are now in the app

### Step 3: Host It Online (For iPhone Access)
Choose ONE of these FREE options:

**Option A: GitHub Pages (Easiest)**
1. Create a free GitHub account
2. Create a new repository
3. Upload all the files
4. Enable GitHub Pages in settings
5. Your app will be live at `https://yourusername.github.io/meal-planner`

**Option B: Netlify (Drag & Drop)**
1. Go to netlify.com
2. Drag the entire folder onto their site
3. Instant deployment!
4. Get a URL like `https://your-meal-planner.netlify.app`

**Option C: Vercel**
1. Go to vercel.com
2. Import from GitHub or drag & drop
3. Instant deployment!

## 📱 Install on iPhone

Once hosted online:
1. Open the URL in Safari on your iPhone
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. The app appears on your home screen like a native app!

## 🎯 How to Use

### 🍽️ Meals Tab
- Browse all your meals
- **Tap to select** meals for the week
- Selected meals have a blue checkmark
- Search for specific meals

### 🛒 Shopping Tab
- View your complete shopping list
- Organized by aisle (just like you wanted!)
- **Tap items** to check them off
- **Add manual items** at the top
- Use **category dropdowns** for correct aisle placement
- **× button** removes items
- **Clear Checked** removes completed items
- **Clear All** starts fresh

### 📦 Categories Tab
- Pre-loaded: Kids Food, Pet Supplies, Cleaning, Baking Basics
- **Tap a category** to add ALL its items to your shopping list
- Click **Manage** to create custom categories
- Perfect for recurring shopping needs

### 📚 Database Tab
- **+ Add Meal** to create new meals
- **✏️ Edit** existing meals
- **🗑️ Delete** meals you don't need
- **Export** button backs up your data

## 💡 Pro Tips

1. **Category Quick-Add**: Create categories for your regular shopping patterns
   - "Weekly Staples" 
   - "Kids Snacks"
   - "Household Basics"

2. **Backup Your Data**: Hit Export button regularly to save a backup

3. **Bulk Import**: Use the import.html page to load many meals at once

4. **Aisle Customization**: Edit the category list in `app.js` if your supermarket layout differs

## 🔄 Importing Your Google Sheets Data

### Manual Format
Open `import.html` and paste lines like:
```
Spaghetti Bolognese | 500g beef mince, 1 onion, 2 cans tomatoes, 400g spaghetti
Butter Chicken | 500g chicken, yogurt, butter, garlic, ginger, cream, rice
```

### From Your Current Sheet
1. In your Google Sheet, combine Column A (meal name) and Column B (ingredients) like: 
   `=A2&" | "&B2`
2. Copy the results
3. Paste into `import.html`
4. Click Import

## 🛠️ Customization

Want to modify aisle order or categories? The code is clean and commented. Happy to help you customize anything!

## ❓ Need Help?

Just let me know what you need:
- More categories
- Different aisle organization  
- Export to different formats
- Additional features
- Hosting help

## 📁 Files Included

- `index.html` - Main app
- `styles.css` - All the styling
- `app.js` - App logic
- `manifest.json` - PWA configuration
- `import.html` - Data import tool
- `README.md` - Full documentation

## 🎉 You're All Set!

Open `index.html` and start planning your meals!
