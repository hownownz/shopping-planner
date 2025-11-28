// Data Storage
class DataStore {
    constructor() {
        this.meals = this.load('meals') || [];
        this.selectedMeals = this.load('selectedMeals') || [];
        this.shoppingList = this.load('shoppingList') || [];
        this.categories = this.load('categories') || this.getDefaultCategories();
    }

    load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading data:', e);
            return null;
        }
    }

    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving data:', e);
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
    addMeal(meal) {
        meal.id = Date.now().toString();
        this.meals.push(meal);
        this.save('meals', this.meals);
    }

    updateMeal(id, meal) {
        const index = this.meals.findIndex(m => m.id === id);
        if (index !== -1) {
            this.meals[index] = { ...this.meals[index], ...meal };
            this.save('meals', this.meals);
        }
    }

    deleteMeal(id) {
        this.meals = this.meals.filter(m => m.id !== id);
        this.selectedMeals = this.selectedMeals.filter(mId => mId !== id);
        this.save('meals', this.meals);
        this.save('selectedMeals', this.selectedMeals);
    }

    toggleMealSelection(id) {
        const index = this.selectedMeals.indexOf(id);
        if (index === -1) {
            this.selectedMeals.push(id);
        } else {
            this.selectedMeals.splice(index, 1);
        }
        this.save('selectedMeals', this.selectedMeals);
        this.updateShoppingList();
    }

    clearSelectedMeals() {
        this.selectedMeals = [];
        this.save('selectedMeals', this.selectedMeals);
        this.updateShoppingList();
    }

    // Shopping list methods
    updateShoppingList() {
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
        this.save('shoppingList', this.shoppingList);
    }

    deduplicateItems(items) {
        const itemMap = new Map();
        
        items.forEach(item => {
            const key = item.text.toLowerCase().trim();
            if (itemMap.has(key)) {
                const existing = itemMap.get(key);
                // Keep the item that's not checked, or the first one if both same status
                if (!existing.checked && item.checked) {
                    return; // Keep existing
                }
            }
            itemMap.set(key, item);
        });

        return Array.from(itemMap.values());
    }

    guessCategory(ingredient) {
        const text = ingredient.toLowerCase();
        
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

    addManualItem(text, category) {
        const item = {
            text: text.trim(),
            category: category,
            checked: false,
            source: 'manual'
        };
        this.shoppingList.push(item);
        this.shoppingList = this.deduplicateItems(this.shoppingList);
        this.save('shoppingList', this.shoppingList);
    }

    toggleItemChecked(text) {
        const item = this.shoppingList.find(i => i.text.toLowerCase() === text.toLowerCase());
        if (item) {
            item.checked = !item.checked;
            this.save('shoppingList', this.shoppingList);
        }
    }

    removeItem(text) {
        this.shoppingList = this.shoppingList.filter(i => i.text.toLowerCase() !== text.toLowerCase());
        this.save('shoppingList', this.shoppingList);
    }

    clearCheckedItems() {
        this.shoppingList = this.shoppingList.filter(i => !i.checked);
        this.save('shoppingList', this.shoppingList);
    }

    clearAllItems() {
        this.shoppingList = [];
        this.save('shoppingList', this.shoppingList);
    }

    // Category methods
    addCategoryItems(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (category) {
            category.items.forEach(itemText => {
                this.addManualItem(itemText, category.aisle);
            });
        }
    }

    addCategory(category) {
        category.id = Date.now().toString();
        this.categories.push(category);
        this.save('categories', this.categories);
    }

    updateCategory(id, category) {
        const index = this.categories.findIndex(c => c.id === id);
        if (index !== -1) {
            this.categories[index] = { ...this.categories[index], ...category };
            this.save('categories', this.categories);
        }
    }

    deleteCategory(id) {
        this.categories = this.categories.filter(c => c.id !== id);
        this.save('categories', this.categories);
    }
}

// UI Controller
class App {
    constructor() {
        this.store = new DataStore();
        this.currentView = 'meals';
        this.editingMealId = null;
        this.editingCategoryId = null;
        
        this.initEventListeners();
        this.render();
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
        const meals = this.store.meals.filter(meal => 
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
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.store.toggleMealSelection(id);
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
                return `
                    <div class="shopping-category">
                        <div class="category-header">${aisle}</div>
                        <div class="category-items">
                            ${items.map(item => `
                                <div class="shopping-item ${item.checked ? 'checked' : ''}" data-text="${item.text}">
                                    <div class="item-checkbox"></div>
                                    <div class="item-text">${item.text}</div>
                                    <button class="item-remove" data-text="${item.text}">×</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('');

        container.innerHTML = html;

        // Add click listeners
        container.querySelectorAll('.shopping-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('item-remove')) {
                    const text = item.dataset.text;
                    this.store.toggleItemChecked(text);
                    this.renderShoppingList();
                }
            });
        });

        container.querySelectorAll('.item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const text = btn.dataset.text;
                this.store.removeItem(text);
                this.renderShoppingList();
            });
        });
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
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                this.store.addCategoryItems(id);
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

        container.innerHTML = this.store.meals.map(meal => `
            <div class="database-item">
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
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                if (confirm('Are you sure you want to delete this meal?')) {
                    this.store.deleteMeal(id);
                    this.renderDatabase();
                }
            });
        });
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

    saveMeal() {
        const name = document.getElementById('meal-name-input').value.trim();
        const ingredientsText = document.getElementById('meal-ingredients-input').value.trim();

        if (!name || !ingredientsText) {
            alert('Please fill in both meal name and ingredients');
            return;
        }

        const ingredients = ingredientsText.split('\n').filter(i => i.trim() !== '');

        const meal = { name, ingredients };

        if (this.editingMealId) {
            this.store.updateMeal(this.editingMealId, meal);
        } else {
            this.store.addMeal(meal);
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

    saveCategory() {
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
            this.store.updateCategory(this.editingCategoryId, category);
        } else {
            this.store.addCategory(category);
        }

        this.closeCategoryModal();
        this.renderCategories();
    }

    deleteCategory() {
        if (confirm('Are you sure you want to delete this category?')) {
            this.store.deleteCategory(this.editingCategoryId);
            this.closeCategoryModal();
            this.renderCategories();
        }
    }

    addManualItem() {
        const input = document.getElementById('manual-item-input');
        const select = document.getElementById('manual-item-category');
        const text = input.value.trim();

        if (text) {
            this.store.addManualItem(text, select.value);
            input.value = '';
            this.renderShoppingList();
        }
    }

    clearCheckedItems() {
        if (confirm('Remove all checked items from the list?')) {
            this.store.clearCheckedItems();
            this.renderShoppingList();
        }
    }

    clearAllItems() {
        if (confirm('Clear the entire shopping list?')) {
            this.store.clearAllItems();
            this.renderShoppingList();
        }
    }

    clearSelectedMeals() {
        if (confirm('Unselect all meals? This will remove meal ingredients from your shopping list.')) {
            this.store.clearSelectedMeals();
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
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
