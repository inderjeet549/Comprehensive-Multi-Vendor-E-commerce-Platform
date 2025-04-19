// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBacyV04HeeJPRvUQOAOYqIEN7fAeUL5wk",
    authDomain: "e-commerce-602fb.firebaseapp.com",
    projectId: "e-commerce-602fb",
    storageBucket: "e-commerce-602fb.appspot.com",
    messagingSenderId: "565262782829",
    appId: "1:565262782829:web:e7cc1178c4a6df6b6fca64",
    measurementId: "G-ZC6N6K969D"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// DOM Elements
const categoriesGrid = document.getElementById('categories-grid');
const productsGrid = document.getElementById('products-grid');
const testimonialsGrid = document.getElementById('testimonials-grid');
const cartCount = document.querySelector('.cart-count');
const wishlistCount = document.querySelector('.wishlist-count');
const darkModeToggle = document.getElementById('darkModeToggle');
const loginLink = document.getElementById('login-link');
const userAccountLink = document.getElementById('user-account');

// Check authentication state
function checkAuth() {
    return new Promise((resolve) => {
        auth.onAuthStateChanged((user) => {
            resolve(!!user);
        });
    });
}

// Update UI based on auth status
async function updateAuthUI() {
    const isAuthenticated = await checkAuth();
    if (loginLink) loginLink.style.display = isAuthenticated ? 'none' : 'block';
    if (userAccountLink) userAccountLink.style.display = isAuthenticated ? 'block' : 'none';
}

// Initialize the store
async function initStore() {
    await updateAuthUI();
    loadCategories();
    loadProducts();
    loadTestimonials();
    loadUserData();
    setupEventListeners();
    
    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Load categories
async function loadCategories() {
    try {
        const snapshot = await db.collection('categories').get();
        const categories = snapshot.docs.map(doc => doc.data().name);

        if (categories.length === 0) {
            return loadCategoriesFromFakeStore();
        }

        displayCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        loadCategoriesFromFakeStore();
    }
}

async function loadCategoriesFromFakeStore() {
    try {
        const response = await fetch('https://fakestoreapi.com/products/categories');
        const categories = await response.json();
        displayCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        categoriesGrid.innerHTML = '<p>Error loading categories. Please try again later.</p>';
    }
}

function displayCategories(categories) {
    categoriesGrid.innerHTML = '';
    const categoryImages = {
        "electronics": "https://fakestoreapi.com/img/81Zt42ioCgL._AC_SX679_.jpg",
        "jewelery": "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg",
        "men's clothing": "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
        "women's clothing": "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg"
    };

    categories.slice(0, 4).forEach(category => {
        const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
        const categoryCard = document.createElement('a');
        categoryCard.className = 'category-card';
        categoryCard.href = `#${category}`;
        categoryCard.innerHTML = `
            <div class="category-image">
                <img src="${categoryImages[category] || 'https://via.placeholder.com/300'}" alt="${formattedCategory}">
            </div>
            <div class="category-info">
                <h4>${formattedCategory}</h4>
                <p>Shop now</p>
            </div>
        `;
        categoriesGrid.appendChild(categoryCard);
    });
}

// Load products
async function loadProducts() {
    try {
        const snapshot = await db.collection('products').limit(8).get();
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (products.length === 0) {
            return loadProductsFromFakeStore();
        }

        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        loadProductsFromFakeStore();
    }
}

async function loadProductsFromFakeStore() {
    try {
        const response = await fetch('https://fakestoreapi.com/products?limit=8');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

function displayProducts(products) {
    productsGrid.innerHTML = '';
    products.forEach(product => {
        const onSale = Math.random() > 0.7;
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            ${onSale ? '<div class="product-badge">Sale</div>' : ''}
            <div class="product-image">
                <img src="${product.image || product.imageUrl || 'https://via.placeholder.com/150'}" alt="${product.title || product.itemName || 'Product'}">
            </div>
            <div class="product-info">
                <div class="product-title">${product.title || product.itemName || 'Unnamed Product'}</div>
                <div class="product-price">₹${(product.price || 0).toFixed(2)}</div>
                <div class="product-rating">
                    ${generateStarRating(product.rating?.rate || 4)}
                    <span>(${product.rating?.count || 100})</span>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart" onClick=(addToCart()) data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="add-to-wishlist" onClick=(addToWishlist()) data-id="${product.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) stars += '<i class="fas fa-star"></i>';
        else if (i === fullStars && hasHalfStar) stars += '<i class="fas fa-star-half-alt"></i>';
        else stars += '<i class="far fa-star"></i>';
    }
    return stars;
}

function loadTestimonials() {
    const testimonials = [
        {
            content: "Great products and fast delivery! I'm very satisfied with my purchase.",
            author: "John Smith",
            role: "Verified Buyer",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
            content: "The quality exceeded my expectations. Will definitely shop here again!",
            author: "Sarah Johnson",
            role: "VIP Customer",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
            content: "Excellent customer service. They helped me choose the perfect product.",
            author: "Michael Brown",
            role: "First-time Buyer",
            avatar: "https://randomuser.me/api/portraits/men/67.jpg"
        }
    ];
    testimonialsGrid.innerHTML = '';
    testimonials.forEach(testimonial => {
        const testimonialCard = document.createElement('div');
        testimonialCard.className = 'testimonial-card';
        testimonialCard.innerHTML = `
            <div class="testimonial-content">
                "${testimonial.content}"
            </div>
            <div class="testimonial-author">
                <div class="author-avatar">
                    <img src="${testimonial.avatar}" alt="${testimonial.author}">
                </div>
                <div class="author-info">
                    <h5>${testimonial.author}</h5>
                    <p>${testimonial.role}</p>
                </div>
            </div>
        `;
        testimonialsGrid.appendChild(testimonialCard);
    });
}

async function loadUserData() {
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
        const user = auth.currentUser;
        // In a real app, you would fetch user-specific data here
        const userData = {
            cartCount: 0,
            wishlistCount: 0
        };
        cartCount.textContent = userData.cartCount;
        wishlistCount.textContent = userData.wishlistCount;
    } else {
        cartCount.textContent = 0;
        wishlistCount.textContent = 0;
    }
}

function setupEventListeners() {
    // Dark mode toggle
    darkModeToggle.addEventListener('click', toggleDarkMode);

    // Product actions
    document.addEventListener('click', async function(e) {
        if (e.target.closest('.add-to-cart')) {
            const button = e.target.closest('.add-to-cart');
            const productId = button.dataset.id;
            await addToCart(productId);
        }
        
        if (e.target.closest('.add-to-wishlist')) {
            const button = e.target.closest('.add-to-wishlist');
            const productId = button.dataset.id;
            await addToWishlist(productId);
        }
    });

    // User account links
    document.getElementById('user-account').addEventListener('click', async function(e) {
        e.preventDefault();
        const isAuthenticated = await checkAuth();
        if (isAuthenticated) {
            window.location.href = "/user-dashboard.html";
        } else {
            window.location.href = "/login.html";
        }
    });

    document.getElementById('wishlist').addEventListener('click', async function(e) {
        e.preventDefault();
        const isAuthenticated = await checkAuth();
        if (isAuthenticated) {
            window.location.href = "/wishlist.html";
        } else {
            alert('Please login to view your wishlist');
            window.location.href = "/login.html";
        }
    });

    document.getElementById('cart').addEventListener('click', async function(e) {
        e.preventDefault();
        const isAuthenticated = await checkAuth();
        if (isAuthenticated) {
            window.location.href = "/cart2/cart.html";
        } else {
            alert('Please login to view your cart');
            window.location.href = "/login.html";
        }
    });
}

async function addToCart(productId) {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        alert('Please login to add items to your cart');
        window.location.href = '/login.html';
        return;
    }
    
    console.log(`Added product ${productId} to cart`);
    const currentCount = parseInt(cartCount.textContent);
    cartCount.textContent = currentCount + 1;
    alert('Product added to cart!');
}

async function addToWishlist(productId) {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        alert('Please login to add items to your wishlist');
        window.location.href = '/login.html';
        return;
    }
    
    console.log(`Added product ${productId} to wishlist`);
    const currentCount = parseInt(wishlistCount.textContent);
    wishlistCount.textContent = currentCount + 1;
    alert('Product added to wishlist!');
}

// Initialize the store when the page loads
window.addEventListener('DOMContentLoaded', initStore);