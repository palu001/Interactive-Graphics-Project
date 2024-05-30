import * as THREE from 'three';
import { ROOM_SIZE, DISTANCE_FROM_FLOOR, CEILINGHEIGHT } from './utils.js';

export class Room {
    constructor(scene) {
        const floor_material = new THREE.MeshPhongMaterial({ color: 'red' });

        const floor_geometry = new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE);
        this.floor = new THREE.Mesh(floor_geometry, floor_material);
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.position.y = DISTANCE_FROM_FLOOR;
        scene.add(this.floor);

        this.floor.castShadow = true;
        this.floor.receiveShadow = true;

        const ceiling_material = new THREE.MeshPhongMaterial({ color: 'blue' });
        this.ceiling = new THREE.Mesh(floor_geometry, ceiling_material);
        this.ceiling.rotation.x = Math.PI / 2;
        this.ceiling.position.y = CEILINGHEIGHT;
        scene.add(this.ceiling);

        this.ceiling.castShadow = true;
        this.ceiling.receiveShadow = true;

        const wall_material = new THREE.MeshPhongMaterial({ color: 'green' });

        // geometry per tutti i muri
        const wall_geometry = new THREE.PlaneGeometry(ROOM_SIZE, CEILINGHEIGHT - DISTANCE_FROM_FLOOR);

        // Muro posteriore
        this.backWall = new THREE.Mesh(wall_geometry, wall_material);
        this.backWall.position.z = -ROOM_SIZE / 2;
        this.backWall.position.y = (CEILINGHEIGHT + DISTANCE_FROM_FLOOR) / 2;
        scene.add(this.backWall);

        this.backWall.castShadow = true;
        this.backWall.receiveShadow = true;

        // Muro anteriore
        this.frontWall = new THREE.Mesh(wall_geometry, wall_material);
        this.frontWall.position.z = ROOM_SIZE / 2;
        this.frontWall.position.y = (CEILINGHEIGHT + DISTANCE_FROM_FLOOR) / 2;
        this.frontWall.rotation.y = Math.PI;
        scene.add(this.frontWall);

        this.frontWall.castShadow = true;
        this.frontWall.receiveShadow = true;

        // Muro sinistro
        this.leftWall = new THREE.Mesh(wall_geometry, wall_material);
        this.leftWall.position.x = -ROOM_SIZE / 2;
        this.leftWall.position.y = (CEILINGHEIGHT + DISTANCE_FROM_FLOOR) / 2;
        this.leftWall.rotation.y = Math.PI / 2;
        scene.add(this.leftWall);

        this.leftWall.castShadow = true;
        this.leftWall.receiveShadow = true;

        // Muro destro
        this.rightWall = new THREE.Mesh(wall_geometry, wall_material);
        this.rightWall.position.x = ROOM_SIZE / 2;
        this.rightWall.position.y = (CEILINGHEIGHT + DISTANCE_FROM_FLOOR) / 2;
        this.rightWall.rotation.y = -Math.PI / 2;
        scene.add(this.rightWall);

        this.rightWall.castShadow = true;
        this.rightWall.receiveShadow = true;
    }
}
