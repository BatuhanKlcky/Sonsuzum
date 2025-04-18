<rosieArtifact title="3D Two-Player Wrestling">
<rosieCreate file="main.js">
<![CDATA[
import * as THREE from 'three';
import { Game } from 'game';

// Get the render target
const renderDiv = document.getElementById('renderDiv');

// Initialize the game with the render target
const game = new Game(renderDiv);

// Start the game
game.start();
]]>
</rosieCreate>

<rosieCreate file="game.js">
<![CDATA[
import * as THREE from 'three';
import { setupScene } from 'sceneSetup';
import { Player } from 'player';
import { InputHandler } from 'inputHandler';
import { checkCollisions, checkOutOfBounds } from 'physics';
import { UIManager } from 'ui';

const PLAYER1_START_POS = new THREE.Vector3(-1.5, 0.5, 0);
const PLAYER2_START_POS = new THREE.Vector3(1.5, 0.5, 0);
const PLAYER_RADIUS = 0.4;
const RING_SIZE = 5;
const PUSH_FORCE = 0.08;

export class Game {
    constructor(renderDiv) {
        this.renderDiv = renderDiv;
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderDiv.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.clock = new THREE.Clock();
        this.inputHandler = new InputHandler();
        this.uiManager = new UIManager();

        this.players = [];
        this.ring = null;
        this.gameState = 'playing'; // playing, gameOver

        this.setup();

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    setup() {
        const { scene, camera, ring } = setupScene(this.scene, this.camera);
        this.scene = scene;
        this.camera = camera;
        this.ring = ring; // Store reference to the ring platform

        // Player 1 (Blue)
        this.player1 = new Player(0x0077ff, PLAYER1_START_POS.clone(), PLAYER_RADIUS, 'Player 1');
        this.scene.add(this.player1.mesh);
        this.players.push(this.player1);

        // Player 2 (Red)
        this.player2 = new Player(0xff4444, PLAYER2_START_POS.clone(), PLAYER_RADIUS, 'Player 2');
        this.scene.add(this.player2.mesh);
        this.players.push(this.player2);

        this.uiManager.showMessage("Push your opponent off!", 3000);
    }

    start() {
        this.animate();
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const delta = this.clock.getDelta();

        if (this.gameState === 'playing') {
            this.update(delta);
        }

        this.renderer.render(this.scene, this.camera);
    }

    update(delta) {
        // Get input states
        const p1Input = this.inputHandler.getPlayer1Input();
        const p2Input = this.inputHandler.getPlayer2Input();

        // Apply movement based on input
        this.player1.update(delta, p1Input, RING_SIZE);
        this.player2.update(delta, p2Input, RING_SIZE);

        // Check collisions between players
        const collisionInfo = checkCollisions(this.player1, this.player2);
        if (collisionInfo.collided) {
            // Apply push force based on collision overlap
            const pushVector = collisionInfo.normal.multiplyScalar(PUSH_FORCE * delta * 60); // Normalize force to 60fps
            this.player1.applyForce(pushVector.clone().negate());
            this.player2.applyForce(pushVector);
        }

         // Check if players are out of bounds
         const p1OutOfBounds = checkOutOfBounds(this.player1, RING_SIZE);
         const p2OutOfBounds = checkOutOfBounds(this.player2, RING_SIZE);

         if (p1OutOfBounds || p2OutOfBounds) {
             this.endGame(p1OutOfBounds ? this.player2 : this.player1);
         }
    }

     endGame(winner) {
        this.gameState = 'gameOver';
        this.uiManager.showMessage(`${winner.name} Wins! Resetting...`, 5000);
        console.log(`${winner.name} Wins!`);

        // Reset game after a delay
        setTimeout(() => {
            this.resetGame();
        }, 3000); // 3-second delay before reset
    }

    resetGame() {
        this.player1.reset(PLAYER1_START_POS.clone());
        this.player2.reset(PLAYER2_START_POS.clone());
        this.gameState = 'playing';
        this.uiManager.hideMessage();
         this.uiManager.showMessage("Round Start!", 2000);
        console.log("Game Reset");
    }


    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
]]>
</rosieCreate>

<rosieCreate file="sceneSetup.js">
<![CDATA[
import * as THREE from 'three';

const RING_SIZE = 5;
const RING_THICKNESS = 0.2;
const ROPE_HEIGHT = 0.8;
const ROPE_RADIUS = 0.05;

export function setupScene(scene, camera) {
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);
    // scene.add(new THREE.CameraHelper(directionalLight.shadow.camera)); // Debug shadow camera

    // Camera Position (Overhead view)
    camera.position.set(0, 8, 6);
    camera.lookAt(0, 0, 0);

    // Ring Platform
    const ringGeometry = new THREE.BoxGeometry(RING_SIZE, RING_THICKNESS, RING_SIZE);
    const ringMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.8 });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = -RING_THICKNESS / 2; // Position base at y=0
    ring.receiveShadow = true;
    scene.add(ring);

    // Ring Ropes (Simplified as corner posts and lines for now)
    const postGeometry = new THREE.CylinderGeometry(ROPE_RADIUS * 2, ROPE_RADIUS * 2, ROPE_HEIGHT, 8);
    const postMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const halfSize = RING_SIZE / 2;

    const postPositions = [
        new THREE.Vector3(halfSize, ROPE_HEIGHT / 2, halfSize),
        new THREE.Vector3(-halfSize, ROPE_HEIGHT / 2, halfSize),
        new THREE.Vector3(halfSize, ROPE_HEIGHT / 2, -halfSize),
        new THREE.Vector3(-halfSize, ROPE_HEIGHT / 2, -halfSize),
    ];

    postPositions.forEach(pos => {
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.copy(pos);
        post.castShadow = true;
        scene.add(post);
    });

    // Simple rope lines (optional visual)
    const ropeMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const points = [
        postPositions[0].clone().setY(ROPE_HEIGHT), postPositions[1].clone().setY(ROPE_HEIGHT),
        postPositions[3].clone().setY(ROPE_HEIGHT), postPositions[2].clone().setY(ROPE_HEIGHT),
        postPositions[0].clone().setY(ROPE_HEIGHT) // Close loop
    ];
    const ropeGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const ropeLine = new THREE.Line(ropeGeometry, ropeMaterial);
    scene.add(ropeLine);

    return { scene, camera, ring }; // Return the ring object
}
]]>
</rosieCreate>

<rosieCreate file="player.js">
<![CDATA[
import * as THREE from 'three';

const MOVE_SPEED = 3;
const DRAG = 0.95; // Velocity multiplier per frame (simulates friction/air resistance)
const PLAYER_HEIGHT = 1.0;

export class Player {
    constructor(color, initialPosition, radius, name = 'Player') {
        this.radius = radius;
        this.name = name;

        const geometry = new THREE.CapsuleGeometry(radius, PLAYER_HEIGHT - 2 * radius, 4, 8);
        const material = new THREE.MeshStandardMaterial({ color: color, roughness: 0.5 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(initialPosition);
        this.mesh.castShadow = true;
        this.mesh.geometry.computeBoundingSphere(); // Ensure bounding sphere is calculated

        this.velocity = new THREE.Vector3(0, 0, 0);
        this.inputDirection = new THREE.Vector3(0, 0, 0);
        this.onGround = true; // Simple ground check, assumes starting on ground
    }

    update(delta, input, ringSize) {
        this.inputDirection.set(0, 0, 0);
        if (input.forward) this.inputDirection.z -= 1;
        if (input.backward) this.inputDirection.z += 1;
        if (input.left) this.inputDirection.x -= 1;
        if (input.right) this.inputDirection.x += 1;

        if (this.inputDirection.lengthSq() > 0) {
            this.inputDirection.normalize();
             this.velocity.add(this.inputDirection.multiplyScalar(MOVE_SPEED * delta));
        }

        // Apply velocity and drag
        this.mesh.position.add(this.velocity.clone().multiplyScalar(delta));
        this.velocity.multiplyScalar(DRAG);

        // Keep player flat on the ring (simple clamping)
        this.mesh.position.y = PLAYER_HEIGHT / 2; // Center the capsule vertically

        // Prevent falling through floor initially (handled by out of bounds check later)
        // Basic boundary clamp (will be replaced by out of bounds check)
         const halfRingSize = ringSize / 2 - this.radius;
         this.mesh.position.x = Math.max(-halfRingSize, Math.min(halfRingSize, this.mesh.position.x));
         this.mesh.position.z = Math.max(-halfRingSize, Math.min(halfRingSize, this.mesh.position.z));

        // Simple rotation towards movement direction (optional)
        if (this.velocity.lengthSq() > 0.001) {
           // Look towards velocity direction (horizontal plane)
           const lookTarget = this.mesh.position.clone().add(new THREE.Vector3(this.velocity.x, 0, this.velocity.z));
           this.mesh.lookAt(lookTarget);
        }
    }

     applyForce(force) {
        // Simple impulse application: F = ma -> a = F/m. Assuming mass = 1 for simplicity.
        // Velocity change = acceleration * time. Here we treat force as velocity change directly per frame for simplicity.
        this.velocity.add(force);
    }

     reset(position) {
        this.mesh.position.copy(position);
        this.velocity.set(0, 0, 0);
        this.onGround = true;
    }

    // Helper for physics
    getPosition() {
        return this.mesh.position;
    }

    getBoundingSphere() {
        // Make sure world matrix is updated if object moved without direct position set
        // this.mesh.updateMatrixWorld();
        const sphere = this.mesh.geometry.boundingSphere.clone();
        sphere.center.copy(this.mesh.position); // Apply world position
        return sphere;
    }
}
]]>
</rosieCreate>

<rosieCreate file="inputHandler.js">
<![CDATA[
export class InputHandler {
    constructor() {
        this.keys = {};
        window.addEventListener('keydown', (e) => this.onKeyChange(e, true));
        window.addEventListener('keyup', (e) => this.onKeyChange(e, false));
    }

    onKeyChange(event, isPressed) {
        this.keys[event.code] = isPressed;
        // Prevent default browser behavior for arrow keys and space
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
            event.preventDefault();
        }
    }

    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
    }

    getPlayer1Input() {
        return {
            forward: this.isKeyPressed('KeyW'),
            backward: this.isKeyPressed('KeyS'),
            left: this.isKeyPressed('KeyA'),
            right: this.isKeyPressed('KeyD'),
            // action: this.isKeyPressed('Space') // Example for later
        };
    }

    getPlayer2Input() {
        return {
            forward: this.isKeyPressed('ArrowUp'),
            backward: this.isKeyPressed('ArrowDown'),
            left: this.isKeyPressed('ArrowLeft'),
            right: this.isKeyPressed('ArrowRight'),
             // action: this.isKeyPressed('Enter') // Example for later
        };
    }
}
]]>
</rosieCreate>

<rosieCreate file="physics.js">
<![CDATA[
import * as THREE from 'three';

// Simple Sphere-Sphere Collision Check
export function checkCollisions(player1, player2) {
    const pos1 = player1.getPosition();
    const pos2 = player2.getPosition();
    const distance = pos1.distanceTo(pos2);
    const combinedRadii = player1.radius + player2.radius;

    if (distance < combinedRadii) {
        const overlap = combinedRadii - distance;
        const collisionNormal = pos2.clone().sub(pos1).normalize();

        // Simple separation - move both players back along the collision normal
        const separationAmount = overlap / 2;
        player1.mesh.position.addScaledVector(collisionNormal, -separationAmount);
        player2.mesh.position.addScaledVector(collisionNormal, separationAmount);


        return {
            collided: true,
            normal: collisionNormal, // Direction from player1 to player2
            overlap: overlap
        };
    }
    return { collided: false };
}

// Simple Out-of-Bounds Check (checks if center is off the platform)
export function checkOutOfBounds(player, ringSize) {
    const pos = player.getPosition();
    const halfSize = ringSize / 2;

    // A player is considered out if their center goes beyond the ring edge.
    // A more sophisticated check might use the radius.
    if (Math.abs(pos.x) > halfSize || Math.abs(pos.z) > halfSize) {
        return true;
    }
     // Check if fallen below a certain threshold (e.g., slightly below the ring)
    if (pos.y < -0.5) { // Adjust threshold as needed
        return true;
    }

    return false;
}
]]>
</rosieCreate>

<rosieCreate file="ui.js">
<![CDATA[
export class UIManager {
    constructor() {
        this.messageElement = this.createMessageElement();
        this.timeoutId = null;
    }

    createMessageElement() {
        const element = document.createElement('div');
        element.id = 'game-message';
        element.style.position = 'absolute';
        element.style.top = '20px';
        element.style.left = '50%';
        element.style.transform = 'translateX(-50%)';
        element.style.padding = '10px 20px';
        element.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        element.style.color = 'white';
        element.style.fontFamily = 'Arial, sans-serif';
        element.style.fontSize = '24px';
        element.style.borderRadius = '5px';
        element.style.zIndex = '100';
        element.style.display = 'none'; // Hidden by default
        document.body.appendChild(element);
        return element;
    }

    showMessage(text, duration = 3000) {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId); // Clear previous timeout if any
        }
        this.messageElement.textContent = text;
        this.messageElement.style.display = 'block';

        if (duration > 0) {
            this.timeoutId = setTimeout(() => {
                this.hideMessage();
            }, duration);
        }
    }

    hideMessage() {
         if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        this.messageElement.style.display = 'none';
    }
}
]]>
</rosieCreate>
</rosieArtifact>
