import * as THREE from 'three';
import { gui } from '../utils.js';
import { ColorGUIHelper } from '../jsHelper/ColorGUIHelper.js';
import { MinMaxGUIHelper } from '../jsHelper/MinMaxGUIHelper.js';
import { makeAxisGrid } from '../utils.js';

export class SceneGUI {
    constructor(scene, camera, balls, ambientLight, directionalLight) {
      this.scene = scene;
      this.camera = camera;
      this.gui = gui;
      this.balls = balls;
      this.ambientLight = ambientLight;
      this.directionalLight = directionalLight;
  
      this.initSceneFolder();
      this.initCameraFolder();
      this.initBallsFolder();
      this.initAmbientLight();
      this.initDirectionalLight();
    }
  
    initSceneFolder() {
      const folder = this.gui.addFolder('scene');
      folder.addColor(new ColorGUIHelper(this.scene, 'background'), 'value').name('background_color');
    }
  
    initCameraFolder() {
      const folder = this.gui.addFolder('camera');
      folder.add(this.camera, 'fov', 1, 180).onChange(() => this.updateCamera());
      const minMaxGUIHelper = new MinMaxGUIHelper(this.camera, 'near', 'far', 0.1);
      folder.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(() => this.updateCamera());
      folder.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(() => this.updateCamera());
    }
  
    updateCamera() {
      this.camera.updateProjectionMatrix();
    }
  
    initBallsFolder() {
      const folder = this.gui.addFolder('balls');
      for (let i = 0; i < 16; i++) {
        const ball = this.balls[i];
        makeAxisGrid(ball.mesh, ball.name, 25, folder);
      }
    }
  
    initAmbientLight() {        
      const folder = this.gui.addFolder('ambient_light');
      folder.addColor(new ColorGUIHelper(this.ambientLight, 'color'), 'value').name('ambient_light_color');
      folder.add(this.ambientLight, 'intensity', 0, 2, 0.01);
    }
  
    initDirectionalLight() {

      this.helper = new THREE.DirectionalLightHelper(this.directionalLight);
      this.scene.add(this.helper);
  
      const folder = this.gui.addFolder('directional_light');
      folder.addColor(new ColorGUIHelper(this.directionalLight, 'color'), 'value').name('directional_light_color');
      folder.add(this.directionalLight, 'intensity', 0, 2, 0.01);
      folder.add(this.helper, 'visible').name('helper_visible');
  
      this.makeXYZGUI(folder, this.directionalLight.position, 'position_light_directional', () => this.updateLight());
      this.makeXYZGUI(folder, this.directionalLight.target.position, 'target_light_directional', () => this.updateLight());
    }
  
    makeXYZGUI(folder, vector3, name, onChangeFn) {
      const xyzFolder = folder.addFolder(name);
      xyzFolder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
      xyzFolder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
      xyzFolder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
      xyzFolder.open();
    }
  
    updateLight() {
      this.directionalLight.target.updateMatrixWorld();
      this.helper.update();
    }
  }