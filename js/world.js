import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SceneGUI } from '../js/jsHelper/SceneGUI.js';
import { Table } from '../js/Table.js';
import { Room } from '../js/Room.js';
import { Lamp } from '../js/Lamp.js';
import { addBallsToScene, illuminatePocket, loadModel, ROOM_SIZE, TABLE_LENGTH } from '../js/utils.js';
import { updatePhysics } from '../js/Physics.js';
import { Arrow } from '../js/Arrow.js';
import { Game } from '../js/Game.js';
import Stats from 'three/addons/libs/stats.module.js';


let stats = new Stats(); // To show FPS information
const scene = new THREE.Scene();
scene.background = new THREE.Color('black');

const canvas = document.querySelector('#c');
const progressBarContainer = document.getElementById('progress-bar-container');
const progressBar = document.getElementById('progress-bar');
const scoreboard = document.getElementById('scoreboard');
const framerate = document.getElementById('framerate');
framerate.appendChild(stats.dom);

// Define camera properties
const fov = 75;  // amplitude of the camera (degrees)
//It is aspect ratio of near and far planes.
const aspect = canvas.clientWidth / canvas.clientHeight; // always size of canvas (w/h) ->  no distortion 
const near = 0.1; // more near objects are not rendered
const far = 1000; // more far objects are not rendered
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
// initial position of the camera
camera.position.z = 10;
camera.position.y = 10;

// Create orbit controls for the camera
const controls = new OrbitControls(camera, canvas);
controls.update();

// Create a WebGL renderer with anti-aliasing -> smooth edges, improve quality of the scene
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
// Set the size of the renderer to match the canvas dimensions 
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
// Enable shadow mapping in the renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // It reduces the aliasing effect: sampling and averaging the shadow map
// Useful to maintain detail in the shadows
renderer.toneMapping = THREE.ACESFilmicToneMapping; // It simulates the way colors are perceived by the human eye.



const balls = [];
// path to the folder containing ball textures
const textureFolder = 'textures/balls/';

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.12);
scene.add(ambientLight);


const table = new Table(scene);
const room = new Room(scene);
const lamp = new Lamp(scene);


addBallsToScene(scene, textureFolder, balls);

// Initialize the Loading Manager
const manager = new THREE.LoadingManager();
manager.onStart = function (url, itemsLoaded, itemsTotal) {
    // Show the progress bar
    progressBarContainer.style.display = 'block';
    canvas.style.display = 'none';
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    // Calculate the loading progress as a percentage
    const progress = (itemsLoaded / itemsTotal) * 100;
    // Update the width of the progress bar
    progressBar.style.width = `${progress}%`;
};

//All files are loaded
manager.onLoad = function () {
    // Hide the progress bar
    progressBarContainer.style.display = 'none';
    // Show the scoreboard
    scoreboard.style.display = 'block';
    canvas.style.display = 'block';
};

manager.onError = function (url) {
    // Log an error message if file loading fails
    console.log(`There was an error loading ${url}`);
};

// Define positions, rotations, and scale factors for models
const modelParams = [
    {
        urlObj: "textures/tv/MISMARTTV.obj",
        urlMtl: "textures/tv/MISMARTTV.mtl",
        position: { x: ROOM_SIZE / 2 - 5, y: -1, z: 0 },
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
        scale: 5
    },
    {
        urlObj: "textures/sofa_02_4k.blend/sofa_02_4k.obj",
        urlMtl: "textures/sofa_02_4k.blend/sofa_02_4k.mtl",
        position: { x: ROOM_SIZE / 2 - 15, y: -1, z: 0 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        scale: 5
    },
    {
        urlObj: "textures/dining_chair_02_4k.blend/dining_chair_02_4k.obj",
        urlMtl: "textures/dining_chair_02_4k.blend/dining_chair_02_4k.mtl",
        position: { x: -ROOM_SIZE / 2 + 2, y: -1, z: -TABLE_LENGTH / 2 - 2 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        scale: 5
    },
    {
        urlObj: "textures/dining_chair_02_4k.blend/dining_chair_02_4k.obj",
        urlMtl: "textures/dining_chair_02_4k.blend/dining_chair_02_4k.mtl",
        position: { x: -ROOM_SIZE / 2 + 2, y: -1, z: TABLE_LENGTH / 2 + 2 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        scale: 5
    },
    {
        urlObj: "textures/fancy_picture_frame_01_4k.blend/fancy_picture_frame_01_4k.obj",
        urlMtl: "textures/fancy_picture_frame_01_4k.blend/fancy_picture_frame_01_4k.mtl",
        position: { x: -ROOM_SIZE / 2, y: 5, z: 0 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        scale: 10
    },
    {
        urlObj: "textures/fancy_picture_frame_02_4k.blend/fancy_picture_frame_02_4k.obj",
        urlMtl: "textures/fancy_picture_frame_02_4k.blend/fancy_picture_frame_02_4k.mtl",
        position: { x: 0, y: 5, z: ROOM_SIZE / 2 },
        rotation: { x: 0, y: Math.PI, z: 0 },
        scale: 10
    },
    {
        urlObj: "textures/security_camera_02_4k.blend/security_camera_02_4k.obj",
        urlMtl: "textures/security_camera_02_4k.blend/security_camera_02_4k.mtl",
        position: { x: 0, y: 7, z: -ROOM_SIZE / 2},
        rotation: { x: 0, y: 0, z: 0 },
        scale: 10
    }
];

// Function to initialize the scene
async function initScene() {
    // Create promises for loading all models
    const loadModelPromises = modelParams.map(params => 
        loadModel(params.urlObj, params.urlMtl, scene, params.position, params.rotation, params.scale, manager)
    );
    // Wait for all models to load
    await Promise.all(loadModelPromises);

    const sceneGUI = new SceneGUI(scene, camera, balls, ambientLight, lamp.pointLight);
    const game = new Game(balls, camera, renderer, controls);
    const arrow = new Arrow(scene, camera, controls, balls, table, game);
    // Set the Arrow in the Game
    game.setArrow(arrow);


    let lastTime = 0; // useful for delta time calculation
    // Animation loop function
    function animate(time) {
        // Illuminate the target pocket if conditions are met
        illuminatePocket(game, table.pockets);
        // Calculate delta time
        const deltaTime = (time - lastTime) / 1000; // Convert time to seconds
        lastTime = time;
        // Update the physics
        updatePhysics(deltaTime, scene, balls, game);
        // Render the scene
        renderer.render(scene, camera);

        //frame rate
        stats.update();
        // Request the next frame
        requestAnimationFrame(animate);
    }

    // Start the animation loop
    animate(0);

    // Event listener for window resize
    window.addEventListener('resize', () => {
        // Update camera aspect ratio
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        // Update camera projection matrix
        camera.updateProjectionMatrix();
        // Update renderer size
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    });
}

// Initialize the scene
initScene();
