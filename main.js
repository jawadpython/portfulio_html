/* ============================================
   PORTFOLIO WEBSITE - MAIN JAVASCRIPT
   Author: Jawad Khribech Portfolio
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // ANIMATED BACKGROUND - GRID SYSTEM
    // ============================================

    class AnimatedGrid {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.particles = [];
            this.mouse = { x: 0, y: 0 };
            this.particleCount = 50;
            
            this.init();
            this.animate();
            this.bindEvents();
        }

        init() {
            this.resize();
            this.createParticles();
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        createParticles() {
            this.particles = [];
            for (let i = 0; i < this.particleCount; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 1.5 + 0.5,
                    opacity: Math.random() * 0.5 + 0.2
                });
            }
        }

        bindEvents() {
            window.addEventListener('resize', () => {
                this.resize();
                this.createParticles();
            });

            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
        }

        drawGrid() {
            const gridSize = 50;
            const offsetX = (Date.now() * 0.01) % gridSize;
            const offsetY = (Date.now() * 0.01) % gridSize;

            this.ctx.strokeStyle = 'rgba(74, 158, 255, 0.05)';
            this.ctx.lineWidth = 1;

            // Vertical lines
            for (let x = -offsetX; x < this.canvas.width; x += gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.canvas.height);
                this.ctx.stroke();
            }

            // Horizontal lines
            for (let y = -offsetY; y < this.canvas.height; y += gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y);
                this.ctx.stroke();
            }
        }

        drawParticles() {
            this.particles.forEach((particle, i) => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Boundary check
                if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

                // Mouse interaction
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    const force = (150 - distance) / 150;
                    particle.vx += dx * force * 0.0001;
                    particle.vy += dy * force * 0.0001;
                }

                // Draw particle
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(74, 158, 255, ${particle.opacity})`;
                this.ctx.fill();

                // Draw connections
                this.particles.slice(i + 1).forEach(otherParticle => {
                    const dx = otherParticle.x - particle.x;
                    const dy = otherParticle.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(particle.x, particle.y);
                        this.ctx.lineTo(otherParticle.x, otherParticle.y);
                        this.ctx.strokeStyle = `rgba(74, 158, 255, ${0.1 * (1 - distance / 120)})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                });
            });
        }

        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawGrid();
            this.drawParticles();
            requestAnimationFrame(() => this.animate());
        }
    }

    // ============================================
    // CUSTOM CURSOR
    // ============================================

    class CustomCursor {
        constructor() {
            this.cursor = document.querySelector('.cursor');
            this.follower = document.querySelector('.cursor-follower');
            this.x = 0;
            this.y = 0;
            this.followerX = 0;
            this.followerY = 0;
            
            this.init();
        }

        init() {
            // Show cursor on mouse move
            document.addEventListener('mousemove', (e) => {
                this.x = e.clientX;
                this.y = e.clientY;
                
                if (!document.body.classList.contains('cursor-active')) {
                    document.body.classList.add('cursor-active');
                }
            });

            // Hide cursor when leaving window
            document.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-active');
            });

            // Hover effects
            const hoverElements = document.querySelectorAll('a, button, .project-card, .service-card');
            hoverElements.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    this.cursor.classList.add('hover');
                    this.follower.classList.add('hover');
                });
                el.addEventListener('mouseleave', () => {
                    this.cursor.classList.remove('hover');
                    this.follower.classList.remove('hover');
                });
            });

            this.animate();
        }

        animate() {
            // Direct cursor follows immediately
            this.cursor.style.left = this.x + 'px';
            this.cursor.style.top = this.y + 'px';

            // Follower cursor with smooth interpolation
            this.followerX += (this.x - this.followerX) * 0.1;
            this.followerY += (this.y - this.followerY) * 0.1;
            
            this.follower.style.left = this.followerX + 'px';
            this.follower.style.top = this.followerY + 'px';

            requestAnimationFrame(() => this.animate());
        }
    }

    // ============================================
    // SMOOTH SCROLL ANIMATIONS
    // ============================================

    class ScrollAnimations {
        constructor() {
            this.elements = document.querySelectorAll('[data-animate]');
            this.init();
        }

        init() {
            // Check initial viewport
            this.checkElements();
            
            // Throttled scroll listener
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.checkElements();
                        ticking = false;
                    });
                    ticking = true;
                }
            });
        }

        checkElements() {
            const windowHeight = window.innerHeight;
            const triggerPoint = windowHeight * 0.75;

            this.elements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const isVisible = rect.top < triggerPoint && rect.bottom > 0;

                if (isVisible && !element.classList.contains('animate')) {
                    const delay = element.getAttribute('data-delay') || 0;
                    setTimeout(() => {
                        element.classList.add('animate');
                    }, delay);
                }
            });
        }
    }

    // ============================================
    // SMOOTH SCROLL NAVIGATION
    // ============================================

    class SmoothScroll {
        constructor() {
            this.init();
        }

        init() {
            const navLinks = document.querySelectorAll('.nav-link');
            
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        const navHeight = document.querySelector('.nav').offsetHeight;
                        const targetPosition = targetElement.offsetTop - navHeight;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        }
    }

    // ============================================
    // NAVIGATION ACTIVE STATE
    // ============================================

    class NavigationActive {
        constructor() {
            this.sections = document.querySelectorAll('.section, #hero');
            this.navLinks = document.querySelectorAll('.nav-link');
            this.init();
        }

        init() {
            window.addEventListener('scroll', () => {
                this.updateActiveLink();
            });
            
            this.updateActiveLink();
        }

        updateActiveLink() {
            const scrollPosition = window.scrollY + 150;
            
            this.sections.forEach((section, index) => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    this.navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }
    }

    // ============================================
    // THEME TOGGLE (DARK/LIGHT MODE)
    // ============================================

    class ThemeToggle {
        constructor() {
            this.toggleBtn = document.getElementById('themeToggle');
            this.currentTheme = localStorage.getItem('theme') || 'dark';
            this.init();
        }

        init() {
            // Apply theme - only set attribute if not 'dark' (dark is default)
            if (this.currentTheme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
            } else {
                // Ensure dark mode - remove attribute if present
                document.documentElement.removeAttribute('data-theme');
                this.currentTheme = 'dark';
            }
            
            if (this.toggleBtn) {
                this.toggleBtn.addEventListener('click', () => {
                    if (this.currentTheme === 'dark') {
                        this.currentTheme = 'light';
                        document.documentElement.setAttribute('data-theme', 'light');
                    } else {
                        this.currentTheme = 'dark';
                        document.documentElement.removeAttribute('data-theme');
                    }
                    localStorage.setItem('theme', this.currentTheme);
                });
            }
        }
    }

    // ============================================
    // LANGUAGE TOGGLE (FRENCH/ENGLISH)
    // ============================================

    class LanguageToggle {
        constructor() {
            this.currentLang = localStorage.getItem('lang') || 'fr';
            this.translations = {
                fr: {
                    'nav.home': 'Accueil',
                    'nav.about': 'À propos',
                    'nav.services': 'Services',
                    'nav.projects': 'Projets',
                    'nav.contact': 'Contact',
                    'hero.greeting': 'Bonjour, je suis',
                    'hero.role': 'Freelance en Réseaux, Cybersécurité (Pentest)',
                    'hero.role2': 'et Développement Web & Mobile',
                    'about.title': 'À propos',
                    'about.text1': 'Ingénieur IT freelance passionné par la sécurité des systèmes et le développement d\'applications robustes. Je combine expertise technique et approche pragmatique pour livrer des solutions sur mesure.',
                    'about.text2': 'Spécialisé dans la sécurisation des infrastructures réseau, les tests de pénétration, et le développement d\'applications web et mobiles performantes.',
                    'services.title': 'Services',
                    'services.network.title': 'Réseaux',
                    'services.network.description': 'Conception, configuration et optimisation d\'infrastructures réseau sécurisées et performantes.',
                    'services.security.title': 'Cybersécurité / Pentest',
                    'services.security.description': 'Tests de pénétration, audits de sécurité et renforcement des défenses de vos systèmes.',
                    'services.web.title': 'Développement Web',
                    'services.web.description': 'Applications web modernes, performantes et sécurisées, du frontend au backend.',
                    'services.mobile.title': 'Développement Mobile',
                    'services.mobile.description': 'Applications mobiles natives et cross-platform avec focus sur la sécurité et l\'expérience utilisateur.',
                    'projects.title': 'Projets',
                    'projects.item1.title': 'Infrastructure Sécurisée',
                    'projects.item1.description': 'Mise en place d\'une architecture réseau complète avec segmentation, monitoring et protection avancée.',
                    'projects.item2.title': 'Audit de Sécurité',
                    'projects.item2.description': 'Test de pénétration complet d\'une application web avec rapport détaillé et recommandations.',
                    'projects.item3.title': 'Application Web',
                    'projects.item3.description': 'Plateforme web sécurisée avec authentification robuste et architecture scalable.',
                    'projects.item4.title': 'Application Mobile',
                    'projects.item4.description': 'Application mobile cross-platform avec chiffrement des données et API sécurisée.',
                    'contact.title': 'Contact',
                    'contact.text': 'Intéressé par une collaboration ? Discutons de votre projet.'
                },
                en: {
                    'nav.home': 'Home',
                    'nav.about': 'About',
                    'nav.services': 'Services',
                    'nav.projects': 'Projects',
                    'nav.contact': 'Contact',
                    'hero.greeting': 'Hello, I am',
                    'hero.role': 'Freelance IT Engineer in Networks, Cybersecurity (Pentest)',
                    'hero.role2': 'and Web & Mobile Development',
                    'about.title': 'About',
                    'about.text1': 'Freelance IT engineer passionate about system security and robust application development. I combine technical expertise and a pragmatic approach to deliver tailored solutions.',
                    'about.text2': 'Specialized in securing network infrastructures, penetration testing, and developing high-performance web and mobile applications.',
                    'services.title': 'Services',
                    'services.network.title': 'Networks',
                    'services.network.description': 'Design, configuration and optimization of secure and high-performance network infrastructures.',
                    'services.security.title': 'Cybersecurity / Pentest',
                    'services.security.description': 'Penetration testing, security audits and strengthening of your systems\' defenses.',
                    'services.web.title': 'Web Development',
                    'services.web.description': 'Modern, high-performance and secure web applications, from frontend to backend.',
                    'services.mobile.title': 'Mobile Development',
                    'services.mobile.description': 'Native and cross-platform mobile applications with focus on security and user experience.',
                    'projects.title': 'Projects',
                    'projects.item1.title': 'Secure Infrastructure',
                    'projects.item1.description': 'Implementation of a complete network architecture with segmentation, monitoring and advanced protection.',
                    'projects.item2.title': 'Security Audit',
                    'projects.item2.description': 'Complete penetration test of a web application with detailed report and recommendations.',
                    'projects.item3.title': 'Web Application',
                    'projects.item3.description': 'Secure web platform with robust authentication and scalable architecture.',
                    'projects.item4.title': 'Mobile Application',
                    'projects.item4.description': 'Cross-platform mobile application with data encryption and secure API.',
                    'contact.title': 'Contact',
                    'contact.text': 'Interested in a collaboration? Let\'s discuss your project.'
                }
            };
            this.init();
        }

        init() {
            // Apply saved language
            this.setLanguage(this.currentLang);
            
            const toggleBtn = document.getElementById('langToggle');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    this.currentLang = this.currentLang === 'fr' ? 'en' : 'fr';
                    this.setLanguage(this.currentLang);
                    localStorage.setItem('lang', this.currentLang);
                });
            }
        }

        setLanguage(lang) {
            document.documentElement.setAttribute('data-lang', lang);
            const elements = document.querySelectorAll('[data-translate]');
            
            elements.forEach(element => {
                const key = element.getAttribute('data-translate');
                if (this.translations[lang] && this.translations[lang][key]) {
                    element.textContent = this.translations[lang][key];
                }
            });
        }
    }

    // ============================================
    // INITIALIZE ALL COMPONENTS
    // ============================================

    document.addEventListener('DOMContentLoaded', () => {
        // Initialize animated background
        const canvas = document.getElementById('backgroundCanvas');
        if (canvas) {
            new AnimatedGrid(canvas);
        }

        // Initialize custom cursor
        new CustomCursor();

        // Initialize scroll animations
        new ScrollAnimations();

        // Initialize smooth scroll
        new SmoothScroll();

        // Initialize navigation active state
        new NavigationActive();

        // Initialize theme toggle
        new ThemeToggle();

        // Initialize language toggle
        new LanguageToggle();

        // Initialize scroll progress
        new ScrollProgress();

        // Initialize back to top button
        new BackToTop();

        // Initialize mobile menu
        new MobileMenu();

        // Initialize enhanced smooth scroll
        new EnhancedSmoothScroll();

        // Initialize staggered animations
        new StaggeredAnimations();

        // Add click handler to scroll indicator
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                const aboutSection = document.querySelector('#about');
                if (aboutSection) {
                    const navHeight = document.querySelector('.nav').offsetHeight;
                    window.scrollTo({
                        top: aboutSection.offsetTop - navHeight,
                        behavior: 'smooth'
                    });
                }
            });
        }

        // Add loaded class to body for any CSS transitions
        document.body.classList.add('loaded');
    });

    // ============================================
    // PERFORMANCE OPTIMIZATION
    // ============================================

    // Throttle function for scroll events
    function throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

})();
