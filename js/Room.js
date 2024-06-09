import * as THREE from 'three';
import { ROOM_SIZE, DISTANCE_FROM_FLOOR, CEILINGHEIGHT } from './utils.js';

export class Room {
  constructor(scene) {
    const textureLoader = new THREE.TextureLoader();
    
    // Load textures
    const floorTexture = textureLoader.load('textures/room/wood_texture.png');
    const ceilingTexture = textureLoader.load('textures/room/wood_texture.png');
    const wallTexture = textureLoader.load('textures/room/wood_texture.png');

    // Create materials with textures
    const floorMaterial = new THREE.MeshPhysicalMaterial({ map: floorTexture, roughness: 0.5, metalness: 0.2 });
    const ceilingMaterial = new THREE.MeshPhysicalMaterial({ map: ceilingTexture, roughness: 0.5, metalness: 0.2 });
    const wallMaterial = new THREE.MeshPhysicalMaterial({ map: wallTexture, roughness: 0.5, metalness: 0.2 });

   
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(2, 2); 

    ceilingTexture.wrapS = THREE.RepeatWrapping;
    ceilingTexture.wrapT = THREE.RepeatWrapping;
    ceilingTexture.repeat.set(2, 2); 

    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(2, 2);  

    // Create geometries
    const floorGeometry = new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE);
    const wallGeometry = new THREE.PlaneGeometry(ROOM_SIZE, CEILINGHEIGHT - DISTANCE_FROM_FLOOR);

    // Floor
    this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = DISTANCE_FROM_FLOOR;
    scene.add(this.floor);
    this.floor.castShadow = true;
    this.floor.receiveShadow = true;

    // Ceiling
    this.ceiling = new THREE.Mesh(floorGeometry, ceilingMaterial);
    this.ceiling.rotation.x = Math.PI / 2;
    this.ceiling.position.y = CEILINGHEIGHT;
    scene.add(this.ceiling);
    this.ceiling.castShadow = true;
    this.ceiling.receiveShadow = true;

    // Back wall
    this.backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    this.backWall.position.z = -ROOM_SIZE / 2;
    this.backWall.position.y = (CEILINGHEIGHT + DISTANCE_FROM_FLOOR) / 2;
    scene.add(this.backWall);
    this.backWall.castShadow = true;
    this.backWall.receiveShadow = true;

    // Front wall
    this.frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
    this.frontWall.position.z = ROOM_SIZE / 2;
    this.frontWall.position.y = (CEILINGHEIGHT + DISTANCE_FROM_FLOOR) / 2;
    this.frontWall.rotation.y = Math.PI;
    scene.add(this.frontWall);
    this.frontWall.castShadow = true;
    this.frontWall.receiveShadow = true;

    // Left wall
    this.leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    this.leftWall.position.x = -ROOM_SIZE / 2;
    this.leftWall.position.y = (CEILINGHEIGHT + DISTANCE_FROM_FLOOR) / 2;
    this.leftWall.rotation.y = Math.PI / 2;
    scene.add(this.leftWall);
    this.leftWall.castShadow = true;
    this.leftWall.receiveShadow = true;

    // Right wall
    this.rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    this.rightWall.position.x = ROOM_SIZE / 2;
    this.rightWall.position.y = (CEILINGHEIGHT + DISTANCE_FROM_FLOOR) / 2;
    this.rightWall.rotation.y = -Math.PI / 2;
    scene.add(this.rightWall);
    this.rightWall.castShadow = true;
    this.rightWall.receiveShadow = true;
  }
}
