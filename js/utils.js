import { AxisGridHelper } from '../js/jsHelper/AxisGridHelper.js';
import * as THREE from 'three';
import { Ball } from './Ball.js';


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
const CORNER_POCKET_RADIUS = 0.16;
export { CORNER_POCKET_RADIUS };
const SIDE_POCKET_RADIUS = 0.15;
export { SIDE_POCKET_RADIUS };
const BORDER_WIDTH = 0.127;
export { BORDER_WIDTH };
const BORDER_HEIGHT = 0.3;
export { BORDER_HEIGHT };
const BORDER_LENGTH = TABLE_LENGTH + .26;
export { BORDER_LENGTH };
const SHORT_BORDER_WIDTH = 5.26;
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
const ROOM_SIZE = 100;
export { ROOM_SIZE };
const CEILINGHEIGHT = 10;
export { CEILINGHEIGHT };
const FRICTION = 1.01;
export { FRICTION };
const LIMIT_VELOCITY = 0.01;
export { LIMIT_VELOCITY };
const POCKET_COLLISION = 1.15;
export { POCKET_COLLISION };
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
  ball.setPosition((Math.random() - 0.5) * TABLE_WIDTH, 1.12, (Math.random() - 0.5) * TABLE_LENGTH);
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
  console.log('All balls added to the scene:', balls);
}