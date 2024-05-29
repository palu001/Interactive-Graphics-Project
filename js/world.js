import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { Ball } from '../js/Ball.js';
import {SceneGUI} from '../js/jsHelper/SceneGUI.js';


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
controls.target.set(0, 5, 0);
controls.update();

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
renderer.shadowMap.enabled = true;

const balls = [];
const textureFolder = 'textures/balls/';




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
}


const color = 0xFFFFFF;
const intensity = 2;
const ambient_light = new THREE.AmbientLight(color, intensity);
scene.add(ambient_light);




const light_directional = new THREE.DirectionalLight(color, intensity);
light_directional.castShadow = true;
light_directional.position.set(0, 10, 0);
light_directional.target.position.set(-5, 0, 0);
scene.add(light_directional);
scene.add(light_directional.target);


const sceneGUI = new SceneGUI(scene, camera, balls, ambient_light, light_directional);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
});
