/// --- GALLERY LIGHTBOX ---
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
        lightboxCaption.textContent = item.dataset.title || '';
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

// NAVIGATION SCROLL
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 0) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
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

// --- CODE-ICON STAR FIELD (replaces old plain square star field) ---

// helper: turn text into a sprite texture
function createIconTexture(text, color = '#c9b8ff') {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, size, size);
    ctx.font = 'bold 40px "Courier New", monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, size / 2, size / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

const iconTexA = createIconTexture('</>');
const iconTexB = createIconTexture('...');

// build one field of points using a given icon texture
function buildIconField(count, texture, size) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
        // spread x/y wide, but keep z pushed further back (-10 to -2)
        // so nothing drifts right up close to the camera and looks huge
        if (i % 3 === 2) {
            positions[i] = -Math.random() * 8 - 2; // z: -2 to -10
        } else {
            positions[i] = (Math.random() - 0.5) * 15; // x, y
        }
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
        size,
        map: texture,
        transparent: true,
        alphaTest: 0.1,   // clips the square edges, keeps only the glyph
        depthWrite: false,
        sizeAttenuation: true
    });

    return new THREE.Points(geo, mat);
}

const starsCount = 120; // fewer icons total
const fieldA = buildIconField(starsCount / 2, iconTexA, 0.24);
const fieldB = buildIconField(starsCount / 2, iconTexB, 0.24);

// group them so the existing animate() code still works unchanged
const starField = new THREE.Group();
starField.add(fieldA, fieldB);
scene.add(starField);

// --- END CODE-ICON STAR FIELD ---

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