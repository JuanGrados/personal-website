import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function initSTLViewer(containerId, fileUrl, color = 0xFF6123) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("Container not found:", containerId);
        return;
    }

    // Add a loading overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);color:white;display:flex;justify-content:center;align-items:center;z-index:20;';
    overlay.innerHTML = 'Initialize 3D Engine...';
    container.appendChild(overlay);

    try {
        const width = container.clientWidth;
        const height = container.clientHeight;

        if (width === 0 || height === 0) {
            overlay.innerHTML = 'Error: Container has 0 size.';
            return;
        }

        // SCENE
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111111);

        // CAMERA - Move it further back initially
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
        camera.position.set(0, 50, 200);

        // RENDERER
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        // CONTROLS
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 2.0;

        // LIGHTS
        const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
        scene.add(ambientLight);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        hemiLight.position.set(0, 20, 0);
        scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 3);
        dirLight.position.set(50, 50, 50);
        scene.add(dirLight);

        const dirLight2 = new THREE.DirectionalLight(0xffffff, 1);
        dirLight2.position.set(-50, 50, -50);
        scene.add(dirLight2);

        // LOADER
        overlay.innerHTML = `Loading Model: ${fileUrl}...`;

        const loader = new STLLoader();
        loader.load(
            fileUrl,
            function (geometry) {
                overlay.innerHTML = 'Processing Geometry...';

                // Center geometry
                geometry.center();
                geometry.computeVertexNormals();

                // Calculate bounding box to normalize scale
                geometry.computeBoundingBox();
                const boundingBox = geometry.boundingBox;
                const size = new THREE.Vector3();
                boundingBox.getSize(size);

                // Determine scale factor to fit in a 100x100x100 box
                const maxDim = Math.max(size.x, size.y, size.z);
                let scale = 1;
                if (maxDim > 0) {
                    scale = 100 / maxDim;
                }

                console.log(`Model Loaded. Size: ${size.x.toFixed(2)}x${size.y.toFixed(2)}x${size.z.toFixed(2)}. Scale: ${scale}`);

                // Material
                const material = new THREE.MeshStandardMaterial({
                    color: color,
                    metalness: 0.4,
                    roughness: 0.4,
                    side: THREE.DoubleSide
                });

                const mesh = new THREE.Mesh(geometry, material);

                // Apply scale
                mesh.scale.set(scale, scale, scale);

                // Rotate to fix potential orientation issues (Z-up vs Y-up)
                mesh.rotation.x = -Math.PI / 2;

                scene.add(mesh);

                // Remove loading overlay
                overlay.style.display = 'none';

                // Reset rotate to ensure user feels control immediately
                controls.reset();
            },
            (xhr) => {
                if (xhr.lengthComputable) {
                    const percent = Math.round((xhr.loaded / xhr.total) * 100);
                    overlay.innerHTML = `Loading: ${percent}%`;
                }
            },
            (error) => {
                console.error('Error loading STL:', error);
                overlay.innerHTML = `<span style="color: #ff4444; padding: 1rem; text-align: center;">
                    Error loading file.<br>
                    ${error.message || 'Check console for details.'}<br>
                    URL: ${fileUrl}
                </span>`;
            }
        );

        // RESIZE
        const onWindowResize = () => {
            if (!container) return;
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener('resize', onWindowResize);

        // ANIMATE
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();

    } catch (e) {
        console.error("Critical Viewer Error:", e);
        overlay.innerHTML = `Critical Error: ${e.message}`;
    }
}
