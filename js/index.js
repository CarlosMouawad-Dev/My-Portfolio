
// --- GALLERY LIGHTBOX ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');

document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (!img) return; // no image added yet for this tile

        lightboxImg.src = img.src;
        lightboxImg.alt = item.dataset.title || '';
        lightboxCaption.textContent = `${item.dataset.title || ''} — ${item.dataset.tool || ''}`;
        lightbox.classList.add('active');
    });
});

function closeLightbox() {
    lightbox.classList.remove('active');
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});




// --- MOBILE MENU INTERACTION LOGIC ---
const menuToggle = document.getElementById('mobile-menu');
const navLinks = document.getElementById('nav-links');
const links = document.querySelectorAll('.nav-links a');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

links.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// --- THREE.JS ENGINE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg-canvas'),
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 0, 4);

const geometry = new THREE.TorusKnotGeometry(1.4, 0.45, 180, 24);

const material = new THREE.PointsMaterial({
    size: 0.009,
    color: 0xc9b8ff,
    transparent: true,
    opacity: 0.7,
    blending: THREE.NormalBlending // was AdditiveBlending
});

const particleMesh = new THREE.Points(geometry, material);
scene.add(particleMesh);

const starsGeometry = new THREE.BufferGeometry();
const starsCount = 1200;
const starPositions = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount * 3; i++) {
    starPositions[i] = (Math.random() - 0.5) * 15;
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starsMaterial = new THREE.PointsMaterial({
    size: 0.015,
    color: 0x8a8a93,
    transparent: true,
    opacity: 0.4
});

const starField = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starField);

const mouse = { x: 0, y: 0 };
const targetMouse = { x: 0, y: 0 };

window.addEventListener('mousemove', (event) => {
    targetMouse.x = (event.clientX / window.innerWidth) - 0.5;
    targetMouse.y = -(event.clientY / window.innerHeight) + 0.5;
});

let currentScrollY = 0;
window.addEventListener('scroll', () => {
    currentScrollY = window.scrollY;
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const clock = new THREE.Clock();

const animate = () => {
    const elapsedTime = clock.getElapsedTime();

    particleMesh.rotation.y = elapsedTime * 0.12;
    particleMesh.rotation.x = elapsedTime * 0.06;

    starField.rotation.y = -elapsedTime * 0.02;

    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;

    particleMesh.position.x = mouse.x * 1.5;
    particleMesh.position.y = mouse.y * 1.5;

    particleMesh.position.z = -currentScrollY * 0.003;
    particleMesh.rotation.z = currentScrollY * 0.001;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

animate();