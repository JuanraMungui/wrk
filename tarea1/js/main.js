"use strict";

/* CUSTOM CURSOR */
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.transform = `translate(${mouseX - 6}px, ${mouseY - 6}px)`;
});
function animateRing() {
  ringX += (mouseX - ringX - 18) * 0.12;
  ringY += (mouseY - ringY - 18) * 0.12;
  cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
  requestAnimationFrame(animateRing);
}
animateRing();

/* PARTICLE CANVAS */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [], W, H;

function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', () => { resize(); initParticles(); });

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W; this.y = Math.random() * H;
    this.size = Math.random() * 1.5 + 0.3;
    this.speedX = (Math.random() - 0.5) * 0.3; this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.5 ? '#00d4ff' : '#7b2fff';
    this.pulse = Math.random() * Math.PI * 2;
  }
  update() {
    this.x += this.speedX; this.y += this.speedY; this.pulse += 0.02;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity * (0.7 + 0.3 * Math.sin(this.pulse));
    ctx.fillStyle = this.color; ctx.shadowColor = this.color; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

function initParticles() {
  particles = [];
  const count = Math.min(Math.floor((W * H) / 8000), 120);
  for (let i = 0; i < count; i++) particles.push(new Particle());
}
initParticles();

function drawGrid() {
  ctx.save(); ctx.strokeStyle = 'rgba(0,212,255,0.03)'; ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  ctx.restore();
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 120) {
        ctx.save(); ctx.globalAlpha = (1 - dist/120) * 0.15;
        ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
        ctx.restore();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, W, H);
  drawGrid(); drawConnections();
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animate);
}
animate();

/* SCROLL PROGRESS */
const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY, total = document.body.scrollHeight - window.innerHeight;
  progressBar.style.width = `${(scrolled / total) * 100}%`;
});

/* NAV */
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60));

/* TYPING EFFECT */
const phrases = ['Full-Stack Developer','UI/UX Enthusiast','Problem Solver','Open Source Contributor','Creative Technologist'];
let phraseIdx = 0, charIdx = 0, deleting = false;
const typedEl = document.querySelector('.typed-text');

function type() {
  const current = phrases[phraseIdx];
  if (deleting) { typedEl.textContent = current.slice(0, --charIdx); }
  else { typedEl.textContent = current.slice(0, ++charIdx); }
  let delay = deleting ? 60 : 100;
  if (!deleting && charIdx === current.length) { delay = 2000; deleting = true; }
  if (deleting && charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; delay = 400; }
  setTimeout(type, delay);
}
type();

/* REVEAL ON SCROLL */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) { setTimeout(() => entry.target.classList.add('visible'), i * 80); revealObserver.unobserve(entry.target); }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObserver.observe(el));

/* SKILL BARS */
const skillFills = document.querySelectorAll('.skill-fill');
const skillObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.style.width = entry.target.dataset.width; skillObserver.unobserve(entry.target); } });
}, { threshold: 0.3 });
skillFills.forEach(fill => skillObserver.observe(fill));

/* COUNTER ANIMATION */
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const step = target / (duration / 16);
  const update = () => {
    start = Math.min(start + step, target);
    el.textContent = Math.floor(start) + (el.dataset.suffix || '');
    if (start < target) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) { animateCounter(entry.target, parseInt(entry.target.dataset.count), 1800); counterObserver.unobserve(entry.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

/* CONTACT FORM */
const form = document.getElementById('contact-form');
const toast = document.getElementById('toast');

function showToast(msg) {
  toast.textContent = msg; toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const name = form.querySelector('#name').value.trim();
  const email = form.querySelector('#email').value.trim();
  const msg = form.querySelector('#message').value.trim();
  if (!name || !email || !msg) { showToast('⚠ Por favor completa todos los campos.'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('⚠ Ingresa un correo electrónico válido.'); return; }
  const btn = form.querySelector('.btn-primary');
  btn.innerHTML = '<span>Enviando...</span>'; btn.disabled = true;
  setTimeout(() => {
    showToast('✓ Mensaje enviado correctamente. ¡Gracias!');
    form.reset(); btn.innerHTML = '<span>Enviar Mensaje</span><span>→</span>'; btn.disabled = false;
  }, 1500);
});

/* SMOOTH SCROLL */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* TILT ON PROJECT CARDS */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const rotX = ((e.clientY - rect.top - rect.height/2) / (rect.height/2)) * -6;
    const rotY = ((e.clientX - rect.left - rect.width/2) / (rect.width/2)) * 6;
    card.style.transform = `translateY(-8px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    card.style.transformStyle = 'preserve-3d';
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});