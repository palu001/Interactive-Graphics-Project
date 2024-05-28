import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { Ball } from '../js/Ball.js';


const scene = new THREE.Scene();
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
