import * as THREE from 'three';

export class EffectManager {
    constructor() {
        this.canvas = document.getElementById('output-canvas');
        this.particles = [];
        this.initialize();
    }

    initialize() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            alpha: true 
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.position.z = 5;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 2);
        this.scene.add(directionalLight);

        // Resize window
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Particle material
        this.particleMaterial = new THREE.ShaderMaterial({
            transparent: true,
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                uniform float time;
                varying float vAlpha;
                
                void main() {
                    vec3 pos = position;
                    vAlpha = 1.0 - (time * 0.5);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = 8.0 * vAlpha;
                }
            `,
            fragmentShader: `
                varying float vAlpha;
                
                void main() {
                    float distance = length(gl_PointCoord - vec2(0.5));
                    if (distance > 0.5) discard;
                    gl_FragColor = vec4(0.0, 1.0, 0.584, vAlpha);
                }
            `
        });

        this.time = 0;

        this.animate();
    }

    updateEffects(handLandmarks) {
        this.time += 0.016; // ~60fps

        handLandmarks.forEach(hand => {
            // Thumb tips and palm points
            const points = [0, 4, 8, 12, 16, 20].map(i => hand[i]);
            this.createTrail(points);
        });

        // Update particles
        this.particles.forEach((particle, index) => {
            particle.material.uniforms.time.value += 0.016;
            particle.position.y += 0.01;
            particle.rotation.z += 0.01;

            if (particle.material.uniforms.time.value > 2.0) {
                this.scene.remove(particle);
                this.particles.splice(index, 1);
            }
        });
    }

    createTrail(points) {
        points.forEach(point => {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(50 * 3); // 50 points

            for (let i = 0; i < positions.length; i += 3) {
                positions[i] = (point.x - 0.5) * 10;
                positions[i + 1] = -(point.y - 0.5) * 10;
                positions[i + 2] = -point.z * 10;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const particle = new THREE.Points(geometry, this.particleMaterial.clone());
            this.scene.add(particle);
            this.particles.push(particle);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
} 