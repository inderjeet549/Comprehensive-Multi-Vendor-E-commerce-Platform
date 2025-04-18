// Import Firebase modules from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const categoriesGrid = document.getElementById('categories-grid');
const productsGrid = document.getElementById('products-grid');
const testimonialsGrid = document.getElementById('testimonials-grid');
const cartCount = document.querySelector('.cart-count');
const wishlistCount = document.querySelector('.wishlist-count');

// Initialize store
function initStore() {
    loadCategories();
    loadProducts();
    loadTestimonials();
    loadUserData();
    setupEventListeners();
}

// Load categories from Firestore or fallback
async function loadCategories() {
    try {
        const snapshot = await getDocs(collection(db, 'categories'));
        const categories = snapshot.docs.map(doc => doc.data().name);

        if (categories.length === 0) {
            console.warn("No categories found in Firestore. Falling back to FakeStore API.");
            return loadCategoriesFromFakeStore();
        }

        displayCategories(categories);
    } catch (error) {
        console.error('Error loading categories from Firestore:', error);
        loadCategoriesFromFakeStore();
    }
}

async function loadCategoriesFromFakeStore() {
    try {
        const response = await fetch('https://fakestoreapi.com/products/categories');
        const categories = await response.json();
        displayCategories(categories);
    } catch (error) {
        console.error('Error loading categories from FakeStore:', error);
        categoriesGrid.innerHTML = '<p>Error loading categories. Please try again later.</p>';
    }
}

function displayCategories(categories) {
    categoriesGrid.innerHTML = '';
    categories.slice(0, 4).forEach(category => {
        const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
        const categoryCard = document.createElement('a');
        categoryCard.className = 'category-card';
        categoryCard.href = `#${category}`;
        categoryCard.innerHTML = `
            <div class="category-image">
                <img src="https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg" alt="${formattedCategory}">
            </div>
            <div class="category-info">
                <h4>${formattedCategory}</h4>
                <p>Shop now</p>
            </div>
        `;
        categoriesGrid.appendChild(categoryCard);
    });
}

// Load products from Firestore or fallback
async function loadProducts() {
    try {
        const snapshot = await getDocs(collection(db, 'products'));
        const products = snapshot.docs.map(doc => doc.data());

        if (products.length === 0) {
            console.warn("No products in Firestore. Falling back to FakeStore API.");
            return loadProductsFromFakeStore();
        }

        displayProducts(products);
    } catch (error) {
        console.error('Error loading products from Firestore:', error);
        loadProductsFromFakeStore();
    }
}

async function loadProductsFromFakeStore() {
    try {
        const response = await fetch('https://fakestoreapi.com/products?limit=8');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products from FakeStore:', error);
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
                <img src="${product.imageUrl || 'https://via.placeholder.com/150'}" alt="${product.itemName || 'Product'}">
            </div>
            <div class="product-info">
                <div class="product-title">${product.itemName}</div>
                <div class="product-price">₹${product.price}</div>
                <div class="product-rating">
                    ${generateStarRating(product.rating?.rate || 4)}
                    <span>(${product.rating?.count || 100})</span>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart" data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="add-to-wishlist" data-id="${product.id}">
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

function loadUserData() {
    const userData = {
        cartCount: 0,
        wishlistCount: 0
    };
    cartCount.textContent = userData.cartCount;
    wishlistCount.textContent = userData.wishlistCount;
}

function setupEventListeners() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add-to-cart')) {
            const button = e.target.closest('.add-to-cart');
            const productId = button.dataset.id;
            addToCart(productId);
        }
        if (e.target.closest('.add-to-wishlist')) {
            const button = e.target.closest('.add-to-wishlist');
            const productId = button.dataset.id;
            addToWishlist(productId);
        }
    });

    document.getElementById('user-account').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = "/user-dashboard.html";
    });

    document.getElementById('wishlist').addEventListener('click', function(e) {
        e.preventDefault();
        alert('Wishlist page would open here');
    });

    document.getElementById('cart').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = "/cart2/cart.html";
    });
}

function addToCart(productId) {
    console.log(`Added product ${productId} to cart`);
    // localStorage.add(productId);
    const currentCount = parseInt(cartCount.textContent);
    cartCount.textContent = currentCount + 1;
    alert('Product added to cart!');
}

function addToWishlist(productId) {
    console.log(`Added product ${productId} to wishlist`);
    const currentCount = parseInt(wishlistCount.textContent);
    wishlistCount.textContent = currentCount + 1;
    alert('Product added to wishlist!');
}

// Start everything on page load
window.addEventListener('DOMContentLoaded', initStore);
