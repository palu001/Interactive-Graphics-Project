import { AxisGridHelper } from '../js/jsHelper/AxisGridHelper.js';
import * as THREE from 'three';
import { Ball } from './Ball.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';


//GUI for Helper
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';
const gui = new GUI();
export { gui };

//Function for Grid
export function makeAxisGrid(node, label, units, folder) {
    const helper = new AxisGridHelper(node, units);
    folder.add(helper, 'visible').name(label);
}

// Dimensions table, balls, pockets, borders, legs, floor
const TABLE_WIDTH = 5;
export { TABLE_WIDTH };
const TABLE_HEIGHT = 0.1;
export { TABLE_HEIGHT };
const TABLE_LENGTH = 8;
export { TABLE_LENGTH };
const BALL_RADIUS = 0.07;
export { BALL_RADIUS };
const CORNER_POCKET_RADIUS = 0.36;
export { CORNER_POCKET_RADIUS };
const SIDE_POCKET_RADIUS = 0.17;
export { SIDE_POCKET_RADIUS };
const BORDER_WIDTH = 0.127;
export { BORDER_WIDTH };
const BORDER_HEIGHT = 0.3;
export { BORDER_HEIGHT };
const BORDER_LENGTH = TABLE_LENGTH - .26;
export { BORDER_LENGTH };
const SHORT_BORDER_WIDTH = TABLE_WIDTH -0.21;
export { SHORT_BORDER_WIDTH };
const SHORT_BORDER_HEIGHT = 0.3;
export { SHORT_BORDER_HEIGHT };
const SHORT_BORDER_LENGTH = 0.127;
export { SHORT_BORDER_LENGTH };
const LEG_WIDTH = 0.2;
export { LEG_WIDTH };
const LEG_HEIGHT = 2;
export { LEG_HEIGHT };
const LEG_DEPTH = 0.2;
export { LEG_DEPTH };
const DISTANCE_FROM_FLOOR = -LEG_WIDTH-0.8;
export { DISTANCE_FROM_FLOOR };
const ROOM_SIZE = 50;
export { ROOM_SIZE };
const CEILINGHEIGHT = 10;
export { CEILINGHEIGHT };
const FRICTION = 1.01;
export { FRICTION };
const LIMIT_VELOCITY = 0.02;
export { LIMIT_VELOCITY };
const SCALAR_VELOCITY = 3;
export { SCALAR_VELOCITY };


//Functions used in order to create balls and insert them into the scene

function createBall(i, scene, textureFolder) {
  const texturePath = i === 0 ? `${textureFolder}whiteball.png` : `${textureFolder}${i}ball.png`;
  return new Ball(scene, texturePath, i);
}

function waitForMeshCreation(ball) {
  return new Promise((resolve) => {
    function checkMesh() {
      if (ball.mesh && ball.velocity && ball.angularVelocity) {
        resolve(ball);
      } else {
        requestAnimationFrame(checkMesh);
      }
    }
    checkMesh();
  });
}

function initializeBall(ball, scene) {
  //ball.setPosition((Math.random() - 0.5) * TABLE_WIDTH, 1.12, (Math.random() - 0.5) * TABLE_LENGTH);
  //ball.velocity = new THREE.Vector3((Math.random() - 0.5), 0, (Math.random() - 0.5));
  ball.velocity = new THREE.Vector3(0, 0, 0);
  ball.angularVelocity = new THREE.Vector3();
}

async function addBall(i, scene, textureFolder, balls) {
  const ball = createBall(i, scene, textureFolder);
  initializeBall(ball, scene);
  balls.push(ball);
  await waitForMeshCreation(ball);
}

export async function addBallsToScene(scene, textureFolder, balls) {
  const ballPromises = [];
  for (let i = 0; i < 16; i++) {
    ballPromises.push(addBall(i, scene, textureFolder, balls));
  }
  await Promise.all(ballPromises);

  // Arrange the balls in a triangle formation
  arrangeBallsInTriangle(balls);

  // Position the cue ball in front of the triangle
  balls[0].setPosition(0, 1.12, 1.5);
}


export function checkVelocities(balls){
  let allBallsStopped = true;
  for (let i = 0; i < balls.length; i++) {
    if (balls[i].velocity.length() > LIMIT_VELOCITY) {
      allBallsStopped = false;
      break;
    }
  }
  return allBallsStopped;
}

function arrangeBallsInTriangle(balls) {
  const startX = 0; // X coordinate for the first ball
  const startZ = -1.5; // Z coordinate for the first ball, adjust as needed
  const rowSpacing = BALL_RADIUS * 2;
  const colSpacing = BALL_RADIUS * 2;

  let ballIndex = 1; // Start from 1 because 0 is the cue ball

  for (let row = 0; row < 5; row++) { // 5 rows in a standard 15-ball triangle
    for (let col = 0; col <= row; col++) {
      const x = startX + colSpacing * (col - row / 2);
      const z = startZ - rowSpacing * row;
      balls[ballIndex].setPosition(x, 1.12, z);
      ballIndex++;
    }
  }
}

export function illuminatePocket(game, pockets){
  if (game.currentPlayer == 1 && game.player1Score == 7){
    if (game.player1Position == 1){
      pockets[5].material.color.set('yellow');
    }
    else{
      pockets[4].material.color.set('yellow');
    }
  }
  else if (game.currentPlayer == 2 && game.player2Score == 7){
    if (game.player2Position == 1){
      pockets[5].material.color.set('yellow');
    }
    else{
      pockets[4].material.color.set('yellow');
    }
  }
  else{
    pockets[5].material.color.set('black');
    pockets[4].material.color.set('black');
  }
}

export async function loadModel(url1, url2, scene, position, rotation, scale_factor, manager) {
  const objLoader = new OBJLoader(manager);
  const mtlLoader = new MTLLoader(manager);

  let model_obj;

  await mtlLoader.loadAsync(url2).then((mtl) => {
      mtl.preload();
      for (const material of Object.values(mtl.materials)) {
          material.side = THREE.DoubleSide;
      }
      objLoader.setMaterials(mtl);
      return objLoader.loadAsync(url1);
  }).then((model) => {
      // Re-center geometry
      model.traverse((child) => {
          if (child.isMesh) {
              child.geometry.computeBoundingBox();
              const boundingBox = child.geometry.boundingBox;
              const center = new THREE.Vector3();
              boundingBox.getCenter(center);

              // Enable shadows
              child.castShadow = true;
              
          }
      });
      model.scale.set(scale_factor, scale_factor, scale_factor);
      model.position.set(position.x, position.y, position.z);
      model.rotation.set(rotation.x, rotation.y, rotation.z);
      scene.add(model);

      model.boundingBox = new THREE.Box3().setFromObject(model);
      model_obj = model;
  });
  return { model_obj };
}