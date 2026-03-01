/**
 * Wedding Invitation - JavaScript
 * Handles: Unlock animation, Countdown timer, Scroll animations, Hearts animation
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeartsAnimation();
    initUnlockButton();
    initScrollAnimations();
    initCountdown();
});

/**
 * Animated Hearts Background
 * Creates floating hearts with calligraphic line-drawing animation
 */
let heartsInterval = null;

function initHeartsAnimation() {
    const container = document.getElementById('hearts-container');
    if (!container) return;

    // Heart drawing order: bottom tip → left half → center dip → right half → bottom tip
    const heartPath = "M50,75 C20,50 10,35 10,20 C10,5 35,5 50,25 C65,5 90,5 90,20 C90,35 80,50 50,75";

    function createHeart() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 80');
        svg.classList.add('heart-svg');

        // Random position
        const x = Math.random() * 80 + 10; // 10-90%
        const y = Math.random() * 70 + 15; // 15-85%

        // Random size - minimum 30px, max 95px
        // Use exponential distribution to make larger hearts (~80-95px) 1.5x less likely
        // Math.pow(Math.random(), 1.5) skews the randomness towards 0
        const sizeProbability = Math.pow(Math.random(), 1.5);
        const size = sizeProbability * 65 + 30; // 30-95px

        // Random slight rotation for more natural look
        const rotation = (Math.random() - 0.5) * 30; // -15 to +15 degrees

        svg.style.left = `${x}%`;
        svg.style.top = `${y}%`;
        svg.style.width = `${size}px`;
        svg.style.height = `${size}px`;
        svg.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', heartPath);
        path.classList.add('heart-path');

        svg.appendChild(path);
        container.appendChild(svg);

        // Remove after animation completes
        setTimeout(() => {
            svg.remove();
        }, 6000);
    }

    // Create initial hearts
    for (let i = 0; i < 2; i++) {
        setTimeout(() => createHeart(), i * 800);
    }

    // Continue creating hearts
    heartsInterval = setInterval(() => {
        createHeart();
    }, 1200);
}

function stopHeartsAnimation() {
    if (heartsInterval) {
        clearInterval(heartsInterval);
        heartsInterval = null;
    }
}

/**
 * Swipe to Unlock Handler
 * Handles drag/touch interaction to unlock the invitation
 */
function initUnlockButton() {
    const cover = document.getElementById('cover');
    const swipeUnlock = document.getElementById('swipe-unlock');
    const swipeHandle = document.getElementById('swipe-handle');
    const mainContent = document.getElementById('main-content');

    if (!swipeHandle || !swipeUnlock || !cover || !mainContent) return;

    const track = swipeUnlock.querySelector('.swipe-track');
    const trackWidth = track.offsetWidth;
    const handleWidth = swipeHandle.offsetWidth;
    const maxDrag = trackWidth - handleWidth - 8;
    const unlockThreshold = maxDrag * 0.85;

    let isDragging = false;
    let startX = 0;
    let currentX = 0;

    // Mouse events
    swipeHandle.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    // Touch events
    swipeHandle.addEventListener('touchstart', startDrag, { passive: true });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);

    function startDrag(e) {
        isDragging = true;
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        swipeHandle.classList.add('dragging');
        swipeUnlock.classList.add('swiping');
        swipeHandle.style.transition = 'none';
    }

    function drag(e) {
        if (!isDragging) return;
        if (e.type === 'touchmove') e.preventDefault();

        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const deltaX = clientX - startX;
        currentX = Math.max(0, Math.min(deltaX, maxDrag));
        swipeHandle.style.left = `${4 + currentX}px`;
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        swipeHandle.classList.remove('dragging');
        swipeHandle.style.transition = 'left 0.3s ease, box-shadow 0.3s ease';

        if (currentX >= unlockThreshold) {
            swipeHandle.style.left = `${4 + maxDrag}px`;
            swipeUnlock.classList.add('unlocked');
            setTimeout(unlock, 300);
        } else {
            swipeHandle.style.left = '4px';
            swipeUnlock.classList.remove('swiping');
            currentX = 0;
        }
    }

    function unlock() {
        stopHeartsAnimation();
        cover.classList.add('unlocked');
        mainContent.classList.remove('hidden');
        document.body.style.overflow = 'auto';
        setTimeout(() => {
            cover.style.display = 'none';
            checkVisibleSections();
        }, 800);
    }

    document.body.style.overflow = 'hidden';
}

/**
 * Scroll Animations
 * Reveals sections as they enter viewport
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (!animatedElements.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px 0px 0px', // Trigger exactly when it enters the viewport threshold
        threshold: 0.5 // Requires 50% of the element (e.g. the dress code block) to be visible before animating
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
}

/**
 * Check visible sections on initial load
 */
function checkVisibleSections() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    animatedElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (isVisible) {
            setTimeout(() => {
                el.classList.add('visible');
            }, 100);
        }
    });
}

/**
 * Countdown Timer
 * Counts down to wedding date
 */
function initCountdown() {
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    // Wedding date: June 6, 2026 at 13:00
    const weddingDate = new Date('2026-06-06T13:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            // Wedding day has passed
            daysEl.textContent = '0';
            hoursEl.textContent = '0';
            minutesEl.textContent = '0';
            secondsEl.textContent = '0';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Animate number changes
        animateNumber(daysEl, days);
        animateNumber(hoursEl, hours);
        animateNumber(minutesEl, minutes);
        animateNumber(secondsEl, seconds);
    }

    function animateNumber(element, newValue) {
        const currentValue = element.textContent;
        const formattedValue = String(newValue).padStart(2, '0');

        if (currentValue !== formattedValue) {
            // Smooth flip animation
            element.classList.add('flip-out');

            setTimeout(() => {
                element.textContent = formattedValue;
                element.classList.remove('flip-out');
                element.classList.add('flip-in');

                setTimeout(() => {
                    element.classList.remove('flip-in');
                }, 300);
            }, 250);
        }
    }

    // Initial update
    updateCountdown();

    // Update every second
    setInterval(updateCountdown, 1000);
}

/**
 * Smooth scroll for anchor links (if needed)
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}
