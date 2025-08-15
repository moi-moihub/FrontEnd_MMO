// Enhanced sidebar toggle with animation and auto-close on navigation
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');

// Function to handle sidebar state
function setSidebarState(isOpen) {
    if (isOpen) {
        sidebar.classList.add('show');
        mainContent.classList.add('shifted');
    } else {
        sidebar.classList.remove('show');
        mainContent.classList.remove('shifted');
    }
    localStorage.setItem('sidebarState', isOpen ? 'open' : 'closed');
}

// Toggle sidebar
sidebarToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    const isOpening = !sidebar.classList.contains('show');
    setSidebarState(isOpening);
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function (event) {
    if (window.innerWidth < 992 &&
        !sidebar.contains(event.target) &&
        !sidebarToggle.contains(event.target) &&
        sidebar.classList.contains('show')) {
        setSidebarState(false);
    }
});

// Auto-close sidebar when nav links are clicked (mobile only)
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function () {
        if (window.innerWidth < 992) {
            setSidebarState(false);
        }
    });
});

// Initialize sidebar state
document.addEventListener('DOMContentLoaded', function () {
    if (window.innerWidth >= 992) {
        setSidebarState(true); // Always open on desktop
    } else {
        const savedState = localStorage.getItem('sidebarState');
        setSidebarState(savedState === 'open');
    }
});

// Handle window resize
window.addEventListener('resize', function () {
    if (window.innerWidth >= 992) {
        setSidebarState(true); // Always open on desktop
    } else {
        const savedState = localStorage.getItem('sidebarState');
        setSidebarState(savedState === 'open');
    }
});