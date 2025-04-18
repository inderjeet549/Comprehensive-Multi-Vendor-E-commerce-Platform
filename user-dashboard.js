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

// DOM elements
const totalOrdersEl = document.getElementById('total-orders');
const orderChangeEl = document.getElementById('order-change');
const totalSpendingEl = document.getElementById('total-spending');
const spendingChangeEl = document.getElementById('spending-change');
const savedItemsEl = document.getElementById('saved-items');
const savedChangeEl = document.getElementById('saved-change');
const processingPercentEl = document.getElementById('processing-percent');
const processingCountEl = document.getElementById('processing-count');
const shippedPercentEl = document.getElementById('shipped-percent');
const shippedCountEl = document.getElementById('shipped-count');
const deliveredPercentEl = document.getElementById('delivered-percent');
const deliveredCountEl = document.getElementById('delivered-count');
const ordersListEl = document.getElementById('orders-list');
const transactionsListEl = document.getElementById('transactions-list');
const navItems = document.querySelectorAll('.nav-item');
const logoutBtn = document.getElementById('logout-btn');
const userGreeting = document.getElementById('user-greeting');

// Initialize the dashboard
function initDashboard() {
    // Check authentication state
    auth.onAuthStateChanged((user) => {
        if (!user) {
            // User not logged in, redirect to login
            window.location.href = 'login.html';
            return;
        }

        // User is logged in
        displayUserInfo(user);
        loadUserStats(user.uid);
        loadRecentOrders(user.uid);
        loadPaymentHistory(user.uid);
        setupNavigation();
        setupEventListeners();
    });
}

// Display user information
function displayUserInfo(user) {
    userGreeting.textContent = `Welcome, ${user.email || 'User'}!`;
}

// Load user statistics from Firebase
function loadUserStats(userId) {
    // Reference to user's stats in Firebase
    const userStatsRef = database.ref(`users/${userId}/stats`);
    
    userStatsRef.once('value').then((snapshot) => {
        const userStats = snapshot.val() || getDefaultStats();
        
        // Update the UI with the stats
        updateStatsUI(userStats);
    }).catch((error) => {
        console.error('Error loading user stats:', error);
        updateStatsUI(getDefaultStats());
    });
}

function getDefaultStats() {
    return {
        totalOrders: 0,
        orderChange: 0,
        totalSpending: 0,
        spendingChange: 0,
        savedItems: 0,
        savedChange: 0,
        orderStatus: {
            processing: 0,
            shipped: 0,
            delivered: 0
        }
    };
}

function updateStatsUI(userStats) {
    totalOrdersEl.textContent = userStats.totalOrders;
    orderChangeEl.textContent = `${userStats.orderChange}% vs last month`;
    totalSpendingEl.textContent = `₹${(userStats.totalSpending / 1000).toFixed(1)}K`;
    spendingChangeEl.textContent = `${userStats.spendingChange}% vs last month`;
    savedItemsEl.textContent = userStats.savedItems;
    savedChangeEl.textContent = `+${userStats.savedChange} vs last month`;
    
    const totalOrders = userStats.totalOrders || 1;
    const processingPercent = Math.round((userStats.orderStatus.processing / totalOrders) * 100);
    const shippedPercent = Math.round((userStats.orderStatus.shipped / totalOrders) * 100);
    const deliveredPercent = Math.round((userStats.orderStatus.delivered / totalOrders) * 100);
    
    processingPercentEl.textContent = `${processingPercent}%`;
    processingCountEl.textContent = `${userStats.orderStatus.processing}/${totalOrders} Orders`;
    shippedPercentEl.textContent = `${shippedPercent}%`;
    shippedCountEl.textContent = `${userStats.orderStatus.shipped}/${totalOrders} Orders`;
    deliveredPercentEl.textContent = `${deliveredPercent}%`;
    deliveredCountEl.textContent = `${userStats.orderStatus.delivered}/${totalOrders} Orders`;
}

// Load recent orders from Firebase
function loadRecentOrders(userId) {
    const ordersRef = database.ref(`users/${userId}/orders`).limitToLast(4);
    
    ordersRef.once('value').then((snapshot) => {
        const orders = [];
        snapshot.forEach((childSnapshot) => {
            orders.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        displayOrders(orders.length ? orders : getMockOrders());
    }).catch((error) => {
        console.error('Error loading orders:', error);
        displayOrders(getMockOrders());
    });
}

function getMockOrders() {
    return [
        {
            date: "01/04/2024",
            product: "ZithroMax Antibiotic",
            location: "New York, USA",
            orderId: "P12345",
            vendor: "PharmaQuick Ltd",
            status: "In Transit"
        },
        {
            date: "02/04/2024",
            product: "Panadol Extra Strength",
            location: "London, UK",
            orderId: "ZH2345",
            vendor: "Reliable Remedies",
            status: "Pending"
        }
    ];
}

function displayOrders(orders) {
    ordersListEl.innerHTML = '';
    
    orders.forEach(order => {
        const orderEl = document.createElement('div');
        orderEl.className = 'order-item';
        
        let statusClass = '';
        if (order.status === 'Pending') statusClass = 'status-pending';
        else if (order.status === 'Shipped' || order.status === 'In Transit') statusClass = 'status-shipped';
        else if (order.status === 'Delivered') statusClass = 'status-delivered';
        
        orderEl.innerHTML = `
            <div class="order-info">
                <div class="order-date">${order.date}</div>
                <div class="order-product">${order.product}</div>
                <div class="order-location">${order.location}</div>
            </div>
            <div class="order-details">
                <div class="order-id">${order.orderId}</div>
                <div class="order-vendor">${order.vendor}</div>
                <div class="order-status ${statusClass}">${order.status}</div>
            </div>
        `;
        
        ordersListEl.appendChild(orderEl);
    });
}

// Load payment history from Firebase
function loadPaymentHistory(userId) {
    const paymentsRef = database.ref(`users/${userId}/payments`).limitToLast(5);
    
    paymentsRef.once('value').then((snapshot) => {
        const payments = [];
        snapshot.forEach((childSnapshot) => {
            payments.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        displayPayments(payments.length ? payments : getMockPayments());
    }).catch((error) => {
        console.error('Error loading payments:', error);
        displayPayments(getMockPayments());
    });
}

function getMockPayments() {
    return [
        { date: "05/04/2024", amount: 1200 },
        { date: "12/04/2024", amount: 950 }
    ];
}

function displayPayments(payments) {
    transactionsListEl.innerHTML = '';
    
    payments.forEach(payment => {
        const paymentEl = document.createElement('div');
        paymentEl.className = 'transaction-item';
        paymentEl.innerHTML = `
            <div class="transaction-amount">-₹${payment.amount}</div>
            <div class="transaction-date">${payment.date}</div>
        `;
        
        transactionsListEl.appendChild(paymentEl);
    });
}

// Set up navigation
function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            navItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            item.classList.add('active');
            
            // In a real app, load the appropriate section here
            console.log(`Loading ${item.dataset.section} section...`);
        });
    });
}

// Set up event listeners
function setupEventListeners() {
    document.getElementById('track-order').addEventListener('click', () => {
        window.location.href = 'order-tracking/index.html';
    });
    
    document.getElementById('view-wishlist').addEventListener('click', () => {
        window.location.href = 'wishlist.html';
    });
    
    document.getElementById('contact-support').addEventListener('click', () => {
        window.location.href = 'cart2/cart.html';
    });

    // Logout functionality
    logoutBtn.addEventListener('click', handleLogout);
}

auth.onAuthStateChanged((user) => {
    if (!user) {
        // User is not logged in, redirect to login page
        window.location.href = 'login.html';
    } else {
        // User is logged in, initialize the dashboard
        initDashboard(user);
    }
});

// Modify the initDashboard function to accept user parameter
function initDashboard(user) {
    // Display user info
    document.getElementById('user-greeting').textContent = `Welcome, ${user.email || 'User'}!`;
    
    // Load dashboard data
    loadUserStats(user.uid);
    loadRecentOrders(user.uid);
    loadPaymentHistory(user.uid);
    setupNavigation();
    setupEventListeners();
}

// Update the logout function
function handleLogout() {
    auth.signOut().then(() => {
        alert('You have been logged out successfully');
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Logout error:', error);
        alert('Error logging out. Please try again.');
    });
}

// Initialize the dashboard when the page loads
window.addEventListener('DOMContentLoaded', initDashboard);