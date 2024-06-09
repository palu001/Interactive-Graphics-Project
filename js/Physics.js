import * as THREE from 'three';
import { BALL_RADIUS, TABLE_WIDTH, TABLE_LENGTH, SIDE_POCKET_RADIUS, CORNER_POCKET_RADIUS, FRICTION, LIMIT_VELOCITY
 } from './utils.js';

function detectCollisions(scene, balls, game) {
  // Collisioni Palla-Palla
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const ball1 = balls[i];
      const ball2 = balls[j];
      const distance = ball1.mesh.position.distanceTo(ball2.mesh.position);
      if (distance < BALL_RADIUS * 2) {
        const normal = new THREE.Vector3().subVectors(ball2.mesh.position, ball1.mesh.position).normalize();
        const relativeVelocity = new THREE.Vector3().subVectors(ball1.velocity, ball2.velocity);
        const speed = relativeVelocity.dot(normal);
        if (speed < 0) continue; // Le palle si stanno allontanando l'una dall'altra
        // Calcolo dell'impulso
        const impulse = normal.multiplyScalar(2 * speed / (1 / BALL_RADIUS + 1 / BALL_RADIUS));
        ball1.velocity.sub(impulse.clone().multiplyScalar(1 / BALL_RADIUS));
        ball2.velocity.add(impulse.clone().multiplyScalar(1 / BALL_RADIUS));
      }
    }
  }

  // Collisioni Palla-Bordo
  balls.forEach(ball => {
    if (ball.mesh.position.x <= -TABLE_WIDTH / 2 + BALL_RADIUS || ball.mesh.position.x >= TABLE_WIDTH / 2 - BALL_RADIUS) {
      ball.velocity.x *= -1;
    }
    if (ball.mesh.position.z <= -TABLE_LENGTH / 2 + BALL_RADIUS || ball.mesh.position.z >= TABLE_LENGTH / 2 - BALL_RADIUS) {
      ball.velocity.z *= -1;
    }
  });

  // Collisioni Palla-Buca
  balls.forEach((ball, index) => {
    const pocketOffset = 0.15; 
    const pocketPositions = [
        [-TABLE_WIDTH / 2 - 0 , 1.12, -TABLE_LENGTH / 2 - 0], 
        [TABLE_WIDTH / 2 + 0, 1.12, -TABLE_LENGTH / 2 - 0],  // back corners
        [-TABLE_WIDTH / 2 - 0, 1.12, TABLE_LENGTH / 2 + 0], 
        [TABLE_WIDTH / 2 + 0, 1.12, TABLE_LENGTH / 2 + 0],   // front corners
        [-TABLE_WIDTH / 2 - 0, 1.12, 0], 
        [TABLE_WIDTH / 2 + 0, 1.12, 0],   // sides
    ];

    pocketPositions.forEach(position => {
      const pocketRadius = (position[2] === 0) ? SIDE_POCKET_RADIUS : CORNER_POCKET_RADIUS;
      const pocketPosition = new THREE.Vector3(position[0], position[1], position[2]);
      const distance = ball.mesh.position.distanceTo(pocketPosition);
      if (distance < pocketRadius/2) {
        if (ball.type != 'cue') {
          scene.remove(ball.mesh);
          balls.splice(index, 1);
          game.addScore(ball.type);
        }
        else{
          const newPosition = findFreePositionNear(ball.lastPosition, balls);
          ball.setPosition(newPosition.x, newPosition.y, newPosition.z);
          ball.velocity.set(0, 0, 0);
          ball.angularVelocity.set(0, 0, 0);
        }
      }
    });
  });
}

function findFreePositionNear(position, balls) {
  // Define a small offset to try nearby positions
  const offset = BALL_RADIUS * 3;
  const attempts = [
    new THREE.Vector3(position.x, position.y, position.z),
    new THREE.Vector3(position.x + offset, position.y, position.z),
    new THREE.Vector3(position.x - offset, position.y, position.z),
    new THREE.Vector3(position.x, position.y, position.z + offset),
    new THREE.Vector3(position.x, position.y, position.z - offset),
  ];

  for (const attempt of attempts) {
    let collision = false;
    for (const ball of balls) {
      if (ball.type!='cue' && attempt.distanceTo(ball.mesh.position) < offset) {
        collision = true;
        break;
      }
    }
    if (!collision) {
      return attempt;
    }
  }
  return position; // Default to original position if no free spot is found
}

export function updatePhysics(deltaTime, scene, balls, game) {
  balls.forEach(ball => {
    if (ball.mesh) { 
      ball.velocity = ball.velocity.divideScalar(FRICTION); // Friction
      if (ball.velocity.length() < LIMIT_VELOCITY){
        ball.velocity.set(0, 0, 0);
      }
      const distance = ball.velocity.clone().multiplyScalar(deltaTime);
      ball.mesh.position.add(distance);

      // Angular velocity and rotation
      const angularVelocityMagnitude = ball.velocity.length() / BALL_RADIUS;
      const rotationAxis = new THREE.Vector3(ball.velocity.z, 0, -ball.velocity.x).normalize();
      const rotationAngle = angularVelocityMagnitude * deltaTime;
      ball.mesh.rotateOnWorldAxis(rotationAxis, rotationAngle);
    } else {
      console.error("Ball velocity is undefined", ball);
    }
  });
  detectCollisions(scene, balls, game);

  // Check if all balls have stopped to change the turn
  game.checkForTurnChange(balls);
}

