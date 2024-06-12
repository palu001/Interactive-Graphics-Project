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
    const ballPosition = ball.mesh.position;
    
    // Define the planes for the table borders
    const leftBorder = new THREE.Vector3(-TABLE_WIDTH / 2, 1.12, ballPosition.z);
    const rightBorder = new THREE.Vector3(TABLE_WIDTH / 2, 1.12, ballPosition.z);
    const topBorder = new THREE.Vector3(ballPosition.x, 1.12, -TABLE_LENGTH / 2);
    const bottomBorder = new THREE.Vector3(ballPosition.x, 1.12, TABLE_LENGTH / 2);

    // Check distance to borders
    if (ballPosition.distanceTo(leftBorder) < BALL_RADIUS) {
      ball.velocity.x *= -1;
      ball.mesh.position.x = -TABLE_WIDTH / 2 + BALL_RADIUS; 
    }
    if (ballPosition.distanceTo(rightBorder) < BALL_RADIUS) {
      ball.velocity.x *= -1;
      ball.mesh.position.x = TABLE_WIDTH / 2 - BALL_RADIUS;  
    }
    if (ballPosition.distanceTo(topBorder) < BALL_RADIUS) {
      ball.velocity.z *= -1;
      ball.mesh.position.z = -TABLE_LENGTH / 2 + BALL_RADIUS;  
    }
    if (ballPosition.distanceTo(bottomBorder) < BALL_RADIUS) {
      ball.velocity.z *= -1;
      ball.mesh.position.z = TABLE_LENGTH / 2 - BALL_RADIUS;  
    }
  });

  // Collisioni Palla-Buca
  balls.forEach((ball, index) => {
    
    const pocketPositions = [
        [-TABLE_WIDTH / 2  , 1.12, -TABLE_LENGTH / 2 ], 
        [TABLE_WIDTH / 2 , 1.12, -TABLE_LENGTH / 2 ],  // back corners
        [-TABLE_WIDTH / 2 , 1.12, TABLE_LENGTH / 2 ], 
        [TABLE_WIDTH / 2 , 1.12, TABLE_LENGTH / 2 ],   // front corners
        [-TABLE_WIDTH / 2 , 1.12, 0], 
        [TABLE_WIDTH / 2 , 1.12, 0],   // sides
    ];

    pocketPositions.forEach(position => {
      const pocketRadius = (position[2] === 0) ? SIDE_POCKET_RADIUS : CORNER_POCKET_RADIUS;
      const pocketPosition = new THREE.Vector3(position[0], position[1], position[2]);
      const distance = ball.mesh.position.distanceTo(pocketPosition);
      //Rimuovere condizione
      if (distance < BALL_RADIUS/2 + pocketRadius/2) {
       
        if (ball.type != 'cue') {
          
          const pocket_string = (position[2] === 0) ? 'side' : 'corner';
          const pocket_int = (position[0] == TABLE_WIDTH/2) ? 2 : 1;
          
          scene.remove(ball.mesh);
          balls.splice(index, 1);
          game.addScore(ball.type, pocket_string, pocket_int, ball.name );
        }
        else{
          if (!game.cueinPocket){
            ball.velocity = new THREE.Vector3(0, 0, 0);
            ball.angularVelocityMagnitude = 0;
            ball.mesh.position.set(-TABLE_WIDTH/2 -2 , 1.12, 0);
            game.cueinPocket = true;
          }
        }
      }
    });
  });
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

