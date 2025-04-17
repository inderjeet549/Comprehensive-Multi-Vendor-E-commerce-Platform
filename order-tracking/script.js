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
const orderSelect = document.getElementById('order-select');
const trackingContainer = document.getElementById('tracking-container');
const noOrderSelected = document.getElementById('no-order-selected');
const orderNumber = document.getElementById('order-number');
const orderStatus = document.getElementById('order-status');
const orderDate = document.getElementById('order-date');
const deliveryDate = document.getElementById('delivery-date');
const deliveryAddress = document.getElementById('delivery-address');
const orderTimeline = document.getElementById('order-timeline');
const driverName = document.getElementById('driver-name');
const driverVehicle = document.getElementById('driver-vehicle');
const deliveryTime = document.getElementById('delivery-time');
const orderItems = document.getElementById('order-items');
const refreshLocationBtn = document.getElementById('refresh-location');
const notificationBell = document.getElementById('notification-bell');
const notificationDropdown = document.getElementById('notifications-dropdown');
const notificationList = document.getElementById('notification-list');
const notificationCount = document.querySelector('.notification-count');

// Map Variables
let map;
let deliveryMarker;
let driverMarker;
let deliveryRoute;
let driverInterval;

// Current User and Orders Data
let currentUser = null;
let userOrders = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize map
    initMap();
    
    // Check auth state
    auth.onAuthStateChanged(user => {
        currentUser = user;
        if (user) {
            loadUserOrders(user.uid);
            setupNotifications(user.uid);
        } else {
            // Redirect to login if not authenticated
            window.location.href = '../login.html?redirect=order-tracking.html';
        }
    });
    
    // Event listeners
    orderSelect.addEventListener('change', handleOrderSelect);
    refreshLocationBtn.addEventListener('click', refreshDriverLocation);
    
    // Notification bell click
    notificationBell.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationDropdown.style.display = notificationDropdown.style.display === 'block' ? 'none' : 'block';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!notificationDropdown.contains(e.target) && e.target !== notificationBell) {
            notificationDropdown.style.display = 'none';
        }
    });
});

// Initialize the map
function initMap() {
    // Default location (can be your store location)
    const defaultLocation = [51.505, -0.09];
    
    // Create map
    map = L.map('delivery-map').setView(defaultLocation, 13);
    
    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add default marker (store location)
    L.marker(defaultLocation).addTo(map)
        .bindPopup('Our Store')
        .openPopup();
}

// Load user's orders from Firebase
function loadUserOrders(userId) {
    database.ref('orders').orderByChild('userId').equalTo(userId).once('value')
        .then(snapshot => {
            userOrders = [];
            orderSelect.innerHTML = '<option value="">-- Select an order --</option>';
            
            snapshot.forEach(orderSnapshot => {
                const order = orderSnapshot.val();
                order.id = orderSnapshot.key;
                userOrders.push(order);
                
                // Add to dropdown
                const option = document.createElement('option');
                option.value = order.id;
                option.textContent = `Order #${order.id.substring(0, 8)} - ${formatDate(order.date)} - $${order.total.toFixed(2)}`;
                orderSelect.appendChild(option);
            });
            
            if (userOrders.length > 0) {
                // Select the most recent order by default
                orderSelect.value = userOrders[0].id;
                handleOrderSelect({ target: orderSelect });
            }
        })
        .catch(error => {
            console.error('Error loading orders:', error);
        });
}

// Handle order selection
function handleOrderSelect(event) {
    const orderId = event.target.value;
    
    if (!orderId) {
        trackingContainer.style.display = 'none';
        noOrderSelected.style.display = 'block';
        return;
    }
    
    const order = userOrders.find(o => o.id === orderId);
    if (!order) return;
    
    // Update UI with order details
    updateOrderDetails(order);
    
    // Show tracking container
    trackingContainer.style.display = 'block';
    noOrderSelected.style.display = 'none';
}

// Update order details in UI
function updateOrderDetails(order) {
    // Basic order info
    orderNumber.textContent = `Order #${order.id.substring(0, 8)}`;
    orderDate.textContent = formatDate(order.date);
    deliveryDate.textContent = formatDate(calculateDeliveryDate(order.date));
    
    // Address
    const shipping = order.shipping;
    deliveryAddress.textContent = `${shipping.name}, ${shipping.address}, ${shipping.city}, ${shipping.state} ${shipping.zip}`;
    
    // Status
    orderStatus.textContent = order.status || 'Processing';
    orderStatus.className = 'order-status';
    orderStatus.classList.add(order.status.toLowerCase());
    
    // Update timeline
    updateTimeline(order);
    
    // Update order items
    updateOrderItems(order.items);
    
    // Update delivery info (simulated)
    updateDeliveryInfo(order);
    
    // Start tracking driver location (simulated)
    startTrackingDriver(order.shipping);
}

// Update order timeline
function updateTimeline(order) {
    const timelineItems = orderTimeline.querySelectorAll('.timeline-item');
    
    // Reset all items
    timelineItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Set active items based on status
    const statusIndex = getStatusIndex(order.status);
    for (let i = 0; i <= statusIndex; i++) {
        timelineItems[i].classList.add('active');
    }
    
    // Update dates in timeline (simulated)
    const orderDateObj = new Date(order.date);
    timelineItems[0].querySelector('p').textContent = `${formatDate(order.date)} - ${formatTime(order.date)}`;
    timelineItems[1].querySelector('p').textContent = `${formatDate(addHours(orderDateObj, 1))} - ${formatTime(addHours(orderDateObj, 1))}`;
    
    if (statusIndex >= 2) {
        timelineItems[2].querySelector('p').textContent = `${formatDate(addDays(orderDateObj, 1))} - ${formatTime(addDays(orderDateObj, 1))}`;
    }
    
    if (statusIndex >= 3) {
        timelineItems[3].querySelector('p').textContent = `${formatDate(addDays(orderDateObj, 2))} - ${formatTime(addDays(orderDateObj, 2))}`;
    }
    
    if (statusIndex >= 4) {
        timelineItems[4].querySelector('p').textContent = `${formatDate(addDays(orderDateObj, 3))} - ${formatTime(addDays(orderDateObj, 3))}`;
    }
}

// Update order items list
function updateOrderItems(items) {
    orderItems.innerHTML = '';
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="order-item-img">
            <div class="order-item-details">
                <h3>${item.name}</h3>
                <p>Sold by: ${item.vendor}</p>
                <p class="order-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <span class="order-item-quantity">Qty: ${item.quantity}</span>
        `;
        orderItems.appendChild(itemElement);
    });
}

// Update delivery information (simulated)
function updateDeliveryInfo(order) {
    // Simulated driver info
    const drivers = [
        { name: "John Smith", vehicle: "Blue Honda Civic (ABC-1234)", phone: "+1234567890" },
        { name: "Maria Garcia", vehicle: "Red Toyota Corolla (XYZ-5678)", phone: "+9876543210" },
        { name: "David Johnson", vehicle: "White Ford Transit (DEF-9012)", phone: "+1122334455" }
    ];
    
    const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
    driverName.textContent = randomDriver.name;
    driverVehicle.textContent = `Vehicle: ${randomDriver.vehicle}`;
    
    // Update contact links
    const contactLinks = document.querySelectorAll('.driver-contact a');
    contactLinks[0].href = `tel:${randomDriver.phone}`;
    contactLinks[1].href = `sms:${randomDriver.phone}`;
    
    // Simulate delivery time (20-60 minutes)
    const minutes = Math.floor(Math.random() * 41) + 20;
    deliveryTime.textContent = `${minutes} minutes`;
}

// Start tracking driver location (simulated)
function startTrackingDriver(shippingAddress) {
    // Clear any existing interval
    if (driverInterval) {
        clearInterval(driverInterval);
    }
    
    // Remove existing markers and route
    if (deliveryMarker) map.removeLayer(deliveryMarker);
    if (driverMarker) map.removeLayer(driverMarker);
    if (deliveryRoute) map.removeLayer(deliveryRoute);
    
    // Geocode the delivery address (in a real app, you would use a geocoding service)
    // For demo purposes, we'll use random coordinates near London
    const storeLocation = [51.505, -0.09]; // Store location
    const deliveryLocation = [
        storeLocation[0] + (Math.random() * 0.1 - 0.05),
        storeLocation[1] + (Math.random() * 0.1 - 0.05)
    ];
    
    // Add delivery location marker
    deliveryMarker = L.marker(deliveryLocation).addTo(map)
        .bindPopup('Delivery Location')
        .openPopup();
    
    // Simulate driver starting near the store
    const driverStartLocation = [
        storeLocation[0] + (Math.random() * 0.01 - 0.005),
        storeLocation[1] + (Math.random() * 0.01 - 0.005)
    ];
    
    // Add driver marker
    driverMarker = L.marker(driverStartLocation, {
        icon: L.divIcon({
            className: 'driver-icon',
            html: '<i class="fas fa-truck"></i>',
            iconSize: [30, 30]
        })
    }).addTo(map);
    
    // Add route from store to delivery location
    deliveryRoute = L.polyline([storeLocation, deliveryLocation], {
        color: 'blue',
        weight: 3,
        dashArray: '5, 5'
    }).addTo(map);
    
    // Fit map to show both locations
    map.fitBounds([storeLocation, deliveryLocation]);
    
    // Simulate driver movement
    let progress = 0;
    const totalSteps = 100;
    
    driverInterval = setInterval(() => {
        progress += 1;
        
        if (progress >= totalSteps) {
            clearInterval(driverInterval);
            
            // Update status to delivered
            const currentOrderId = orderSelect.value;
            const orderRef = database.ref(`orders/${currentOrderId}`);
            orderRef.update({ status: 'Delivered' });
            
            // Add notification
            addNotification(`Your order #${currentOrderId.substring(0, 8)} has been delivered!`, new Date().toISOString());
        }
        
        // Calculate current position along the route
        const lat = storeLocation[0] + (deliveryLocation[0] - storeLocation[0]) * (progress / totalSteps);
        const lng = storeLocation[1] + (deliveryLocation[1] - storeLocation[1]) * (progress / totalSteps);
        
        // Update driver marker position
        driverMarker.setLatLng([lat, lng]);
        
        // Update estimated time
        const remainingTime = Math.round((totalSteps - progress) / totalSteps * parseInt(deliveryTime.textContent));
        deliveryTime.textContent = `${remainingTime > 0 ? remainingTime : 1} minutes`;
        
    }, 2000);
}

// Refresh driver location
function refreshDriverLocation() {
    const currentOrderId = orderSelect.value;
    if (!currentOrderId) return;
    
    const order = userOrders.find(o => o.id === currentOrderId);
    if (order) {
        startTrackingDriver(order.shipping);
        refreshLocationBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
        
        setTimeout(() => {
            refreshLocationBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Location';
        }, 1000);
    }
}

// Setup real-time notifications
function setupNotifications(userId) {
    database.ref(`notifications/${userId}`).orderByChild('timestamp').limitToLast(5).on('value', snapshot => {
        notificationList.innerHTML = '';
        let count = 0;
        
        snapshot.forEach(notificationSnapshot => {
            const notification = notificationSnapshot.val();
            if (!notification.read) count++;
            
            const notificationElement = document.createElement('div');
            notificationElement.className = 'notification-item';
            notificationElement.innerHTML = `
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
                <time>${formatDateTime(notification.timestamp)}</time>
            `;
            
            notificationElement.addEventListener('click', () => {
                // Mark as read
                database.ref(`notifications/${userId}/${notificationSnapshot.key}`).update({ read: true });
            });
            
            notificationList.appendChild(notificationElement);
        });
        
        notificationCount.textContent = count;
        notificationCount.style.display = count > 0 ? 'flex' : 'none';
    });
}

// Add a new notification
function addNotification(title, message) {
    if (!currentUser) return;
    
    const notification = {
        title: title,
        message: message,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    database.ref(`notifications/${currentUser.uid}`).push(notification);
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function calculateDeliveryDate(orderDate) {
    const date = new Date(orderDate);
    date.setDate(date.getDate() + 3); // 3 days after order
    return date.toISOString();
}

function addHours(date, hours) {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function getStatusIndex(status) {
    const statuses = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
    return statuses.indexOf(status);
}