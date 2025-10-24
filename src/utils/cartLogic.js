const STORAGE_KEY = 'sakura-ramen-cart-v1';
let cartState = [];
let initialized = false;
const subscribers = new Set();

function hasLocalStorage() {
    try {
        const testKey = '__sakura_cart_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        return true;
    } catch (error) {
        return false;
    }
}

function loadFromStorage() {
    if (typeof window === 'undefined' || !hasLocalStorage()) {
        return [];
    }

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return [];
        }

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            notes: item.notes || ''
        })).filter(item => item.name);
    } catch (error) {
        console.warn('Unable to read stored cart data', error);
        return [];
    }
}

function persistToStorage() {
    if (typeof window === 'undefined' || !hasLocalStorage()) {
        return;
    }

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartState));
    } catch (error) {
        console.warn('Unable to persist cart data', error);
    }
}

function notifySubscribers() {
    const snapshot = getCart();
    subscribers.forEach(callback => {
        try {
            callback(snapshot);
        } catch (error) {
            console.error('Cart subscription callback failed', error);
        }
    });

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sakura-cart:updated', { detail: { cart: snapshot } }));
    }
}

function ensureInitialized() {
    if (initialized) {
        return;
    }

    cartState = loadFromStorage();
    initialized = true;
}

function normaliseId(name, price, providedId) {
    if (providedId) {
        return providedId;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const priceSuffix = Number(price) ? `-${Math.round(Number(price) * 100)}` : '';
    return `${slug}${priceSuffix}`;
}

export function initializeCartStorage() {
    ensureInitialized();
    persistToStorage();
    notifySubscribers();
    return getCart();
}

export function getCart() {
    ensureInitialized();
    return cartState.map(item => ({ ...item }));
}

export function getCartItemCount() {
    return getCart().reduce((total, item) => total + item.quantity, 0);
}

export function getCartSubtotal() {
    return getCart().reduce((total, item) => total + item.price * item.quantity, 0);
}

export function addItemToCart({ id, name, description = '', price, quantity = 1, notes = '' }) {
    ensureInitialized();

    if (!name) {
        return getCart();
    }

    const numericPrice = Number(price) || 0;
    const itemId = normaliseId(name, numericPrice, id);
    const existingItem = cartState.find(item => item.id === itemId);

    if (existingItem) {
        existingItem.quantity += quantity;
        if (notes) {
            existingItem.notes = notes;
        }
    } else {
        cartState.push({
            id: itemId,
            name,
            description,
            price: numericPrice,
            quantity,
            notes
        });
    }

    persistToStorage();
    notifySubscribers();
    return getCart();
}

export function updateCartItemQuantity(id, quantity) {
    ensureInitialized();
    const target = cartState.find(item => item.id === id);

    if (!target) {
        return getCart();
    }

    const nextQuantity = Number(quantity);

    if (Number.isNaN(nextQuantity) || nextQuantity < 1) {
        removeCartItem(id);
        return getCart();
    }

    target.quantity = Math.floor(nextQuantity);
    persistToStorage();
    notifySubscribers();
    return getCart();
}

export function removeCartItem(id) {
    ensureInitialized();
    cartState = cartState.filter(item => item.id !== id);
    persistToStorage();
    notifySubscribers();
    return getCart();
}

export function setCartItemNote(id, note) {
    ensureInitialized();
    const target = cartState.find(item => item.id === id);
    if (!target) {
        return getCart();
    }

    target.notes = note;
    persistToStorage();
    notifySubscribers();
    return getCart();
}

export function clearCart() {
    ensureInitialized();
    cartState = [];
    persistToStorage();
    notifySubscribers();
    return getCart();
}

export function subscribeToCart(callback) {
    if (typeof callback !== 'function') {
        return () => {};
    }

    ensureInitialized();
    subscribers.add(callback);

    // Immediately provide current state
    try {
        callback(getCart());
    } catch (error) {
        console.error('Cart subscription callback failed during registration', error);
    }

    return () => {
        subscribers.delete(callback);
    };
}

export function getOrderSummary() {
    const items = getCart();
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    return {
        items,
        subtotal,
        totalItems
    };
}
