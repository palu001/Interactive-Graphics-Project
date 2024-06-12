
import * as THREE from 'three';
import { SCALAR_VELOCITY, checkVelocities } from './utils.js';

export class Arrow {
  constructor(scene, camera, controls, balls, table, game) {
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.balls = balls;
    this.table = table;
    this.game = game;
    
    this.raycaster_click = new THREE.Raycaster();
    this.raycaster_arrow = new THREE.Raycaster();
    this.mouse_click = new THREE.Vector2();
    this.mouse_arrow = new THREE.Vector2();
    this.arrowHelper = null;

    this.dragControls = false;

    window.addEventListener('mousedown', this.onMouseClick.bind(this), false);
    window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    window.addEventListener('keydown', this.onEnterPress.bind(this), false);
  }

  onMouseClick(event) {
    if (this.dragControls) return;
    // Calculate mouse position in normalized device coordinates
    this.mouse_click.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse_click.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster_click with the camera and mouse position
    this.raycaster_click.setFromCamera(this.mouse_click, this.camera);

    // Calculate objects intersecting the ray
    const intersects = this.raycaster_click.intersectObject(this.balls[0].mesh);

    if (intersects.length > 0) {
      const mesh = this.balls[0].mesh;
      if (!this.arrowHelper && checkVelocities(this.balls)) {
        this.arrowHelper = new THREE.ArrowHelper(
          new THREE.Vector3(1, 0, 0),
          mesh.position,
          1,
          0xffff00
        );
        this.scene.add(this.arrowHelper);
        this.controls.enabled = false;
      } else if (this.arrowHelper) {
        this.scene.remove(this.arrowHelper);
        this.arrowHelper = null;
        this.controls.enabled = true;
      }
    }
    else{
      this.controls.enabled = true;
      if (this.arrowHelper) {
        this.scene.remove(this.arrowHelper);
        this.arrowHelper = null;
      }
    }
  }

  onMouseMove(event) {
    if (this.arrowHelper) {
      // Calculate mouse position in normalized device coordinates
      this.mouse_arrow.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse_arrow.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update the raycaster_arrow with the camera and mouse position
      this.raycaster_arrow.setFromCamera(this.mouse_arrow, this.camera);

      // Calculate intersection with the table
      const intersects = this.raycaster_arrow.intersectObject(this.table.table);
      if (intersects.length > 0) {
        let point = intersects[0].point;
        point.y = 0; // Ensure y is always 0
        // Calculate the direction and length
        const ballPosition = this.balls[0].mesh.position;
        const direction = new THREE.Vector3().subVectors(point, ballPosition).normalize();
        direction.y = 0; // Ensure y is always 0
        const length = Math.min(ballPosition.distanceTo(point), 2);
        this.arrowHelper.setDirection(direction);
        this.arrowHelper.setLength(length);
        this.arrowHelper.dir = direction;
        this.arrowHelper.length = length;
      }
    }
  }

  onEnterPress(event) {
    if (event.key === 'Enter' && this.arrowHelper) {
      const direction = this.arrowHelper.dir.clone(); // Clone to avoid modifying the original
      const length = this.arrowHelper.length * SCALAR_VELOCITY;
      // Save the cue ball's position before the shot
      this.balls[0].lastPosition = this.balls[0].mesh.position.clone();
      
      this.balls[0].velocity = direction.multiplyScalar(length);
      this.scene.remove(this.arrowHelper);
      this.arrowHelper = null;
      this.controls.enabled = true;

      this.game.setWaitingForNextTurn(); // Imposta lo stato di attesa del prossimo turno
    }
  }
}

