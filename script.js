// DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle');
const themeStatus = document.getElementById('theme-status');
const actionBtn = document.getElementById('btn');
const clickCounter = document.getElementById('click-counter');

// 1. Theme Toggle Logic with Persistence
const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const getStoredTheme = () => localStorage.getItem('theme');
const setStoredTheme = (theme) => localStorage.setItem('theme', theme);

// Apply Theme
const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update labels
    if (theme === 'dark') {
        themeStatus.textContent = '다크 모드';
    } else {
        themeStatus.textContent = '라이트 모드';
    }
};

// Initial Theme Load
let currentTheme = getStoredTheme() || getSystemTheme();
applyTheme(currentTheme);

// Toggle Event
themeToggleBtn.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    setStoredTheme(nextTheme);
    
    // Play subtle audio/vibration feedback if supported
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
});

// 2. Interactive Counter Logic
let count = parseInt(localStorage.getItem('interactionCount')) || 0;
clickCounter.textContent = count;

actionBtn.addEventListener('click', () => {
    count++;
    clickCounter.textContent = count;
    localStorage.setItem('interactionCount', count);

    // Button micro-interaction: transient scaling
    actionBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        actionBtn.style.transform = 'none';
    }, 100);

    // Create custom particle burst effect for micro-animation
    createParticleBurst();
});

// Extra Micro-animation: Click particle burst
function createParticleBurst() {
    const rect = actionBtn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        document.body.appendChild(particle);
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 4;
        const destinationX = (Math.cos(angle) * velocity * 15);
        const destinationY = (Math.sin(angle) * velocity * 15);
        
        particle.style.position = 'fixed';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.width = '6px';
        particle.style.height = '6px';
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = 'var(--primary)';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        
        const animation = particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${destinationX}px, ${destinationY}px) scale(0)`, opacity: 0 }
        ], {
            duration: 600 + Math.random() * 400,
            easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
        });
        
        animation.onfinish = () => particle.remove();
    }
}