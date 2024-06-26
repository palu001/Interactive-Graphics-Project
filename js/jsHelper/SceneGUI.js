import * as THREE from 'three';
import { gui } from '../utils.js';
import { ColorGUIHelper } from '../jsHelper/ColorGUIHelper.js';
import { MinMaxGUIHelper } from '../jsHelper/MinMaxGUIHelper.js';
import { makeAxisGrid } from '../utils.js';

export class SceneGUI {
  constructor(scene, camera, balls, ambientLight, pointLight) {
      this.scene = scene;
      this.camera = camera;
      this.gui = gui;
      this.balls = balls;
      this.ambientLight = ambientLight;
      this.pointLight = pointLight;
      
      // Initialize the GUI folders for different components.
      this.initSceneFolder();
      this.initCameraFolder();
      if (this.balls != null) {
          this.initBallsFolder();
      }
      this.initAmbientLight();
      this.initpointLight();
      this.gui.close();
  }
  
  // Initializes the scene folder in the GUI.
  initSceneFolder() {
      const folder = this.gui.addFolder('scene');
      //only background color
      folder.addColor(new ColorGUIHelper(this.scene, 'background'), 'value').name('background_color');
  }

  // Initializes the camera folder in the GUI.
  initCameraFolder() {
      const folder = this.gui.addFolder('camera');
      //updateCamera when i change the values
      folder.add(this.camera, 'fov', 1, 180).onChange(() => this.updateCamera());
      const minMaxGUIHelper = new MinMaxGUIHelper(this.camera, 'near', 'far', 0.1);
      folder.add(minMaxGUIHelper, 'min', 0.1, 1000, 0.1).name('near').onChange(() => this.updateCamera());
      folder.add(minMaxGUIHelper, 'max', 0.1, 1000, 0.1).name('far').onChange(() => this.updateCamera());
  }

  // Updates the camera's projection matrix. It needs to be called every time the camera's properties are changed.
  updateCamera() {
      this.camera.updateProjectionMatrix();
  }

  // Initializes the balls folder in the GUI, if balls are provided.
  initBallsFolder() {
      const folder = this.gui.addFolder('balls');
      for (let i = 0; i < 16; i++) {
          const ball = this.balls[i];
          console.log(ball);
          makeAxisGrid(ball.mesh, ball.name, folder);
      }
  }

  // Initializes the ambient light folder in the GUI.
  initAmbientLight() {        
      const folder = this.gui.addFolder('ambient_light');
      folder.addColor(new ColorGUIHelper(this.ambientLight, 'color'), 'value').name('ambient_light_color');
      folder.add(this.ambientLight, 'intensity', 0, 2, 0.01);
  }

  // Initializes the point light folder in the GUI.
  initpointLight() {
      this.helper = new THREE.PointLightHelper(this.pointLight);
      // Initially the pointLight helper is invisible.
      this.helper.visible = false;
      this.scene.add(this.helper);

      // Create a CameraHelper to visualize the shadow camera of the point light and make it invisible by default.
      this.cameraHelper = new THREE.CameraHelper(this.pointLight.shadow.camera);
      this.cameraHelper.visible = false;
      this.scene.add(this.cameraHelper);

      // Create a folder in the GUI for the point light.
      var folder = this.gui.addFolder('point_light');
      folder.addColor(new ColorGUIHelper(this.pointLight, 'color'), 'value').name('point_light_color');
      folder.add(this.pointLight, 'intensity', 0, 200, 1);
      
      // The distance property of a light is used to calculate the attenuation of the light. I use zero so it will not attenuate.
      folder.add(this.pointLight, 'distance', 0, 40).onChange(() => this.updateLight());
      folder.add(this.helper, 'visible').name('helper_visible');

      // Add controls for the point light's position.
      this.makeXYZGUI(folder, this.pointLight.position, 'position_light_point', () => this.updateLight());

      // Create a folder in the GUI for the shadow camera of the light. The shadow have a camera that is used to render the shadow map.
      folder = this.gui.addFolder('Shadow Camera');
      folder.add(this.cameraHelper, 'visible').name('camera_helper_visible');
      const minMaxGUIHelper = new MinMaxGUIHelper(this.pointLight.shadow.camera, 'near', 'far', 0.1);
      folder.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(() => this.updateLight());
      folder.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(() => this.updateLight());
  }

  // Helper function to add XYZ controls for a vector (light position)
  makeXYZGUI(folder, vector3, name, onChangeFn) {
      const xyzFolder = folder.addFolder(name);
      xyzFolder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
      xyzFolder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
      xyzFolder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
  }

  // Updates the point light helper and the shadow camera helper.
  updateLight() {
      // Updates the helper's geometry to match the dimensions
      this.helper.update();
      // Update the light's shadow camera's projection matrix.
      this.pointLight.shadow.camera.updateProjectionMatrix();
      // Update the camera helper we're using to show the light's shadow camera.
      this.cameraHelper.update();
  }
}
