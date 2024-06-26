import * as THREE from 'three';
import { BALL_RADIUS, TABLE_WIDTH, TABLE_LENGTH, SIDE_POCKET_RADIUS, CORNER_POCKET_RADIUS, FRICTION, LIMIT_VELOCITY
 } from './utils.js';

function detectCollisions(scene, balls, game) {
  // Collision ball-ball
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const ball1 = balls[i];
      const ball2 = balls[j];
      const distance = ball1.mesh.position.distanceTo(ball2.mesh.position);
      // It means that the balls are colliding because the distance is less than the sum of their radius
      if (distance < BALL_RADIUS * 2) {
        // Elastic collision: https://en.wikipedia.org/wiki/Elastic_collision
        const x1 = ball1.mesh.position.clone();
        const x2 = ball2.mesh.position.clone();
        const v1 = ball1.velocity.clone();
        const v2 = ball2.velocity.clone();

        const x1_minus_x2 = x1.clone().sub(x2);
        const x2_minus_x1 = x2.clone().sub(x1);
        const v1_minus_v2 = v1.clone().sub(v2);
        const v2_minus_v1 = v2.clone().sub(v1);

        const norm_x1_minus_x2 = x1_minus_x2.lengthSq();
        const norm_x2_minus_x1 = x2_minus_x1.lengthSq();

        const speed = v1_minus_v2.clone().dot(x2_minus_x1.clone().normalize());

        if (speed < 0) {
          continue;
        }

        const dot_v1_x1_minus_x2 = v1_minus_v2.dot(x1_minus_x2);
        const dot_v2_x2_minus_x1 = v2_minus_v1.dot(x2_minus_x1);

        const m1 = 1; 
        const m2 = 1; 

        const v1_new = v1.sub(x1_minus_x2.multiplyScalar((2 * m2 / (m1 + m2)) * (dot_v1_x1_minus_x2 / norm_x1_minus_x2)));
        const v2_new = v2.sub(x2_minus_x1.multiplyScalar((2 * m1 / (m1 + m2)) * (dot_v2_x2_minus_x1 / norm_x2_minus_x1)));

        ball1.velocity = v1_new;
        ball2.velocity = v2_new;

      }
    }
  }

  // Collision Border-Ball : i change the direction of the ball if it hits the border 
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

  // Collision Pocket-Ball
  balls.forEach((ball, index) => {
    
    const pocketPositions = [
        [-TABLE_WIDTH / 2  , 1.12, -TABLE_LENGTH / 2 ], 
        [TABLE_WIDTH / 2 , 1.12, -TABLE_LENGTH / 2 ],  
        [-TABLE_WIDTH / 2 , 1.12, TABLE_LENGTH / 2 ], 
        [TABLE_WIDTH / 2 , 1.12, TABLE_LENGTH / 2 ],   
        [-TABLE_WIDTH / 2 , 1.12, 0], 
        [TABLE_WIDTH / 2 , 1.12, 0],   
    ];

    pocketPositions.forEach(position => {
      const pocketRadius = (position[2] === 0) ? SIDE_POCKET_RADIUS : CORNER_POCKET_RADIUS;
      const pocketPosition = new THREE.Vector3(position[0], position[1], position[2]);
      const distance = ball.mesh.position.distanceTo(pocketPosition);
      if (distance < BALL_RADIUS/2 + pocketRadius/2) {
       
        if (ball.type != 'white') {
          
          const pocket_string = (position[2] === 0) ? 'side' : 'corner';
          const pocket_int = (position[0] == TABLE_WIDTH/2) ? 2 : 1;
          
          scene.remove(ball.mesh);
          balls.splice(index, 1);
          game.addScore(ball.type, pocket_string, pocket_int, ball.name );
        }
        else{
          if (!game.whiteinPocket){
            ball.velocity = new THREE.Vector3(0, 0, 0);
            ball.angularVelocityMagnitude = 0;
            ball.mesh.position.set(-TABLE_WIDTH/2 -2 , 1.12, 0); // not on the table
            game.whiteinPocket = true; // it will be seen in the changeTurn function
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
      const rotationAxis = new THREE.Vector3(ball.velocity.z, 0, -ball.velocity.x).normalize(); // It is perpendicular to the velocity vector
      const rotationAngle = angularVelocityMagnitude * deltaTime;
      ball.mesh.rotateOnWorldAxis(rotationAxis, rotationAngle); // rotate the ball of the angle around the axis
    } else {
      console.error("Ball velocity is undefined", ball);
    }
  });
  detectCollisions(scene, balls, game);

  // Check if all balls have stopped to change the turn
  game.checkForTurnChange(balls);
}

