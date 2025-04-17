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
const categoriesGrid = document.getElementById('categories-grid');
const productsGrid = document.getElementById('products-grid');
const testimonialsGrid = document.getElementById('testimonials-grid');
const cartCount = document.querySelector('.cart-count');
const wishlistCount = document.querySelector('.wishlist-count');

// Initialize the store
function initStore() {
    // Load categories from FakeStore API
    loadCategories();
    
    // Load products from FakeStore API
    loadProducts();
    
    // Load testimonials from Firebase
    loadTestimonials();
    
    // Load user cart and wishlist count from Firebase
    loadUserData();
    
    // Set up event listeners
    setupEventListeners();
}

// Load categories from FakeStore API
async function loadCategories() {
    try {
        const response = await fetch('https://fakestoreapi.com/products/categories');
        const categories = await response.json();
        
        // Display categories
        categoriesGrid.innerHTML = '';
        categories.slice(0, 4).forEach(category => {
            const categoryCard = document.createElement('a');
            categoryCard.className = 'category-card';
            categoryCard.href = `#${category}`;
            
            // Format category name
            const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
            
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
    } catch (error) {
        console.error('Error loading categories:', error);
        categoriesGrid.innerHTML = '<p>Error loading categories. Please try again later.</p>';
    }
}

// Load products from FakeStore API
async function loadProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products?limit=8');
        const products = await response.json();
        
        // Display products
        productsGrid.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            // Check if product is on sale (random for demo)
            const onSale = Math.random() > 0.7;
            
            productCard.innerHTML = `
                ${onSale ? '<div class="product-badge">Sale</div>' : ''}
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <div class="product-info">
                    <div class="product-title">${product.title}</div>
                    <div class="product-price">$${product.price}</div>
                    <div class="product-rating">
                        ${generateStarRating(product.rating.rate)}
                        <span>(${product.rating.count})</span>
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
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

// Generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    return stars;
}

// Load testimonials from Firebase
function loadTestimonials() {
    // In a real app, you would fetch from Firebase
    // For demo, we'll use mock data that would come from Firebase
    
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
    
    // Display testimonials
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

// Load user data from Firebase
function loadUserData() {
    // In a real app, you would fetch the authenticated user's data from Firebase
    // For demo, we'll use mock data
    
    const userData = {
        cartCount: 3,
        wishlistCount: 5
    };
    
    // Update UI
    cartCount.textContent = userData.cartCount;
    wishlistCount.textContent = userData.wishlistCount;
}

// Set up event listeners
function setupEventListeners() {
    // Add to cart buttons
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
    
    // User account link
    document.getElementById('user-account').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = "/user-dashboard.html"; // Redirect to user account page
        // alert('User account page would open here');
    });
    
    // Wishlist link
    document.getElementById('wishlist').addEventListener('click', function(e) {
        e.preventDefault();
        alert('Wishlist page would open here');
    });
    
    // Cart link
    document.getElementById('cart').addEventListener('click', function(e) {
        e.preventDefault();
        alert('Cart page would open here');
    });
}

// Add product to cart
function addToCart(productId) {
    // In a real app, you would update Firebase
    console.log(`Added product ${productId} to cart`);
    
    // Update UI
    const currentCount = parseInt(cartCount.textContent);
    cartCount.textContent = currentCount + 1;
    
    // Show feedback
    alert('Product added to cart!');
}

// Add product to wishlist
function addToWishlist(productId) {
    // In a real app, you would update Firebase
    console.log(`Added product ${productId} to wishlist`);
    
    // Update UI
    const currentCount = parseInt(wishlistCount.textContent);
    wishlistCount.textContent = currentCount + 1;
    
    // Show feedback
    alert('Product added to wishlist!');
}

// Initialize the store when the page loads
window.addEventListener('DOMContentLoaded', initStore);