import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SceneGUI } from '../js/jsHelper/SceneGUI.js';
import { Table } from '../js/Table.js';
import { Room } from '../js/Room.js';
import { Lamp } from '../js/Lamp.js';
import { addBallsToScene, illuminatePocket } from '../js/utils.js';
import { updatePhysics } from '../js/Physics.js';
import { Arrow } from '../js/Arrow.js';
import { Game } from '../js/Game.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color('black');

const canvas = document.querySelector('#c');

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

const ambientLight = new THREE.AmbientLight(0xffffff, 0.0);
scene.add(ambientLight);

const table = new Table(scene);
const room = new Room(scene);
const lamp = new Lamp(scene);

addBallsToScene(scene, textureFolder, balls);
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

