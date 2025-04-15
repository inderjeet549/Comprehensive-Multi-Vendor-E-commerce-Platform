
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
