import * as THREE from 'three';
import {BALL_RADIUS} from './utils.js';

export class Ball {
  constructor(scene, texturePath, i) {
    
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(texturePath);
    const geometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 1.0,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
    this.name = 'ball' + i;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    // Determine the type of ball
    if (i === 0) {
      this.type = 'cue'; // Cue ball
    } else if (i === 8) {
      this.type = '8'; // 8-ball
    } else if (i >= 1 && i <= 7) {
      this.type = 'solid'; // Solid balls
    } else {
      this.type = 'striped'; // Striped balls
    }
  }
  setPosition(x, y, z) {
    this.mesh.position.set(x, y, z);
  }
}
