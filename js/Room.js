import * as THREE from 'three';
import { ROOM_SIZE, DISTANCE_FROM_FLOOR, CEILINGHEIGHT } from './utils.js';

export class Room {
  constructor(scene) {
    const textureLoader = new THREE.TextureLoader();
    
    // Load textures for floor, ceiling, and walls
    const floorTexture = textureLoader.load('textures/room/wood_floor_diff_4k.jpg');
    const ceilingTexture = textureLoader.load('textures/room/oak_veneer_01_diff_4k.jpg');
    const wallTexture = textureLoader.load('textures/room/oak_veneer_01_diff_4k.jpg');

    // Create materials with the loaded textures
    const floorMaterial = new THREE.MeshPhongMaterial({ map: floorTexture, });
    const ceilingMaterial = new THREE.MeshPhongMaterial({ map: ceilingTexture, });
    const wallMaterial = new THREE.MeshPhongMaterial({ map: wallTexture, });

    // Set texture wrapping and repeat for floor texture
    floorTexture.wrapS = THREE.RepeatWrapping; // Repeat the texture horizontally
    floorTexture.wrapT = THREE.RepeatWrapping; // Repeat the texture vertically
    // 1 | 1
    // 1 | 1
    floorTexture.repeat.set(2, 2);  //The texture is mapped 4 times 


    // Set texture wrapping and repeat for ceiling texture
    ceilingTexture.wrapS = THREE.RepeatWrapping;
    ceilingTexture.wrapT = THREE.RepeatWrapping;
    ceilingTexture.repeat.set(2, 2); 

    // Set texture wrapping and repeat for wall texture
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    // 1 | 1
    wallTexture.repeat.set(2, 1);  

    // Create geometries for floor and walls
    const floorGeometry = new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE);
    const wallGeometry = new THREE.PlaneGeometry(ROOM_SIZE, CEILINGHEIGHT - DISTANCE_FROM_FLOOR);

    // Create the floor mesh, set its position and rotation, and add it to the scene
    this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = DISTANCE_FROM_FLOOR;
    scene.add(this.floor);
    this.floor.castShadow = true;
    this.floor.receiveShadow = true;

    // Create the ceiling mesh, set its position and rotation, and add it to the scene
    this.ceiling = new THREE.Mesh(floorGeometry, ceilingMaterial);
    this.ceiling.rotation.x = Math.PI / 2;
    this.ceiling.position.y = CEILINGHEIGHT;
    scene.add(this.ceiling);
    this.ceiling.castShadow = true;
    this.ceiling.receiveShadow = true;

    // Create the back wall mesh, set its position and rotation, and add it to the scene
    this.backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    this.backWall.position.z = -ROOM_SIZE / 2;
    this.backWall.position.y = (CEILINGHEIGHT + DISTANCE_FROM_FLOOR) / 2;
    scene.add(this.backWall);
    this.backWall.castShadow = true;
    this.backWall.receiveShadow = true;

    // Create the front wall mesh, set its position and rotation, and add it to the scene
    this.frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
    this.frontWall.position.z = ROOM_SIZE / 2;
    this.frontWall.position.y = (CEILINGHEIGHT + DISTANCE_FROM_FLOOR) / 2;
    this.frontWall.rotation.y = Math.PI;
    scene.add(this.frontWall);
    this.frontWall.castShadow = true;
    this.frontWall.receiveShadow = true;

    // Create the left wall mesh, set its position and rotation, and add it to the scene
    this.leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    this.leftWall.position.x = -ROOM_SIZE / 2;
    this.leftWall.position.y = (CEILINGHEIGHT + DISTANCE_FROM_FLOOR) / 2;
    this.leftWall.rotation.y = Math.PI / 2;
    scene.add(this.leftWall);
    this.leftWall.castShadow = true;
    this.leftWall.receiveShadow = true;

    // Create the right wall mesh, set its position and rotation, and add it to the scene
    this.rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    this.rightWall.position.x = ROOM_SIZE / 2;
    this.rightWall.position.y = (CEILINGHEIGHT + DISTANCE_FROM_FLOOR) / 2;
    this.rightWall.rotation.y = -Math.PI / 2;
    scene.add(this.rightWall);
    this.rightWall.castShadow = true;
    this.rightWall.receiveShadow = true;
  }
}
