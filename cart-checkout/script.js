// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// DOM Elements
const cartIcon = document.getElementById('cart-icon');
const cartPreview = document.getElementById('cart-preview');
const cartCount = document.querySelector('.cart-count');
const previewItems = document.getElementById('preview-items');
const previewTotal = document.getElementById('preview-total');
const cartItems = document.getElementById('cart-items');
const subtotal = document.getElementById('subtotal');
const shipping = document.getElementById('shipping');
const tax = document.getElementById('tax');
const total = document.getElementById('total');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const closeModal = document.getElementById('close-modal');
const steps = document.querySelectorAll('.step');
const checkoutSteps = document.querySelectorAll('.checkout-step');
const nextToPayment = document.getElementById('next-to-payment');
const backToShipping = document.getElementById('back-to-shipping');
const nextToConfirm = document.getElementById('next-to-confirm');
const backToPayment = document.getElementById('back-to-payment');
const placeOrder = document.getElementById('place-order');
const orderSuccess = document.getElementById('order-success');
const confirmationItems = document.getElementById('confirmation-items');
const confirmSubtotal = document.getElementById('confirm-subtotal');
const confirmShipping = document.getElementById('confirm-shipping');
const confirmTax = document.getElementById('confirm-tax');
const confirmTotal = document.getElementById('confirm-total');
const confirmShippingAddress = document.getElementById('confirm-shipping-address');
const confirmShippingMethod = document.getElementById('confirm-shipping-method');
const confirmPaymentMethod = document.getElementById('confirm-payment-method');
const orderNumber = document.getElementById('order-number');
const shippingForm = document.getElementById('shipping-form');
const paymentForm = document.getElementById('payment-form');

// Cart Data
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    
    // Load cart from Firebase if user is logged in
    auth.onAuthStateChanged(user => {
        if (user) {
            loadCartFromFirebase(user.uid);
        }
    });
});

// Toggle cart preview
cartIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    cartPreview.style.display = cartPreview.style.display === 'block' ? 'none' : 'block';
});

// Close cart preview when clicking outside
document.addEventListener('click', (e) => {
    if (!cartPreview.contains(e.target) ){
        cartPreview.style.display = 'none';
    }
});

// Update cart UI
function updateCartUI() {
    // Update cart count
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = itemCount;
    
    // Update cart preview
    updateCartPreview();
    
    // Update main cart
    updateMainCart();
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Save to Firebase if user is logged in
    const user = auth.currentUser;
    if (user) {
        saveCartToFirebase(user.uid);
    }
}

// Update cart preview
function updateCartPreview() {
    if (cart.length === 0) {
        previewItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        previewTotal.textContent = '$0.00';
        return;
    }
    
    let previewHTML = '';
    let calculatedTotal = 0;
    
    cart.forEach(item => {
        calculatedTotal += item.price * item.quantity;
        previewHTML += `
            <div class="cart-preview-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-preview-item-details">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
                </div>
            </div>
        `;
    });
    
    previewItems.innerHTML = previewHTML;
    previewTotal.textContent = `$${calculatedTotal.toFixed(2)}`;
}

// Update main cart
function updateMainCart() {
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <a href="../products.html" class="btn">Continue Shopping</a>
            </div>
        `;
        subtotal.textContent = '$0.00';
        tax.textContent = '$0.00';
        total.textContent = '$5.99';
        return;
    }
    
    let cartHTML = '';
    let calculatedSubtotal = 0;
    
    cart.forEach((item, index) => {
        calculatedSubtotal += item.price * item.quantity;
        cartHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p class="cart-item-vendor">Sold by: ${item.vendor}</p>
                    <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn minus" data-index="${index}">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-index="${index}">
                            <button class="quantity-btn plus" data-index="${index}">+</button>
                        </div>
                        <span class="remove-item" data-index="${index}">Remove</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = cartHTML;
    
    // Calculate totals
    const shippingCost = parseFloat(shipping.textContent.replace('$', ''));
    const calculatedTax = calculatedSubtotal * 0.1; // 10% tax
    const calculatedTotal = calculatedSubtotal + shippingCost + calculatedTax;
    
    subtotal.textContent = `$${calculatedSubtotal.toFixed(2)}`;
    tax.textContent = `$${calculatedTax.toFixed(2)}`;
    total.textContent = `$${calculatedTotal.toFixed(2)}`;
    
    // Add event listeners to quantity controls
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', decreaseQuantity);
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', increaseQuantity);
    });
    
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', updateQuantity);
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', removeItem);
    });
}

// Quantity control functions
function decreaseQuantity(e) {
    const index = e.target.dataset.index;
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        updateCartUI();
    }
}

function increaseQuantity(e) {
    const index = e.target.dataset.index;
    cart[index].quantity++;
    updateCartUI();
}

function updateQuantity(e) {
    const index = e.target.dataset.index;
    const newQuantity = parseInt(e.target.value);
    
    if (newQuantity > 0) {
        cart[index].quantity = newQuantity;
        updateCartUI();
    } else {
        e.target.value = cart[index].quantity;
    }
}

function removeItem(e) {
    const index = e.target.dataset.index;
    cart.splice(index, 1);
    updateCartUI();
}

// Checkout process
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items to your cart before checkout.');
        return;
    }
    
    checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeModal.addEventListener('click', () => {
    checkoutModal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Step navigation
nextToPayment.addEventListener('click', () => {
    if (shippingForm.checkValidity()) {
        goToStep(2);
    } else {
        shippingForm.reportValidity();
    }
});

backToShipping.addEventListener('click', () => {
    goToStep(1);
});

nextToConfirm.addEventListener('click', () => {
    if (paymentForm.checkValidity()) {
        updateConfirmation();
        goToStep(3);
    } else {
        paymentForm.reportValidity();
    }
});

backToPayment.addEventListener('click', () => {
    goToStep(2);
});

function goToStep(stepNumber) {
    // Update step indicators
    steps.forEach(step => {
        if (parseInt(step.dataset.step) <= stepNumber) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Show the correct step content
    checkoutSteps.forEach(step => {
        if (step.id === `step-${stepNumber}`) {
            step.style.display = 'block';
        } else {
            step.style.display = 'none';
        }
    });
}

// Update confirmation page
function updateConfirmation() {
    // Update order items
    let confirmationHTML = '';
    let calculatedSubtotal = 0;
    
    cart.forEach(item => {
        calculatedSubtotal += item.price * item.quantity;
        confirmationHTML += `
            <div class="confirmation-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="confirmation-item-details">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
                </div>
            </div>
        `;
    });
    
    confirmationItems.innerHTML = confirmationHTML;
    
    // Update totals
    const shippingCost = parseFloat(document.getElementById('shipping-method').value.split('$')[1]);
    const calculatedTax = calculatedSubtotal * 0.1;
    const calculatedTotal = calculatedSubtotal + shippingCost + calculatedTax;
    
    confirmSubtotal.textContent = `$${calculatedSubtotal.toFixed(2)}`;
    confirmShipping.textContent = `$${shippingCost.toFixed(2)}`;
    confirmTax.textContent = `$${calculatedTax.toFixed(2)}`;
    confirmTotal.textContent = `$${calculatedTotal.toFixed(2)}`;
    
    // Update shipping info
    const fullName = document.getElementById('full-name').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zip = document.getElementById('zip').value;
    const shippingMethod = document.getElementById('shipping-method').options[document.getElementById('shipping-method').selectedIndex].text;
    
    confirmShippingAddress.textContent = `${fullName}, ${address}, ${city}, ${state} ${zip}`;
    confirmShippingMethod.textContent = shippingMethod;
    
    // Update payment info
    const cardNumber = document.getElementById('card-number').value;
    confirmPaymentMethod.textContent = `Card ending in ${cardNumber.slice(-4)}`;
}

// Place order
placeOrder.addEventListener('click', () => {
    const user = auth.currentUser;
    const userId = user ? user.uid : 'guest';
    
    // Create order data
    const orderData = {
        items: cart,
        shipping: {
            name: document.getElementById('full-name').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zip: document.getElementById('zip').value,
            method: document.getElementById('shipping-method').options[document.getElementById('shipping-method').selectedIndex].text
        },
        payment: {
            cardName: document.getElementById('card-name').value,
            cardNumber: document.getElementById('card-number').value,
            expiryDate: document.getElementById('expiry-date').value,
            cvv: document.getElementById('cvv').value
        },
        subtotal: parseFloat(confirmSubtotal.textContent.replace('$', '')),
        shippingCost: parseFloat(confirmShipping.textContent.replace('$', '')),
        tax: parseFloat(confirmTax.textContent.replace('$', '')),
        total: parseFloat(confirmTotal.textContent.replace('$', '')),
        status: 'processing',
        date: new Date().toISOString(),
        userId: userId
    };
    
    // Save order to Firebase
    const orderRef = database.ref('orders').push();
    orderRef.set(orderData)
        .then(() => {
            // Generate order number
            const orderNum = `ORD-${Date.now().toString().slice(-8)}`;
            orderNumber.textContent = orderNum;
            
            // Update UI to show success
            document.getElementById('step-3').style.display = 'none';
            orderSuccess.style.display = 'block';
            
            // Clear cart
            cart = [];
            updateCartUI();
            
            // If user is logged in, clear their cart in Firebase
            if (user) {
                database.ref(`carts/${user.uid}`).remove();
            }
        })
        .catch(error => {
            console.error('Error saving order:', error);
            alert('There was an error processing your order. Please try again.');
        });
});

// Firebase functions
function saveCartToFirebase(userId) {
    database.ref(`carts/${userId}`).set(cart)
        .catch(error => {
            console.error('Error saving cart to Firebase:', error);
        });
}

function loadCartFromFirebase(userId) {
    database.ref(`carts/${userId}`).once('value')
        .then(snapshot => {
            const firebaseCart = snapshot.val();
            if (firebaseCart) {
                cart = firebaseCart;
                updateCartUI();
            }
        })
        .catch(error => {
            console.error('Error loading cart from Firebase:', error);
        });
}

// Shipping method change
document.getElementById('shipping-method').addEventListener('change', (e) => {
    const shippingCost = parseFloat(e.target.value.split('$')[1]);
    shipping.textContent = `$${shippingCost.toFixed(2)}`;
    
    // Recalculate total
    const currentSubtotal = parseFloat(subtotal.textContent.replace('$', ''));
    const currentTax = currentSubtotal * 0.1;
    const currentTotal = currentSubtotal + shippingCost + currentTax;
    
    tax.textContent = `$${currentTax.toFixed(2)}`;
    total.textContent = `$${currentTotal.toFixed(2)}`;
});