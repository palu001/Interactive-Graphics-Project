import * as THREE from 'three';
import { TABLE_WIDTH, TABLE_HEIGHT, TABLE_LENGTH, 
  CORNER_POCKET_RADIUS, SIDE_POCKET_RADIUS, BORDER_WIDTH, BORDER_HEIGHT, 
  BORDER_LENGTH, SHORT_BORDER_WIDTH, SHORT_BORDER_HEIGHT, SHORT_BORDER_LENGTH, 
  LEG_WIDTH, LEG_HEIGHT, LEG_DEPTH } from './utils.js';

export class Table {
  constructor(scene) {
    // Table surface
    const tableMaterial = new THREE.MeshPhongMaterial({
      color: 'green',
    });
    const tableGeometry = new THREE.BoxGeometry(TABLE_WIDTH, TABLE_HEIGHT, TABLE_LENGTH);
    this.table = new THREE.Mesh(tableGeometry, tableMaterial);
    this.table.position.y = 1.0; // in order to have legs, table is not on the ground
    scene.add(this.table);
    this.table.castShadow = true;
    this.table.receiveShadow = true;
    
    // Pockets for balls that are a quarter of a Cylinder
    // default values for radialSegments and heightSegments that divide the cylinder in circular and vertical segments
    // openEnded = false to have a closed cylinder ( top and bottom)
    const cornerPocketGeometry = new THREE.CylinderGeometry(CORNER_POCKET_RADIUS, CORNER_POCKET_RADIUS, 0.5, 32, 1, false, 0, Math.PI / 2);
    const sidePocketGeometry = new THREE.CylinderGeometry(SIDE_POCKET_RADIUS, SIDE_POCKET_RADIUS, 0.5, 32, 1, false, 0, Math.PI);
    const pocketMaterial = new THREE.MeshPhongMaterial({ color: 'black', side: THREE.DoubleSide });
    this.pockets = [];

    const pocketOffset = 0.15; 
    const pocketPositions = [
        [-TABLE_WIDTH / 2 - pocketOffset , 0.85, -TABLE_LENGTH / 2 - pocketOffset], 
        [TABLE_WIDTH / 2 + pocketOffset, 0.85, -TABLE_LENGTH / 2 - pocketOffset],  // back corners
        [-TABLE_WIDTH / 2 - pocketOffset, 0.85, TABLE_LENGTH / 2 + pocketOffset], 
        [TABLE_WIDTH / 2 + pocketOffset, 0.85, TABLE_LENGTH / 2 + pocketOffset],   // front corners
        [-TABLE_WIDTH / 2 - pocketOffset, 0.85, 0], 
        [TABLE_WIDTH / 2 + pocketOffset, 0.85, 0],   // sides
    ];

    pocketPositions.forEach((position, index) => {
      const isSidePocket = index >= 4;
      const pocketGeometry = isSidePocket ? sidePocketGeometry : cornerPocketGeometry;
      const pocket = new THREE.Mesh(pocketGeometry, pocketMaterial.clone()); // clone material to avoid sharing
      pocket.position.set(position[0], position[1], position[2]);
      // Ruota la buca per orientare la parte aperta verso il tavolo
      if (index === 0) pocket.rotation.y = 0; // back left corner
      else if (index === 1) pocket.rotation.y = -Math.PI / 2; // back right corner
      else if (index === 2) pocket.rotation.y = +Math.PI / 2; // front left corner
      else if (index === 3) pocket.rotation.y = Math.PI; // front right corner
      else if (index === 4) pocket.rotation.y = 0; // left side
      else if (index === 5) pocket.rotation.y = -Math.PI; // right side

      scene.add(pocket);
      this.pockets.push(pocket);
    });

    // Borders
    const borderMaterial = new THREE.MeshPhongMaterial({
      color: 'brown',
    });

    // Long side borders
    const halfBorderLength = BORDER_LENGTH / 2 - 0.2;
    const longBorderGeometry = new THREE.BoxGeometry(BORDER_WIDTH, BORDER_HEIGHT, halfBorderLength);
    
    // Left side borders
    const longBorder1a = new THREE.Mesh(longBorderGeometry, borderMaterial);
    longBorder1a.position.set(-TABLE_WIDTH / 2 - BORDER_WIDTH / 2, 1.05, -TABLE_LENGTH / 4);
    scene.add(longBorder1a);
    longBorder1a.castShadow = true;
    longBorder1a.receiveShadow = true;

    const longBorder1b = new THREE.Mesh(longBorderGeometry, borderMaterial);
    longBorder1b.position.set(-TABLE_WIDTH / 2 - BORDER_WIDTH / 2, 1.05, TABLE_LENGTH / 4);
    scene.add(longBorder1b);
    longBorder1b.castShadow = true;
    longBorder1b.receiveShadow = true;

    // Right side borders
    const longBorder2a = new THREE.Mesh(longBorderGeometry, borderMaterial);
    longBorder2a.position.set(TABLE_WIDTH / 2 + BORDER_WIDTH / 2, 1.05, -TABLE_LENGTH / 4);
    scene.add(longBorder2a);
    longBorder2a.castShadow = true;
    longBorder2a.receiveShadow = true;

    const longBorder2b = new THREE.Mesh(longBorderGeometry, borderMaterial);
    longBorder2b.position.set(TABLE_WIDTH / 2 + BORDER_WIDTH / 2, 1.05, TABLE_LENGTH / 4);
    scene.add(longBorder2b);
    longBorder2b.castShadow = true;
    longBorder2b.receiveShadow = true;

    // Short side borders
    const shortBorderGeometry = new THREE.BoxGeometry(SHORT_BORDER_WIDTH, SHORT_BORDER_HEIGHT, SHORT_BORDER_LENGTH);
    const shortBorder1 = new THREE.Mesh(shortBorderGeometry, borderMaterial);
    shortBorder1.position.set(0, 1.05, -TABLE_LENGTH / 2 - SHORT_BORDER_LENGTH / 2);
    scene.add(shortBorder1);
    shortBorder1.castShadow = true;
    shortBorder1.receiveShadow = true;

    const shortBorder2 = new THREE.Mesh(shortBorderGeometry, borderMaterial);
    shortBorder2.position.set(0, 1.05, TABLE_LENGTH / 2 + SHORT_BORDER_LENGTH / 2);
    scene.add(shortBorder2);
    shortBorder2.castShadow = true;
    shortBorder2.receiveShadow = true;

    // Table legs
    const legMaterial = new THREE.MeshPhongMaterial({ color: 'brown',});
    const legGeometry = new THREE.BoxGeometry(LEG_WIDTH, LEG_HEIGHT, LEG_DEPTH);

    const legPositions = [
        [-TABLE_WIDTH / 2 + LEG_WIDTH / 2, 0, -TABLE_LENGTH / 2 + LEG_DEPTH / 2],
        [TABLE_WIDTH / 2 - LEG_WIDTH / 2, 0, -TABLE_LENGTH / 2 + LEG_DEPTH / 2], // back legs
        [-TABLE_WIDTH / 2 + LEG_WIDTH / 2, 0, TABLE_LENGTH / 2 - LEG_DEPTH / 2],
        [TABLE_WIDTH / 2 - LEG_WIDTH / 2, 0, TABLE_LENGTH / 2 - LEG_DEPTH / 2],   // front legs
    ];

    legPositions.forEach(position => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.castShadow = true;
      leg.receiveShadow = true;
      leg.position.set(position[0], position[1], position[2]);
      scene.add(leg);
    });
  }
}
