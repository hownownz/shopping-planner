// Data Storage with Firebase Sync
import firebaseService from './firebase-service.js';

class DataStore {
    constructor() {
        this.meals = [];
        this.selectedMeals = [];
        this.shoppingList = [];
        this.categories = [];
        this.ingredientMappings = {}; // Custom ingredient-to-category mappings
        this.isInitialized = false;
        this.syncEnabled = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        // Load from localStorage first (for offline support)
        this.meals = this.loadLocal('meals') || [];
        this.selectedMeals = this.loadLocal('selectedMeals') || [];
        this.shoppingList = this.loadLocal('shoppingList') || [];
        this.categories = this.loadLocal('categories') || this.getDefaultCategories();
        this.ingredientMappings = this.loadLocal('ingredientMappings') || {};

        // Set up Firebase sync if authenticated
        if (firebaseService.isAuthenticated()) {
            this.setupFirebaseSync();
        }

        this.isInitialized = true;
    }

    setupFirebaseSync() {
        // Listen for real-time updates from Firebase
        firebaseService.onSync((type, data) => {
            switch(type) {
                case 'meals':
                    this.meals = data;
                    this.saveLocal('meals', data);
                    if (window.app) window.app.render();
                    break;
                case 'categories':
                    this.categories = data;
                    this.saveLocal('categories', data);
                    if (window.app) window.app.render();
                    break;
                case 'shoppingList':
                    this.shoppingList = data;
                    this.saveLocal('shoppingList', data);
                    if (window.app) window.app.render();
                    break;
                case 'selectedMeals':
                    this.selectedMeals = data;
                    this.saveLocal('selectedMeals', data);
                    if (window.app) window.app.render();
                    break;
                case 'ingredientMappings':
                    this.ingredientMappings = data;
                    this.saveLocal('ingredientMappings', data);
                    break;
            }
        });

        this.syncEnabled = true;
        console.log('🔄 Firebase sync enabled');
    }

    loadLocal(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading data:', e);
            return null;
        }
    }

    saveLocal(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving data:', e);
        }
    }

    // Save to both localStorage and Firebase
    async save(key, data) {
        this.saveLocal(key, data);
        
        if (this.syncEnabled) {
            // Sync to Firebase based on data type
            switch(key) {
                case 'meals':
                    await firebaseService.saveMeals(data);
                    break;
                case 'categories':
                    await firebaseService.saveCategories(data);
                    break;
                case 'shoppingList':
                    await firebaseService.saveShoppingList(data);
                    break;
                case 'selectedMeals':
                    await firebaseService.saveSelectedMeals(data);
                    break;
                case 'ingredientMappings':
                    await firebaseService.saveIngredientMappings(data);
                    break;
            }
        }
    }

    getDefaultCategories() {
        return [
            {
                id: 'kids-food',
                name: 'Kids Food',
                icon: '👶',
                aisle: 'Breakfast/Condiments',
                items: [
                    'Weetbix',
                    'Up n Go 12pack',
                    'Pouches (yogurt etc)',
                    'Yogurt',
                    'Fruit cups 1',
                    'Custards 1L'
                ]
            },
            {
                id: 'pet-supplies',
                name: 'Pet Supplies',
                icon: '🐱',
                aisle: 'Pet Things',
                items: [
                    'Cat food',
                    'Litter'
                ]
            },
            {
                id: 'cleaning',
                name: 'Cleaning',
                icon: '🧹',
                aisle: 'Cleaning/Washing products',
                items: [
                    'Dishwasher tablet',
                    'Washing powder',
                    'Dish washing liquid',
                    'Multi purpose spray',
                    'Paper towels',
                    'Sponge'
                ]
            },
            {
                id: 'baking-basics',
                name: 'Baking Basics',
                icon: '🎂',
                aisle: 'Baking/Choc Sauce/Dried Fruits',
                items: [
                    'High grade flour',
                    'Sugar',
                    'Eggs',
                    'Butter',
                    'Baking powder'
                ]
            }
        ];
    }

    // Meal methods
    async addMeal(meal) {
        meal.id = Date.now().toString();
        // Set sortOrder to highest + 1 (add to end)
        const maxOrder = this.meals.length > 0
            ? Math.max(...this.meals.map(m => m.sortOrder || 0))
            : 0;
        meal.sortOrder = maxOrder + 1;
        this.meals.push(meal);
        await this.save('meals', this.meals);

        if (this.syncEnabled) {
            await firebaseService.saveMeal(meal);
        }
    }

    async updateMeal(id, meal) {
        const index = this.meals.findIndex(m => m.id === id);
        if (index !== -1) {
            this.meals[index] = { ...this.meals[index], ...meal };
            await this.save('meals', this.meals);
            
            if (this.syncEnabled) {
                await firebaseService.saveMeal(this.meals[index]);
            }
        }
    }

    async deleteMeal(id) {
        this.meals = this.meals.filter(m => m.id !== id);
        this.selectedMeals = this.selectedMeals.filter(mId => mId !== id);
        await this.save('meals', this.meals);
        await this.save('selectedMeals', this.selectedMeals);
        
        if (this.syncEnabled) {
            await firebaseService.deleteMeal(id);
        }
    }

    async toggleMealSelection(id) {
        const index = this.selectedMeals.indexOf(id);
        if (index === -1) {
            this.selectedMeals.push(id);
        } else {
            this.selectedMeals.splice(index, 1);
        }
        await this.save('selectedMeals', this.selectedMeals);
        this.updateShoppingList();
    }

    async clearSelectedMeals() {
        this.selectedMeals = [];
        await this.save('selectedMeals', this.selectedMeals);
        this.updateShoppingList();
    }

    // Shopping list methods
    async updateShoppingList() {
        // Get ingredients from selected meals
        const mealIngredients = [];
        this.selectedMeals.forEach(mealId => {
            const meal = this.meals.find(m => m.id === mealId);
            if (meal) {
                meal.ingredients.forEach(ingredient => {
                    mealIngredients.push({
                        text: ingredient.trim(),
                        category: this.guessCategory(ingredient),
                        checked: false,
                        source: 'meal'
                    });
                });
            }
        });

        // Keep manually added items and checked items
        const manualItems = this.shoppingList.filter(item => item.source === 'manual' || item.source === 'category');
        const checkedMealItems = this.shoppingList.filter(item => item.source === 'meal' && item.checked);

        // Combine and deduplicate
        const combinedItems = [...mealIngredients, ...manualItems, ...checkedMealItems];
        const uniqueItems = this.deduplicateItems(combinedItems);

        this.shoppingList = uniqueItems;
        await this.save('shoppingList', this.shoppingList);
    }

    deduplicateItems(items) {
        const itemMap = new Map();

        items.forEach(item => {
            const key = item.text.toLowerCase().trim();
            if (itemMap.has(key)) {
                const existing = itemMap.get(key);
                // Increment count for duplicate items from meals
                if (item.source === 'meal') {
                    existing.count = (existing.count || 1) + 1;
                }
                // Keep the item that's not checked, or the first one if both same status
                if (!existing.checked && item.checked) {
                    return; // Keep existing
                }
            } else {
                // First occurrence - set initial count
                item.count = 1;
                itemMap.set(key, item);
            }
        });

        return Array.from(itemMap.values());
    }

    guessCategory(ingredient) {
        const text = ingredient.toLowerCase().trim();

        // Check custom mappings first (exact match)
        if (this.ingredientMappings[text]) {
            return this.ingredientMappings[text];
        }

        // Check if any custom mapping keyword is in the ingredient
        for (const [keyword, category] of Object.entries(this.ingredientMappings)) {
            if (text.includes(keyword.toLowerCase())) {
                return category;
            }
        }

        // Fall back to default regex patterns
        // Fruit/Veg
        if (text.match(/apple|banana|lettuce|tomato|cucumber|onion|garlic|carrot|potato|broccoli|cauliflower|spinach|capsicum|mushroom|celery|ginger|leek|cabbage|pumpkin|kumara|corn|bean|lemon|grape|mandarin/)) {
            return 'Fruit/Veg';
        }

        // Meat/Chilled
        if (text.match(/egg|milk|cream|cheese|yogurt|butter|sausage|steak|chicken|beef|pork|ham|salami|tofu|mozzarella|parmesan|feta|halloumi/)) {
            return 'Meat/Chilled';
        }

        // Pasta/Rice/Noodles
        if (text.match(/pasta|spaghetti|rice|noodle|macaroni|penne|risoni|lasagna|tortilla|wrap/)) {
            return 'Pasta/Noodles/Stock/Sauces/Tacos/Rice';
        }

        // Canned/Sauces
        if (text.match(/can|tin|sauce|stock|paste|pickle|olive|chutney|passata/)) {
            return 'Canned/Seasoning/Sauces';
        }

        // Frozen
        if (text.match(/frozen|ice cream/)) {
            return 'Frozen';
        }

        // Bread
        if (text.match(/bread|bun|roll|muffin/)) {
            return 'Bread/Buns';
        }

        // Baking
        if (text.match(/flour|sugar|baking|yeast|oil|coconut/)) {
            return 'Baking/Choc Sauce/Dried Fruits';
        }

        // Default to Misc
        return 'Misc';
    }

    // Ingredient mapping methods
    async addIngredientMapping(ingredient, category) {
        const key = ingredient.toLowerCase().trim();
        this.ingredientMappings[key] = category;
        await this.save('ingredientMappings', this.ingredientMappings);
    }

    async removeIngredientMapping(ingredient) {
        const key = ingredient.toLowerCase().trim();
        delete this.ingredientMappings[key];
        await this.save('ingredientMappings', this.ingredientMappings);
    }

    getIngredientMappings() {
        return Object.entries(this.ingredientMappings).map(([ingredient, category]) => ({
            ingredient,
            category
        }));
    }

    async addManualItem(text, category) {
        const item = {
            text: text.trim(),
            category: category,
            checked: false,
            source: 'manual'
        };
        this.shoppingList.push(item);
        this.shoppingList = this.deduplicateItems(this.shoppingList);
        await this.save('shoppingList', this.shoppingList);
    }

    async toggleItemChecked(text) {
        const item = this.shoppingList.find(i => i.text.toLowerCase() === text.toLowerCase());
        if (item) {
            item.checked = !item.checked;
            await this.save('shoppingList', this.shoppingList);
        }
    }

    async removeItem(text) {
        this.shoppingList = this.shoppingList.filter(i => i.text.toLowerCase() !== text.toLowerCase());
        await this.save('shoppingList', this.shoppingList);
    }

    async clearCheckedItems() {
        this.shoppingList = this.shoppingList.filter(i => !i.checked);
        await this.save('shoppingList', this.shoppingList);
    }

    async clearAllItems() {
        this.shoppingList = [];
        await this.save('shoppingList', this.shoppingList);
    }

    // Category methods
    async addCategoryItems(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (category) {
            for (const itemText of category.items) {
                await this.addManualItem(itemText, category.aisle);
            }
        }
    }

    async addCategory(category) {
        category.id = Date.now().toString();
        this.categories.push(category);
        await this.save('categories', this.categories);
        
        if (this.syncEnabled) {
            await firebaseService.saveCategory(category);
        }
    }

    async updateCategory(id, category) {
        const index = this.categories.findIndex(c => c.id === id);
        if (index !== -1) {
            this.categories[index] = { ...this.categories[index], ...category };
            await this.save('categories', this.categories);
            
            if (this.syncEnabled) {
                await firebaseService.saveCategory(this.categories[index]);
            }
        }
    }

    async deleteCategory(id) {
        this.categories = this.categories.filter(c => c.id !== id);
        await this.save('categories', this.categories);

        if (this.syncEnabled) {
            await firebaseService.deleteCategory(id);
        }
    }

    // Meal ordering methods
    async reorderMeals(fromIndex, toIndex) {
        // Get sorted meals array
        const sortedMeals = this.getSortedMeals();

        // Move meal from one position to another in the sorted array
        const meal = sortedMeals[fromIndex];
        sortedMeals.splice(fromIndex, 1);
        sortedMeals.splice(toIndex, 0, meal);

        // Update sortOrder for all meals based on new positions
        sortedMeals.forEach((m, index) => {
            m.sortOrder = index;
        });

        // Update the main meals array
        this.meals = sortedMeals;
        await this.save('meals', this.meals);

        if (this.syncEnabled) {
            await firebaseService.saveMeals(this.meals);
        }
    }

    async sortMealsAlphabetically() {
        // Ensure all meals have sortOrder first
        this.meals.forEach((meal, index) => {
            if (meal.sortOrder === undefined) {
                meal.sortOrder = index;
            }
        });

        // Sort alphabetically (case-insensitive)
        this.meals.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

        // Reassign sortOrder based on new alphabetical position
        this.meals.forEach((m, index) => {
            m.sortOrder = index;
        });

        await this.save('meals', this.meals);

        if (this.syncEnabled) {
            await firebaseService.saveMeals(this.meals);
        }
    }

    getSortedMeals() {
        // Ensure all meals have sortOrder (for backwards compatibility)
        this.meals.forEach((meal, index) => {
            if (meal.sortOrder === undefined) {
                meal.sortOrder = index;
            }
        });

        // Return sorted by sortOrder
        return [...this.meals].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }
}

// UI Controller
class App {
    constructor() {
        this.store = new DataStore();
        this.currentView = 'meals';
        this.editingMealId = null;
        this.editingCategoryId = null;
        this.isReady = false;
        this.collapsedCategories = new Set(); // Track which shopping categories are collapsed
    }

    async initialize() {
        // Check authentication
        await firebaseService.initialize();
        
        if (!firebaseService.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        // Initialize data store
        await this.store.initialize();
        
        this.initEventListeners();
        this.render();
        this.isReady = true;
        
        // Add logout button
        this.addLogoutButton();
    }

    addLogoutButton() {
        // Add logout button to navigation if not exists
        const nav = document.querySelector('.bottom-nav');
        if (nav && !document.getElementById('logout-btn')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'logout-btn';
            logoutBtn.className = 'nav-btn';
            logoutBtn.innerHTML = '<span class="nav-icon">🚪</span><span class="nav-label">Logout</span>';
            logoutBtn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to logout?')) {
                    await firebaseService.signOut();
                    window.location.href = 'login.html';
                }
            });
            nav.appendChild(logoutBtn);
        }
    }

    initEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Meal modal
        document.getElementById('add-meal-btn').addEventListener('click', () => this.openMealModal());
        document.getElementById('close-modal').addEventListener('click', () => this.closeMealModal());
        document.getElementById('cancel-meal-btn').addEventListener('click', () => this.closeMealModal());
        document.getElementById('save-meal-btn').addEventListener('click', () => this.saveMeal());

        // Category modal
        document.getElementById('manage-categories-btn').addEventListener('click', () => this.openCategoryModal());
        document.getElementById('close-category-modal').addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('cancel-category-btn').addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('save-category-btn').addEventListener('click', () => this.saveCategory());
        document.getElementById('delete-category-btn').addEventListener('click', () => this.deleteCategory());

        // Meal search
        document.getElementById('meal-search').addEventListener('input', (e) => {
            this.renderMealsList(e.target.value);
        });

        // Shopping list actions
        document.getElementById('add-manual-btn').addEventListener('click', () => this.addManualItem());
        document.getElementById('manual-item-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addManualItem();
        });
        document.getElementById('clear-checked-btn').addEventListener('click', () => this.clearCheckedItems());
        document.getElementById('clear-list-btn').addEventListener('click', () => this.clearAllItems());
        document.getElementById('clear-meals-btn').addEventListener('click', () => this.clearSelectedMeals());
        
        // Export data
        document.getElementById('export-data-btn').addEventListener('click', () => this.exportData());

        // Sort meals alphabetically
        document.getElementById('sort-alphabetically-btn').addEventListener('click', async () => {
            if (confirm('Sort all meals alphabetically? This will change the current order.')) {
                await this.store.sortMealsAlphabetically();
                this.renderDatabase();
            }
        });

        // Manage ingredients
        document.getElementById('manage-ingredients-btn').addEventListener('click', () => this.openIngredientsModal());
        document.getElementById('close-ingredients-modal').addEventListener('click', () => this.closeIngredientsModal());
        document.getElementById('close-ingredients-btn').addEventListener('click', () => this.closeIngredientsModal());
        document.getElementById('add-ingredient-mapping-btn').addEventListener('click', () => this.addIngredientMapping());
        document.getElementById('new-ingredient-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addIngredientMapping();
        });

        // Bulk mode toggle
        document.getElementById('toggle-bulk-mode-btn').addEventListener('click', () => this.toggleBulkMode());
        document.getElementById('cancel-bulk-mode-btn').addEventListener('click', () => this.toggleBulkMode());
        document.getElementById('save-bulk-ingredients-btn').addEventListener('click', () => this.saveBulkIngredients());

        // Export/Import
        document.getElementById('export-ingredients-btn').addEventListener('click', () => this.exportIngredients());
        document.getElementById('import-ingredients-btn').addEventListener('click', () => {
            document.getElementById('import-ingredients-file').click();
        });
        document.getElementById('import-ingredients-file').addEventListener('change', (e) => this.importIngredients(e));
    }

    switchView(view) {
        this.currentView = view;
        
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Update views
        document.querySelectorAll('.view').forEach(v => {
            v.classList.toggle('active', v.id === `${view}-view`);
        });

        this.render();
    }

    render() {
        switch(this.currentView) {
            case 'meals':
                this.renderMealsList();
                break;
            case 'shopping':
                this.renderShoppingList();
                break;
            case 'categories':
                this.renderCategories();
                break;
            case 'database':
                this.renderDatabase();
                break;
        }
    }

    renderMealsList(searchTerm = '') {
        const container = document.getElementById('meals-list');
        const sortedMeals = this.store.getSortedMeals();
        const meals = sortedMeals.filter(meal =>
            searchTerm === '' || meal.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (meals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🍽️</div>
                    <div class="empty-state-text">
                        ${searchTerm ? 'No meals found' : 'No meals yet. Add some in the Database tab!'}
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = meals.map(meal => {
            const isSelected = this.store.selectedMeals.includes(meal.id);
            return `
                <div class="meal-item ${isSelected ? 'selected' : ''}" data-id="${meal.id}">
                    <div class="meal-checkbox"></div>
                    <div class="meal-info">
                        <div class="meal-name">${meal.name}</div>
                        <div class="meal-ingredients-count">${meal.ingredients.length} ingredients</div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click listeners
        container.querySelectorAll('.meal-item').forEach(item => {
            item.addEventListener('click', async () => {
                const id = item.dataset.id;
                await this.store.toggleMealSelection(id);
                this.renderMealsList(searchTerm);
            });
        });
    }

    renderShoppingList() {
        const container = document.getElementById('shopping-list');
        
        if (this.store.shoppingList.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🛒</div>
                    <div class="empty-state-text">Your shopping list is empty. Select some meals!</div>
                </div>
            `;
            return;
        }

        // Group by category (in aisle order)
        const aisleOrder = [
            'Fruit/Veg',
            'Meat/Chilled',
            'Pet Things',
            'Chips',
            'Coffee/Drinks/Tea',
            'Breakfast/Condiments',
            'Baking/Choc Sauce/Dried Fruits',
            'Bars/Chips/Pretzels/Popcorn',
            'Canned/Seasoning/Sauces',
            'Pasta/Noodles/Stock/Sauces/Tacos/Rice',
            'Paper Towels/Nappy Things/TP',
            'Biscuits/Crackers',
            'Cleaning/Washing products',
            'Frozen',
            'Bread/Buns',
            'Womens Products/Shampoo/Soap/Oral',
            'Misc'
        ];

        const grouped = {};
        this.store.shoppingList.forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });

        // Sort items within each category
        Object.keys(grouped).forEach(category => {
            grouped[category].sort((a, b) => a.text.localeCompare(b.text));
        });

        const html = aisleOrder
            .filter(aisle => grouped[aisle] && grouped[aisle].length > 0)
            .map(aisle => {
                const items = grouped[aisle];
                const isCollapsed = this.collapsedCategories.has(aisle);
                const checkedCount = items.filter(item => item.checked).length;
                const totalCount = items.length;
                return `
                    <div class="shopping-category ${isCollapsed ? 'collapsed' : ''}">
                        <div class="category-header" data-category="${aisle}">
                            <span class="category-toggle">${isCollapsed ? '▶' : '▼'}</span>
                            <span class="category-name">${aisle}</span>
                            <span class="category-progress">${checkedCount}/${totalCount}</span>
                        </div>
                        <div class="category-items">
                            ${items.map(item => `
                                <div class="shopping-item ${item.checked ? 'checked' : ''}" data-text="${item.text}" data-category="${item.category}">
                                    <div class="item-checkbox"></div>
                                    <div class="item-text">
                                        ${item.text}
                                        ${item.count > 1 ? `<span class="item-count">×${item.count}</span>` : ''}
                                    </div>
                                    <button class="item-categorize" data-text="${item.text}" title="Change category">🏷️</button>
                                    <button class="item-remove" data-text="${item.text}">×</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('');

        container.innerHTML = html;

        // Add click listener for category headers (collapse/expand)
        container.querySelectorAll('.category-header').forEach(header => {
            header.addEventListener('click', () => {
                const category = header.dataset.category;
                if (this.collapsedCategories.has(category)) {
                    this.collapsedCategories.delete(category);
                } else {
                    this.collapsedCategories.add(category);
                }
                this.renderShoppingList();
            });
        });

        // Add click listeners for items
        container.querySelectorAll('.shopping-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                if (!e.target.classList.contains('item-remove') && !e.target.classList.contains('item-categorize')) {
                    const text = item.dataset.text;
                    await this.store.toggleItemChecked(text);
                    this.renderShoppingList();
                }
            });
        });

        container.querySelectorAll('.item-remove').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const text = btn.dataset.text;
                await this.store.removeItem(text);
                this.renderShoppingList();
            });
        });

        container.querySelectorAll('.item-categorize').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const text = btn.dataset.text;
                await this.promptForCategory(text);
            });
        });
    }

    async promptForCategory(ingredient) {
        const categories = [
            'Fruit/Veg',
            'Meat/Chilled',
            'Pasta/Noodles/Stock/Sauces/Tacos/Rice',
            'Canned/Seasoning/Sauces',
            'Frozen',
            'Bread/Buns',
            'Baking/Choc Sauce/Dried Fruits',
            'Pet Things',
            'Chips',
            'Coffee/Drinks/Tea',
            'Breakfast/Condiments',
            'Bars/Chips/Pretzels/Popcorn',
            'Paper Towels/Nappy Things/TP',
            'Biscuits/Crackers',
            'Cleaning/Washing products',
            'Womens Products/Shampoo/Soap/Oral'
        ];

        const categoryList = categories.map((cat, i) => `${i + 1}. ${cat}`).join('\n');
        const response = prompt(`Change category for "${ingredient}"\n\nCurrent: ${this.store.ingredientMappings[ingredient.toLowerCase()] || 'Not set'}\n\nEnter the number for the new category:\n\n${categoryList}\n\nOr type a custom category name:`);

        if (response) {
            const num = parseInt(response);
            let category;

            if (num && num >= 1 && num <= categories.length) {
                category = categories[num - 1];
            } else {
                category = response.trim();
            }

            if (category) {
                await this.store.addIngredientMapping(ingredient, category);
                // Recategorize existing shopping list items
                await this.store.updateShoppingList();
                this.renderShoppingList();
                alert(`"${ingredient}" updated to "${category}"`);
            }
        }
    }

    renderCategories() {
        const container = document.getElementById('categories-list');
        
        if (this.store.categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <div class="empty-state-text">No categories yet. Click Manage to add some!</div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.store.categories.map(category => `
            <div class="category-card" data-id="${category.id}">
                <div class="category-icon">${category.icon}</div>
                <div class="category-name">${category.name}</div>
                <div class="category-count">${category.items.length} items</div>
            </div>
        `).join('');

        // Add click listeners
        container.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', async () => {
                const id = card.dataset.id;
                await this.store.addCategoryItems(id);
                this.renderShoppingList();
                // Show feedback
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 200);
            });
        });
    }

    renderDatabase() {
        const container = document.getElementById('database-list');

        if (this.store.meals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📚</div>
                    <div class="empty-state-text">No meals in database. Click "+ Add Meal" to create one!</div>
                </div>
            `;
            return;
        }

        const sortedMeals = this.store.getSortedMeals();

        container.innerHTML = sortedMeals.map((meal, index) => `
            <div class="database-item" draggable="true" data-id="${meal.id}" data-index="${index}">
                <div class="drag-handle">⋮⋮</div>
                <div class="database-item-info">
                    <h3>${meal.name}</h3>
                    <div class="database-item-ingredients">${meal.ingredients.slice(0, 3).join(', ')}${meal.ingredients.length > 3 ? '...' : ''}</div>
                </div>
                <div class="database-item-actions">
                    <button class="icon-btn edit-meal-btn" data-id="${meal.id}">✏️</button>
                    <button class="icon-btn delete-meal-btn" data-id="${meal.id}">🗑️</button>
                </div>
            </div>
        `).join('');

        // Add click listeners
        container.querySelectorAll('.edit-meal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                this.openMealModal(id);
            });
        });

        container.querySelectorAll('.delete-meal-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                if (confirm('Are you sure you want to delete this meal?')) {
                    await this.store.deleteMeal(id);
                    this.renderDatabase();
                }
            });
        });

        // Add drag-and-drop listeners
        this.setupDragAndDrop(container);
    }

    setupDragAndDrop(container) {
        let draggedElement = null;
        let draggedIndex = null;

        container.querySelectorAll('.database-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedElement = item;
                draggedIndex = parseInt(item.dataset.index);
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                draggedElement = null;
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = this.getDragAfterElement(container, e.clientY);
                if (afterElement == null) {
                    container.appendChild(draggedElement);
                } else {
                    container.insertBefore(draggedElement, afterElement);
                }
            });

            item.addEventListener('drop', async (e) => {
                e.preventDefault();
                const dropIndex = parseInt(item.dataset.index);
                if (draggedIndex !== null && draggedIndex !== dropIndex) {
                    await this.store.reorderMeals(draggedIndex, dropIndex);
                    this.renderDatabase();
                }
            });
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.database-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    openMealModal(mealId = null) {
        this.editingMealId = mealId;
        const modal = document.getElementById('meal-modal');
        const title = document.getElementById('modal-title');
        const nameInput = document.getElementById('meal-name-input');
        const ingredientsInput = document.getElementById('meal-ingredients-input');

        if (mealId) {
            const meal = this.store.meals.find(m => m.id === mealId);
            title.textContent = 'Edit Meal';
            nameInput.value = meal.name;
            ingredientsInput.value = meal.ingredients.join('\n');
        } else {
            title.textContent = 'Add Meal';
            nameInput.value = '';
            ingredientsInput.value = '';
        }

        modal.classList.add('active');
        nameInput.focus();
    }

    closeMealModal() {
        document.getElementById('meal-modal').classList.remove('active');
        this.editingMealId = null;
    }

    async saveMeal() {
        const name = document.getElementById('meal-name-input').value.trim();
        const ingredientsText = document.getElementById('meal-ingredients-input').value.trim();

        if (!name || !ingredientsText) {
            alert('Please fill in both meal name and ingredients');
            return;
        }

        const ingredients = ingredientsText.split('\n').filter(i => i.trim() !== '');

        const meal = { name, ingredients };

        if (this.editingMealId) {
            await this.store.updateMeal(this.editingMealId, meal);
        } else {
            await this.store.addMeal(meal);
        }

        this.closeMealModal();
        this.render();
    }

    openCategoryModal(categoryId = null) {
        this.editingCategoryId = categoryId;
        const modal = document.getElementById('category-modal');
        const title = document.getElementById('category-modal-title');
        const nameInput = document.getElementById('category-name-input');
        const itemsInput = document.getElementById('category-items-input');
        const aisleSelect = document.getElementById('category-aisle-select');
        const deleteBtn = document.getElementById('delete-category-btn');

        if (categoryId) {
            const category = this.store.categories.find(c => c.id === categoryId);
            title.textContent = 'Edit Category';
            nameInput.value = category.name;
            itemsInput.value = category.items.join('\n');
            aisleSelect.value = category.aisle;
            deleteBtn.style.display = 'block';
        } else {
            title.textContent = 'Add Category';
            nameInput.value = '';
            itemsInput.value = '';
            aisleSelect.value = 'Misc';
            deleteBtn.style.display = 'none';
        }

        modal.classList.add('active');
        nameInput.focus();
    }

    closeCategoryModal() {
        document.getElementById('category-modal').classList.remove('active');
        this.editingCategoryId = null;
    }

    async saveCategory() {
        const name = document.getElementById('category-name-input').value.trim();
        const itemsText = document.getElementById('category-items-input').value.trim();
        const aisle = document.getElementById('category-aisle-select').value;

        if (!name || !itemsText) {
            alert('Please fill in category name and items');
            return;
        }

        const items = itemsText.split('\n').filter(i => i.trim() !== '');

        const category = {
            name,
            items,
            aisle,
            icon: '📦' // Default icon, could make this customizable
        };

        if (this.editingCategoryId) {
            await this.store.updateCategory(this.editingCategoryId, category);
        } else {
            await this.store.addCategory(category);
        }

        this.closeCategoryModal();
        this.renderCategories();
    }

    async deleteCategory() {
        if (confirm('Are you sure you want to delete this category?')) {
            await this.store.deleteCategory(this.editingCategoryId);
            this.closeCategoryModal();
            this.renderCategories();
        }
    }

    async addManualItem() {
        const input = document.getElementById('manual-item-input');
        const select = document.getElementById('manual-item-category');
        const text = input.value.trim();

        if (text) {
            await this.store.addManualItem(text, select.value);
            input.value = '';
            this.renderShoppingList();
        }
    }

    async clearCheckedItems() {
        if (confirm('Remove all checked items from the list?')) {
            await this.store.clearCheckedItems();
            this.renderShoppingList();
        }
    }

    async clearAllItems() {
        if (confirm('Clear the entire shopping list?')) {
            await this.store.clearAllItems();
            this.renderShoppingList();
        }
    }

    async clearSelectedMeals() {
        if (confirm('Unselect all meals? This will remove meal ingredients from your shopping list.')) {
            await this.store.clearSelectedMeals();
            this.renderMealsList();
        }
    }

    exportData() {
        const data = {
            meals: this.store.meals,
            categories: this.store.categories,
            exportDate: new Date().toISOString()
        };

        // Create downloadable JSON file
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `meal-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Also create CSV for easy viewing in sheets
        const csv = this.store.meals.map(meal => {
            return `${meal.name}|${meal.ingredients.join(', ')}`;
        }).join('\n');

        const csvBlob = new Blob([csv], { type: 'text/csv' });
        const csvUrl = URL.createObjectURL(csvBlob);
        const csvLink = document.createElement('a');
        csvLink.href = csvUrl;
        csvLink.download = `meal-planner-backup-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(csvLink);
        csvLink.click();
        document.body.removeChild(csvLink);
        URL.revokeObjectURL(csvUrl);
    }

    openIngredientsModal() {
        const modal = document.getElementById('ingredients-modal');
        modal.classList.add('active');
        this.renderIngredientMappings();
    }

    closeIngredientsModal() {
        const modal = document.getElementById('ingredients-modal');
        modal.classList.remove('active');
        document.getElementById('new-ingredient-input').value = '';
        document.getElementById('new-ingredient-category').value = '';
    }

    renderIngredientMappings() {
        const container = document.getElementById('ingredient-mappings-list');
        const mappings = this.store.getIngredientMappings();

        if (mappings.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No ingredient mappings yet. Add your first one above!</p>';
            return;
        }

        // Sort mappings alphabetically by ingredient
        mappings.sort((a, b) => a.ingredient.localeCompare(b.ingredient));

        container.innerHTML = mappings.map(({ ingredient, category }) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eee;">
                <div style="flex: 1;">
                    <strong>${ingredient}</strong>
                    <span style="color: #666; margin-left: 10px;">→ ${category}</span>
                </div>
                <button class="icon-btn delete-mapping-btn" data-ingredient="${ingredient}" title="Delete mapping" style="color: #dc3545;">🗑️</button>
            </div>
        `).join('');

        // Add delete listeners
        container.querySelectorAll('.delete-mapping-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const ingredient = btn.dataset.ingredient;
                if (confirm(`Remove category mapping for "${ingredient}"?`)) {
                    await this.store.removeIngredientMapping(ingredient);
                    await this.store.updateShoppingList();
                    this.renderIngredientMappings();
                    if (this.currentView === 'shopping') {
                        this.renderShoppingList();
                    }
                }
            });
        });
    }

    async addIngredientMapping() {
        const ingredientInput = document.getElementById('new-ingredient-input');
        const categorySelect = document.getElementById('new-ingredient-category');

        const ingredient = ingredientInput.value.trim();
        const category = categorySelect.value;

        if (!ingredient) {
            alert('Please enter an ingredient name');
            return;
        }

        if (!category) {
            alert('Please select a category');
            return;
        }

        await this.store.addIngredientMapping(ingredient, category);
        await this.store.updateShoppingList();

        // Clear inputs
        ingredientInput.value = '';
        categorySelect.value = '';

        // Refresh the list
        this.renderIngredientMappings();

        // Update shopping list if visible
        if (this.currentView === 'shopping') {
            this.renderShoppingList();
        }
    }

    toggleBulkMode() {
        const singleMode = document.getElementById('single-mode-section');
        const bulkMode = document.getElementById('bulk-mode-section');
        const toggleBtn = document.getElementById('toggle-bulk-mode-btn');

        if (bulkMode.style.display === 'none') {
            // Switch to bulk mode
            singleMode.style.display = 'none';
            bulkMode.style.display = 'block';
            toggleBtn.textContent = '📋 Switch to Single Add';

            // Populate textarea with current mappings
            const mappings = this.store.getIngredientMappings();
            const bulkText = mappings
                .sort((a, b) => a.ingredient.localeCompare(b.ingredient))
                .map(({ ingredient, category }) => `${ingredient} | ${category}`)
                .join('\n');
            document.getElementById('bulk-ingredients-textarea').value = bulkText;
        } else {
            // Switch back to single mode
            bulkMode.style.display = 'none';
            singleMode.style.display = 'block';
            toggleBtn.textContent = '📝 Switch to Bulk Edit';
        }
    }

    async saveBulkIngredients() {
        const textarea = document.getElementById('bulk-ingredients-textarea');
        const lines = textarea.value.split('\n').filter(line => line.trim());

        const newMappings = {};
        const errors = [];

        lines.forEach((line, index) => {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length !== 2) {
                errors.push(`Line ${index + 1}: Invalid format (should be "ingredient | category")`);
                return;
            }

            const [ingredient, category] = parts;
            if (!ingredient || !category) {
                errors.push(`Line ${index + 1}: Missing ingredient or category`);
                return;
            }

            newMappings[ingredient.toLowerCase()] = category;
        });

        if (errors.length > 0) {
            alert('Errors found:\n\n' + errors.join('\n'));
            return;
        }

        // Confirm replacement
        const currentCount = Object.keys(this.store.ingredientMappings).length;
        const newCount = Object.keys(newMappings).length;

        if (!confirm(`Replace ${currentCount} existing mappings with ${newCount} new mappings?\n\nThis will:\n- Remove all current mappings\n- Add the mappings from the textarea\n- Update your shopping list`)) {
            return;
        }

        // Replace all mappings
        this.store.ingredientMappings = newMappings;
        await this.store.save('ingredientMappings', this.store.ingredientMappings);
        await this.store.updateShoppingList();

        // Switch back to single mode
        this.toggleBulkMode();
        this.renderIngredientMappings();

        if (this.currentView === 'shopping') {
            this.renderShoppingList();
        }

        alert(`Successfully saved ${newCount} ingredient mappings!`);
    }

    exportIngredients() {
        const mappings = this.store.ingredientMappings;
        const data = {
            ingredientMappings: mappings,
            exportDate: new Date().toISOString(),
            count: Object.keys(mappings).length
        };

        // Create downloadable JSON file
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ingredient-mappings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert(`Exported ${Object.keys(mappings).length} ingredient mappings!`);
    }

    async importIngredients(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (!data.ingredientMappings || typeof data.ingredientMappings !== 'object') {
                    alert('Invalid file format. Expected a JSON file with "ingredientMappings" field.');
                    return;
                }

                const newMappings = data.ingredientMappings;
                const currentCount = Object.keys(this.store.ingredientMappings).length;
                const newCount = Object.keys(newMappings).length;

                const action = confirm(
                    `Found ${newCount} ingredient mappings in file.\n\n` +
                    `Current mappings: ${currentCount}\n\n` +
                    `Choose:\n` +
                    `OK = Replace all existing mappings\n` +
                    `Cancel = Merge (keep existing, add new)`
                );

                if (action) {
                    // Replace all
                    this.store.ingredientMappings = newMappings;
                } else {
                    // Merge
                    this.store.ingredientMappings = { ...this.store.ingredientMappings, ...newMappings };
                }

                await this.store.save('ingredientMappings', this.store.ingredientMappings);
                await this.store.updateShoppingList();

                this.renderIngredientMappings();
                if (this.currentView === 'shopping') {
                    this.renderShoppingList();
                }

                const finalCount = Object.keys(this.store.ingredientMappings).length;
                alert(`Successfully imported! Total mappings: ${finalCount}`);

            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };

        reader.readAsText(file);

        // Reset file input so same file can be imported again
        event.target.value = '';
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    window.app = new App();
    await window.app.initialize();
});
