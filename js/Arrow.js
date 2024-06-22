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
    
    // Create raycasters for click and arrow actions.It is used for working out what objects in the 3d space the mouse is over.
    this.raycaster_click = new THREE.Raycaster();
    this.raycaster_arrow = new THREE.Raycaster();

    // Create vectors for mouse positions (x, y 2d coordinates)
    this.mouse_click = new THREE.Vector2();
    this.mouse_arrow = new THREE.Vector2();

    // Initialize the arrow helper as null
    this.arrowHelper = null;

    // Flag to control dragging behavior
    this.dragControls = false;

    // Add event listeners for mouse click, mouse move, and key press.
    // bind is necessary in order to access the class properties, otherwise 'this' would refer to window or undefined. 
    window.addEventListener('mousedown', this.onMouseClick.bind(this), false); // A mouse button is pressed over an element
    window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    window.addEventListener('keydown', this.onEnterPress.bind(this), false);
  }

  // Method to handle mouse click events
  onMouseClick(event) {
    if (this.dragControls) return;
    // Calculate mouse position in normalized device coordinates
    this.mouse_click.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse_click.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster_click with the camera and mouse position (origin and direction)
    this.raycaster_click.setFromCamera(this.mouse_click, this.camera);

    // Calculate object intersecting the ray
    const intersects = this.raycaster_click.intersectObject(this.balls[0].mesh);

    if (intersects.length > 0) {
      const mesh = this.balls[0].mesh;
      // If the arrow helper doesn't exist and all ball velocities are zero, create the arrow helper
      if (!this.arrowHelper && checkVelocities(this.balls)) {
        this.arrowHelper = new THREE.ArrowHelper(
          new THREE.Vector3(1, 0, 0), // Initial direction
          mesh.position, // Initial position
          1, // Length
          0xffff00 // Color
        );
        this.scene.add(this.arrowHelper);
        // I can't move the camera while aiming
        this.controls.enabled = false; 
      } else if (this.arrowHelper) {
        // If the arrow helper exists, remove it
        this.scene.remove(this.arrowHelper);
        this.arrowHelper = null;
        this.controls.enabled = true;
      }
    } else {
      // If no intersection, ensure controls are enabled and remove arrow helper if it exists
      this.controls.enabled = true;
      if (this.arrowHelper) {
        this.scene.remove(this.arrowHelper);
        this.arrowHelper = null;
      }
    }
  }

  // Method to handle mouse move events for arrow helper direction and length
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
        //Direction is the normalized vector from the ball to the point where i am moving the mouse on the table.
        const direction = new THREE.Vector3().subVectors(point, ballPosition).normalize();
        direction.y = 0; // Ensure y is always 0
        const length = Math.min(ballPosition.distanceTo(point), 2);

        //Now i set the values that i have calculated to the arrow helper
        this.arrowHelper.setDirection(direction);
        this.arrowHelper.setLength(length);
        this.arrowHelper.dir = direction;
        this.arrowHelper.length = length;
      }
    }
  }

  // Method to handle enter key press events
  onEnterPress(event) {
    if (event.key === 'Enter' && this.arrowHelper) {
      const direction = this.arrowHelper.dir.clone(); // Clone to avoid modifying the original with multiplyScalar
      const length = this.arrowHelper.length * SCALAR_VELOCITY;
      
      // Set the velocity of the ball using the direction and length calculated 
      this.balls[0].velocity = direction.multiplyScalar(length);
      this.scene.remove(this.arrowHelper);
      this.arrowHelper = null;
      this.controls.enabled = true;

      this.game.setWaitingForNextTurn(); // Set the game state to waiting for the next turn
    }
  }
}
