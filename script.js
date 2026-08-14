// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const prefersReducedMotion = typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (hamburger && navMenu) {
        function setMenuState(isOpen) {
            hamburger.classList.toggle('active', isOpen);
            navMenu.classList.toggle('active', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
        }

        setMenuState(false);

        hamburger.addEventListener('click', function() {
            setMenuState(!navMenu.classList.contains('active'));
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', function() {
                setMenuState(false);
            });
        });

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navMenu.classList.contains('active')) {
                setMenuState(false);
                hamburger.focus();
            }
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 70;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
            }
        });
    });

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (!navbar) {
            return;
        }

        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
        }
    });

    // Animate skill progress bars
    function animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        skillBars.forEach(bar => {
            const progress = bar.getAttribute('data-progress');
            if (progress) {
                bar.style.width = progress + '%';
            }
        });
    }

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observerCallback = function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animate skill bars when skills section comes into view
                if (entry.target.id === 'skills') {
                    setTimeout(() => {
                        animateSkillBars();
                    }, 300);
                }
            }
        });
    };

    const observer = 'IntersectionObserver' in window
        ? new IntersectionObserver(observerCallback, observerOptions)
        : null;

    // Add scroll animation to sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('scroll-animate');
        if (observer) {
            observer.observe(section);
        } else {
            section.classList.add('visible');
        }
    });

    // Add scroll animation to project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        card.classList.add('scroll-animate');
        card.style.animationDelay = `${index * 0.1}s`;
        if (observer) {
            observer.observe(card);
        } else {
            card.classList.add('visible');
        }
    });

    // Typing animation for hero section
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.textContent = '';
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }

    // Initialize typing animation after a short delay
    if (!prefersReducedMotion) {
        setTimeout(() => {
            const language = document.documentElement.getAttribute('lang') || 'en';
            const heroTitle = document.querySelector(`.hero-content h1 [lang="${language}"] .highlight`);
            if (heroTitle) {
                typeWriter(heroTitle, heroTitle.textContent, 80);
            }
        }, 500);
    }

    // Add hover effects to project cards
    const projectCardsHover = document.querySelectorAll('.project-card');
    projectCardsHover.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add loading animation
    function addLoadingAnimation() {
        if (prefersReducedMotion) {
            return;
        }

        const body = document.body;
        body.style.opacity = '0';
        
        setTimeout(() => {
            body.style.transition = 'opacity 0.5s ease-in-out';
            body.style.opacity = '1';
        }, 100);
    }

    addLoadingAnimation();

    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        if (prefersReducedMotion) {
            return;
        }

        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        const heroSection = document.querySelector('.hero');
        
        if (heroSection && scrolled < window.innerHeight) {
            heroSection.style.transform = `translateY(${rate}px)`;
        }
    });

    // Add active state to navigation based on scroll position
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const sectionHeight = section.clientHeight;
            
            if (sectionTop <= 100 && sectionTop + sectionHeight > 100) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Easter egg: Konami code
    let konamiCode = [];
    const konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    
    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.code);
        
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            // Easter egg activated
            document.body.style.filter = 'hue-rotate(180deg)';
            setTimeout(() => {
                document.body.style.filter = 'none';
            }, 3000);
            
            // Show a fun message
            const message = document.createElement('div');
            message.textContent = '🎉 Konami Code Activated! 🎉';
            message.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--gradient-primary);
                color: white;
                padding: 20px 40px;
                border-radius: 12px;
                font-size: 1.2rem;
                font-weight: 600;
                box-shadow: var(--shadow-xl);
                z-index: 10000;
                animation: fadeInUp 0.5s ease-out;
            `;
            
            document.body.appendChild(message);
            
            setTimeout(() => {
                message.remove();
            }, 3000);
            
            konamiCode = [];
        }
    });

    // Add resize handler for responsive behavior
    function handleResize() {
        const hero = document.querySelector('.hero');
        
        if (window.innerWidth <= 768) {
            // Mobile adjustments
            if (hero) {
                hero.style.minHeight = 'auto';
                hero.style.paddingTop = '100px';
            }
        } else {
            // Desktop adjustments
            if (hero) {
                hero.style.minHeight = '100vh';
                hero.style.paddingTop = '120px';
            }
            
            // Close mobile menu if open
            const navMenu = document.querySelector('.nav-menu');
            const hamburger = document.querySelector('.hamburger');
            if (navMenu && hamburger) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        }
    }
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    // Language Switcher Logic
    const langBtn = document.getElementById('lang-btn');
    function updateLangBtnText(lang) {
        if (langBtn) {
            const spanText = langBtn.querySelector('span');
            if (spanText) {
                spanText.textContent = lang === 'en' ? '中文' : 'English';
            }
        }
    }

    function getSavedLanguage() {
        try {
            return localStorage.getItem('lang') || 'en';
        } catch (error) {
            return 'en';
        }
    }

    function saveLanguage(lang) {
        try {
            localStorage.setItem('lang', lang);
        } catch (error) {
            // Storage may be unavailable in privacy-restricted contexts.
        }
    }

    if (langBtn) {
        langBtn.addEventListener('click', function() {
            const currentLang = document.documentElement.getAttribute('lang') || 'en';
            const newLang = currentLang === 'en' ? 'zh' : 'en';
            document.documentElement.setAttribute('lang', newLang);
            saveLanguage(newLang);
            updateLangBtnText(newLang);
        });
    }

    // Set initial language from storage
    const savedLang = getSavedLanguage();
    document.documentElement.setAttribute('lang', savedLang);
    updateLangBtnText(savedLang);
});
