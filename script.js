// ====== MOBILE MENU TOGGLE ======
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links a');

mobileMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when a link is clicked
navLinksItems.forEach(item => {
    item.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        navLinks.classList.remove('active');
    });
});


// ====== STICKY HEADER & ACTIVE LINK ON SCROLL ======
const header = document.getElementById('header');
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    // Sticky header
    if (window.scrollY > 50) {
        header.classList.add('sticky');
    } else {
        header.classList.remove('sticky');
    }

    // Active link highlighting
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinksItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').includes(current) && current !== '') {
            item.classList.add('active');
        }
    });
});


// ====== TYPING ANIMATION (Typed.js) ======
if (document.querySelector('.typing')) {
    new Typed('.typing', {
        strings: ['Software Developer', 'Tech Enthusiast', 'Content Creator', 'BCA Student'],
        typeSpeed: 100,
        backSpeed: 60,
        loop: true,
        backDelay: 1500
    });
}


// ====== SCROLL REVEAL ANIMATION ======
function reveal() {
    const reveals = document.querySelectorAll('.reveal');

    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add('active');
        }
    }
}

window.addEventListener('scroll', reveal);
// Trigger once on load
reveal();


// ====== FORM SUBMISSION ======
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = contactForm.querySelector('.submit-btn');
        const originalText = btn.innerHTML;

        // Visual feedback
        btn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
        btn.style.opacity = '0.8';

        // Gather data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        // Send via FormSubmit AJAX API
        fetch("https://formsubmit.co/ajax/lakshmipathichandana@gmail.com", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                _subject: subject,
                message: message,
                _template: "box" // Optional: makes the email look nicer
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    btn.innerHTML = 'Message Sent! <i class="fas fa-check"></i>';
                    btn.style.background = '#10b981';
                    btn.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
                    contactForm.reset();
                } else {
                    btn.innerHTML = 'Error! <i class="fas fa-times"></i>';
                    btn.style.background = '#ef4444';
                }

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.boxShadow = '';
                    btn.style.opacity = '1';
                }, 4000);
            })
            .catch(error => {
                console.error('Error:', error);
                btn.innerHTML = 'Error! Try Again';
                btn.style.background = '#ef4444';

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.opacity = '1';
                }, 3000);
            });
    });
}


// ====== FOOTER YEAR ======
const yearSpan = document.getElementById('year');
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}
