/**
 * 3D Background Experience for Portfolio
 * Built with Three.js
 */

class Scene3D {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        if (!this.canvas) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });

        this.objects = [];
        this.particles = null;

        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;

        this.init();
    }

    init() {
        // Setup Renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Camera
        this.camera.position.z = 30;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);

        this.pointLight = new THREE.PointLight(0x00f0ff, 2, 100);
        this.pointLight.position.set(0, 0, 10);
        this.scene.add(this.pointLight);

        const pointLight2 = new THREE.PointLight(0x8b5cf6, 2, 100);
        pointLight2.position.set(-10, 10, 10);
        this.scene.add(pointLight2);

        // Add Elements
        this.createParticles();
        this.createFloatingShapes();

        // Events
        window.addEventListener('resize', this.onWindowResize.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));

        // Start Loop
        this.animate();
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const count = 1500;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 100;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            size: 0.15,
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createFloatingShapes() {
        const geometries = [
            new THREE.IcosahedronGeometry(1.5, 0),
            new THREE.TorusKnotGeometry(1, 0.3, 100, 16),
            new THREE.OctahedronGeometry(1.5, 0),
            new THREE.TetrahedronGeometry(1.5, 0),
            new THREE.DodecahedronGeometry(1.5, 0)
        ];

        const materials = [
            new THREE.MeshStandardMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.5 }),
            new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.2, metalness: 0.8 }),
            new THREE.MeshStandardMaterial({ color: 0xec4899, wireframe: true }),
            new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4, metalness: 0.5 }),
            new THREE.MeshStandardMaterial({ color: 0x10b981, wireframe: true })
        ];

        for (let i = 0; i < 20; i++) {
            const geo = geometries[Math.floor(Math.random() * geometries.length)];
            const mat = materials[Math.floor(Math.random() * materials.length)];

            const mesh = new THREE.Mesh(geo, mat);

            // Random position in space
            mesh.position.x = (Math.random() - 0.5) * 80;
            mesh.position.y = (Math.random() - 0.5) * 80;
            mesh.position.z = (Math.random() - 0.5) * 50 - 10;

            // Random rotation
            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;

            // Random scale
            const scale = Math.random() * 0.8 + 0.4;
            mesh.scale.set(scale, scale, scale);

            // Save custom data for animation
            mesh.userData = {
                rotationSpeedX: (Math.random() - 0.5) * 0.01,
                rotationSpeedY: (Math.random() - 0.5) * 0.01,
                floatSpeed: Math.random() * 0.05 + 0.01,
                floatOffset: Math.random() * Math.PI * 2
            };

            this.scene.add(mesh);
            this.objects.push(mesh);
        }
    }

    onMouseMove(event) {
        this.mouseX = (event.clientX - window.innerWidth / 2);
        this.mouseY = (event.clientY - window.innerHeight / 2);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const time = Date.now() * 0.001;

        // Smooth mouse movement for parallax
        this.targetX = this.mouseX * 0.001;
        this.targetY = this.mouseY * 0.001;

        this.camera.position.x += (this.targetX * 15 - this.camera.position.x) * 0.02;
        this.camera.position.y += (-this.targetY * 15 - this.camera.position.y) * 0.02;
        this.camera.lookAt(this.scene.position);

        // Move light with camera for dynamic lighting effect
        if (this.pointLight) {
            this.pointLight.position.x = this.camera.position.x;
            this.pointLight.position.y = this.camera.position.y;
        }

        // Animate particles
        if (this.particles) {
            this.particles.rotation.y = time * 0.05;
            this.particles.rotation.x = time * 0.02;
        }

        // Animate objects
        this.objects.forEach((obj) => {
            obj.rotation.x += obj.userData.rotationSpeedX;
            obj.rotation.y += obj.userData.rotationSpeedY;
            obj.position.y += Math.sin(time + obj.userData.floatOffset) * obj.userData.floatSpeed;
        });

        this.renderer.render(this.scene, this.camera);
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    new Scene3D();
});
