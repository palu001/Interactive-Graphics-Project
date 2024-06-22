import * as THREE from 'three';
import { CEILINGHEIGHT } from './utils.js';

export class Lamp {
    constructor(scene) {
        // Create the lamp bulb
        const lampMaterial = new THREE.MeshPhongMaterial({ color: 'yellow' });
        const lampGeometry = new THREE.SphereGeometry(0.5);
        this.lamp = new THREE.Mesh(lampGeometry, lampMaterial);
        this.lamp.position.y = CEILINGHEIGHT - 4; // Position the lamp bulb near the ceiling
        scene.add(this.lamp); 
        this.lamp.castShadow = true; 
        this.lamp.receiveShadow = true; 

        // Create the point light
        this.pointLight = new THREE.PointLight({ color: 'yellow' });
        this.pointLight.position.set(0, CEILINGHEIGHT - 4, 0); // Position the point light near the ceiling
        this.pointLight.castShadow = true; // Enable shadow casting for the point light
        // shadow map stores the depth values of the objects that are visible to the light source or in shadow
        this.pointLight.shadow.mapSize.width = 4096; // Set the shadow map width (improve shadow quality)
        this.pointLight.shadow.mapSize.height = 4096; // Set the shadow map height (improve shadow quality)
        this.pointLight.intensity = 150; 
        scene.add(this.pointLight); 

        // Create the lamp wire
        const wireMaterial = new THREE.MeshPhongMaterial({ color: 'black' });
        const wireGeometry = new THREE.CylinderGeometry(0.05, 0.05, CEILINGHEIGHT - 3);
        this.wire = new THREE.Mesh(wireGeometry, wireMaterial);
        this.wire.position.y = CEILINGHEIGHT; // Position the wire at the ceiling
        this.wire.position.x = 0; // Set the wire's x position
        this.wire.position.z = 0; // Set the wire's z position
        scene.add(this.wire); 
        this.wire.receiveShadow = true;

        // Create the lamp structure
        const points = [];
        // Use a loop to generate 10 points along a 2D profile
        for (let i = 0; i < 10; ++i) {
            points.push(new THREE.Vector2(Math.sin(i * 0.2) * 0.5 + 0.5, (i - 5) * 0.18));
        }
        // Define the number of segments around the circumference of the lathe geometry
        const segments = 23;
        // Define the starting angle for the lathe (0 means start from the positive x-axis)
        const phiStart = 0;
        // 2 * PI means a full circle
        const phiLength = Math.PI * 2;
        // This geometry is created by rotating the 2D profile defined by the points array
        const shadeGeometry = new THREE.LatheGeometry(points, segments, phiStart, phiLength);
        // The material renders on both sides of the geometry (front and back faces)
        const shadeMaterial = new THREE.MeshPhongMaterial({ color: 'gray', side: THREE.DoubleSide });

        this.shade = new THREE.Mesh(shadeGeometry, shadeMaterial);
        this.shade.position.y = CEILINGHEIGHT - 4.5; 
        this.shade.position.x = 0;
        this.shade.position.z = 0; 
        this.shade.rotation.x = Math.PI; // Rotate the shade upside down
        scene.add(this.shade); // Add the shade to the scene

        // Enable shadow receiving for the shade
        this.shade.receiveShadow = true;
    }
}
