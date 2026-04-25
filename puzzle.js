/**
 * 3D Rotation Puzzle for Portfolio Entry
 * Built with Three.js and GSAP
 */

class RotationPuzzle {
    constructor() {
        this.container = document.getElementById('three-container');
        this.overlay = document.getElementById('puzzle-overlay');
        this.statsDisplay = document.getElementById('match-count'); // We'll repurpose this for steps

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.cubes = [];
        this.isBusy = false;
        this.steps = 0;

        this.init();
    }

    init() {
        // Setup Renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Setup Camera
        this.camera.position.z = 6;

        // Setup Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);

        // Add background particles
        this.createParticles();

        // Create the Puzzle Grid
        this.createPuzzle();

        // Event Listeners
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousedown', (e) => this.onMouseDown(e));

        // Start Animation Loop
        this.animate();

        // Lock Body Scroll
        document.body.classList.add('puzzle-active');

        // Update UI Text
        if (this.statsDisplay) this.statsDisplay.innerText = this.steps;
    }

    createParticles() {
        const particlesGeometry = new THREE.BufferGeometry();
        const count = 500;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 20;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.05,
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.5
        });

        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(particles);
    }

    createTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Dark background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 512, 512);

        // Center Hexagon/Diamond with Glow
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 30;

        ctx.beginPath();
        ctx.moveTo(256, 50);
        ctx.lineTo(456, 256);
        ctx.lineTo(256, 462);
        ctx.lineTo(56, 256);
        ctx.closePath();

        ctx.lineWidth = 15;
        ctx.strokeStyle = '#00f0ff';
        ctx.stroke();

        // Inner glowing shape
        ctx.shadowColor = '#8b5cf6';
        ctx.shadowBlur = 40;
        ctx.beginPath();
        ctx.moveTo(256, 120);
        ctx.lineTo(392, 256);
        ctx.lineTo(256, 392);
        ctx.lineTo(120, 256);
        ctx.closePath();
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 10;
        ctx.stroke();

        // Center dot
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 50;
        ctx.beginPath();
        ctx.arc(256, 256, 40, 0, Math.PI * 2);
        ctx.fillStyle = '#ec4899';
        ctx.fill();

        return new THREE.CanvasTexture(canvas);
    }

    createPuzzle() {
        const baseTexture = this.createTexture();
        const spacing = 1.05;

        // 3x3 Grid
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {

                // Clone texture for this specific cube
                const texture = baseTexture.clone();
                texture.needsUpdate = true;
                texture.repeat.set(1 / 3, 1 / 3);
                // UV coordinates: 0,0 is bottom-left. row 0 is top.
                texture.offset.set(col / 3, (2 - row) / 3);

                const geometry = new THREE.BoxGeometry(1, 1, 0.2);

                // Materials: 0: right, 1: left, 2: top, 3: bottom, 4: front, 5: back
                const materials = [
                    new THREE.MeshStandardMaterial({ color: 0x111111 }),
                    new THREE.MeshStandardMaterial({ color: 0x111111 }),
                    new THREE.MeshStandardMaterial({ color: 0x111111 }),
                    new THREE.MeshStandardMaterial({ color: 0x111111 }),
                    new THREE.MeshStandardMaterial({ map: texture, emissiveMap: texture, emissive: 0xffffff, emissiveIntensity: 0.4 }),
                    new THREE.MeshStandardMaterial({ color: 0x222222 })
                ];

                const cube = new THREE.Mesh(geometry, materials);

                // Position in grid
                cube.position.set((col - 1) * spacing, -(row - 1) * spacing, 0);

                // Add wireframe for premium look
                const edges = new THREE.EdgesGeometry(geometry);
                const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x333333 }));
                cube.add(line);

                // Setup rotation logic
                // Avoid solved state at start
                let startRots = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
                cube.rotation.z = startRots * (Math.PI / 2);

                cube.userData = {
                    rotationsLeft: startRots,
                    row: row,
                    col: col
                };

                this.scene.add(cube);
                this.cubes.push(cube);

                // Intro animation
                gsap.from(cube.position, {
                    z: 5,
                    opacity: 0,
                    duration: 1,
                    delay: (row * 3 + col) * 0.1,
                    ease: "power3.out"
                });
            }
        }
    }

    onMouseDown(event) {
        if (this.isBusy) return;

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.cubes, false);

        if (intersects.length > 0) {
            const cube = intersects[0].object;
            this.rotateCube(cube);
        }
    }

    rotateCube(cube) {
        this.isBusy = true;

        // Update logic
        cube.userData.rotationsLeft = (cube.userData.rotationsLeft - 1 + 4) % 4;
        this.steps++;
        if (this.statsDisplay) this.statsDisplay.innerText = this.steps;

        // Animate
        gsap.to(cube.rotation, {
            z: cube.rotation.z - (Math.PI / 2),
            duration: 0.4,
            ease: "back.out(1.5)",
            onComplete: () => {
                this.isBusy = false;
                this.checkWin();
            }
        });
    }

    checkWin() {
        const isWon = this.cubes.every(cube => cube.userData.rotationsLeft === 0);

        if (isWon) {
            this.isBusy = true;
            this.endGame();
        }
    }

    endGame() {
        // Success Sequence
        setTimeout(() => {
            // Squeeze together
            this.cubes.forEach(cube => {
                gsap.to(cube.position, {
                    x: (cube.userData.col - 1) * 1.0, // Remove spacing
                    y: -(cube.userData.row - 1) * 1.0,
                    z: 0.5,
                    duration: 0.5,
                    ease: "power2.inOut"
                });
            });

            // Spin and explode
            setTimeout(() => {
                this.cubes.forEach(cube => {
                    gsap.to(cube.position, {
                        x: (Math.random() - 0.5) * 30,
                        y: (Math.random() - 0.5) * 30,
                        z: 10 + Math.random() * 10,
                        duration: 1.5,
                        ease: "power3.in"
                    });
                    gsap.to(cube.rotation, {
                        x: Math.random() * Math.PI * 4,
                        y: Math.random() * Math.PI * 4,
                        duration: 1.5
                    });
                });

                // Fade out overlay
                setTimeout(() => {
                    this.overlay.classList.add('hidden');
                    document.body.classList.remove('puzzle-active');
                    if (window.reveal) window.reveal();
                }, 800);

            }, 1000);
        }, 300);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Subtle floating for the whole group
        const time = Date.now() * 0.001;
        this.cubes.forEach((cube, i) => {
            if (!this.isBusy && cube.userData.rotationsLeft !== 0) {
                // tiny wobble if not solved
                // cube.rotation.x = Math.sin(time * 2 + i) * 0.02;
                // cube.rotation.y = Math.cos(time * 2 + i) * 0.02;
            }
        });

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new RotationPuzzle();
});
