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
            const { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, updateDoc, deleteDoc, query, orderBy } =
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
                orderBy
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

    // Real-time sync setup
    setupRealtimeSync() {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;

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

        // Listen to shopping list
        const shoppingRef = this.imports.doc(this.db, `users/${userId}/data/shopping`);
        const shoppingUnsubscribe = this.imports.onSnapshot(shoppingRef, (doc) => {
            if (doc.exists()) {
                this.notifySyncCallbacks('shoppingList', doc.data().items || []);
            }
        });

        // Listen to selected meals
        const selectedRef = this.imports.doc(this.db, `users/${userId}/data/selected`);
        const selectedUnsubscribe = this.imports.onSnapshot(selectedRef, (doc) => {
            if (doc.exists()) {
                this.notifySyncCallbacks('selectedMeals', doc.data().meals || []);
            }
        });

        // Listen to ingredient mappings
        const mappingsRef = this.imports.doc(this.db, `users/${userId}/data/ingredientMappings`);
        const mappingsUnsubscribe = this.imports.onSnapshot(mappingsRef, (doc) => {
            if (doc.exists()) {
                this.notifySyncCallbacks('ingredientMappings', doc.data().mappings || {});
            }
        });

        this.unsubscribes.push(
            mealsUnsubscribe,
            categoriesUnsubscribe,
            shoppingUnsubscribe,
            selectedUnsubscribe,
            mappingsUnsubscribe
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

    async saveSelectedMeals(selectedMeals) {
        if (!this.currentUser) return;

        const userId = this.currentUser.uid;
        const selectedRef = this.imports.doc(this.db, `users/${userId}/data/selected`);

        try {
            await this.imports.setDoc(selectedRef, {
                meals: selectedMeals,
                updatedAt: new Date().toISOString()
            });
            console.log('✅ Selected meals synced');
        } catch (error) {
            console.error('❌ Error syncing selected meals:', error);
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

    // Migration helper - import from localStorage
    async migrateFromLocalStorage() {
        if (!this.currentUser) return;

        try {
            const meals = JSON.parse(localStorage.getItem('meals') || '[]');
            const categories = JSON.parse(localStorage.getItem('categories') || '[]');
            const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
            const selectedMeals = JSON.parse(localStorage.getItem('selectedMeals') || '[]');

            if (meals.length > 0) await this.saveMeals(meals);
            if (categories.length > 0) await this.saveCategories(categories);
            if (shoppingList.length > 0) await this.saveShoppingList(shoppingList);
            if (selectedMeals.length > 0) await this.saveSelectedMeals(selectedMeals);

            console.log('✅ Migration complete');
            return { success: true };
        } catch (error) {
            console.error('❌ Migration error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;
