import * as THREE from 'three';
import { BALL_RADIUS, TABLE_WIDTH, TABLE_LENGTH, SIDE_POCKET_RADIUS, CORNER_POCKET_RADIUS } from './utils.js';

function detectCollisions(scene, balls) {
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
    const pocketPositions = [
      [-TABLE_WIDTH / 2, 1, -TABLE_LENGTH / 2], [TABLE_WIDTH / 2, 1, -TABLE_LENGTH / 2], // Angoli posteriori
      [-TABLE_WIDTH / 2, 1, TABLE_LENGTH / 2], [TABLE_WIDTH / 2, 1, TABLE_LENGTH / 2],   // Angoli anteriori
      [-TABLE_WIDTH / 2, 1, 0], [TABLE_WIDTH / 2, 1, 0],   // Lati
    ];

    pocketPositions.forEach(position => {
      const pocketRadius = (position[2] === 0) ? SIDE_POCKET_RADIUS : CORNER_POCKET_RADIUS;
      const pocketPosition = new THREE.Vector3(position[0], position[1], position[2]);
      const distance = ball.mesh.position.distanceTo(pocketPosition);
      if (distance < pocketRadius) {
        scene.remove(ball.mesh);
        balls.splice(index, 1);
      }
    });
  });
}

export function updatePhysics(deltaTime, scene, balls) {
  balls.forEach(ball => {
    if (ball.mesh) {  // Ensure velocity is defined
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
  
  detectCollisions(scene, balls);
}

