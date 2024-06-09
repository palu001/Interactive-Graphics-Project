import * as THREE from 'three';
import {BALL_RADIUS} from './utils.js';

export class Ball {
  constructor(scene, texturePath, i) {
    
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(texturePath);
    const geometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
    const material = new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.0,
      metalness: 0.8,
      reflectivity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
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
