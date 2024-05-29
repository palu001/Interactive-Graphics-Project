import * as THREE from 'three';

export class Ball {
  constructor(scene, texturePath, i,  radius = 1, widthSegments = 32, heightSegments = 32) {
    this.scene = scene;
    this.textureLoader = new THREE.TextureLoader();
    this.texture = this.textureLoader.load(texturePath);
    this.geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    this.material = new THREE.MeshStandardMaterial({
      map: this.texture,
      roughness: 1.0,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
    this.name = 'ball' + i;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }

  setPosition(x, y, z) {
    this.mesh.position.set(x, y, z);
  }
}
