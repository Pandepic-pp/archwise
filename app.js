/* ArchWyse: no external dependencies */

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Mobile menu
const menuToggle  = document.getElementById('menu-toggle');
const mobileMenu  = document.getElementById('mobile-menu');

menuToggle.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

document.querySelectorAll('.mob-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

document.addEventListener('click', e => {
  if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// Scroll reveal via IntersectionObserver
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// FAQ tabs + accordion
document.querySelectorAll('.faq-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.faq-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.faq-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('faq-' + tab.dataset.tab).classList.add('active');
  });
});

document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    item.closest('.faq-panel').querySelectorAll('.faq-item.open').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// Contact form
const form    = document.getElementById('contact-form');
const success = document.getElementById('form-success');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  const original = btn.textContent;
  btn.textContent = 'Sending...';
  btn.disabled = true;

  const data = {
    name:    form.querySelector('#name').value.trim(),
    email:   form.querySelector('#email').value.trim(),
    subject: form.querySelector('#topic').value || 'General inquiry',
    message: form.querySelector('#message').value.trim(),
    company: form.querySelector('#company').value.trim(),
    companySize: form.querySelector('#size').value.trim()
  };

  try {
    const res = await fetch('https://app.archwyse.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Server error');

    form.reset();
    btn.style.display = 'none';
    success.style.display = 'flex';
  } catch {
    btn.textContent = original;
    btn.disabled = false;
    alert('Failed to send message. Please try again or email us directly at support@archwyse.com');
  }
});
