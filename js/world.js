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

const scene = new THREE.Scene();
scene.background = new THREE.Color('black');

const canvas = document.querySelector('#c');
const progressBarContainer = document.getElementById('progress-bar-container');
const progressBar = document.getElementById('progress-bar');

const scoreboard = document.getElementById('scoreboard');

const fov = 75;
const aspect = canvas.clientWidth / canvas.clientHeight;
const near = 0.1;
const far = 1000;

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 10;
camera.position.y = 10;

const controls = new OrbitControls(camera, canvas);
controls.update();

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

const balls = [];
const textureFolder = 'textures/balls/';

const ambientLight = new THREE.AmbientLight(0xffffff, 0.12);
scene.add(ambientLight);

const table = new Table(scene);
const room = new Room(scene);
const lamp = new Lamp(scene);

addBallsToScene(scene, textureFolder, balls);


// Initialize the Loading Manager
const manager = new THREE.LoadingManager();
manager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log(`Started loading file: ${url}. Loaded ${itemsLoaded} of ${itemsTotal} files.`);
    progressBarContainer.style.display = 'block'; // Show progress bar
    
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    const progress = (itemsLoaded / itemsTotal) * 100;
    console.log(`Loading file: ${url}. Progress: ${progress.toFixed(2)}% (${itemsLoaded} of ${itemsTotal} files).`);
    progressBar.style.width = `${progress}%`; // Update progress bar
};

manager.onLoad = function () {
    console.log('All files loaded.');
    progressBarContainer.style.display = 'none'; // Hide progress bar
    scoreboard.style.display = 'block'; // Show scoreboard
};

manager.onError = function (url) {
    console.log(`There was an error loading ${url}`);
};

// Positions, rotations, and scale factors for models
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
        position: { x: 0, y: 5, z: ROOM_SIZE / 2 - 1 },
        rotation: { x: 0, y: Math.PI, z: 0 },
        scale: 10
    },
    {
        urlObj: "textures/security_camera_02_4k.blend/security_camera_02_4k.obj",
        urlMtl: "textures/security_camera_02_4k.blend/security_camera_02_4k.mtl",
        position: { x: 0, y: 7, z: -ROOM_SIZE / 2 + 1 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 10
    }
];

async function initScene() {
    const loadModelPromises = modelParams.map(params => 
        loadModel(params.urlObj, params.urlMtl, scene, params.position, params.rotation, params.scale, manager)
    );

    await Promise.all(loadModelPromises);

    const sceneGUI = new SceneGUI(scene, camera, balls, ambientLight, lamp.pointLight);
    const game = new Game(balls, camera, renderer, controls);
    const arrow = new Arrow(scene, camera, controls, balls, table, game);
    game.setArrow(arrow);

    let lastTime = 0;
    function animate(time) {
        illuminatePocket(game, table.pockets);
        const deltaTime = (time - lastTime) / 1000; // Convert time to seconds
        lastTime = time;
        updatePhysics(deltaTime, scene, balls, game);
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate(0);

    window.addEventListener('resize', () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    });
}

initScene();
