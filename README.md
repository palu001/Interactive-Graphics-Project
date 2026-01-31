# 3D Billiard Game

A realistic 3D billiard simulation built with Three.js for the "Interactive Graphics" course at Sapienza University of Rome, a.y. 2024-2025. The game implements authentic pool physics, collision detection, and classic 8-ball rules while showcasing real-time graphics techniques.

## Table of Contents
- [Quick Start](#quick-start)
- [Core Systems](#core-systems)
  - [Physics Engine](#physics-engine)
  - [Game Rules](#game-rules)
  - [Camera System](#camera-system)
  - [Arrow Aiming System](#arrow-aiming-system)
  - [Drag Controls](#drag-controls)
  - [Asset Loading](#asset-loading)
- [Controls](#controls)
- [Technical Implementation](#technical-implementation)
- [Programming Model](#programming-model)

## Quick Start

### Local Server 
Clone and run locally:

```bash
# Clone the repository
git clone https://github.com/yourusername/billiard-game.git](https://github.com/palu001/Interactive-Graphics-Project.git
cd Interactive-Graphics-Project

# Start a local server (choose one):
# Python 3
python3 -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Core Systems

### Physics Engine

The game implements realistic billiard physics with:

#### Ball-Ball Collisions
Elastic collision physics based on conservation of momentum and energy:

```javascript
// Velocity update using elastic collision formulas
v1' = v1 - ((2m2 / (m1 + m2)) * ((v1 - v2) · (x1 - x2) / ||x1 - x2||²)) * (x1 - x2)
v2' = v2 - ((2m1 / (m1 + m2)) * ((v2 - v1) · (x2 - x1) / ||x2 - x1||²)) * (x2 - x1)
```

**Key features:**
- Perfect elastic collisions (no energy loss on impact)
- Speed-based collision filtering to prevent jittering
- Equal mass assumption (m₁ = m₂ = 1) simplifies calculations

#### Border Collisions
Simple reflection physics when balls hit table cushions:
```javascript
// Reverse velocity component perpendicular to border
if (ballPosition.distanceTo(border) < BALL_RADIUS) {
  ball.velocity.component *= -1;
  // Reposition to prevent clipping
  ball.position = border ± BALL_RADIUS;
}
```

#### Friction & Motion Decay
Realistic table friction slows balls over time:

```javascript
ball.velocity = ball.velocity.divideScalar(FRICTION); // FRICTION = 1.01
if (ball.velocity.length() < LIMIT_VELOCITY) {        // LIMIT_VELOCITY = 0.01
  ball.velocity.set(0, 0, 0);  // Full stop
}
```

#### Rotational Dynamics
Balls rotate realistically based on linear velocity:

```javascript
const angularVelocity = ball.velocity.length() / BALL_RADIUS;
const rotationAxis = new THREE.Vector3(vz, 0, -vx).normalize(); // ⊥ to velocity
const rotationAngle = angularVelocity * deltaTime;
ball.mesh.rotateOnWorldAxis(rotationAxis, rotationAngle);
```

Rolling without slipping: ω = v/r

#### Pocket Detection
Two pocket types with different radii:

| Pocket Type | Radius | Positions |
|------------|--------|-----------|
| Corner | 0.36 m | All four corners |
| Side | 0.20 m | Middle of left/right edges |

```javascript
const distance = ball.position.distanceTo(pocketPosition);
if (distance < BALL_RADIUS/2 + pocketRadius/2) {
  // Ball falls in pocket
}
```

### Game Rules

Implementation of standard 8-ball pool rules:

#### Turn System
- **Two players** alternate turns
- Shooting the **white ball (cue ball)** to pocket colored balls
- **Turn continues** if player pockets their assigned ball type
- **Turn changes** on miss or foul

#### Ball Assignment
First pocketed ball determines types:
```javascript
if (this.player1Type == null) {
  this.player1Type = ballType;              // 'solid' or 'striped'
  this.player2Type = (ballType === 'solid') ? 'striped' : 'solid';
}
```

**Ball types:**
- **Solid (1-7)**: Full color balls
- **Striped (9-15)**: Half-white, half-color balls
- **8-ball**: Black ball, must be pocketed last

#### Special Balls
**Ball 1** and **Ball 15** have unique rules:
- Must be pocketed in a **side pocket** (not corner)
- Determines which side pocket for the 8-ball
- Pocketing in wrong pocket = instant loss

```javascript
if (ballType == this.player1Type && ballName == 'ball1') {
  if (pocketType === 'side') {
    this.player1Position = pocketInt;  // Remember which side (1 or 2)
  } else {
    // Instant loss - wrong pocket type
  }
}
```

#### Win Conditions
To win, a player must:
1. Pocket all 7 balls of their type (solid or striped)
2. Pocket the 8-ball in the **correct side pocket**

**Lose conditions:**
- Pocket 8-ball before clearing your balls
- Pocket 8-ball in wrong side pocket
- Pocket 8-ball in any corner pocket
- Pocket ball 1/15 in corner pocket (if it's your type)
- Scratch (white ball in pocket) when opponent has balls remaining

#### Scoring Display
```javascript
updateScoreboard() {
  document.getElementById('player1Score').innerText = `Player 1: ${this.player1Score}`;
  document.getElementById('player2Score').innerText = `Player 2: ${this.player2Score}`;
  document.getElementById('currentPlayerTurn').innerText = `Player ${this.currentPlayer}'s turn`;
  document.getElementById('targetBall').innerText = `Target Ball: ${this.targetBall}`;
}
```

#### Demo Mode
Press **`1`** to set up final scenario:
- Only balls 1, 15, and 8 remain
- Both players at 6/7 score
- Perfect for testing endgame mechanics

### Camera System

**Orbit Controls** powered by Three.js OrbitControls:

```javascript
const controls = new OrbitControls(camera, canvas);
controls.enabled = true;  // Disabled during aiming
```

**Features:**
- **Left-click drag**: Rotate around table
- **Right-click drag**: Pan camera position  
- **Mouse wheel**: Zoom in/out

### Arrow Aiming System

Visual aiming helper for cue ball shots:

#### Click to Aim
```javascript
onMouseClick(event) {
  // Only activate if all balls stopped
  if (checkVelocities(this.balls)) {
    this.arrowHelper = new THREE.ArrowHelper(
      direction,           // Initial direction vector
      ball.position,       // Arrow origin (white ball)
      2,                   // Max length (meters)
      0xffff00             // Yellow color
    );
    this.controls.enabled = false;  // Freeze camera
  }
}
```

#### Dynamic Direction
Arrow follows mouse movement on table plane:

```javascript
onMouseMove(event) {
  // Cast ray from camera through mouse position
  this.raycaster.setFromCamera(this.mouse, this.camera);
  const intersects = this.raycaster.intersectObject(this.table);
  
  if (intersects.length > 0) {
    const point = intersects[0].point;
    point.y = 0;  // Project to table plane
    
    // Calculate direction from ball to mouse
    const direction = point.sub(ballPosition).normalize();
    const length = Math.min(ballPosition.distanceTo(point), 2);
    
    this.arrowHelper.setDirection(direction);
    this.arrowHelper.setLength(length);
  }
}
```

#### Shoot
Press **Enter** to apply force:

```javascript
onEnterPress(event) {
  if (event.key === 'Enter' && this.arrowHelper) {
    const direction = this.arrowHelper.dir.clone();
    const length = this.arrowHelper.length * SCALAR_VELOCITY;  // Scale: 3x
    
    ball.velocity = direction.multiplyScalar(length);
    
    // Cleanup
    scene.remove(this.arrowHelper);
    this.arrowHelper = null;
    this.controls.enabled = true;
  }
}
```

**Visual feedback:**
- Arrow length = shot power
- Arrow direction = shot angle  
- Yellow color for high visibility

### Drag Controls

When white ball scratches, player can reposition it:

```javascript
initializeDragControls() {
  this.dragControls = new DragControls(
    [whiteBall.mesh],      // Only white ball draggable
    camera,
    renderer.domElement
  );
  
  this.dragControls.addEventListener('drag', (event) => {
    event.object.position.y = 1.12;  // Lock Y position (table height)
  });
}
```

#### Position Validation
```javascript
isValidPosition(position) {
  // Check table boundaries
  if (position.x < -TABLE_WIDTH/2 + BALL_RADIUS || 
      position.x > TABLE_WIDTH/2 - BALL_RADIUS ||
      position.z < -TABLE_LENGTH/2 + BALL_RADIUS || 
      position.z > TABLE_LENGTH/2 - BALL_RADIUS) {
    return false;
  }
  
  // Check collision with other balls
  for (const ball of this.balls) {
    if (ball.type !== 'white' && 
        position.distanceTo(ball.position) < BALL_RADIUS * 2) {
      return false;
    }
  }
  return true;
}
```

**User flow:**
1. White ball scratches → Drag mode activates
2. Camera switches to top-down view (FOV 115°)
3. Player drags white ball to valid position
4. Press **Enter** to confirm
5. Camera returns to normal view

### Asset Loading

#### Loading Manager
Custom progress tracking with visual feedback:

```javascript
const manager = new THREE.LoadingManager();

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
  const progress = (itemsLoaded / itemsTotal) * 100;
  progressBar.style.width = `${progress}%`;
};

manager.onLoad = function () {
  progressBarContainer.style.display = 'none';
  scoreboard.style.display = 'block';
  canvas.style.display = 'block';
};
```

**Progress bar:**
```html
<div id="progress-bar-container">
  <div id="progress-bar"></div>
</div>
```

#### OBJ/MTL Model Loading
Asynchronous loading for room decorations:

```javascript
async function loadModel(objUrl, mtlUrl, scene, position, rotation, scale, manager) {
  const mtlLoader = new MTLLoader(manager);
  const objLoader = new OBJLoader(manager);
  
  const mtl = await mtlLoader.loadAsync(mtlUrl);
  mtl.preload();  // Prepare materials
  
  // Enable double-sided rendering
  for (const material of Object.values(mtl.materials)) {
    material.side = THREE.DoubleSide;
  }
  
  objLoader.setMaterials(mtl);
  const model = await objLoader.loadAsync(objUrl);
  
  // Enable shadows
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
    }
  });
  
  model.scale.set(scale, scale, scale);
  model.position.set(position.x, position.y, position.z);
  model.rotation.set(rotation.x, rotation.y, rotation.z);
  
  scene.add(model);
  return model;
}
```

**Loaded models:**
- TV (MISMARTTV)
- Sofa
- Dining chairs (×2)
- Picture frames (×2)
- Security camera

All models loaded in parallel using `Promise.all()`:

```javascript
const loadModelPromises = modelParams.map(params => 
  loadModel(params.urlObj, params.urlMtl, scene, params.position, 
            params.rotation, params.scale, manager)
);
await Promise.all(loadModelPromises);
```

## Controls

| Key/Mouse | Action |
|-----------|--------|
| **Left-click** (on white ball) | Toggle aiming arrow |
| **Mouse move** (while aiming) | Adjust arrow direction and power |
| **Enter** | Shoot ball / Confirm white ball position |
| **Left-click drag** | Rotate camera |
| **Right-click drag** | Pan camera |
| **Mouse wheel** | Zoom in/out |
| **1** | Setup demo scenario (final game state) |
| **Drag** (after scratch) | Reposition white ball |

## Technical Implementation

### Constants & Configuration
```javascript
// Table dimensions (meters)
TABLE_WIDTH: 5
TABLE_LENGTH: 8
TABLE_HEIGHT: 0.1

// Ball properties
BALL_RADIUS: 0.07

// Pocket sizes
CORNER_POCKET_RADIUS: 0.36
SIDE_POCKET_RADIUS: 0.20

// Physics parameters
FRICTION: 1.01          // Velocity decay multiplier
LIMIT_VELOCITY: 0.01    // Stop threshold
SCALAR_VELOCITY: 3      // Shot power multiplier

// Environment
ROOM_SIZE: 50
CEILING_HEIGHT: 10
```

### Ball Creation System
Automatic texture loading and positioning:

```javascript
async function addBallsToScene(scene, textureFolder, balls) {
  // Create all 16 balls (0 = white, 1-15 = colored)
  for (let i = 0; i < 16; i++) {
    const texturePath = (i === 0) 
      ? `${textureFolder}whiteball.png` 
      : `${textureFolder}${i}ball.png`;
    
    const ball = new Ball(scene, texturePath, i);
    ball.velocity = new THREE.Vector3(0, 0, 0);
    balls.push(ball);
    
    await waitForMeshCreation(ball);
  }
  
  arrangeBallsInTriangle(balls);  // Balls 1-15 in rack formation
  balls[0].setPosition(0, 1.12, 1.5);  // White ball in front
}
```

**Triangle arrangement algorithm:**
```javascript
function arrangeBallsInTriangle(balls) {
  const startX = 0, startZ = -1.5;
  const spacing = BALL_RADIUS * 2;
  let ballIndex = 1;
  
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col <= row; col++) {
      const x = startX + spacing * (col - row / 2);
      const z = startZ - spacing * row;
      balls[ballIndex].setPosition(x, 1.12, z);
      ballIndex++;
    }
  }
}
```

### Lighting System
Three-point lighting setup:

```javascript
// Ambient light for base illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.12);

// Point light (lamp above table)
const pointLight = new THREE.PointLight(0xffffff, 1.0);
pointLight.position.set(0, CEILING_HEIGHT - 2, 0);
pointLight.castShadow = true;

// Shadow mapping configuration
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;  // Soft shadows
renderer.toneMapping = THREE.ACESFilmicToneMapping;  // Cinematic look
```

**Shadow quality:**
- PCF Soft Shadow Map: reduces jagged edges
- ACES Filmic Tone Mapping: realistic color grading

### Rendering Loop
Fixed timestep physics with dynamic rendering:

```javascript
let lastTime = 0;

function animate(time) {
  const deltaTime = (time - lastTime) / 1000;  // Convert to seconds
  lastTime = time;
  
  // Update physics
  updatePhysics(deltaTime, scene, balls, game);
  
  // Visual feedback (illuminate target pocket when applicable)
  illuminatePocket(game, table.pockets);
  
  // Render frame
  renderer.render(scene, camera);
  stats.update();  // FPS counter
  
  requestAnimationFrame(animate);
}
```

### Responsive Design
Dynamic canvas resizing:

```javascript
window.addEventListener('resize', () => {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
});
```

## Programming Model

### Event-Driven Architecture
Centralized input handling:

```javascript
// Arrow.js
window.addEventListener('mousedown', this.onMouseClick.bind(this));
window.addEventListener('mousemove', this.onMouseMove.bind(this));
window.addEventListener('keydown', this.onEnterPress.bind(this));

// Game.js
window.addEventListener('keydown', this.onScenarioPress.bind(this));
```

**Binding pattern:**
- `.bind(this)` ensures class methods retain proper context
- Prevents `this` from referring to `window` or `undefined`

### State Management
Game state tracked in `Game.js`:

```javascript
class Game {
  constructor() {
    this.currentPlayer = 1;
    this.player1Score = 0;
    this.player2Score = 0;
    this.player1Type = null;        // 'solid' or 'striped'
    this.player2Type = null;
    this.isWaitingForNextTurn = false;
    this.pointsScored = false;
    this.targetBall = null;
    this.whiteinPocket = false;
  }
}
```

**Turn management:**
```javascript
checkForTurnChange(balls) {
  if (this.isWaitingForNextTurn && checkVelocities(balls)) {
    this.changeTurn();
    this.isWaitingForNextTurn = false;
  }
}
```

### Asynchronous Loading
Non-blocking asset loading:

```javascript
async function initScene() {
  // Load all models in parallel
  const loadModelPromises = modelParams.map(params => 
    loadModel(params.urlObj, params.urlMtl, scene, params.position, 
              params.rotation, params.scale, manager)
  );
  
  await Promise.all(loadModelPromises);
  
  // Initialize game systems after assets loaded
  const game = new Game(balls, camera, renderer, controls);
  const arrow = new Arrow(scene, camera, controls, balls, table, game);
  game.setArrow(arrow);
  
  // Start animation loop
  animate(0);
}
```

### Cross-Component Communication
Components reference each other for coordination:

```javascript
// Arrow needs Game reference to set turn state
class Arrow {
  constructor(scene, camera, controls, balls, table, game) {
    this.game = game;
  }
  
  onEnterPress() {
    // ...shoot logic...
    this.game.setWaitingForNextTurn();
  }
}

// Game needs Arrow reference to disable controls
class Game {
  setArrow(arrow) {
    this.arrow = arrow;
  }
  
  initializeDragControls() {
    this.arrow.dragControls = true;  // Notify arrow system
  }
}
```

---

## Credits

Developed for **Interactive Graphics** course, Sapienza University of Rome, A.Y. 2024-2025.

**Technologies:**
- [Three.js](https://threejs.org/) - 3D graphics library
- [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls) - Camera controls
- [DragControls](https://threejs.org/docs/#examples/en/controls/DragControls) - Object dragging

**Assets:**
- Ball textures: Custom-made
- 3D models: Various sources (see `textures/` folder)

---

**Enjoy the game and feel free to extend it! 🎱**
