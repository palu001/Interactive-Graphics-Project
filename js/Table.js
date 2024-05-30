import * as THREE from 'three';

import {TABLE_WIDTH, TABLE_HEIGHT, TABLE_LENGTH, 
  CORNER_POCKET_RADIUS, SIDE_POCKET_RADIUS, BORDER_WIDTH, BORDER_HEIGHT, 
  BORDER_LENGTH, SHORT_BORDER_WIDTH, SHORT_BORDER_HEIGHT, SHORT_BORDER_LENGTH, 
  LEG_WIDTH, LEG_HEIGHT, LEG_DEPTH} from './utils.js';


export class Table {
  constructor(scene) {

    // billiard table (only playfield)
    const tableGeometry = new THREE.BoxGeometry(TABLE_WIDTH, TABLE_HEIGHT, TABLE_LENGTH);
    const tableMaterial = new THREE.MeshPhongMaterial({ color: 'green' });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.y = 1.0; // for legs
    scene.add(table);
    table.castShadow = true;
    table.receiveShadow = true;

    // pockets for balls
    const cornerPocketGeometry = new THREE.CylinderGeometry(CORNER_POCKET_RADIUS, CORNER_POCKET_RADIUS, 0.1, 32);
    const sidePocketGeometry = new THREE.CylinderGeometry(SIDE_POCKET_RADIUS, SIDE_POCKET_RADIUS, 0.1, 32);
    const pocketMaterial = new THREE.MeshPhongMaterial({ color: 'black'});
    const pockets = [];

    const pocketPositions = [
        [-TABLE_WIDTH / 2, 1, -TABLE_LENGTH / 2], [TABLE_WIDTH / 2, 1, -TABLE_LENGTH / 2], // back corners
        [-TABLE_WIDTH / 2, 1, TABLE_LENGTH / 2], [TABLE_WIDTH / 2, 1, TABLE_LENGTH / 2],   // front corners
        [-TABLE_WIDTH / 2, 1, 0], [TABLE_WIDTH / 2, 1, 0],   // sides
    ];

    pocketPositions.forEach((position, index) => {
      const isSidePocket = index >= 4;
      const pocketGeometry = isSidePocket ? sidePocketGeometry : cornerPocketGeometry;
      const pocket = new THREE.Mesh(pocketGeometry, pocketMaterial);
      pocket.castShadow = true;
      pocket.receiveShadow = true;
      pocket.rotation.x = Math.PI / 2;
      pocket.position.set(position[0], position[1], position[2]);
      scene.add(pocket);
      pockets.push(pocket);
    });

    // Create borders material 
    const borderMaterial = new THREE.MeshPhongMaterial({ color: 'brown'});

    // Long side borders
    const longBorderGeometry = new THREE.BoxGeometry(BORDER_WIDTH, BORDER_HEIGHT, BORDER_LENGTH);
    const longBorder1 = new THREE.Mesh(longBorderGeometry, borderMaterial);
    longBorder1.position.set(-TABLE_WIDTH / 2 - BORDER_WIDTH / 2, 1.05, 0);
    scene.add(longBorder1);
    longBorder1.castShadow = true;
    longBorder1.receiveShadow = true;

    const longBorder2 = new THREE.Mesh(longBorderGeometry, borderMaterial);
    longBorder2.position.set(TABLE_WIDTH / 2 + BORDER_WIDTH / 2, 1.05, 0);
    scene.add(longBorder2);
    longBorder2.castShadow = true;
    longBorder2.receiveShadow = true;

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

    // Create table legs
    const legGeometry = new THREE.BoxGeometry(LEG_WIDTH, LEG_HEIGHT, LEG_DEPTH);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 'brown' });

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
