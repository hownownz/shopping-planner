// Firebase Service - Handles all Firebase operations
import firebaseConfig from './firebase-config.js';

class FirebaseService {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.syncCallbacks = [];
        this.unsubscribes = [];
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // Import Firebase modules
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
            const { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } =
                await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
            const { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, updateDoc, deleteDoc, query, orderBy, writeBatch } =
                await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const { initializeAppCheck, ReCaptchaV3Provider } =
                await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js');

            // Initialize Firebase
            const app = initializeApp(firebaseConfig);

            // Initialize App Check with reCAPTCHA v3
            if (firebaseConfig.appCheckSiteKey) {
                try {
                    const appCheck = initializeAppCheck(app, {
                        provider: new ReCaptchaV3Provider(firebaseConfig.appCheckSiteKey),
                        isTokenAutoRefreshEnabled: true
                    });
                    console.log('✅ App Check initialized successfully');
                } catch (appCheckError) {
                    console.warn('⚠️ App Check initialization failed (running without App Check):', appCheckError.message);
                    // Continue without App Check - app will still work
                }
            } else {
                console.warn('⚠️ App Check site key not configured. Add appCheckSiteKey to firebase-config.js');
            }

            this.auth = getAuth(app);
            this.db = getFirestore(app);

            // Store imports for later use
            this.imports = {
                signInWithEmailAndPassword,
                createUserWithEmailAndPassword,
                signOut,
                doc,
                setDoc,
                getDoc,
                collection,
                onSnapshot,
                updateDoc,
                deleteDoc,
                query,
                orderBy,
                writeBatch
            };

            // Wait for initial auth state to be resolved
            await new Promise((resolve) => {
                const unsubscribe = onAuthStateChanged(this.auth, (user) => {
                    this.currentUser = user;
                    if (user) {
                        this.setupRealtimeSync();
                    } else {
                        this.cleanupSync();
                    }
                    unsubscribe(); // Unsubscribe after first check
                    resolve();
                });
            });

            // Continue listening to auth state changes
            onAuthStateChanged(this.auth, (user) => {
                this.currentUser = user;
                if (user) {
                    this.setupRealtimeSync();
                } else {
                    this.cleanupSync();
                }
            });

            this.isInitialized = true;
            console.log('✅ Firebase initialized successfully');
        } catch (error) {
            console.error('❌ Firebase initialization error:', error);
            throw error;
        }
    }

    // Authentication methods
    async signUp(email, password) {
        try {
            const userCredential = await this.imports.createUserWithEmailAndPassword(
                this.auth, 
                email, 
                password
            );
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const userCredential = await this.imports.signInWithEmailAndPassword(
                this.auth, 
                email, 
                password
            );
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            await this.imports.signOut(this.auth);
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Ensures the one-time array-doc -> subcollection migration has run before
    // any subcollection listener attaches, so listeners never see an empty
    // collection and overwrite good local/cached data. Gated by a flag doc so
    // it only actually runs once per account, across all devices.
    async ensureSubcollectionsMigrated(userId) {
        const statusRef = this.imports.doc(this.db, `users/${userId}/data/migrationStatus`);
        try {
            const statusSnap = await this.imports.getDoc(statusRef);
            if (statusSnap.exists() && statusSnap.data().subcollectionsMigrated) {
                return;
            }

            const result = await this.migrateToSubcollections();
            await this.imports.setDoc(statusRef, {
                subcollectionsMigrated: true,
                migratedAt: new Date().toISOString(),
                ...result
            });
            console.log('✅ One-time subcollection migration ran automatically:', result);
        } catch (error) {
            console.error('❌ Migration status check failed:', error);
        }
    }

    // Real-time sync setup
    async setupRealtimeSync() {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;

        await this.ensureSubcollectionsMigrated(userId);

        // Listen to meals collection
        const mealsRef = this.imports.collection(this.db, `users/${userId}/meals`);
        const mealsUnsubscribe = this.imports.onSnapshot(mealsRef, (snapshot) => {
            const meals = [];
            snapshot.forEach((doc) => {
                meals.push({ id: doc.id, ...doc.data() });
            });
            this.notifySyncCallbacks('meals', meals);
        });

        // Listen to categories collection
        const categoriesRef = this.imports.collection(this.db, `users/${userId}/categories`);
        const categoriesUnsubscribe = this.imports.onSnapshot(categoriesRef, (snapshot) => {
            const categories = [];
            snapshot.forEach((doc) => {
                categories.push({ id: doc.id, ...doc.data() });
            });
            this.notifySyncCallbacks('categories', categories);
        });

        // Listen to shopping list (one document per item)
        const shoppingItemsRef = this.imports.collection(this.db, `users/${userId}/shoppingItems`);
        const shoppingUnsubscribe = this.imports.onSnapshot(shoppingItemsRef, (snapshot) => {
            const items = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            this.notifySyncCallbacks('shoppingList', items);
        });

        // Listen to the weekly meal plan (one meal id per day of week, or null)
        const selectedRef = this.imports.doc(this.db, `users/${userId}/data/selected`);
        const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const selectedUnsubscribe = this.imports.onSnapshot(selectedRef, (doc) => {
            const raw = (doc.exists() && doc.data().mealsByDay) || {};
            const mealsByDay = {};
            weekDays.forEach(day => mealsByDay[day] = raw[day] || null);
            this.notifySyncCallbacks('selectedMealsByDay', mealsByDay);
        });

        // Listen to ingredient mappings
        const mappingsRef = this.imports.doc(this.db, `users/${userId}/data/ingredientMappings`);
        const mappingsUnsubscribe = this.imports.onSnapshot(mappingsRef, (doc) => {
            if (doc.exists()) {
                this.notifySyncCallbacks('ingredientMappings', doc.data().mappings || {});
            }
        });

        // Listen to master product list (one document per product)
        const masterProductsRef = this.imports.collection(this.db, `users/${userId}/masterProducts`);
        const masterProductListUnsubscribe = this.imports.onSnapshot(masterProductsRef, (snapshot) => {
            const products = [];
            snapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() });
            });
            this.notifySyncCallbacks('masterProductList', products);
        });

        // Listen to aisles
        const aislesRef = this.imports.doc(this.db, `users/${userId}/data/aisles`);
        const aislesUnsubscribe = this.imports.onSnapshot(aislesRef, (doc) => {
            if (doc.exists()) {
                this.notifySyncCallbacks('aisles', doc.data().aisles || []);
            }
        });

        this.unsubscribes.push(
            mealsUnsubscribe,
            categoriesUnsubscribe,
            shoppingUnsubscribe,
            selectedUnsubscribe,
            mappingsUnsubscribe,
            masterProductListUnsubscribe,
            aislesUnsubscribe
        );

        console.log('🔄 Real-time sync enabled');
    }

    cleanupSync() {
        this.unsubscribes.forEach(unsubscribe => unsubscribe());
        this.unsubscribes = [];
    }

    onSync(callback) {
        this.syncCallbacks.push(callback);
    }

    notifySyncCallbacks(type, data) {
        this.syncCallbacks.forEach(callback => callback(type, data));
    }

    // Data operations
    async saveMeals(meals) {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;
        const batch = [];

        for (const meal of meals) {
            const mealRef = this.imports.doc(this.db, `users/${userId}/meals/${meal.id}`);
            batch.push(this.imports.setDoc(mealRef, {
                name: meal.name,
                ingredients: meal.ingredients,
                sortOrder: meal.sortOrder || 0,
                updatedAt: new Date().toISOString()
            }));
        }

        try {
            await Promise.all(batch);
            console.log('✅ Meals synced');
        } catch (error) {
            console.error('❌ Error syncing meals:', error);
        }
    }

    async saveMeal(meal) {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;
        const mealRef = this.imports.doc(this.db, `users/${userId}/meals/${meal.id}`);

        try {
            await this.imports.setDoc(mealRef, {
                name: meal.name,
                ingredients: meal.ingredients,
                sortOrder: meal.sortOrder || 0,
                updatedAt: new Date().toISOString()
            });
            console.log('✅ Meal saved');
        } catch (error) {
            console.error('❌ Error saving meal:', error);
        }
    }

    async deleteMeal(mealId) {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;
        const mealRef = this.imports.doc(this.db, `users/${userId}/meals/${mealId}`);

        try {
            await this.imports.deleteDoc(mealRef);
            console.log('✅ Meal deleted');
        } catch (error) {
            console.error('❌ Error deleting meal:', error);
        }
    }

    async saveCategories(categories) {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;
        const batch = [];

        for (const category of categories) {
            const catRef = this.imports.doc(this.db, `users/${userId}/categories/${category.id}`);
            batch.push(this.imports.setDoc(catRef, {
                name: category.name,
                icon: category.icon,
                aisle: category.aisle,
                items: category.items,
                updatedAt: new Date().toISOString()
            }));
        }

        try {
            await Promise.all(batch);
            console.log('✅ Categories synced');
        } catch (error) {
            console.error('❌ Error syncing categories:', error);
        }
    }

    async saveCategory(category) {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;
        const catRef = this.imports.doc(this.db, `users/${userId}/categories/${category.id}`);

        try {
            await this.imports.setDoc(catRef, {
                name: category.name,
                icon: category.icon,
                aisle: category.aisle,
                items: category.items,
                updatedAt: new Date().toISOString()
            });
            console.log('✅ Category saved');
        } catch (error) {
            console.error('❌ Error saving category:', error);
        }
    }

    async deleteCategory(categoryId) {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;
        const catRef = this.imports.doc(this.db, `users/${userId}/categories/${categoryId}`);

        try {
            await this.imports.deleteDoc(catRef);
            console.log('✅ Category deleted');
        } catch (error) {
            console.error('❌ Error deleting category:', error);
        }
    }

    async saveShoppingList(items) {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;
        const shoppingRef = this.imports.doc(this.db, `users/${userId}/data/shopping`);

        try {
            await this.imports.setDoc(shoppingRef, {
                items: items,
                updatedAt: new Date().toISOString()
            });
            console.log('✅ Shopping list synced');
        } catch (error) {
            console.error('❌ Error syncing shopping list:', error);
        }
    }

    // Item-level shopping list operations (one document per item)
    async saveShoppingItem(item) {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;
        const itemRef = this.imports.doc(this.db, `users/${userId}/shoppingItems/${item.id}`);

        try {
            await this.imports.setDoc(itemRef, {
                text: item.text,
                category: item.category,
                checked: !!item.checked,
                source: item.source,
                count: item.count || 1,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error saving shopping item:', error);
        }
    }

    async deleteShoppingItem(id) {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;
        const itemRef = this.imports.doc(this.db, `users/${userId}/shoppingItems/${id}`);

        try {
            await this.imports.deleteDoc(itemRef);
        } catch (error) {
            console.error('❌ Error deleting shopping item:', error);
        }
    }

    // Replace the entire shopping list atomically (used when regenerating from selected meals)
    async replaceShoppingItems(items) {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;

        try {
            const existingRef = this.imports.collection(this.db, `users/${userId}/shoppingItems`);
            const existingSnapshot = await new Promise((resolve, reject) => {
                const unsubscribe = this.imports.onSnapshot(existingRef, (snapshot) => {
                    unsubscribe();
                    resolve(snapshot);
                }, reject);
            });

            const batch = this.imports.writeBatch(this.db);
            existingSnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
            items.forEach((item) => {
                const itemRef = this.imports.doc(this.db, `users/${userId}/shoppingItems/${item.id}`);
                batch.set(itemRef, {
                    text: item.text,
                    category: item.category,
                    checked: !!item.checked,
                    source: item.source,
                    count: item.count || 1,
                    updatedAt: new Date().toISOString()
                });
            });
            await batch.commit();
            console.log('✅ Shopping list replaced');
        } catch (error) {
            console.error('❌ Error replacing shopping list:', error);
        }
    }

    // Delete/update many shopping items atomically (clearChecked, clearAll, uncheckAll)
    async deleteShoppingItems(ids) {
        if (!this.currentUser || ids.length === 0) return;

        const userId = this.currentUser.uid;

        try {
            const batch = this.imports.writeBatch(this.db);
            ids.forEach((id) => {
                const itemRef = this.imports.doc(this.db, `users/${userId}/shoppingItems/${id}`);
                batch.delete(itemRef);
            });
            await batch.commit();
        } catch (error) {
            console.error('❌ Error deleting shopping items:', error);
        }
    }

    async updateShoppingItemsFields(idsWithFields) {
        if (!this.currentUser || idsWithFields.length === 0) return;

        const userId = this.currentUser.uid;

        try {
            const batch = this.imports.writeBatch(this.db);
            idsWithFields.forEach(({ id, fields }) => {
                const itemRef = this.imports.doc(this.db, `users/${userId}/shoppingItems/${id}`);
                batch.update(itemRef, { ...fields, updatedAt: new Date().toISOString() });
            });
            await batch.commit();
        } catch (error) {
            console.error('❌ Error updating shopping items:', error);
        }
    }

    async saveSelectedMealsByDay(mealsByDay) {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;
        const selectedRef = this.imports.doc(this.db, `users/${userId}/data/selected`);

        try {
            await this.imports.setDoc(selectedRef, {
                mealsByDay: mealsByDay,
                updatedAt: new Date().toISOString()
            });
            console.log('✅ Weekly meal plan synced');
        } catch (error) {
            console.error('❌ Error syncing weekly meal plan:', error);
        }
    }

    async saveIngredientMappings(mappings) {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;
        const mappingsRef = this.imports.doc(this.db, `users/${userId}/data/ingredientMappings`);

        try {
            await this.imports.setDoc(mappingsRef, {
                mappings: mappings,
                updatedAt: new Date().toISOString()
            });
            console.log('✅ Ingredient mappings synced');
        } catch (error) {
            console.error('❌ Error syncing ingredient mappings:', error);
        }
    }

    async saveMasterProductList(products) {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;
        const masterProductListRef = this.imports.doc(this.db, `users/${userId}/data/masterProductList`);

        try {
            await this.imports.setDoc(masterProductListRef, {
                products: products,
                updatedAt: new Date().toISOString()
            });
            console.log('✅ Master product list synced');
        } catch (error) {
            console.error('❌ Error syncing master product list:', error);
        }
    }

    // Item-level product operations (one document per product)
    async saveProduct(product) {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;
        const productRef = this.imports.doc(this.db, `users/${userId}/masterProducts/${product.id}`);

        try {
            await this.imports.setDoc(productRef, {
                name: product.name,
                aisle: product.aisle,
                createdAt: product.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error saving product:', error);
        }
    }

    async deleteProduct(id) {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;
        const productRef = this.imports.doc(this.db, `users/${userId}/masterProducts/${id}`);

        try {
            await this.imports.deleteDoc(productRef);
        } catch (error) {
            console.error('❌ Error deleting product:', error);
        }
    }

    // Replace the entire product catalog atomically (used by "Replace all" JSON import)
    async replaceProducts(products) {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;

        try {
            const existingRef = this.imports.collection(this.db, `users/${userId}/masterProducts`);
            const existingSnapshot = await new Promise((resolve, reject) => {
                const unsubscribe = this.imports.onSnapshot(existingRef, (snapshot) => {
                    unsubscribe();
                    resolve(snapshot);
                }, reject);
            });

            const batch = this.imports.writeBatch(this.db);
            existingSnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
            products.forEach((product) => {
                const productRef = this.imports.doc(this.db, `users/${userId}/masterProducts/${product.id}`);
                batch.set(productRef, {
                    name: product.name,
                    aisle: product.aisle,
                    createdAt: product.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            });
            await batch.commit();
            console.log('✅ Product catalog replaced');
        } catch (error) {
            console.error('❌ Error replacing product catalog:', error);
        }
    }

    // Bulk product writes (JSON import, aisle rename cascade) as one atomic batch
    async saveProducts(products) {
        if (!this.currentUser || products.length === 0) return;

        const userId = this.currentUser.uid;

        try {
            const batch = this.imports.writeBatch(this.db);
            products.forEach((product) => {
                const productRef = this.imports.doc(this.db, `users/${userId}/masterProducts/${product.id}`);
                batch.set(productRef, {
                    name: product.name,
                    aisle: product.aisle,
                    createdAt: product.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            });
            await batch.commit();
        } catch (error) {
            console.error('❌ Error saving products:', error);
        }
    }

    async saveAisles(aisles) {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;
        const aislesRef = this.imports.doc(this.db, `users/${userId}/data/aisles`);

        try {
            await this.imports.setDoc(aislesRef, {
                aisles: aisles,
                updatedAt: new Date().toISOString()
            });
            console.log('✅ Aisles synced');
        } catch (error) {
            console.error('❌ Error syncing aisles:', error);
        }
    }

    // Migration helper - import from localStorage
    async migrateFromLocalStorage() {
        if (!this.currentUser) return;

        try {
            const meals = JSON.parse(localStorage.getItem('meals') || '[]');
            const categories = JSON.parse(localStorage.getItem('categories') || '[]');
            const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');

            if (meals.length > 0) await this.saveMeals(meals);
            if (categories.length > 0) await this.saveCategories(categories);
            if (shoppingList.length > 0) await this.saveShoppingList(shoppingList);

            console.log('✅ Migration complete');
            return { success: true };
        } catch (error) {
            console.error('❌ Migration error:', error);
            return { success: false, error: error.message };
        }
    }

    // One-time migration: move shoppingList/masterProductList from single
    // array-documents to one-document-per-item subcollections. Safe to run
    // multiple times (overwrites by id); does NOT delete the old documents -
    // remove users/{uid}/data/shopping and users/{uid}/data/masterProductList
    // manually once the new subcollections are confirmed working.
    async migrateToSubcollections() {
        if (!this.currentUser) return { success: false, error: 'Not signed in' };

        const userId = this.currentUser.uid;
        const result = { shoppingItems: 0, products: 0 };

        try {
            const shoppingRef = this.imports.doc(this.db, `users/${userId}/data/shopping`);
            const shoppingSnap = await this.imports.getDoc(shoppingRef);
            if (shoppingSnap.exists()) {
                const items = shoppingSnap.data().items || [];
                const withIds = items.map((item, index) => ({
                    ...item,
                    id: item.id || `item-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`
                }));
                if (withIds.length > 0) {
                    const batch = this.imports.writeBatch(this.db);
                    withIds.forEach((item) => {
                        const itemRef = this.imports.doc(this.db, `users/${userId}/shoppingItems/${item.id}`);
                        batch.set(itemRef, {
                            text: item.text,
                            category: item.category,
                            checked: !!item.checked,
                            source: item.source,
                            count: item.count || 1,
                            updatedAt: new Date().toISOString()
                        });
                    });
                    await batch.commit();
                    result.shoppingItems = withIds.length;
                }
            }

            const productsRef = this.imports.doc(this.db, `users/${userId}/data/masterProductList`);
            const productsSnap = await this.imports.getDoc(productsRef);
            if (productsSnap.exists()) {
                const products = productsSnap.data().products || [];
                if (products.length > 0) {
                    const batch = this.imports.writeBatch(this.db);
                    products.forEach((product) => {
                        const productRef = this.imports.doc(this.db, `users/${userId}/masterProducts/${product.id}`);
                        batch.set(productRef, {
                            name: product.name,
                            aisle: product.aisle,
                            createdAt: product.createdAt || new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        });
                    });
                    await batch.commit();
                    result.products = products.length;
                }
            }

            console.log(`✅ Subcollection migration complete: ${result.shoppingItems} shopping items, ${result.products} products`);
            return { success: true, ...result };
        } catch (error) {
            console.error('❌ Subcollection migration error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;
