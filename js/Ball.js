import * as THREE from 'three';
import { BALL_RADIUS } from './utils.js';

export class Ball {
  // i: the index of the ball, used to determine its type and name
  constructor(scene, texturePath, i) {
    
    // Load the texture for the ball
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(texturePath);
    
    // Create the geometry for the ball (a sphere)
    const geometry = new THREE.SphereGeometry(BALL_RADIUS);
    
    // Create the material for the ball with physical properties
    const material = new THREE.MeshPhongMaterial({
      map: texture,  // Apply the texture to the material
    });
    
    
    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
    this.name = 'ball' + i;
    
    // Enable shadows for the ball
    this.mesh.castShadow = true; // The ball will cast a shadow if light shines on it
    this.mesh.receiveShadow = true; // The ball will receive shadows from other objects

    // Determine the type of ball based on the index
    if (i === 0) {
      this.type = 'white'; // White ball
    } else if (i === 8) {
      this.type = '8'; // 8-ball
    } else if (i >= 1 && i <= 7) {
      this.type = 'solid'; // Solid balls
    } else {
      this.type = 'striped'; // Striped balls
    }
  }

  // Method to set the position of the ball in the scene
  setPosition(x, y, z) {
    this.mesh.position.set(x, y, z);
  }
}
