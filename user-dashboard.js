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

// Mock user ID (in a real app, you'd get this after authentication)
const userId = "user123";

// Initialize the dashboard
function initDashboard() {
    // Load user data
    loadUserStats();
    loadRecentOrders();
    loadPaymentHistory();
    
    // Set up navigation
    setupNavigation();
    
    // Set up button event listeners
    document.getElementById('track-order').addEventListener('click', () => {
        alert('Track Order feature would open here');
    });
    
    document.getElementById('view-wishlist').addEventListener('click', () => {
        alert('Wishlist would open here');
    });
    
    document.getElementById('contact-support').addEventListener('click', () => {
        alert('Support chat would open here');
    });
}

// Load user statistics
function loadUserStats() {
    // In a real app, you would fetch this from Firebase
    // For demo purposes, we'll use mock data
    
    // Mock data for user stats
    const userStats = {
        totalOrders: 120,
        orderChange: 15,
        totalSpending: 82000,
        spendingChange: 7,
        savedItems: 32,
        savedChange: 5,
        orderStatus: {
            processing: 30,
            shipped: 48,
            delivered: 42
        }
    };
    
    // Update the UI with the stats
    totalOrdersEl.textContent = userStats.totalOrders;
    orderChangeEl.textContent = `${userStats.orderChange}% vs last month`;
    totalSpendingEl.textContent = `₹${(userStats.totalSpending / 1000).toFixed(1)}K`;
    spendingChangeEl.textContent = `${userStats.spendingChange}% vs last month`;
    savedItemsEl.textContent = userStats.savedItems;
    savedChangeEl.textContent = `+${userStats.savedChange} vs last month`;
    
    // Calculate percentages for order status
    const totalOrders = userStats.totalOrders;
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

// Load recent orders
function loadRecentOrders() {
    // Mock data for recent orders
    const recentOrders = [
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
        },
        {
            date: "24/05/2024",
            product: "CiproCure 500mg",
            location: "Mumbai, India",
            orderId: "PX6789",
            vendor: "HealthCorp Inc.",
            status: "Delivered"
        },
        {
            date: "11/04/2024",
            product: "AmoxiHeal 250mg",
            location: "Sydney, AUS",
            orderId: "AM4567",
            vendor: "MediCare Solutions",
            status: "Shipped"
        }
    ];
    
    // Clear the orders list
    ordersListEl.innerHTML = '';
    
    // Add each order to the list
    recentOrders.forEach(order => {
        const orderEl = document.createElement('div');
        orderEl.className = 'order-item';
        
        // Determine status class
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

// Load payment history
function loadPaymentHistory() {
    // Mock data for payment history
    const paymentHistory = [
        { date: "05/04/2024", amount: 1200 },
        { date: "12/04/2024", amount: 950 },
        { date: "18/04/2024", amount: 2500 },
        { date: "25/04/2024", amount: 800 },
        { date: "02/05/2024", amount: 1500 }
    ];
    
    // Clear the transactions list
    transactionsListEl.innerHTML = '';
    
    // Add each transaction to the list
    paymentHistory.forEach(transaction => {
        const transactionEl = document.createElement('div');
        transactionEl.className = 'transaction-item';
        transactionEl.innerHTML = `
            <div class="transaction-amount">-¥${transaction.amount}</div>
            <div class="transaction-date">${transaction.date}</div>
        `;
        
        transactionsListEl.appendChild(transactionEl);
    });
}

// Set up navigation
function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // In a real app, you would load the appropriate section here
            alert(`Loading ${item.dataset.section} section...`);
        });
    });
}

// Initialize the dashboard when the page loads
window.addEventListener('DOMContentLoaded', initDashboard);