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
      
      this.initSceneFolder();
      this.initCameraFolder();
      if (this.balls != null){
        this.initBallsFolder();
      }
      this.initAmbientLight();
      this.initpointLight();
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
        console.log(ball);
        makeAxisGrid(ball.mesh, ball.name, 25, folder);
      }
    }
  
    initAmbientLight() {        
      const folder = this.gui.addFolder('ambient_light');
      folder.addColor(new ColorGUIHelper(this.ambientLight, 'color'), 'value').name('ambient_light_color');
      folder.add(this.ambientLight, 'intensity', 0, 2, 0.01);
    }
  
    initpointLight() {

      this.helper = new THREE.PointLightHelper(this.pointLight);
      this.helper.visible = false;
      this.scene.add(this.helper);
      this.cameraHelper = new THREE.CameraHelper(this.pointLight.shadow.camera);
      this.cameraHelper.visible = false;
      this.scene.add(this.cameraHelper);
  
      var folder = this.gui.addFolder('point_light');
      folder.addColor(new ColorGUIHelper(this.pointLight, 'color'), 'value').name('point_light_color');
      folder.add(this.pointLight, 'intensity', 0, 200, 1);
      folder.add(this.pointLight, 'distance', 0, 40).onChange(() => this.updateLight());
      folder.add(this.helper, 'visible').name('helper_visible');
  
      this.makeXYZGUI(folder, this.pointLight.position, 'position_light_point', () => this.updateLight());
      folder = this.gui.addFolder('Shadow Camera');
      folder.add(this.cameraHelper, 'visible').name('camera_helper_visible');
      const minMaxGUIHelper = new MinMaxGUIHelper(this.pointLight.shadow.camera, 'near', 'far', 0.1);
      folder.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(() => this.updateLight());
      folder.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(() => this.updateLight());
      folder.add(this.pointLight.shadow.camera, 'zoom', 0.01, 1.5, 0.01).onChange(() => this.updateLight());
    }

  
    makeXYZGUI(folder, vector3, name, onChangeFn) {
      const xyzFolder = folder.addFolder(name);
      xyzFolder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
      xyzFolder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
      xyzFolder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
      xyzFolder.open();
    }
  
    updateLight() {
      this.helper.update();
      // update the light's shadow camera's projection matrix
      this.pointLight.shadow.camera.updateProjectionMatrix();
      // and now update the camera helper we're using to show the light's shadow camera
      this.cameraHelper.update();

    }
  }