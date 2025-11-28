# Meal Planner App

A Progressive Web App (PWA) for meal planning and shopping list management, designed for mobile use.

## Features

✅ **Meal Database**: Store all your meals with ingredients
✅ **Meal Selector**: Quick selection of meals for the week
✅ **Auto Shopping List**: Automatically generates shopping list from selected meals
✅ **Category Quick-Add**: One-tap to add pre-defined item groups (Kids Food, Pet Supplies, etc.)
✅ **Manual Item Management**: Add/remove individual items
✅ **Aisle Organization**: Shopping list organized by supermarket aisle order
✅ **Offline Support**: All data stored locally on your device
✅ **No Costs**: Zero API or subscription fees

## Getting Started

### 1. Open the App

You can run this locally by opening `index.html` in your browser, or host it on a free service:

**Option A: Local Testing**
- Simply open `index.html` in your browser
- Works on desktop and mobile

**Option B: Host Free (Recommended for iPhone)**
- Use GitHub Pages, Netlify, or Vercel (all free)
- This allows you to "Add to Home Screen" on iPhone

### 2. Import Your Existing Meals

I can help you convert your Google Sheets data into this app. Here's how:

1. Export your "Meal Database" sheet to CSV
2. I'll create a simple import script to load it into the app
3. Your meals will be available immediately

### 3. Install on iPhone

Once hosted online:
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app icon will appear on your home screen

## How to Use

### Meals Tab
- Browse your meal database
- Tap meals to select them for the week
- Search for specific meals
- Selected meals automatically add ingredients to shopping list

### Shopping Tab
- View your shopping list organized by aisle
- Tap items to check them off
- Add manual items with category selection
- Remove items you don't need
- Clear checked items or entire list

### Categories Tab
- Quick-add pre-defined groups of items
- Tap a category to add all its items to your list
- Examples: "Kids Food", "Pet Supplies", "Cleaning"

### Database Tab
- Add new meals
- Edit existing meals
- Delete meals you no longer cook

## Data Storage

- All data stored in your browser's localStorage
- No internet connection required after initial load
- Data persists across sessions
- Export/backup coming soon

## Customization

Want to modify the categories or aisle order? Just edit the `getDefaultCategories()` function in `app.js`.

## Next Steps

1. **Import your Google Sheets data** - Let me know when you're ready and I'll create an import script
2. **Host it online** - I can guide you through free hosting
3. **Add more features** - What else would you like?

## Need Help?

Just ask! I'm here to help you customize this further.
