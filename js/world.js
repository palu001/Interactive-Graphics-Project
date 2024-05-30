import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { Ball } from '../js/Ball.js';
import {SceneGUI} from '../js/jsHelper/SceneGUI.js';
import {Table} from '../js/Table.js';
import {Room} from '../js/Room.js';
import {Lamp} from '../js/Lamp.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color('black');



const canvas = document.querySelector('#c');

const fov = 75;
const aspect = canvas.clientWidth / canvas.clientHeight;
const near = 0.1;
const far = 1000;

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 15;




const controls = new OrbitControls(camera, canvas);
/* controls.target.set(0, 5, 0); */
controls.update();

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
renderer.shadowMap.enabled = true;

const balls = [];
const textureFolder = 'textures/balls/';




/* Da modificare col tavolo 
for (let i = 0; i < 16; i++) {
  var texturePath=textureFolder + i + 'ball.png';
  if (i==0){
    texturePath=textureFolder + 'whiteball.png';
  }
  console.log(texturePath);
  const ball = new Ball(scene, texturePath, i);
  ball.setPosition(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10
  );
  balls.push(ball);
}*/


const color = 0xFFFFFF;
const intensity = 2;
const ambient_light = new THREE.AmbientLight(color, intensity);
scene.add(ambient_light);








const table = new Table(scene);
const ball = new Ball(scene, textureFolder + 'whiteball.png', 0);
const room = new Room(scene);
const lamp = new Lamp(scene);

const sceneGUI = new SceneGUI(scene, camera, null, ambient_light, lamp.pointLight);

function animate() {
  

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
});
