import * as THREE from 'three';
import { makeAxisGrid} from '../js/utils.js';

export class Ball {
  constructor(scene, texturePath, i,  radius = 1, widthSegments = 32, heightSegments = 32) {
    this.scene = scene;
    this.textureLoader = new THREE.TextureLoader();
    this.texture = this.textureLoader.load(texturePath);
    this.geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
    this.name = 'ball' + i;
    makeAxisGrid(this.mesh, this.name, 25);

    
  }

  setPosition(x, y, z) {
    this.mesh.position.set(x, y, z);
  }
}
