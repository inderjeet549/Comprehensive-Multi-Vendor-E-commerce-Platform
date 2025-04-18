// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBacyV04HeeJPRvUQOAOYqIEN7fAeUL5wk",
    authDomain: "e-commerce-602fb.firebaseapp.com",
    projectId: "e-commerce-602fb",
    storageBucket: "e-commerce-602fb.firebasestorage.app",
    messagingSenderId: "565262782829",
    appId: "1:565262782829:web:e7cc1178c4a6df6b6fca64",
    measurementId: "G-ZC6N6K969D"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// DOM Elements
const cartItemsContainer = document.getElementById('cart-items');
const cartCountElement = document.getElementById('cart-count');
const subtotalElement = document.getElementById('subtotal');
const shippingElement = document.getElementById('shipping');
const taxElement = document.getElementById('tax');
const totalElement = document.getElementById('total');
const checkoutButton = document.getElementById('checkout-button');
const continueShoppingBtn = document.getElementById('continue-shopping');
const startShoppingBtn = document.getElementById('start-shopping');

// Cart data
let cartItems = [];
let cartTotal = 0;

// Initialize the cart page
function initCartPage() {
    // Check if user is authenticated
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in, load their cart
            loadCartItems(user.uid);
        } else {
            // No user is signed in, show empty cart
            showEmptyCart();
        }
    });

    // Set up event listeners
    continueShoppingBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    startShoppingBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    checkoutButton.addEventListener('click', proceedToCheckout);
}

// Load cart items from Firebase
function loadCartItems(userId) {
    const cartRef = database.ref(`users/${userId}/cart`);
    
    cartRef.on('value', (snapshot) => {
        const cartData = snapshot.val();
        
        if (cartData && Object.keys(cartData).length > 0) {
            // Convert cart data to array
            cartItems = Object.keys(cartData).map(productId => {
                return {
                    id: productId,
                    ...cartData[productId]
                };
            });
            
            // Display cart items
            displayCartItems();
            
            // Calculate and display totals
            calculateTotals();
        } else {
            // Cart is empty
            showEmptyCart();
        }
    });
}

// Display cart items in the UI
function displayCartItems() {
    // Clear the cart items container
    cartItemsContainer.innerHTML = '';
    
    // Update cart count
    cartCountElement.textContent = cartItems.length;
    
    // Add each cart item to the container
    cartItems.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.dataset.id = item.id;
        
        cartItemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="cart-item-details">
                <div>
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">¥${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <input type="number" class="quantity-value" value="${item.quantity}" min="1" data-id="${item.id}">
                        <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                    <button class="remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Add event listeners to quantity controls and remove buttons
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', decreaseQuantity);
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', increaseQuantity);
    });
    
    document.querySelectorAll('.quantity-value').forEach(input => {
        input.addEventListener('change', updateQuantity);
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', removeItem);
    });
}

// Show empty cart message
function showEmptyCart() {
    cartItemsContainer.innerHTML = `
        <div class="empty-cart-message">
            <i class="fas fa-shopping-cart"></i>
            <p>Your cart is empty</p>
            <button id="start-shopping" class="primary-button">Start Shopping</button>
        </div>
    `;
    
    cartCountElement.textContent = '0';
    subtotalElement.textContent = '¥0';
    shippingElement.textContent = '¥0';
    taxElement.textContent = '¥0';
    totalElement.textContent = '¥0';
    checkoutButton.disabled = true;
    
    // Reattach event listener to the new button
    document.getElementById('start-shopping').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// Calculate order totals
function calculateTotals() {
    // Calculate subtotal
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate shipping (fixed for demo)
    const shipping = subtotal > 100 ? 0 : 10;
    
    // Calculate tax (10% for demo)
    const tax = subtotal * 0.1;
    
    // Calculate total
    const total = subtotal + shipping + tax;
    
    // Update UI
    subtotalElement.textContent = `¥${subtotal.toFixed(2)}`;
    shippingElement.textContent = `¥${shipping.toFixed(2)}`;
    taxElement.textContent = `¥${tax.toFixed(2)}`;
    totalElement.textContent = `¥${total.toFixed(2)}`;
    
    // Enable checkout button if cart has items
    checkoutButton.disabled = cartItems.length === 0;
    
    // Store total for checkout
    cartTotal = total;
}

// Quantity control functions
function decreaseQuantity(e) {
    const productId = e.target.dataset.id;
    const item = cartItems.find(item => item.id === productId);
    
    if (item && item.quantity > 1) {
        updateCartItemQuantity(productId, item.quantity - 1);
    }
}

function increaseQuantity(e) {
    const productId = e.target.dataset.id;
    const item = cartItems.find(item => item.id === productId);
    
    if (item) {
        updateCartItemQuantity(productId, item.quantity + 1);
    }
}

function updateQuantity(e) {
    const productId = e.target.dataset.id;
    const newQuantity = parseInt(e.target.value);
    
    if (newQuantity > 0) {
        updateCartItemQuantity(productId, newQuantity);
    } else {
        e.target.value = 1;
    }
}

// Update item quantity in Firebase
function updateCartItemQuantity(productId, newQuantity) {
    const user = auth.currentUser;
    if (!user) return;
    
    database.ref(`users/${user.uid}/cart/${productId}/quantity`).set(newQuantity)
        .catch(error => {
            console.error('Error updating quantity:', error);
            alert('Failed to update quantity. Please try again.');
        });
}

// Remove item from cart
function removeItem(e) {
    const productId = e.target.dataset.id;
    const user = auth.currentUser;
    if (!user) return;
    
    if (confirm('Are you sure you want to remove this item from your cart?')) {
        database.ref(`users/${user.uid}/cart/${productId}`).remove()
            .catch(error => {
                console.error('Error removing item:', error);
                alert('Failed to remove item. Please try again.');
            });
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (cartItems.length === 0) return;
    
    // In a real app, you would redirect to checkout page
    alert(`Proceeding to checkout with total: ¥${cartTotal.toFixed(2)}`);
    
    // For demo, we'll just clear the cart
    const user = auth.currentUser;
    if (user) {
        database.ref(`users/${user.uid}/cart`).remove()
            .then(() => {
                alert('Order placed successfully!');
                showEmptyCart();
            })
            .catch(error => {
                console.error('Error during checkout:', error);
                alert('Failed to complete checkout. Please try again.');
            });
    }
}

// Initialize the cart page when DOM is loaded
document.addEventListener('DOMContentLoaded', initCartPage);