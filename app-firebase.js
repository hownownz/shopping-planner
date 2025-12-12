// Data Storage with Firebase Sync
import firebaseService from './firebase-service.js';

class DataStore {
    constructor() {
        this.meals = [];
        this.selectedMeals = [];
        this.shoppingList = [];
        this.categories = [];
        this.ingredientMappings = {}; // Custom ingredient-to-category mappings
        this.itemUsageCount = {}; // Track how often items are added to shopping list
        this.masterProductList = []; // Master list of all products organized by aisle
        this.aisles = []; // List of aisle names with order
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
        this.itemUsageCount = this.loadLocal('itemUsageCount') || {};
        this.masterProductList = this.loadLocal('masterProductList') || this.getDefaultMasterProductList();
        this.aisles = this.loadLocal('aisles') || this.getDefaultAisles();

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
                case 'masterProductList':
                    this.masterProductList = data;
                    this.saveLocal('masterProductList', data);
                    if (window.app) window.app.render();
                    break;
                case 'aisles':
                    this.aisles = data;
                    this.saveLocal('aisles', data);
                    if (window.app) window.app.render();
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
                case 'masterProductList':
                    await firebaseService.saveMasterProductList(data);
                    break;
                case 'aisles':
                    await firebaseService.saveAisles(data);
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

    getDefaultMasterProductList() {
        // Master product list from user's iCloud shopping list
        const products = [
            // Fruit/Veg
            { aisle: 'Fruit/Veg', name: 'Apples' },
            { aisle: 'Fruit/Veg', name: 'Avocados' },
            { aisle: 'Fruit/Veg', name: 'Bananas' },
            { aisle: 'Fruit/Veg', name: 'Bok Choy' },
            { aisle: 'Fruit/Veg', name: 'Broccoli' },
            { aisle: 'Fruit/Veg', name: 'Capsicum' },
            { aisle: 'Fruit/Veg', name: 'Carrots' },
            { aisle: 'Fruit/Veg', name: 'Celery' },
            { aisle: 'Fruit/Veg', name: 'Cherry tomatoes' },
            { aisle: 'Fruit/Veg', name: 'Chives' },
            { aisle: 'Fruit/Veg', name: 'Coriander' },
            { aisle: 'Fruit/Veg', name: 'Corn' },
            { aisle: 'Fruit/Veg', name: 'Cucumber' },
            { aisle: 'Fruit/Veg', name: 'Ginger' },
            { aisle: 'Fruit/Veg', name: 'Grapes' },
            { aisle: 'Fruit/Veg', name: 'Lettuce' },
            { aisle: 'Fruit/Veg', name: 'Mandarins' },
            { aisle: 'Fruit/Veg', name: 'Mushrooms' },
            { aisle: 'Fruit/Veg', name: 'Onions' },
            { aisle: 'Fruit/Veg', name: 'Onions Spring' },
            { aisle: 'Fruit/Veg', name: 'Pears' },
            { aisle: 'Fruit/Veg', name: 'Potatoes' },
            { aisle: 'Fruit/Veg', name: 'Snow peas' },
            { aisle: 'Fruit/Veg', name: 'Spinach' },
            { aisle: 'Fruit/Veg', name: 'Strawberries' },
            { aisle: 'Fruit/Veg', name: 'Zucchini' },

            // Meat/Chilled
            { aisle: 'Meat/Chilled', name: 'Bacon' },
            { aisle: 'Meat/Chilled', name: 'Beef Mince' },
            { aisle: 'Meat/Chilled', name: 'Butter' },
            { aisle: 'Meat/Chilled', name: 'Chicken Breast' },
            { aisle: 'Meat/Chilled', name: 'Chicken Thighs' },
            { aisle: 'Meat/Chilled', name: 'Chicken Whole' },
            { aisle: 'Meat/Chilled', name: 'Cream' },
            { aisle: 'Meat/Chilled', name: 'Custards 1L' },
            { aisle: 'Meat/Chilled', name: 'Eggs' },
            { aisle: 'Meat/Chilled', name: 'Fish' },
            { aisle: 'Meat/Chilled', name: 'Fruit cups 1' },
            { aisle: 'Meat/Chilled', name: 'Ham' },
            { aisle: 'Meat/Chilled', name: 'Milk' },
            { aisle: 'Meat/Chilled', name: 'Pouches (yogurt etc)' },
            { aisle: 'Meat/Chilled', name: 'Salami' },
            { aisle: 'Meat/Chilled', name: 'Sausages' },
            { aisle: 'Meat/Chilled', name: 'Steak' },
            { aisle: 'Meat/Chilled', name: 'Yogurt' },

            // Pet Things
            { aisle: 'Pet Things', name: 'Cat food' },
            { aisle: 'Pet Things', name: 'Litter' },

            // Chips
            { aisle: 'Chips', name: 'Chips' },
            { aisle: 'Chips', name: 'Doritos' },
            { aisle: 'Chips', name: 'Eta Ripples' },
            { aisle: 'Chips', name: 'Grain Waves' },

            // Coffee/Drinks/Tea
            { aisle: 'Coffee/Drinks/Tea', name: 'Coffee' },
            { aisle: 'Coffee/Drinks/Tea', name: 'Cordial' },
            { aisle: 'Coffee/Drinks/Tea', name: 'Milo' },
            { aisle: 'Coffee/Drinks/Tea', name: 'Orange Juice' },
            { aisle: 'Coffee/Drinks/Tea', name: 'Soft drink' },
            { aisle: 'Coffee/Drinks/Tea', name: 'Tea' },

            // Breakfast/Condiments
            { aisle: 'Breakfast/Condiments', name: 'BBQ sauce' },
            { aisle: 'Breakfast/Condiments', name: 'Cereal' },
            { aisle: 'Breakfast/Condiments', name: 'Honey' },
            { aisle: 'Breakfast/Condiments', name: 'Jam' },
            { aisle: 'Breakfast/Condiments', name: 'Maple syrup' },
            { aisle: 'Breakfast/Condiments', name: 'Marmite' },
            { aisle: 'Breakfast/Condiments', name: 'Nutella' },
            { aisle: 'Breakfast/Condiments', name: 'Oats' },
            { aisle: 'Breakfast/Condiments', name: 'Peanut Butter' },
            { aisle: 'Breakfast/Condiments', name: 'Promite' },
            { aisle: 'Breakfast/Condiments', name: 'Sweet chilli sauce' },
            { aisle: 'Breakfast/Condiments', name: 'Tomato sauce' },
            { aisle: 'Breakfast/Condiments', name: 'Up n Go 12pack' },
            { aisle: 'Breakfast/Condiments', name: 'Weetbix' },

            // Baking/Choc Sauce/Dried Fruits
            { aisle: 'Baking/Choc Sauce/Dried Fruits', name: 'Baking powder' },
            { aisle: 'Baking/Choc Sauce/Dried Fruits', name: 'Baking Soda' },
            { aisle: 'Baking/Choc Sauce/Dried Fruits', name: 'Chocolate sauce' },
            { aisle: 'Baking/Choc Sauce/Dried Fruits', name: 'Cocoa' },
            { aisle: 'Baking/Choc Sauce/Dried Fruits', name: 'Coconut cream' },
            { aisle: 'Baking/Choc Sauce/Dried Fruits', name: 'Condensed milk' },
            { aisle: 'Baking/Choc Sauce/Dried Fruits', name: 'Dried fruits' },
            { aisle: 'Baking/Choc Sauce/Dried Fruits', name: 'High grade flour' },
            { aisle: 'Baking/Choc Sauce/Dried Fruits', name: 'Oil canola' },
            { aisle: 'Baking/Choc Sauce/Dried Fruits', name: 'Oil olive' },
            { aisle: 'Baking/Choc Sauce/Dried Fruits', name: 'Raisins' },
            { aisle: 'Baking/Choc Sauce/Dried Fruits', name: 'Sugar' },
            { aisle: 'Baking/Choc Sauce/Dried Fruits', name: 'Vanilla extract' },

            // Bars/Chips/Pretzels/Popcorn
            { aisle: 'Bars/Chips/Pretzels/Popcorn', name: 'Bars (muesli etc)' },
            { aisle: 'Bars/Chips/Pretzels/Popcorn', name: 'Muesli Bars' },
            { aisle: 'Bars/Chips/Pretzels/Popcorn', name: 'Popcorn' },
            { aisle: 'Bars/Chips/Pretzels/Popcorn', name: 'Pretzels' },

            // Canned/Seasoning/Sauces
            { aisle: 'Canned/Seasoning/Sauces', name: 'Aioli' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Black beans can' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Capers' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Chickpeas can' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Chilli flakes' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Corn kernel can' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Fish sauce' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Garlic paste' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Ginger paste' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Kidney beans can' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Mayo' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Mustard' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Olives' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Oyster sauce' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Pepper' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Pickles' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Salt' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Sesame oil' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Simmer sauces' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Soy sauce' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Tomato cans' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Tomato paste' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Tuna can' },
            { aisle: 'Canned/Seasoning/Sauces', name: 'Vinegar' },

            // Pasta/Noodles/Stock/Sauces/Tacos/Rice
            { aisle: 'Pasta/Noodles/Stock/Sauces/Tacos/Rice', name: 'Chicken stock' },
            { aisle: 'Pasta/Noodles/Stock/Sauces/Tacos/Rice', name: 'Egg noodles' },
            { aisle: 'Pasta/Noodles/Stock/Sauces/Tacos/Rice', name: 'Lasagna pasta sheets' },
            { aisle: 'Pasta/Noodles/Stock/Sauces/Tacos/Rice', name: 'Noodles packet' },
            { aisle: 'Pasta/Noodles/Stock/Sauces/Tacos/Rice', name: 'Pasta sauce (marinara)' },
            { aisle: 'Pasta/Noodles/Stock/Sauces/Tacos/Rice', name: 'Pasta' },
            { aisle: 'Pasta/Noodles/Stock/Sauces/Tacos/Rice', name: 'Rice' },
            { aisle: 'Pasta/Noodles/Stock/Sauces/Tacos/Rice', name: 'Taco seasoning' },
            { aisle: 'Pasta/Noodles/Stock/Sauces/Tacos/Rice', name: 'Taco shells' },
            { aisle: 'Pasta/Noodles/Stock/Sauces/Tacos/Rice', name: 'Tortilla wraps' },
            { aisle: 'Pasta/Noodles/Stock/Sauces/Tacos/Rice', name: 'Vegetable stock' },

            // Paper Towels/Nappy Things/TP
            { aisle: 'Paper Towels/Nappy Things/TP', name: 'Nappies' },
            { aisle: 'Paper Towels/Nappy Things/TP', name: 'Paper towels' },
            { aisle: 'Paper Towels/Nappy Things/TP', name: 'Tissues' },
            { aisle: 'Paper Towels/Nappy Things/TP', name: 'Toilet paper' },
            { aisle: 'Paper Towels/Nappy Things/TP', name: 'Wipes' },

            // Biscuits/Crackers
            { aisle: 'Biscuits/Crackers', name: 'Biscuits' },
            { aisle: 'Biscuits/Crackers', name: 'Corn Thins' },
            { aisle: 'Biscuits/Crackers', name: 'Crackers' },
            { aisle: 'Biscuits/Crackers', name: 'Rice Crackers' },
            { aisle: 'Biscuits/Crackers', name: 'Shapes' },
            { aisle: 'Biscuits/Crackers', name: 'Vita Wheats' },

            // Cleaning/Washing products
            { aisle: 'Cleaning/Washing products', name: 'Dish washing liquid' },
            { aisle: 'Cleaning/Washing products', name: 'Dishwasher tablet' },
            { aisle: 'Cleaning/Washing products', name: 'Multi purpose spray' },
            { aisle: 'Cleaning/Washing products', name: 'Sponge' },
            { aisle: 'Cleaning/Washing products', name: 'Washing powder' },

            // Frozen
            { aisle: 'Frozen', name: 'Fish Fingers' },
            { aisle: 'Frozen', name: 'Frozen vege' },
            { aisle: 'Frozen', name: 'Hashbrowns' },
            { aisle: 'Frozen', name: 'Ice cream' },
            { aisle: 'Frozen', name: 'Ice' },
            { aisle: 'Frozen', name: 'Peas' },
            { aisle: 'Frozen', name: 'Pizza' },
            { aisle: 'Frozen', name: 'Wedges' },

            // Bread/Buns
            { aisle: 'Bread/Buns', name: 'Bagels' },
            { aisle: 'Bread/Buns', name: 'Bread' },
            { aisle: 'Bread/Buns', name: 'Burger buns' },
            { aisle: 'Bread/Buns', name: 'English muffins' },
            { aisle: 'Bread/Buns', name: 'Hot dog buns' },
            { aisle: 'Bread/Buns', name: 'Pita bread' },

            // Womens Products/Shampoo/Soap/Oral
            { aisle: 'Womens Products/Shampoo/Soap/Oral', name: 'Deodorant' },
            { aisle: 'Womens Products/Shampoo/Soap/Oral', name: 'Floss' },
            { aisle: 'Womens Products/Shampoo/Soap/Oral', name: 'Hand wash' },
            { aisle: 'Womens Products/Shampoo/Soap/Oral', name: 'Shampoo' },
            { aisle: 'Womens Products/Shampoo/Soap/Oral', name: 'Soap' },
            { aisle: 'Womens Products/Shampoo/Soap/Oral', name: 'Toothbrush' },
            { aisle: 'Womens Products/Shampoo/Soap/Oral', name: 'Toothpaste' }
        ];

        // Convert to structured format with IDs and timestamps
        return products.map((product, index) => ({
            id: `product-${Date.now()}-${index}`,
            name: product.name,
            aisle: product.aisle,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }));
    }

    getDefaultAisles() {
        return [
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
    }

    // Master Product List methods
    async addProduct(name, aisle) {
        const product = {
            id: `product-${Date.now()}`,
            name: name.trim(),
            aisle: aisle,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.masterProductList.push(product);
        await this.save('masterProductList', this.masterProductList);
    }

    async editProduct(id, name, aisle = null) {
        const index = this.masterProductList.findIndex(p => p.id === id);
        if (index !== -1) {
            this.masterProductList[index].name = name.trim();
            if (aisle) {
                this.masterProductList[index].aisle = aisle;
            }
            this.masterProductList[index].updatedAt = new Date().toISOString();
            await this.save('masterProductList', this.masterProductList);
        }
    }

    async deleteProduct(id) {
        this.masterProductList = this.masterProductList.filter(p => p.id !== id);
        await this.save('masterProductList', this.masterProductList);
    }

    getProductsByAisle(aisle) {
        return this.masterProductList
            .filter(p => p.aisle === aisle)
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    searchProducts(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return this.masterProductList;

        return this.masterProductList.filter(p =>
            p.name.toLowerCase().includes(term)
        );
    }

    getAllAisles() {
        // Get unique aisles from master product list
        const productAisles = [...new Set(this.masterProductList.map(p => p.aisle))];

        // Combine configured aisles with any aisles from products not in the list
        const allAisles = [...new Set([...this.aisles, ...productAisles])];

        // Sort according to configured order, putting unconfigured aisles at the end
        return allAisles.sort((a, b) => {
            const indexA = this.aisles.indexOf(a);
            const indexB = this.aisles.indexOf(b);

            // If both are in the configured list, sort by their order
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            // If only A is configured, it comes first
            if (indexA !== -1) return -1;
            // If only B is configured, it comes first
            if (indexB !== -1) return 1;
            // Otherwise, sort alphabetically
            return a.localeCompare(b);
        });
    }

    // Legacy method for compatibility - can be removed later
    getAllAislesOld() {
        const aisles = [...new Set(this.masterProductList.map(p => p.aisle))];
        // Sort aisles in the standard order
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
        return aisles.sort((a, b) => {
            const indexA = aisleOrder.indexOf(a);
            const indexB = aisleOrder.indexOf(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }

    // Aisle management methods
    async addAisle(aisleName) {
        const trimmed = aisleName.trim();
        if (!trimmed) return;
        if (this.aisles.includes(trimmed)) {
            throw new Error('Aisle already exists');
        }
        this.aisles.push(trimmed);
        await this.save('aisles', this.aisles);
    }

    async updateAisle(oldName, newName) {
        const trimmed = newName.trim();
        if (!trimmed) return;

        const index = this.aisles.indexOf(oldName);
        if (index === -1) {
            throw new Error('Aisle not found');
        }

        // Check if new name conflicts with existing aisle (unless it's the same)
        if (oldName !== trimmed && this.aisles.includes(trimmed)) {
            throw new Error('Aisle name already exists');
        }

        // Update aisle in the list
        this.aisles[index] = trimmed;

        // Update all products that use this aisle
        this.masterProductList.forEach(product => {
            if (product.aisle === oldName) {
                product.aisle = trimmed;
                product.updatedAt = new Date().toISOString();
            }
        });

        // Save both
        await this.save('aisles', this.aisles);
        await this.save('masterProductList', this.masterProductList);
    }

    async deleteAisle(aisleName) {
        const index = this.aisles.indexOf(aisleName);
        if (index === -1) return;

        // Check if any products use this aisle
        const productsUsingAisle = this.masterProductList.filter(p => p.aisle === aisleName);
        if (productsUsingAisle.length > 0) {
            throw new Error(`Cannot delete aisle: ${productsUsingAisle.length} products are using it`);
        }

        // Remove from list
        this.aisles.splice(index, 1);
        await this.save('aisles', this.aisles);
    }

    async reorderAisles(newOrder) {
        // newOrder should be an array of aisle names in the desired order
        this.aisles = newOrder;
        await this.save('aisles', this.aisles);
    }

    async moveAisle(aisleName, direction) {
        const index = this.aisles.indexOf(aisleName);
        if (index === -1) return;

        let newIndex = index;
        if (direction === 'up' && index > 0) {
            newIndex = index - 1;
        } else if (direction === 'down' && index < this.aisles.length - 1) {
            newIndex = index + 1;
        } else {
            return; // Can't move
        }

        // Swap
        [this.aisles[index], this.aisles[newIndex]] = [this.aisles[newIndex], this.aisles[index]];
        await this.save('aisles', this.aisles);
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
                    const text = ingredient.trim();
                    mealIngredients.push({
                        text: text,
                        category: this.guessCategory(ingredient),
                        checked: false,
                        source: 'meal'
                    });
                    // Track usage
                    this.trackItemUsage(text);
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
        console.log('📝 addManualItem called:', text, category);
        console.log('📝 Shopping list before:', this.shoppingList.length, 'items');

        const item = {
            text: text.trim(),
            category: category,
            checked: false,
            source: 'manual'
        };
        this.shoppingList.push(item);
        console.log('📝 Shopping list after push:', this.shoppingList.length, 'items');

        this.shoppingList = this.deduplicateItems(this.shoppingList);
        console.log('📝 Shopping list after dedup:', this.shoppingList.length, 'items');

        // Track usage
        this.trackItemUsage(text.trim());

        await this.save('shoppingList', this.shoppingList);
        console.log('📝 Shopping list saved');
    }

    // Check if an item is already in the shopping list
    isItemInShoppingList(itemName) {
        const normalizedName = itemName.toLowerCase().trim();
        return this.shoppingList.some(item =>
            item.text.toLowerCase().trim() === normalizedName
        );
    }

    // Usage tracking methods
    trackItemUsage(itemText) {
        const key = itemText.toLowerCase().trim();
        this.itemUsageCount[key] = (this.itemUsageCount[key] || 0) + 1;
        this.save('itemUsageCount', this.itemUsageCount);
    }

    getFrequentlyUsedItems(limit = 20) {
        // Convert object to array and sort by count
        const items = Object.entries(this.itemUsageCount)
            .map(([text, count]) => ({
                text: text,
                count: count,
                category: this.guessCategory(text)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);

        return items;
    }

    getAllKnownItems() {
        // Get all unique items from various sources
        const items = new Set();

        // From meals
        this.meals.forEach(meal => {
            meal.ingredients.forEach(ing => {
                items.add(ing.trim().toLowerCase());
            });
        });

        // From usage history
        Object.keys(this.itemUsageCount).forEach(item => {
            items.add(item);
        });

        // From quick-add groups
        this.categories.forEach(cat => {
            cat.items.forEach(item => {
                items.add(item.trim().toLowerCase());
            });
        });

        // Convert to array with metadata
        return Array.from(items).map(text => ({
            text: text,
            count: this.itemUsageCount[text] || 0,
            category: this.guessCategory(text)
        })).sort((a, b) => a.text.localeCompare(b.text));
    }

    // Get meals that use a specific product/ingredient
    getMealsUsingProduct(productName) {
        const searchTerm = productName.toLowerCase().trim();
        return this.meals.filter(meal => {
            return meal.ingredients.some(ing => {
                const ingredient = ing.toLowerCase().trim();

                // More strict matching:
                // "Corn" should NOT match "Corn Chips", "Corn Tin", "Sour Cream"
                // "Corn" SHOULD match "corn", "2 corn", "corn cobs"

                // Strategy: Check if product name appears at start (after numbers/amounts)
                // or as the complete ingredient (possibly with quantities)

                // Remove common quantity patterns (1, 2, 1/2, 250g, etc)
                const cleanIngredient = ingredient
                    .replace(/^[\d\/\.\s]+/g, '') // Remove leading numbers/fractions
                    .replace(/^\d+\s*(g|kg|ml|l|cup|cups|tbsp|tsp|can|tin|packet)s?\s+/gi, '') // Remove measurements
                    .trim();

                // Escape special regex characters in search term
                const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                // Check if the product name is at the start of the cleaned ingredient
                // This means "corn" matches "corn" or "corn cobs" but not "sweet corn" or "corn chips"
                const startsWithPattern = new RegExp(`^${escapedTerm}(\\s|$)`, 'i');

                // Also check if it's an exact match (after cleaning)
                const isExactMatch = cleanIngredient === searchTerm;

                return isExactMatch || startsWithPattern.test(cleanIngredient);
            });
        });
    }

    // Reset usage statistics
    async resetUsageStatistics() {
        this.itemUsageCount = {};
        await this.save('itemUsageCount', this.itemUsageCount);
    }

    // Ingredient consolidation methods
    cleanIngredientName(ingredient) {
        // Remove quantities and measurements from ingredient string
        return ingredient.toLowerCase().trim()
            .replace(/^[\d\/\.\s]+/g, '') // Remove leading numbers/fractions
            .replace(/^\d+\s*(g|kg|ml|l|cup|cups|tbsp|tsp|can|tin|packet|cans|tins|packets)s?\s+/gi, '') // Remove measurements
            .trim();
    }

    // Levenshtein distance for fuzzy matching
    levenshteinDistance(str1, str2) {
        const m = str1.length;
        const n = str2.length;
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = 1 + Math.min(
                        dp[i - 1][j],     // deletion
                        dp[i][j - 1],     // insertion
                        dp[i - 1][j - 1]  // substitution
                    );
                }
            }
        }

        return dp[m][n];
    }

    // Calculate similarity score (0-1, higher is more similar)
    similarityScore(str1, str2) {
        const maxLen = Math.max(str1.length, str2.length);
        if (maxLen === 0) return 1.0;
        const distance = this.levenshteinDistance(str1, str2);
        return 1.0 - (distance / maxLen);
    }

    // Find ingredient mismatches and suggest matches
    findIngredientMismatches() {
        // Get all unique ingredient names from meals
        const ingredientSet = new Set();
        this.meals.forEach(meal => {
            meal.ingredients.forEach(ing => {
                const cleaned = this.cleanIngredientName(ing);
                if (cleaned) {
                    ingredientSet.add(cleaned);
                }
            });
        });

        // Get all product names from master list (lowercased)
        const masterProductNames = this.masterProductList.map(p => p.name.toLowerCase());
        const masterProductSet = new Set(masterProductNames);

        // Find ingredients that don't match any master product
        const mismatches = [];

        ingredientSet.forEach(ingredient => {
            // Check if ingredient exists in master list (exact match)
            if (!masterProductSet.has(ingredient)) {
                // Find best matches using fuzzy matching
                const matches = masterProductNames
                    .map(productName => ({
                        productName: productName,
                        score: this.similarityScore(ingredient, productName)
                    }))
                    .filter(m => m.score > 0.5) // Only suggest if similarity > 50%
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 3); // Top 3 matches

                // Count how many meals use this ingredient and get their names
                const mealsUsing = this.meals.filter(meal =>
                    meal.ingredients.some(ing => this.cleanIngredientName(ing) === ingredient)
                );

                if (matches.length > 0) {
                    mismatches.push({
                        ingredient: ingredient,
                        mealsCount: mealsUsing.length,
                        mealNames: mealsUsing.map(m => m.name),
                        suggestedMatches: matches
                    });
                }
            }
        });

        // Sort by number of meals using the ingredient (descending)
        return mismatches.sort((a, b) => b.mealsCount - a.mealsCount);
    }

    // Apply ingredient consolidation (rename ingredients in meals)
    async consolidateIngredients(changes) {
        // changes is an array of {from: 'old name', to: 'new name'}
        let updatedCount = 0;

        this.meals.forEach(meal => {
            let modified = false;
            meal.ingredients = meal.ingredients.map(ing => {
                const cleaned = this.cleanIngredientName(ing);

                // Check if this ingredient should be changed
                const change = changes.find(c => c.from === cleaned);
                if (change) {
                    // Replace the cleaned part with the new name, preserving quantities
                    const quantityMatch = ing.match(/^([\d\/\.\s]+[\d]+\s*(?:g|kg|ml|l|cup|cups|tbsp|tsp|can|tin|packet|cans|tins|packets)?s?\s+)/i);
                    const newIng = quantityMatch ? quantityMatch[1] + change.to : change.to;
                    modified = true;
                    updatedCount++;
                    return newIng;
                }
                return ing;
            });

            if (modified) {
                // No need to await individual saves, we'll save all meals at once
            }
        });

        // Save all meals at once
        await this.save('meals', this.meals);

        return updatedCount;
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

    async uncheckAllItems() {
        this.shoppingList.forEach(item => {
            item.checked = false;
        });
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
        this.editingProductId = null;
        this.isReady = false;
        this.collapsedCategories = new Set(); // Track which shopping categories are collapsed
        this.collapsedAisles = new Set(); // Track which master product list aisles are collapsed - start all collapsed
        this.productSearchTerm = ''; // Track search term for master product list
        this.productSearchHadFocus = false; // Track if product search box has/had focus
        this.userHasInteractedWithAisles = false; // Track if user has manually collapsed/expanded aisles
        this.productSortMode = 'alphabetical'; // Track sort mode for products: 'alphabetical' or 'frequency'
        this.undoStack = []; // Track actions for undo functionality
        this.maxUndoStack = 10; // Keep last 10 actions
        this.selectedIngredients = new Map(); // Track selected ingredients for meal creation: productName -> quantity
        this.ingredientSearchTerm = ''; // Track search term for ingredient selection
        this.selectedCategoryProducts = new Set(); // Track selected products for category creation
        this.categoryProductSearchTerm = ''; // Track search term for category product selection
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

        // Initialize dark mode
        this.initDarkMode();

        this.initEventListeners();
        this.updateAllAisleDropdowns(); // Populate dropdowns with configured aisles
        this.render();
        this.isReady = true;

        // Add logout button
        this.addLogoutButton();
    }

    initDarkMode() {
        // Check if dark mode preference is saved
        const isDarkMode = localStorage.getItem('darkMode') === 'true';

        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            this.updateDarkModeIcon(true);
        }

        // Add event listeners to all toggle buttons (one in each view header)
        document.querySelectorAll('.dark-mode-toggle').forEach(btn => {
            btn.addEventListener('click', () => this.toggleDarkMode());
        });
    }

    toggleDarkMode() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        this.updateDarkModeIcon(isDarkMode);
    }

    updateDarkModeIcon(isDarkMode) {
        // Update all toggle icons (one in each view header)
        document.querySelectorAll('.toggle-icon').forEach(icon => {
            icon.textContent = isDarkMode ? '☀️' : '🌙';
        });
    }

    getRecentProducts(limit = 15) {
        // Get products sorted by usage count, return top N
        const productsWithCount = this.store.masterProductList
            .map(product => ({
                ...product,
                count: this.store.itemUsageCount[product.name.toLowerCase()] || 0
            }))
            .filter(p => p.count > 0) // Only products that have been used
            .sort((a, b) => b.count - a.count) // Sort by count descending
            .slice(0, limit);

        return productsWithCount;
    }

    // Undo system
    pushUndoAction(action) {
        this.undoStack.push(action);
        // Keep only last N actions
        if (this.undoStack.length > this.maxUndoStack) {
            this.undoStack.shift();
        }
        this.updateUndoButton();
    }

    async undo() {
        if (this.undoStack.length === 0) return;

        const action = this.undoStack.pop();

        try {
            switch (action.type) {
                case 'DELETE_MEAL':
                    // Restore deleted meal
                    this.store.meals.push(action.data);
                    await this.store.save('meals', this.store.meals);
                    this.renderMealsList();
                    break;

                case 'DELETE_PRODUCT':
                    // Restore deleted product
                    this.store.masterProductList.push(action.data);
                    await this.store.save('masterProductList', this.store.masterProductList);
                    this.renderCategories();
                    break;

                case 'CLEAR_CHECKED':
                    // Restore cleared items
                    this.store.shoppingList.push(...action.data);
                    await this.store.save('shoppingList', this.store.shoppingList);
                    this.renderShoppingList();
                    this.renderCategories(); // Update to show items are back in list
                    break;

                case 'CLEAR_ALL':
                    // Restore all items
                    this.store.shoppingList = action.data;
                    await this.store.save('shoppingList', this.store.shoppingList);
                    this.renderShoppingList();
                    this.renderCategories(); // Update to show items are back in list
                    break;
            }
        } catch (error) {
            console.error('Undo failed:', error);
            alert('Failed to undo action');
        }

        this.updateUndoButton();
    }

    updateUndoButton() {
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.disabled = this.undoStack.length === 0;
        }
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
        // Undo button
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undo());
        }

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

        // Ingredient selection search
        document.getElementById('ingredient-search-input').addEventListener('input', (e) => {
            this.ingredientSearchTerm = e.target.value;
            this.renderIngredientSelection();
        });

        // Quick-add product
        document.getElementById('quick-add-product-btn').addEventListener('click', () => this.quickAddProduct());
        document.getElementById('quick-add-product-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.quickAddProduct();
        });

        // Category modal
        document.getElementById('manage-categories-btn').addEventListener('click', () => this.openCategoryModal());
        document.getElementById('close-category-modal').addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('cancel-category-btn').addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('save-category-btn').addEventListener('click', () => this.saveCategory());
        document.getElementById('delete-category-btn').addEventListener('click', () => this.deleteCategory());

        // Category product selection search
        document.getElementById('category-product-search-input').addEventListener('input', (e) => {
            this.categoryProductSearchTerm = e.target.value;
            this.renderCategoryProductSelection();
        });

        // Product modal
        document.getElementById('add-product-btn').addEventListener('click', () => this.openProductModal());
        document.getElementById('close-product-modal').addEventListener('click', () => this.closeProductModal());
        document.getElementById('cancel-product-btn').addEventListener('click', () => this.closeProductModal());
        document.getElementById('save-product-btn').addEventListener('click', () => this.saveProduct());

        // Edit Product modal
        document.getElementById('close-edit-product-modal').addEventListener('click', () => this.closeEditProductModal());
        document.getElementById('cancel-edit-product-btn').addEventListener('click', () => this.closeEditProductModal());
        document.getElementById('save-edit-product-btn').addEventListener('click', () => this.saveEditProduct());

        // Meal search
        document.getElementById('meal-search').addEventListener('input', (e) => {
            this.renderMealsList(e.target.value);
        });

        // Shopping list actions
        document.getElementById('add-manual-btn').addEventListener('click', () => this.addManualItem());
        document.getElementById('manual-item-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addManualItem();
        });
        document.getElementById('uncheck-all-btn').addEventListener('click', () => this.uncheckAllItems());
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

        // Reset statistics
        document.getElementById('reset-stats-btn').addEventListener('click', () => this.resetStatistics());

        // Ingredient consolidation
        document.getElementById('consolidate-ingredients-btn').addEventListener('click', () => this.openConsolidateModal());
        document.getElementById('close-consolidate-modal').addEventListener('click', () => this.closeConsolidateModal());
        document.getElementById('close-consolidate-btn').addEventListener('click', () => this.closeConsolidateModal());
        document.getElementById('close-consolidate-empty-btn').addEventListener('click', () => this.closeConsolidateModal());
        document.getElementById('apply-consolidation-btn').addEventListener('click', () => this.applyConsolidation());

        // Bulk mode toggle
        document.getElementById('toggle-bulk-mode-btn').addEventListener('click', () => this.toggleBulkMode());
        document.getElementById('cancel-bulk-mode-btn').addEventListener('click', () => this.toggleBulkMode());
        document.getElementById('save-bulk-ingredients-btn').addEventListener('click', () => this.saveBulkIngredients());

        // Export/Import ingredients
        document.getElementById('export-ingredients-btn').addEventListener('click', () => this.exportIngredients());
        document.getElementById('import-ingredients-btn').addEventListener('click', () => {
            document.getElementById('import-ingredients-file').click();
        });
        document.getElementById('import-ingredients-file').addEventListener('change', (e) => this.importIngredients(e));

        // Export/Import master products
        document.getElementById('export-master-products-btn').addEventListener('click', () => this.exportMasterProducts());
        document.getElementById('import-master-products-btn').addEventListener('click', () => {
            document.getElementById('import-master-products-file').click();
        });
        document.getElementById('import-master-products-file').addEventListener('change', (e) => this.importMasterProducts(e));

        // Manage aisles
        document.getElementById('manage-aisles-btn').addEventListener('click', () => this.openAislesModal());
        document.getElementById('close-aisles-modal').addEventListener('click', () => this.closeAislesModal());
        document.getElementById('close-aisles-btn').addEventListener('click', () => this.closeAislesModal());
        document.getElementById('add-aisle-btn').addEventListener('click', () => this.addAisle());
        document.getElementById('new-aisle-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addAisle();
        });
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
                this.populateAutocomplete();
                break;
            case 'categories':
                this.renderCategories();
                break;
            case 'database':
                this.renderDatabase();
                break;
        }
    }

    populateAutocomplete() {
        const datalist = document.getElementById('known-items-list');
        if (!datalist) return;

        const allItems = this.store.getAllKnownItems();
        // Show top 100 most frequent items in autocomplete
        const topItems = allItems
            .sort((a, b) => b.count - a.count)
            .slice(0, 100);

        datalist.innerHTML = topItems.map(item => `
            <option value="${item.text}"></option>
        `).join('');
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
                this.renderCategories(); // Update to show which items are now in list
            });
        });
    }

    renderShoppingList() {
        console.log('🛒 renderShoppingList called, items:', this.store.shoppingList.length);
        const container = document.getElementById('shopping-list');

        if (this.store.shoppingList.length === 0) {
            console.log('🛒 Shopping list is empty, showing empty state');
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
                this.renderCategories(); // Update to show item is no longer in list
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

        let html = '';

        // Quick-Add Groups Section
        if (this.store.categories.length > 0) {
            html += '<div class="section-header">📦 Quick-Add Groups</div>';
            html += '<div class="categories-grid">';
            html += this.store.categories.map(category => `
            <div class="category-card">
                <div class="category-card-main" data-id="${category.id}">
                    <div class="category-icon">${category.icon}</div>
                    <div class="category-info">
                        <div class="category-name">${category.name}</div>
                        <div class="category-count">${category.items.length} items</div>
                    </div>
                </div>
                <div class="category-actions">
                    <button class="icon-btn edit-category-btn" data-id="${category.id}" title="Edit">✏️</button>
                    <button class="icon-btn delete-category-btn" data-id="${category.id}" title="Delete">🗑️</button>
                </div>
            </div>
        `).join('');
            html += '</div>'; // Close categories-grid
        } else {
            html += `
                <div class="empty-state">
                    <div class="empty-state-icon">⚡</div>
                    <div class="empty-state-text">No quick-add groups yet. Click "+ Add Group" to create one!</div>
                </div>
            `;
        }

        // Frequently Used Section
        const frequentItems = this.store.getFrequentlyUsedItems(18);
        if (frequentItems.length > 0) {
            html += '<div class="section-header" style="margin-top: 24px;">⭐ Frequently Used</div>';
            html += '<div class="frequent-items-grid">';
            html += frequentItems.map(item => `
                <div class="frequent-item" data-text="${item.text}" data-category="${item.category}">
                    <span class="frequent-item-text">${item.text}</span>
                    <span class="frequent-item-count">×${item.count}</span>
                </div>
            `).join('');
            html += '</div>';
        }

        // Recently Used Products Section
        const recentProducts = this.getRecentProducts(15);
        if (recentProducts.length > 0) {
            html += '<div class="section-header" style="margin-top: 24px;">⏱️ Recently Used</div>';
            html += '<div class="recent-products-list">';
            html += recentProducts.map(product => `
                <button class="recent-product-item" data-id="${product.id}" data-name="${product.name}" data-aisle="${product.aisle}">
                    <span class="recent-product-name">${product.name}</span>
                    <span class="recent-product-count">×${product.count}</span>
                </button>
            `).join('');
            html += '</div>';
        }

        // All Products Section
        html += '<div class="section-header" style="margin-top: 24px;">🛍️ All Products</div>';
        html += '<div style="display: flex; gap: 10px; margin-bottom: 16px;">';
        html += '<div class="search-box" style="flex: 1; margin: 0;">';
        html += `<input type="text" id="product-search" placeholder="Search products..." value="${this.productSearchTerm}">`;
        html += '</div>';
        html += '<select id="product-sort-mode" style="padding: 8px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;">';
        html += `<option value="alphabetical" ${this.productSortMode === 'alphabetical' ? 'selected' : ''}>Sort A-Z</option>`;
        html += `<option value="frequency" ${this.productSortMode === 'frequency' ? 'selected' : ''}>Sort by Usage</option>`;
        html += '</select>';
        html += '<button class="btn-secondary" id="collapse-all-aisles-btn" style="white-space: nowrap;">Collapse All</button>';
        html += '<button class="btn-secondary" id="expand-all-aisles-btn" style="white-space: nowrap;">Expand All</button>';
        html += '</div>';

        // Get filtered products
        const filteredProducts = this.productSearchTerm
            ? this.store.searchProducts(this.productSearchTerm)
            : this.store.masterProductList;

        // Group by aisle
        const aisles = this.store.getAllAisles();
        const productsByAisle = {};
        aisles.forEach(aisle => {
            let products = filteredProducts.filter(p => p.aisle === aisle);

            // Sort products within each aisle
            if (this.productSortMode === 'frequency') {
                // Sort by usage count (descending), then alphabetically
                products.sort((a, b) => {
                    const countA = this.store.itemUsageCount[a.name.toLowerCase()] || 0;
                    const countB = this.store.itemUsageCount[b.name.toLowerCase()] || 0;
                    if (countB !== countA) {
                        return countB - countA; // Higher count first
                    }
                    return a.name.localeCompare(b.name); // Alphabetical tie-breaker
                });
            } else {
                // Sort alphabetically (default)
                products.sort((a, b) => a.name.localeCompare(b.name));
            }

            productsByAisle[aisle] = products;
        });

        // Initialize all aisles as collapsed on first render (if user hasn't interacted and not searching)
        if (this.collapsedAisles.size === 0 && !this.productSearchTerm && !this.userHasInteractedWithAisles) {
            aisles.forEach(aisle => {
                this.collapsedAisles.add(aisle);
            });
        }

        // Render collapsible aisles
        html += '<div class="master-products-list">';
        aisles.forEach(aisle => {
            const products = productsByAisle[aisle];
            if (products.length === 0) return;

            const isCollapsed = this.collapsedAisles.has(aisle);
            html += `
                <div class="master-aisle ${isCollapsed ? 'collapsed' : ''}">
                    <div class="master-aisle-header" data-aisle="${aisle}">
                        <span class="aisle-toggle">${isCollapsed ? '▶' : '▼'}</span>
                        <span class="aisle-name">${aisle}</span>
                        <span class="aisle-count">${products.length} items</span>
                    </div>
                    <div class="master-aisle-items">
                        ${products.map(product => {
                            const usageCount = this.store.itemUsageCount[product.name.toLowerCase()] || 0;
                            const showUsage = this.productSortMode === 'frequency' && usageCount > 0;
                            const mealsUsing = this.store.getMealsUsingProduct(product.name);
                            const mealCount = mealsUsing.length;
                            const isInShoppingList = this.store.isItemInShoppingList(product.name);
                            return `
                                <div class="master-product-item ${isInShoppingList ? 'in-shopping-list' : ''}" data-id="${product.id}">
                                    <div style="display: flex; flex-direction: column; flex: 1; min-width: 0;">
                                        <span class="master-product-name">
                                            ${product.name}
                                            ${showUsage ? `<span style="color: #999; font-size: 12px; margin-left: 8px;">×${usageCount}</span>` : ''}
                                            ${isInShoppingList ? `<span class="in-list-badge">✓ In List</span>` : ''}
                                        </span>
                                        ${mealCount > 0 ? `
                                            <span style="color: #666; font-size: 11px; margin-top: 2px;" title="${mealsUsing.map(m => m.name).join(', ')}">
                                                Used in ${mealCount} meal${mealCount > 1 ? 's' : ''}: ${mealsUsing.slice(0, 3).map(m => m.name).join(', ')}${mealCount > 3 ? '...' : ''}
                                            </span>
                                        ` : ''}
                                    </div>
                                    <div class="master-product-actions">
                                        <button class="icon-btn add-product-btn" data-id="${product.id}" data-name="${product.name}" data-aisle="${product.aisle}" title="Add to shopping list">➕</button>
                                        <button class="icon-btn edit-product-btn" data-id="${product.id}" data-name="${product.name}" data-aisle="${product.aisle}" title="Edit">✏️</button>
                                        <button class="icon-btn delete-product-btn" data-id="${product.id}" data-name="${product.name}" title="Delete">🗑️</button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;

        // Add click listeners for adding items to shopping list from groups
        container.querySelectorAll('.category-card-main').forEach(card => {
            card.addEventListener('click', async () => {
                const id = card.dataset.id;
                await this.store.addCategoryItems(id);
                this.renderShoppingList();
                this.renderCategories(); // Update to show items are now in list
                // Show feedback
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 200);
            });
        });

        // Add edit listeners
        container.querySelectorAll('.edit-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                this.openCategoryModal(id);
            });
        });

        // Add delete listeners
        container.querySelectorAll('.delete-category-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const category = this.store.categories.find(c => c.id === id);
                if (confirm(`Delete "${category.name}"? This cannot be undone.`)) {
                    await this.store.deleteCategory(id);
                    this.renderCategories();
                }
            });
        });

        // Add click listeners for frequent items
        container.querySelectorAll('.frequent-item').forEach(item => {
            item.addEventListener('click', async () => {
                const text = item.dataset.text;
                const category = item.dataset.category;
                await this.store.addManualItem(text, category);
                this.renderShoppingList();
                this.renderCategories(); // Update to show item is now in list
                // Show feedback
                item.style.transform = 'scale(0.95)';
                item.style.opacity = '0.7';
                setTimeout(() => {
                    item.style.transform = '';
                    item.style.opacity = '';
                }, 200);
            });
        });

        // Product sort mode listener
        const productSortMode = document.getElementById('product-sort-mode');
        if (productSortMode) {
            productSortMode.addEventListener('change', (e) => {
                this.productSortMode = e.target.value;
                this.renderCategories();
            });
        }

        // Product search listener
        const productSearch = document.getElementById('product-search');
        if (productSearch) {
            // Focus the search box if it had focus before re-render
            if (this.productSearchHadFocus) {
                productSearch.focus();
                // Set cursor to end of text
                const length = productSearch.value.length;
                productSearch.setSelectionRange(length, length);
                this.productSearchHadFocus = false;
            }

            productSearch.addEventListener('input', (e) => {
                this.productSearchTerm = e.target.value;
                this.productSearchHadFocus = true; // Track that search box has focus

                // Auto-expand aisles with matching products when searching
                if (this.productSearchTerm.trim()) {
                    const filteredProducts = this.store.searchProducts(this.productSearchTerm);
                    const aislesWithMatches = new Set(filteredProducts.map(p => p.aisle));
                    const allAisles = this.store.getAllAisles();

                    // Collapse aisles without matches, expand aisles with matches
                    this.collapsedAisles.clear();
                    allAisles.forEach(aisle => {
                        if (!aislesWithMatches.has(aisle)) {
                            this.collapsedAisles.add(aisle);
                        }
                    });
                } else {
                    // If search is cleared, restore default collapsed state (all collapsed)
                    const allAisles = this.store.getAllAisles();
                    this.collapsedAisles.clear();
                    allAisles.forEach(aisle => this.collapsedAisles.add(aisle));
                }

                this.renderCategories();
            });

            productSearch.addEventListener('focus', () => {
                this.productSearchHadFocus = true;
            });

            productSearch.addEventListener('blur', () => {
                this.productSearchHadFocus = false;
            });
        }

        // Collapse/Expand All buttons
        const collapseAllBtn = document.getElementById('collapse-all-aisles-btn');
        const expandAllBtn = document.getElementById('expand-all-aisles-btn');

        if (collapseAllBtn) {
            collapseAllBtn.addEventListener('click', () => {
                this.userHasInteractedWithAisles = true; // Mark that user has interacted
                const aisles = this.store.getAllAisles();
                aisles.forEach(aisle => this.collapsedAisles.add(aisle));
                this.renderCategories();
            });
        }

        if (expandAllBtn) {
            expandAllBtn.addEventListener('click', () => {
                this.userHasInteractedWithAisles = true; // Mark that user has interacted
                this.collapsedAisles.clear();
                this.renderCategories();
            });
        }

        // Aisle collapse/expand listeners
        container.querySelectorAll('.master-aisle-header').forEach(header => {
            header.addEventListener('click', () => {
                this.userHasInteractedWithAisles = true; // Mark that user has interacted
                const aisle = header.dataset.aisle;
                if (this.collapsedAisles.has(aisle)) {
                    this.collapsedAisles.delete(aisle);
                } else {
                    this.collapsedAisles.add(aisle);
                }
                this.renderCategories();
            });
        });

        // Recent products - click to add
        container.querySelectorAll('.recent-product-item').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const name = btn.dataset.name;
                const aisle = btn.dataset.aisle;
                await this.store.addManualItem(name, aisle);
                this.renderShoppingList();
                this.renderCategories(); // Update to show item is now in list
                // Show feedback
                btn.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 200);
            });
        });

        // Add product to shopping list
        container.querySelectorAll('.add-product-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const name = btn.dataset.name;
                const aisle = btn.dataset.aisle;
                await this.store.addManualItem(name, aisle);
                this.renderShoppingList();
                this.renderCategories(); // Update to show item is now in list
                // Show feedback
                btn.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 200);
            });
        });

        // Edit product name
        container.querySelectorAll('.edit-product-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const currentName = btn.dataset.name;
                const currentAisle = btn.dataset.aisle;
                this.openEditProductModal(id, currentName, currentAisle);
            });
        });

        // Delete product
        container.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const name = btn.dataset.name;
                if (confirm(`Delete "${name}" from master product list?`)) {
                    // Save for undo
                    const product = this.store.masterProductList.find(p => p.id === id);
                    if (product) {
                        this.pushUndoAction({
                            type: 'DELETE_PRODUCT',
                            data: { ...product }
                        });
                    }
                    await this.store.deleteProduct(id);
                    this.renderCategories();
                }
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
            <div class="database-item" draggable="true" data-id="${meal.id}" data-index="${index}" style="display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px;">
                <div class="drag-handle" style="margin-right: 0;">⋮⋮</div>
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
                    // Save for undo
                    const meal = this.store.meals.find(m => m.id === id);
                    if (meal) {
                        this.pushUndoAction({
                            type: 'DELETE_MEAL',
                            data: { ...meal }
                        });
                    }
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
        this.selectedIngredients = new Map();
        this.ingredientSearchTerm = '';

        const modal = document.getElementById('meal-modal');
        const title = document.getElementById('modal-title');
        const nameInput = document.getElementById('meal-name-input');
        const searchInput = document.getElementById('ingredient-search-input');
        const quickAddProduct = document.getElementById('quick-add-product-input');
        const quickAddQuantity = document.getElementById('quick-add-quantity-input');

        if (mealId) {
            const meal = this.store.meals.find(m => m.id === mealId);
            title.textContent = 'Edit Meal';
            nameInput.value = meal.name;

            // Parse existing ingredients into selectedIngredients map
            meal.ingredients.forEach(ing => {
                const cleaned = this.store.cleanIngredientName(ing);
                // Try to extract quantity from original ingredient string
                const quantityMatch = ing.match(/^([\d\/\.\s]+[\d]+\s*(?:g|kg|ml|l|cup|cups|tbsp|tsp|can|tin|packet|cans|tins|packets)?s?\s+)/i);
                const quantity = quantityMatch ? quantityMatch[1].trim() : '';

                // Find matching product in master list (case-insensitive)
                const masterProduct = this.store.masterProductList.find(
                    p => p.name.toLowerCase() === cleaned
                );

                if (masterProduct) {
                    this.selectedIngredients.set(masterProduct.name, quantity);
                } else {
                    // Product not in master list, use cleaned name
                    this.selectedIngredients.set(cleaned, quantity);
                }
            });
        } else {
            title.textContent = 'Add Meal';
            nameInput.value = '';
        }

        searchInput.value = '';
        quickAddProduct.value = '';
        quickAddQuantity.value = '';

        this.renderIngredientSelection();
        this.renderSelectedIngredients();

        modal.classList.add('active');
        nameInput.focus();
    }

    closeMealModal() {
        document.getElementById('meal-modal').classList.remove('active');
        this.editingMealId = null;
        this.selectedIngredients = new Map();
        this.ingredientSearchTerm = '';
    }

    async saveMeal() {
        const name = document.getElementById('meal-name-input').value.trim();

        if (!name) {
            alert('Please enter a meal name');
            return;
        }

        if (this.selectedIngredients.size === 0) {
            alert('Please select at least one ingredient');
            return;
        }

        // Build ingredients array from selectedIngredients map
        const ingredients = [];
        this.selectedIngredients.forEach((quantity, productName) => {
            if (quantity && quantity.trim()) {
                ingredients.push(`${quantity} ${productName}`);
            } else {
                ingredients.push(productName);
            }
        });

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
        const deleteBtn = document.getElementById('delete-category-btn');

        // Reset selection state
        this.selectedCategoryProducts.clear();
        this.categoryProductSearchTerm = '';
        document.getElementById('category-product-search-input').value = '';

        if (categoryId) {
            const category = this.store.categories.find(c => c.id === categoryId);
            title.textContent = 'Edit Quick-Add Group';
            nameInput.value = category.name;

            // Pre-select products that are in this category
            category.items.forEach(item => {
                this.selectedCategoryProducts.add(item);
            });

            deleteBtn.style.display = 'block';
        } else {
            title.textContent = 'Add Quick-Add Group';
            nameInput.value = '';
            deleteBtn.style.display = 'none';
        }

        modal.classList.add('active');
        this.renderCategoryProductSelection();
        this.updateCategorySelectedProductsList();
        nameInput.focus();
    }

    closeCategoryModal() {
        document.getElementById('category-modal').classList.remove('active');
        this.editingCategoryId = null;
        this.selectedCategoryProducts.clear();
        this.categoryProductSearchTerm = '';
    }

    renderCategoryProductSelection() {
        const container = document.getElementById('category-product-selection-area');
        const searchTerm = this.categoryProductSearchTerm.toLowerCase();

        // Get all aisles and products
        const aisles = this.store.getAllAisles();

        let html = '';

        aisles.forEach((aisle, aisleIndex) => {
            const products = this.store.getProductsByAisle(aisle);

            // Filter products by search term
            const filteredProducts = searchTerm
                ? products.filter(p => p.name.toLowerCase().includes(searchTerm))
                : products;

            if (filteredProducts.length === 0) return; // Skip empty aisles

            // When searching, expand all; otherwise start collapsed
            const isExpanded = searchTerm !== '';
            const aisleId = `category-aisle-${aisleIndex}`;

            html += `
                <div class="category-product-aisle-group" style="margin-bottom: 8px; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: white;">
                    <div class="aisle-header" data-aisle-id="${aisleId}" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--surface); cursor: pointer; user-select: none; border-bottom: 1px solid var(--border);">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="aisle-toggle" style="font-size: 12px; transition: transform 0.2s;">${isExpanded ? '▼' : '▶'}</span>
                            <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">${aisle}</span>
                            <span style="font-size: 12px; color: var(--text-secondary);">(${filteredProducts.length})</span>
                        </div>
                    </div>
                    <div class="category-product-list" id="${aisleId}" style="display: ${isExpanded ? 'block' : 'none'}; padding: 8px;">
                        ${filteredProducts.map(product => {
                            const isSelected = this.selectedCategoryProducts.has(product.name);

                            return `
                                <div class="category-product-item" style="display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 10px; padding: 8px; border-radius: 4px; ${isSelected ? 'background: #e0f2fe;' : ''} margin-bottom: 2px;">
                                    <input
                                        type="checkbox"
                                        class="category-product-checkbox"
                                        data-product="${product.name}"
                                        ${isSelected ? 'checked' : ''}
                                        style="cursor: pointer; margin: 0; width: 16px; height: 16px;"
                                    />
                                    <label style="cursor: pointer; font-size: 14px; margin: 0;" data-product="${product.name}">
                                        ${product.name}
                                    </label>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        });

        if (!html) {
            html = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No products found</p>';
        }

        container.innerHTML = html;

        // Attach toggle listeners for aisle headers
        container.querySelectorAll('.aisle-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const aisleId = e.currentTarget.dataset.aisleId;
                const productList = document.getElementById(aisleId);
                const toggle = e.currentTarget.querySelector('.aisle-toggle');

                if (productList.style.display === 'none') {
                    productList.style.display = 'block';
                    toggle.textContent = '▼';
                } else {
                    productList.style.display = 'none';
                    toggle.textContent = '▶';
                }
            });
        });

        // Attach event listeners for checkboxes
        container.querySelectorAll('.category-product-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const productName = e.target.dataset.product;
                if (e.target.checked) {
                    this.selectedCategoryProducts.add(productName);
                } else {
                    this.selectedCategoryProducts.delete(productName);
                }
                this.updateCategorySelectedProductsList();
                this.renderCategoryProductSelection(); // Re-render to update highlighting
            });
        });

        // Also allow clicking labels to toggle
        container.querySelectorAll('label[data-product]').forEach(label => {
            label.addEventListener('click', (e) => {
                const productName = e.target.dataset.product;
                const checkbox = container.querySelector(`input[data-product="${productName}"]`);
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            });
        });
    }

    updateCategorySelectedProductsList() {
        const container = document.getElementById('category-selected-products-list');
        const countSpan = document.getElementById('category-selected-count');
        const products = Array.from(this.selectedCategoryProducts).sort();

        countSpan.textContent = products.length;

        if (products.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px 0;">No products selected yet</p>';
            return;
        }

        container.innerHTML = products.map(productName => `
            <span style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; margin: 2px; font-size: 13px;">
                ${productName}
                <button onclick="app.removeCategoryProduct('${productName.replace(/'/g, "\\'")}'); event.stopPropagation();" style="border: none; background: none; color: #0369a1; cursor: pointer; margin-left: 4px; font-weight: bold;">×</button>
            </span>
        `).join('');
    }

    removeCategoryProduct(productName) {
        this.selectedCategoryProducts.delete(productName);
        this.updateCategorySelectedProductsList();
        this.renderCategoryProductSelection();
    }

    async saveCategory() {
        const name = document.getElementById('category-name-input').value.trim();
        const items = Array.from(this.selectedCategoryProducts);

        if (!name) {
            alert('Please enter a category name');
            return;
        }

        if (items.length === 0) {
            alert('Please select at least one product');
            return;
        }

        const category = {
            name,
            items,
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

    openProductModal() {
        const modal = document.getElementById('product-modal');
        const nameInput = document.getElementById('product-name-input');
        const aisleSelect = document.getElementById('product-aisle-select');

        nameInput.value = '';
        aisleSelect.value = 'Misc';

        modal.classList.add('active');
        nameInput.focus();
    }

    closeProductModal() {
        document.getElementById('product-modal').classList.remove('active');
    }

    async saveProduct() {
        const name = document.getElementById('product-name-input').value.trim();
        const aisle = document.getElementById('product-aisle-select').value;

        if (!name) {
            alert('Please enter a product name');
            return;
        }

        // Check for duplicates (case-insensitive)
        const existingProduct = this.store.masterProductList.find(
            p => p.name.toLowerCase() === name.toLowerCase()
        );

        if (existingProduct) {
            const message = `"${name}" already exists in ${existingProduct.aisle} aisle.\n\n` +
                `Do you want to:\n` +
                `• OK = Add anyway (will create duplicate)\n` +
                `• Cancel = Don't add`;

            if (!confirm(message)) {
                return; // User chose not to add duplicate
            }
        }

        await this.store.addProduct(name, aisle);
        this.closeProductModal();
        this.renderCategories();
    }

    openEditProductModal(productId, currentName, currentAisle) {
        this.editingProductId = productId;
        const modal = document.getElementById('edit-product-modal');
        const nameInput = document.getElementById('edit-product-name-input');
        const aisleSelect = document.getElementById('edit-product-aisle-select');

        nameInput.value = currentName;
        aisleSelect.value = currentAisle;

        modal.classList.add('active');
        nameInput.focus();
    }

    closeEditProductModal() {
        document.getElementById('edit-product-modal').classList.remove('active');
        this.editingProductId = null;
    }

    async saveEditProduct() {
        const name = document.getElementById('edit-product-name-input').value.trim();
        const aisle = document.getElementById('edit-product-aisle-select').value;

        if (!name) {
            alert('Please enter a product name');
            return;
        }

        await this.store.editProduct(this.editingProductId, name, aisle);
        this.closeEditProductModal();
        this.renderCategories();
    }

    async addManualItem() {
        const input = document.getElementById('manual-item-input');
        const select = document.getElementById('manual-item-category');
        const text = input.value.trim();

        if (text) {
            await this.store.addManualItem(text, select.value);
            input.value = '';
            this.renderShoppingList();
            this.renderCategories(); // Update to show item is now in list
        }
    }

    async uncheckAllItems() {
        if (confirm('Uncheck all items? (Items will remain in the list)')) {
            await this.store.uncheckAllItems();
            this.renderShoppingList();
        }
    }

    async clearCheckedItems() {
        if (confirm('Remove all checked items from the list?')) {
            // Save for undo
            const checkedItems = this.store.shoppingList.filter(i => i.checked);
            if (checkedItems.length > 0) {
                this.pushUndoAction({
                    type: 'CLEAR_CHECKED',
                    data: checkedItems.map(i => ({ ...i }))
                });
            }
            await this.store.clearCheckedItems();
            this.renderShoppingList();
            this.renderCategories(); // Update to show items are no longer in list
        }
    }

    async clearAllItems() {
        if (confirm('Clear the entire shopping list?')) {
            // Save for undo
            const allItems = [...this.store.shoppingList];
            if (allItems.length > 0) {
                this.pushUndoAction({
                    type: 'CLEAR_ALL',
                    data: allItems.map(i => ({ ...i }))
                });
            }
            await this.store.clearAllItems();
            this.renderShoppingList();
            this.renderCategories(); // Update to show items are no longer in list
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

    exportMasterProducts() {
        const data = {
            masterProductList: this.store.masterProductList,
            exportDate: new Date().toISOString(),
            count: this.store.masterProductList.length
        };

        // Create downloadable JSON file
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `master-products-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert(`Exported ${this.store.masterProductList.length} products!`);
    }

    async importMasterProducts(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (!data.masterProductList || !Array.isArray(data.masterProductList)) {
                    alert('Invalid file format. Expected a JSON file with "masterProductList" array.');
                    return;
                }

                const newProducts = data.masterProductList;
                const currentCount = this.store.masterProductList.length;
                const newCount = newProducts.length;

                const action = confirm(
                    `Found ${newCount} products in file.\n\n` +
                    `Current products: ${currentCount}\n\n` +
                    `Choose:\n` +
                    `OK = Replace all existing products\n` +
                    `Cancel = Merge (keep existing, add new)`
                );

                if (action) {
                    // Replace all
                    this.store.masterProductList = newProducts;
                } else {
                    // Merge - add products that don't already exist (by name + aisle)
                    const existingKeys = new Set(
                        this.store.masterProductList.map(p => `${p.name.toLowerCase()}|${p.aisle}`)
                    );

                    newProducts.forEach(product => {
                        const key = `${product.name.toLowerCase()}|${product.aisle}`;
                        if (!existingKeys.has(key)) {
                            // Generate new ID and timestamps for imported products
                            this.store.masterProductList.push({
                                ...product,
                                id: `product-${Date.now()}-${Math.random()}`,
                                createdAt: product.createdAt || new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            });
                        }
                    });
                }

                await this.store.save('masterProductList', this.store.masterProductList);

                this.renderCategories();

                const finalCount = this.store.masterProductList.length;
                alert(`Successfully imported! Total products: ${finalCount}`);

            } catch (error) {
                alert('Error reading file: ' + error.message);
            }
        };

        reader.readAsText(file);

        // Reset file input so same file can be imported again
        event.target.value = '';
    }

    // Reset Statistics
    async resetStatistics() {
        const message =
            'This will reset ALL usage statistics:\n\n' +
            '• Item usage counts (for frequency sorting)\n' +
            '• Recently Used section (top 15 products)\n\n' +
            'Your products and meals will NOT be affected.\n\n' +
            'Continue?';

        if (!confirm(message)) return;

        await this.store.resetUsageStatistics();

        // Refresh views
        if (this.currentView === 'categories') {
            this.renderCategories();
        }

        alert('Usage statistics have been reset!');
    }

    // Ingredient Consolidation
    openConsolidateModal() {
        const modal = document.getElementById('consolidate-modal');
        modal.classList.add('active');

        // Show loading state
        document.getElementById('consolidate-loading').style.display = 'block';
        document.getElementById('consolidate-results').style.display = 'none';
        document.getElementById('consolidate-empty').style.display = 'none';

        // Run analysis asynchronously
        setTimeout(() => {
            this.analyzeIngredients();
        }, 100);
    }

    closeConsolidateModal() {
        const modal = document.getElementById('consolidate-modal');
        modal.classList.remove('active');
    }

    analyzeIngredients() {
        const mismatches = this.store.findIngredientMismatches();

        if (mismatches.length === 0) {
            // No mismatches found
            document.getElementById('consolidate-loading').style.display = 'none';
            document.getElementById('consolidate-empty').style.display = 'block';
            return;
        }

        // Show results
        document.getElementById('consolidate-loading').style.display = 'none';
        document.getElementById('consolidate-results').style.display = 'block';
        document.getElementById('mismatch-count').textContent = mismatches.length;

        // Render the list
        const container = document.getElementById('consolidate-list');
        container.innerHTML = mismatches.map((mismatch, index) => `
            <div class="consolidate-item" style="padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 12px; background: #fff;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <div style="font-weight: 600; color: #dc3545; font-size: 15px;">"${mismatch.ingredient}"</div>
                        <div style="color: #666; font-size: 13px; margin-top: 4px;">
                            Used in ${mismatch.mealsCount} meal${mismatch.mealsCount === 1 ? '' : 's'}:
                            <strong>${mismatch.mealNames.join(', ')}</strong>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 12px;">
                    <div style="font-size: 13px; color: #666; margin-bottom: 8px;">Suggested matches:</div>
                    ${mismatch.suggestedMatches.map((match, matchIndex) => `
                        <label style="display: flex; align-items: center; padding: 8px; background: #f8f9fa; border-radius: 4px; margin-bottom: 6px; cursor: pointer; transition: background 0.2s;">
                            <input
                                type="radio"
                                name="mismatch-${index}"
                                value="${match.productName}"
                                data-from="${mismatch.ingredient}"
                                data-to="${match.productName}"
                                style="margin-right: 10px;"
                                ${matchIndex === 0 ? 'checked' : ''}
                            />
                            <div style="flex: 1;">
                                <span style="font-weight: 500;">${match.productName}</span>
                                <span style="color: #666; margin-left: 8px; font-size: 12px;">(${Math.round(match.score * 100)}% match)</span>
                            </div>
                        </label>
                    `).join('')}
                    <label style="display: flex; align-items: center; padding: 8px; background: #f8f9fa; border-radius: 4px; cursor: pointer;">
                        <input
                            type="radio"
                            name="mismatch-${index}"
                            value=""
                            style="margin-right: 10px;"
                        />
                        <span style="color: #666; font-style: italic;">Skip (don't change)</span>
                    </label>
                </div>
            </div>
        `).join('');

        // Enable apply button
        document.getElementById('apply-consolidation-btn').disabled = false;
    }

    async applyConsolidation() {
        // Collect selected changes
        const changes = [];
        const container = document.getElementById('consolidate-list');
        const radios = container.querySelectorAll('input[type="radio"]:checked');

        radios.forEach(radio => {
            if (radio.value) { // Skip if "don't change" is selected
                changes.push({
                    from: radio.dataset.from,
                    to: radio.dataset.to
                });
            }
        });

        if (changes.length === 0) {
            alert('No changes selected. Please select at least one ingredient to update or click Close.');
            return;
        }

        // Confirm with user
        const message =
            `This will update ${changes.length} ingredient${changes.length === 1 ? '' : 's'} across all meals:\n\n` +
            changes.slice(0, 5).map(c => `• "${c.from}" → "${c.to}"`).join('\n') +
            (changes.length > 5 ? `\n... and ${changes.length - 5} more` : '') +
            '\n\nContinue?';

        if (!confirm(message)) return;

        // Apply consolidation
        const updatedCount = await this.store.consolidateIngredients(changes);

        // Refresh views
        this.renderDatabase();
        if (this.currentView === 'categories') {
            this.renderCategories();
        }

        // Close modal and show success
        this.closeConsolidateModal();
        alert(`Successfully updated ${updatedCount} ingredient reference${updatedCount === 1 ? '' : 's'} across your meals!`);
    }

    // Aisle Management
    openAislesModal() {
        const modal = document.getElementById('aisles-modal');
        modal.classList.add('active');
        this.renderAislesList();
    }

    closeAislesModal() {
        const modal = document.getElementById('aisles-modal');
        modal.classList.remove('active');
        document.getElementById('new-aisle-input').value = '';
    }

    renderAislesList() {
        const container = document.getElementById('aisles-list');
        const aisles = this.store.aisles;

        if (aisles.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No aisles configured</p>';
            return;
        }

        container.innerHTML = aisles.map((aisle, index) => {
            const productsCount = this.store.masterProductList.filter(p => p.aisle === aisle).length;
            return `
                <div class="aisle-item" data-aisle="${aisle}" style="display: flex; align-items: center; gap: 10px; padding: 12px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 8px; background: white;">
                    <div style="cursor: grab; color: #999; font-size: 18px;">⋮⋮</div>
                    <div style="flex: 1;">
                        <div style="font-weight: 500;">${aisle}</div>
                        <div style="font-size: 12px; color: #666;">${productsCount} product${productsCount === 1 ? '' : 's'}</div>
                    </div>
                    <button class="btn-icon" onclick="app.moveAisleUp('${aisle.replace(/'/g, "\\'")}', ${index})" title="Move up" ${index === 0 ? 'disabled' : ''}>↑</button>
                    <button class="btn-icon" onclick="app.moveAisleDown('${aisle.replace(/'/g, "\\'")}', ${index})" title="Move down" ${index === aisles.length - 1 ? 'disabled' : ''}>↓</button>
                    <button class="btn-icon" onclick="app.editAisle('${aisle.replace(/'/g, "\\'")}')">✏️</button>
                    <button class="btn-icon" onclick="app.deleteAisle('${aisle.replace(/'/g, "\\'")}')">🗑️</button>
                </div>
            `;
        }).join('');
    }

    async addAisle() {
        const input = document.getElementById('new-aisle-input');
        const aisleName = input.value.trim();

        if (!aisleName) {
            alert('Please enter an aisle name');
            return;
        }

        try {
            await this.store.addAisle(aisleName);
            input.value = '';
            this.renderAislesList();
            this.updateAllAisleDropdowns();
        } catch (error) {
            alert(error.message);
        }
    }

    async editAisle(oldName) {
        const newName = prompt('Enter new aisle name:', oldName);
        if (!newName || newName === oldName) return;

        try {
            await this.store.updateAisle(oldName, newName);
            this.renderAislesList();
            this.updateAllAisleDropdowns();
            if (this.currentView === 'categories') {
                this.renderCategories();
            }
        } catch (error) {
            alert(error.message);
        }
    }

    async deleteAisle(aisleName) {
        const productsCount = this.store.masterProductList.filter(p => p.aisle === aisleName).length;

        if (productsCount > 0) {
            alert(`Cannot delete "${aisleName}": ${productsCount} product${productsCount === 1 ? ' is' : 's are'} using this aisle.\n\nPlease reassign or delete those products first.`);
            return;
        }

        if (!confirm(`Delete aisle "${aisleName}"?`)) return;

        try {
            await this.store.deleteAisle(aisleName);
            this.renderAislesList();
            this.updateAllAisleDropdowns();
        } catch (error) {
            alert(error.message);
        }
    }

    async moveAisleUp(aisleName, currentIndex) {
        if (currentIndex === 0) return;
        await this.store.moveAisle(aisleName, 'up');
        this.renderAislesList();
        this.updateAllAisleDropdowns();
        if (this.currentView === 'categories') {
            this.renderCategories();
        }
    }

    async moveAisleDown(aisleName, currentIndex) {
        if (currentIndex === this.store.aisles.length - 1) return;
        await this.store.moveAisle(aisleName, 'down');
        this.renderAislesList();
        this.updateAllAisleDropdowns();
        if (this.currentView === 'categories') {
            this.renderCategories();
        }
    }

    updateAllAisleDropdowns() {
        const dropdownIds = [
            'manual-item-category',
            'category-aisle-select',
            'new-ingredient-category',
            'product-aisle-select',
            'edit-product-aisle-select'
        ];

        const aisles = this.store.aisles;

        dropdownIds.forEach(id => {
            const select = document.getElementById(id);
            if (!select) return;

            // Save current value
            const currentValue = select.value;

            // Rebuild options
            select.innerHTML = aisles.map(aisle =>
                `<option value="${aisle}">${aisle}</option>`
            ).join('');

            // Restore value if it still exists
            if (aisles.includes(currentValue)) {
                select.value = currentValue;
            }
        });
    }

    // Enhanced Meal Creation - Ingredient Selection
    renderIngredientSelection() {
        const container = document.getElementById('ingredient-selection-area');
        const searchTerm = this.ingredientSearchTerm.toLowerCase();

        // Get all aisles and products
        const aisles = this.store.getAllAisles();

        let html = '';

        aisles.forEach((aisle, aisleIndex) => {
            const products = this.store.getProductsByAisle(aisle);

            // Filter products by search term
            const filteredProducts = searchTerm
                ? products.filter(p => p.name.toLowerCase().includes(searchTerm))
                : products;

            if (filteredProducts.length === 0) return; // Skip empty aisles

            // When searching, expand all; otherwise start collapsed
            const isExpanded = searchTerm !== '';
            const aisleId = `ingredient-aisle-${aisleIndex}`;

            html += `
                <div class="ingredient-aisle-group" style="margin-bottom: 8px; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; background: white;">
                    <div class="aisle-header" data-aisle-id="${aisleId}" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--surface); cursor: pointer; user-select: none; border-bottom: 1px solid var(--border);">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="aisle-toggle" style="font-size: 12px; transition: transform 0.2s;">${isExpanded ? '▼' : '▶'}</span>
                            <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">${aisle}</span>
                            <span style="font-size: 12px; color: var(--text-secondary);">(${filteredProducts.length})</span>
                        </div>
                    </div>
                    <div class="ingredient-products" id="${aisleId}" style="display: ${isExpanded ? 'block' : 'none'}; padding: 8px;">
                        ${filteredProducts.map(product => {
                            const isSelected = this.selectedIngredients.has(product.name);
                            const quantity = this.selectedIngredients.get(product.name) || '';

                            return `
                                <div class="ingredient-item" style="display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px; padding: 8px; border-radius: 4px; ${isSelected ? 'background: #e0f2fe;' : ''} margin-bottom: 2px;">
                                    <input
                                        type="checkbox"
                                        class="ingredient-checkbox"
                                        data-product="${product.name}"
                                        ${isSelected ? 'checked' : ''}
                                        style="cursor: pointer; margin: 0; width: 16px; height: 16px;"
                                    />
                                    <label style="cursor: pointer; font-size: 14px; margin: 0;" data-product="${product.name}">
                                        ${product.name}
                                    </label>
                                    <input
                                        type="text"
                                        class="ingredient-quantity"
                                        data-product="${product.name}"
                                        placeholder="Qty"
                                        value="${quantity}"
                                        style="width: 100px; padding: 4px 8px; font-size: 13px; border: 1px solid var(--border); border-radius: 4px; ${isSelected ? '' : 'visibility: hidden;'}"
                                    />
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        });

        if (html === '') {
            html = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">No products found</p>';
        }

        container.innerHTML = html;

        // Attach toggle listeners for aisle headers
        container.querySelectorAll('.aisle-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const aisleId = e.currentTarget.dataset.aisleId;
                const productList = document.getElementById(aisleId);
                const toggle = e.currentTarget.querySelector('.aisle-toggle');

                if (productList.style.display === 'none') {
                    productList.style.display = 'block';
                    toggle.textContent = '▼';
                } else {
                    productList.style.display = 'none';
                    toggle.textContent = '▶';
                }
            });
        });

        // Add event listeners for checkboxes
        container.querySelectorAll('.ingredient-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const productName = e.target.dataset.product;
                if (e.target.checked) {
                    this.selectedIngredients.set(productName, '');
                } else {
                    this.selectedIngredients.delete(productName);
                }
                this.renderIngredientSelection(); // Re-render to show/hide quantity input
                this.renderSelectedIngredients();
            });
        });

        // Add event listeners for quantity inputs
        container.querySelectorAll('.ingredient-quantity').forEach(input => {
            input.addEventListener('input', (e) => {
                const productName = e.target.dataset.product;
                this.selectedIngredients.set(productName, e.target.value);
                this.renderSelectedIngredients();
            });
        });

        // Add event listeners for labels (to toggle checkbox)
        container.querySelectorAll('label[data-product]').forEach(label => {
            label.addEventListener('click', (e) => {
                const productName = e.target.dataset.product;
                const checkbox = container.querySelector(`input.ingredient-checkbox[data-product="${productName}"]`);
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        });
    }

    renderSelectedIngredients() {
        const container = document.getElementById('selected-ingredients-list');
        const countSpan = document.getElementById('selected-count');

        countSpan.textContent = this.selectedIngredients.size;

        if (this.selectedIngredients.size === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px 0;">No ingredients selected yet</p>';
            return;
        }

        // Sort ingredients alphabetically
        const sortedIngredients = Array.from(this.selectedIngredients.entries()).sort((a, b) =>
            a[0].localeCompare(b[0])
        );

        container.innerHTML = sortedIngredients.map(([productName, quantity]) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; border-bottom: 1px solid #e5e7eb;">
                <div style="flex: 1;">
                    ${quantity ? `<span style="color: #666; font-size: 13px;">${quantity}</span> ` : ''}
                    <span style="font-weight: 500;">${productName}</span>
                </div>
                <button
                    class="icon-btn remove-ingredient-btn"
                    data-product="${productName}"
                    title="Remove"
                    style="color: #dc3545; padding: 4px 8px;"
                >×</button>
            </div>
        `).join('');

        // Add remove listeners
        container.querySelectorAll('.remove-ingredient-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const productName = btn.dataset.product;
                this.selectedIngredients.delete(productName);
                this.renderIngredientSelection();
                this.renderSelectedIngredients();
            });
        });
    }

    async quickAddProduct() {
        const productInput = document.getElementById('quick-add-product-input');
        const quantityInput = document.getElementById('quick-add-quantity-input');

        const productName = productInput.value.trim();
        const quantity = quantityInput.value.trim();

        if (!productName) {
            alert('Please enter a product name');
            return;
        }

        // Check if product already exists in master list
        const existingProduct = this.store.masterProductList.find(
            p => p.name.toLowerCase() === productName.toLowerCase()
        );

        if (existingProduct) {
            // Product exists, just select it
            this.selectedIngredients.set(existingProduct.name, quantity);
        } else {
            // Add to master list in Misc aisle
            await this.store.addProduct(productName, 'Misc');
            // Add to selected ingredients
            this.selectedIngredients.set(productName, quantity);
        }

        // Clear inputs
        productInput.value = '';
        quantityInput.value = '';

        // Re-render
        this.renderIngredientSelection();
        this.renderSelectedIngredients();
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    window.app = new App();
    await window.app.initialize();
});
