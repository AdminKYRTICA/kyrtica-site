// Mobile nav toggle + basic form UX
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('show'));
  }

  // Optional: simple success message for contact form when using Formspree
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', () => {
      setTimeout(() => {
        alert('Thanks! We received your message.');
      }, 300);
    });
  }
});
