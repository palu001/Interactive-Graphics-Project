import * as THREE from 'three';
import {BALL_RADIUS} from './utils.js';

export class Ball {
  constructor(scene, texturePath, i) {
    
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(texturePath);
    const geometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      map: this.texture,
      roughness: 1.0,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
    this.name = 'ball' + i;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.set(0, 1.1, 0); // Raised to match the table height
  }

  setPosition(x, y, z) {
    this.mesh.position.set(x, y, z);
  }
}
