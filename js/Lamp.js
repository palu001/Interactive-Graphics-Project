import * as THREE from 'three';
import {CEILINGHEIGHT } from './utils.js';

export class Lamp {
    constructor(scene){

        // lampadina
        const lampMaterial = new THREE.MeshPhongMaterial({ color: 'yellow' });
        const lampGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        this.lamp = new THREE.Mesh(lampGeometry, lampMaterial);
        this.lamp.position.y = CEILINGHEIGHT - 4;
        scene.add(this.lamp);
        this.lamp.castShadow = true;
        this.lamp.receiveShadow = true;

        // luce 
        this.pointLight = new THREE.PointLight({color: 'yellow'});
        this.pointLight.position.set(0, CEILINGHEIGHT - 4, 0);
        this.pointLight.castShadow = true;
        this.pointLight.shadow.mapSize.width = 4096;
        this.pointLight.shadow.mapSize.height = 4096;
        this.pointLight.intensity = 150;
        
        scene.add(this.pointLight);

        //filo della lampada
        const wireMaterial = new THREE.MeshPhongMaterial({ color: 'black' });
        const wireGeometry = new THREE.CylinderGeometry(0.05, 0.05, CEILINGHEIGHT-3, 32);
        this.wire = new THREE.Mesh(wireGeometry, wireMaterial);
        this.wire.position.y = CEILINGHEIGHT;
        this.wire.position.x = 0;
        this.wire.position.z = 0;
        scene.add(this.wire);

        
        this.wire.receiveShadow = true;

        // rivestimento della lampada
        const points = [];
        for (let i = 0; i < 10; ++i) {
            points.push(new THREE.Vector2(Math.sin(i * 0.2) * 0.5 + 0.5, (i - 5) * .18));
        }
        const segments = 23;
        const phiStart = 0;
        const phiLength = Math.PI * 2;

        const shadeGeometry = new THREE.LatheGeometry(points, segments, phiStart, phiLength);
        const shadeMaterial = new THREE.MeshPhongMaterial({ color: 'gray', side: THREE.DoubleSide });
        this.shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
        this.shade.position.y = CEILINGHEIGHT - 4.5; 
        this.shade.position.x = 0;
        this.shade.position.z = 0;
        this.shade.rotation.x = Math.PI; 
        scene.add(this.shade);

        //this.shade.castShadow = true;
        this.shade.receiveShadow = true;
    }
}