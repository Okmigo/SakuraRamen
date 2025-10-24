import {
    addItemToCart,
    clearCart,
    getOrderSummary,
    initializeCartStorage,
    removeCartItem,
    setCartItemNote,
    subscribeToCart,
    updateCartItemQuantity
} from '../utils/cartLogic.js';

const ORDER_PORTAL_URL = 'https://order.sakuraramen208.com/';
const ORDER_NOTE_KEY = 'sakura-ramen-order-note';
let drawerElement;
let overlayElement;
let panelElement;
let statusElement;
let orderNoteInput;
let checkoutButton;
let cartItemsContainer;
let emptyStateElement;
let subtotalElement;
let clearButton;
let isAnimating = false;

function ready(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

function ensureDrawer() {
    if (drawerElement) {
        return;
    }

    drawerElement = document.createElement('div');
    drawerElement.id = 'cart-drawer';
    drawerElement.className = 'fixed inset-0 z-[70] pointer-events-none';

    drawerElement.innerHTML = `
        <div data-cart-overlay class="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300"></div>
        <aside data-cart-panel class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl translate-x-full transition-transform duration-300 flex flex-col">
            <header class="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
                <div>
                    <h2 class="font-display text-2xl font-semibold text-gray-900">Your Order</h2>
                    <p class="text-sm text-gray-500">Review selections and finish checkout with our ordering partner.</p>
                </div>
                <button type="button" data-cart-close class="w-10 h-10 rounded-full border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 transition flex items-center justify-center" aria-label="Close cart">
                    <span class="text-xl leading-none">×</span>
                </button>
            </header>
            <div class="flex-1 overflow-y-auto px-6 py-4" data-cart-body>
                <div data-cart-empty class="text-center text-gray-500 py-12">
                    <p class="font-medium text-gray-600 mb-2">Your cart is empty</p>
                    <p class="text-sm">Explore the menu and add dishes to begin.</p>
                </div>
                <div data-cart-items class="space-y-6"></div>
            </div>
            <div class="px-6 py-5 border-t border-gray-100 space-y-4 bg-white">
                <div class="flex items-center justify-between text-gray-700">
                    <span class="font-medium">Subtotal</span>
                    <span data-cart-subtotal class="font-semibold text-gray-900">$0.00</span>
                </div>
                <label class="block">
                    <span class="text-xs uppercase tracking-wide text-gray-400">Order note</span>
                    <textarea data-order-note class="mt-2 w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4C2C2] focus:border-[#F4C2C2] transition" rows="3" placeholder="Share pickup details or dietary notes (optional)"></textarea>
                </label>
                <p class="text-xs text-gray-500 leading-relaxed">We will securely forward these details to Sakura Ramen's ordering portal and open their checkout so you can confirm payment.</p>
                <div data-cart-status class="text-sm font-medium"></div>
                <div class="flex flex-col sm:flex-row gap-3">
                    <button type="button" data-cart-clear class="flex-1 border border-gray-300 rounded-full py-3 font-medium text-gray-600 hover:text-gray-800 hover:border-gray-400 transition">Clear Cart</button>
                    <button type="button" data-cart-checkout class="flex-1 btn-primary px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition">Checkout</button>
                </div>
            </div>
        </aside>
    `;

    document.body.appendChild(drawerElement);
    overlayElement = drawerElement.querySelector('[data-cart-overlay]');
    panelElement = drawerElement.querySelector('[data-cart-panel]');
    statusElement = drawerElement.querySelector('[data-cart-status]');
    orderNoteInput = drawerElement.querySelector('[data-order-note]');
    checkoutButton = drawerElement.querySelector('[data-cart-checkout]');
    cartItemsContainer = drawerElement.querySelector('[data-cart-items]');
    emptyStateElement = drawerElement.querySelector('[data-cart-empty]');
    subtotalElement = drawerElement.querySelector('[data-cart-subtotal]');
    clearButton = drawerElement.querySelector('[data-cart-clear]');

    const savedNote = loadOrderNote();
    if (savedNote && orderNoteInput) {
        orderNoteInput.value = savedNote;
    }
}

function openCart() {
    if (!drawerElement || isAnimating) {
        return;
    }

    drawerElement.classList.remove('pointer-events-none');
    requestAnimationFrame(() => {
        overlayElement.style.opacity = '1';
        panelElement.style.transform = 'translateX(0)';
        document.body.style.overflow = 'hidden';
    });
}

function closeCart() {
    if (!drawerElement || isAnimating) {
        return;
    }

    isAnimating = true;
    overlayElement.style.opacity = '0';
    panelElement.style.transform = 'translateX(100%)';

    setTimeout(() => {
        drawerElement.classList.add('pointer-events-none');
        document.body.style.overflow = '';
        isAnimating = false;
    }, 300);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function updateCartBadges(cart) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countElements = document.querySelectorAll('[data-cart-count]');

    countElements.forEach(element => {
        element.textContent = totalItems;
    });
}

function toggleEmptyState(cart) {
    if (!cartItemsContainer || !emptyStateElement) {
        return;
    }

    if (cart.length === 0) {
        emptyStateElement.classList.remove('hidden');
        cartItemsContainer.classList.add('hidden');
    } else {
        emptyStateElement.classList.add('hidden');
        cartItemsContainer.classList.remove('hidden');
    }
}

function bindItemControls(container) {
    container.querySelectorAll('[data-cart-remove]').forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.getAttribute('data-cart-remove');
            removeCartItem(itemId);
        });
    });

    container.querySelectorAll('[data-cart-increment]').forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.getAttribute('data-cart-increment');
            const currentQuantity = Number(button.getAttribute('data-quantity')) || 0;
            updateCartItemQuantity(itemId, currentQuantity + 1);
        });
    });

    container.querySelectorAll('[data-cart-decrement]').forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.getAttribute('data-cart-decrement');
            const currentQuantity = Number(button.getAttribute('data-quantity')) || 0;
            const nextQuantity = currentQuantity - 1;
            if (nextQuantity < 1) {
                removeCartItem(itemId);
            } else {
                updateCartItemQuantity(itemId, nextQuantity);
            }
        });
    });

    container.querySelectorAll('[data-cart-item-note]').forEach(textarea => {
        textarea.addEventListener('input', event => {
            const itemId = textarea.getAttribute('data-cart-item-note');
            setCartItemNote(itemId, event.target.value);
        });
    });
}

function renderCartItems(cart) {
    if (!cartItemsContainer) {
        return;
    }

    cartItemsContainer.innerHTML = '';

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'border border-gray-100 rounded-2xl p-4 shadow-sm';
        itemElement.setAttribute('data-cart-item', item.id);
        itemElement.innerHTML = `
            <div class="flex items-start justify-between gap-4">
                <div>
                    <h3 class="font-semibold text-gray-900">${item.name}</h3>
                    ${item.description ? `<p class="text-sm text-gray-500 mt-1">${item.description}</p>` : ''}
                    <p class="text-xs text-gray-400 mt-2">${formatCurrency(item.price)} each</p>
                </div>
                <button type="button" class="text-gray-400 hover:text-red-500 transition" aria-label="Remove ${item.name}" data-cart-remove="${item.id}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div class="mt-4 flex items-center justify-between gap-4">
                <div class="flex items-center bg-[#F8F8F8] rounded-full px-3 py-2">
                    <button type="button" class="px-2 text-xl text-gray-500 hover:text-gray-800 transition" aria-label="Decrease quantity" data-cart-decrement="${item.id}" data-quantity="${item.quantity}">−</button>
                    <span class="px-4 text-base font-medium text-gray-800">${item.quantity}</span>
                    <button type="button" class="px-2 text-xl text-gray-500 hover:text-gray-800 transition" aria-label="Increase quantity" data-cart-increment="${item.id}" data-quantity="${item.quantity}">+</button>
                </div>
                <span class="font-semibold text-gray-900">${formatCurrency(item.price * item.quantity)}</span>
            </div>
            <label class="mt-4 block">
                <span class="text-xs uppercase tracking-wide text-gray-400">Notes</span>
                <textarea class="mt-2 w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4C2C2] focus:border-[#F4C2C2] transition" data-cart-item-note="${item.id}" rows="2" placeholder="Extra noodles, sauce on the side, etc.">${item.notes || ''}</textarea>
            </label>
        `;

        cartItemsContainer.appendChild(itemElement);
    });

    bindItemControls(cartItemsContainer);
}

function updateSubtotal(cart) {
    if (!subtotalElement) {
        return;
    }

    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    subtotalElement.textContent = formatCurrency(subtotal);
}

function setupTriggers() {
    const triggers = document.querySelectorAll('[data-cart-trigger]');
    triggers.forEach(trigger => {
        trigger.addEventListener('click', event => {
            event.preventDefault();
            ensureDrawer();
            openCart();
        });
    });
}

function setupCloseInteractions() {
    if (!drawerElement) {
        return;
    }

    drawerElement.querySelectorAll('[data-cart-close]').forEach(button => {
        button.addEventListener('click', () => closeCart());
    });

    if (overlayElement) {
        overlayElement.addEventListener('click', () => closeCart());
    }

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && drawerElement && !drawerElement.classList.contains('pointer-events-none')) {
            closeCart();
        }
    });
}

function getMenuItemDetails(button) {
    const card = button.closest('.menu-item') || button.closest('[data-menu-item]');
    if (!card) {
        return null;
    }

    const name = (card.dataset.name || card.querySelector('h3, h4, h5')?.textContent || '').trim();
    const description = (card.dataset.description || card.querySelector('p')?.textContent || '').trim();

    let priceValue = card.dataset.price;
    if (!priceValue) {
        const priceElement = card.querySelector('[data-price], .price, span');
        if (priceElement) {
            const priceMatch = priceElement.textContent.match(/[\d.,]+/);
            priceValue = priceMatch ? priceMatch[0] : '0';
        }
    }

    const numericPrice = parseFloat(String(priceValue).replace(/,/g, '')) || 0;
    const id = card.dataset.itemId || undefined;

    return {
        id,
        name,
        description,
        price: numericPrice
    };
}

function setupAddToCartButtons() {
    const buttons = document.querySelectorAll('.add-to-cart');

    buttons.forEach(button => {
        if (button.dataset.cartReady === 'true') {
            return;
        }

        button.dataset.cartReady = 'true';
        button.addEventListener('click', event => {
            event.preventDefault();
            ensureDrawer();
            const details = getMenuItemDetails(button);
            if (!details) {
                return;
            }

            addItemToCart(details);
            if (statusElement) {
                statusElement.textContent = `${details.name} added to cart.`;
                statusElement.className = 'text-sm font-medium text-gray-700';
            }
            openCart();
        });
    });
}

function saveOrderNote(note) {
    try {
        window.localStorage.setItem(ORDER_NOTE_KEY, note);
    } catch (error) {
        console.warn('Unable to persist order note', error);
    }
}

function loadOrderNote() {
    try {
        return window.localStorage.getItem(ORDER_NOTE_KEY) || '';
    } catch (error) {
        return '';
    }
}

async function forwardCartToOrderingPortal(cartPayload) {
    const response = await fetch('/.netlify/functions/sendOrderToExternal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cartPayload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Unable to forward order to restaurant');
    }

    return response.json();
}

async function handleCheckout(cart) {
    if (!cart.length || !checkoutButton) {
        return;
    }

    checkoutButton.disabled = true;
    checkoutButton.textContent = 'Sending…';
    statusElement.textContent = 'Preparing your order…';
    statusElement.className = 'text-sm font-medium text-gray-500';

    const orderNote = orderNoteInput ? orderNoteInput.value.trim() : '';
    saveOrderNote(orderNote);

    const payload = {
        ...getOrderSummary(),
        orderNote,
        submittedAt: new Date().toISOString()
    };

    try {
        const response = await forwardCartToOrderingPortal(payload);
        statusElement.textContent = 'Order details sent! We opened our partner site so you can confirm checkout.';
        statusElement.className = 'text-sm font-medium text-green-600';

        window.open(ORDER_PORTAL_URL, '_blank', 'noopener');

        if (response && response.forwarded === false) {
            statusElement.textContent += ' (Heads up: automatic forwarding is disabled, so please review your selections manually.)';
        }
    } catch (error) {
        console.error(error);
        statusElement.textContent = 'We could not reach the ordering portal automatically. Please try again or order directly.';
        statusElement.className = 'text-sm font-medium text-red-600';
    } finally {
        checkoutButton.disabled = false;
        checkoutButton.textContent = 'Checkout';
    }
}

function setupCheckout() {
    if (!checkoutButton) {
        return;
    }

    checkoutButton.addEventListener('click', event => {
        event.preventDefault();
        const summary = getOrderSummary();
        if (!summary.items.length) {
            statusElement.textContent = 'Add at least one item before checking out.';
            statusElement.className = 'text-sm font-medium text-red-500';
            return;
        }

        handleCheckout(summary.items);
    });
}

function setupClearButton() {
    if (!clearButton) {
        return;
    }

    clearButton.addEventListener('click', () => {
        clearCart();
        if (orderNoteInput) {
            orderNoteInput.value = '';
        }
        saveOrderNote('');
        if (statusElement) {
            statusElement.textContent = 'Cart cleared.';
            statusElement.className = 'text-sm font-medium text-gray-500';
        }
    });
}

function initialise() {
    initializeCartStorage();
    ensureDrawer();
    setupTriggers();
    setupCloseInteractions();
    setupAddToCartButtons();
    setupCheckout();
    setupClearButton();

    if (orderNoteInput) {
        orderNoteInput.addEventListener('input', event => {
            saveOrderNote(event.target.value);
        });
    }

    subscribeToCart(cart => {
        updateCartBadges(cart);
        toggleEmptyState(cart);
        renderCartItems(cart);
        updateSubtotal(cart);

        if (!cart.length && statusElement) {
            statusElement.textContent = '';
            statusElement.className = 'text-sm font-medium text-gray-500';
        }
    });
}

ready(initialise);

export { initialise as initializeCartUI };
